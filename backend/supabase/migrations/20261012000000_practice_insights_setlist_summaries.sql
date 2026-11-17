-- Read models execute only through the backend, with explicit user ownership.
create index practice_sessions_completed_user_idx
  on public.practice_sessions(user_id, started_at)
  where deleted_at is null and ended_at is not null;

create or replace function public.get_practice_summary(p_user_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  v_timezone text;
  v_daily_target integer;
  v_weekly_target integer;
  v_today date;
  v_week date;
  v_result jsonb;
begin
  if not exists (select 1 from public.users where id = p_user_id and deleted_at is null) then
    raise exception 'User not found' using errcode = 'P0002';
  end if;
  select timezone, daily_target_seconds, weekly_target_days
    into v_timezone, v_daily_target, v_weekly_target
    from public.user_practice_goals where user_id = p_user_id;
  v_timezone := coalesce(v_timezone, 'UTC');
  v_daily_target := coalesce(v_daily_target, 1800);
  v_weekly_target := coalesce(v_weekly_target, 5);
  v_today := (now() at time zone v_timezone)::date;
  v_week := date_trunc('week', v_today::timestamp)::date;

  with sessions as materialized (
    select id, (started_at at time zone v_timezone)::date as day,
      coalesce(duration_seconds::bigint, duration_minutes::bigint * 60, 0) as seconds
    from public.practice_sessions
    where user_id = p_user_id and deleted_at is null and ended_at is not null
      and started_at <= now() and ended_at <= now()
  ), daily as (
    select day, sum(seconds) as seconds, count(*) as session_count
    from sessions group by day
  ), positive_days as (
    select day, day - (row_number() over (order by day))::integer as island
    from daily where seconds > 0
  ), streaks as (
    select count(*) as days, max(day) as last_day from positive_days group by island
  ), entries as materialized (
    select p.*, s.day from public.practice_session_songs p
    join sessions s on s.id = p.practice_session_id
    join public.songs song on song.id = p.song_id
      and song.user_id = p_user_id and song.deleted_at is null
  ), skills as (
    select t.id as technique_id, t.key, t.name, t.category,
      count(distinct e.practice_session_id) as session_count,
      sum(coalesce(e.seconds_practiced::bigint, e.minutes_practiced::bigint * 60, 0)) as seconds_practiced,
      sum(coalesce(e.repetitions::bigint, 0)) as repetitions,
      round(avg(e.quality_rating), 2) as average_quality,
      round(avg(e.practiced_bpm), 2) as average_bpm,
      max(e.day) as last_practiced_on
    from entries e
    join public.practice_session_techniques pt on pt.practice_session_song_id = e.id
    join public.techniques t on t.id = pt.technique_id
    group by t.id
  ), totals as (
    select coalesce(sum(seconds), 0) as total_seconds, count(*) as total_sessions,
      count(distinct day) filter (where seconds > 0) as practiced_days
    from sessions
  ), streak_stats as (
    select coalesce(max(days), 0) as longest,
      coalesce(max(days) filter (where last_day >= v_today - 1), 0) as current
    from streaks
  )
  select jsonb_build_object(
    'timezone', v_timezone, 'as_of', now(), 'today', v_today,
    'goal', jsonb_build_object('daily_target_seconds', v_daily_target, 'weekly_target_days', v_weekly_target),
    'totals', jsonb_build_object('duration_seconds', total_seconds, 'session_count', total_sessions,
      'practiced_days', practiced_days,
      'mastered_songs', (select count(*) from public.songs where user_id = p_user_id and deleted_at is null and learning_status = 'mastered'),
      'average_bpm', (select round(avg(practiced_bpm), 2) from entries)),
    'streak', jsonb_build_object('current_days', current, 'longest_days', longest),
    'daily', jsonb_build_object('duration_seconds', coalesce((select seconds from daily where day = v_today), 0),
      'session_count', coalesce((select session_count from daily where day = v_today), 0),
      'goal_reached', coalesce((select seconds >= v_daily_target from daily where day = v_today), false)),
    'week', jsonb_build_object('starts_on', v_week,
      'duration_seconds', coalesce((select sum(seconds) from daily where day between v_week and v_week + 6), 0),
      'practiced_days', (select count(*) from daily where day between v_week and v_week + 6 and seconds > 0),
      'goal_reached_days', (select count(*) from daily where day between v_week and v_week + 6 and seconds >= v_daily_target),
      'goal_reached', (select count(*) >= v_weekly_target from daily where day between v_week and v_week + 6 and seconds > 0),
      'previous_duration_seconds', coalesce((select sum(seconds) from daily where day between v_week - 7 and v_week - 1), 0)),
    'calendar', (select jsonb_agg(jsonb_build_object('date', g.day::date,
      'duration_seconds', coalesce(d.seconds, 0), 'session_count', coalesce(d.session_count, 0),
      'goal_reached', coalesce(d.seconds >= v_daily_target, false)) order by g.day)
      from generate_series(v_week::timestamp, (v_week + 6)::timestamp, interval '1 day') g(day)
      left join daily d on d.day = g.day::date),
    'weekly_evolution', (select jsonb_agg(jsonb_build_object('starts_on', w.day::date,
      'duration_seconds', coalesce((select sum(d.seconds) from daily d where d.day between w.day::date and w.day::date + 6), 0),
      'practiced_days', (select count(*) from daily d where d.day between w.day::date and w.day::date + 6 and d.seconds > 0)) order by w.day)
      from generate_series((v_week - 77)::timestamp, v_week::timestamp, interval '7 days') w(day)),
    'skills', coalesce((select jsonb_agg(to_jsonb(skills) order by seconds_practiced desc, key) from skills), '[]'::jsonb),
    'achievements', jsonb_build_array(
      jsonb_build_object('key', 'first-session', 'target', 1, 'progress', least(total_sessions, 1), 'unlocked', total_sessions >= 1),
      jsonb_build_object('key', 'seven-day-streak', 'target', 7, 'progress', least(longest, 7), 'unlocked', longest >= 7),
      jsonb_build_object('key', 'ten-hours', 'target', 36000, 'progress', least(total_seconds, 36000), 'unlocked', total_seconds >= 36000))
  ) into v_result from totals cross join streak_stats;
  return v_result;
end;
$$;

create or replace function public.list_setlist_summaries(
  p_user_id uuid, p_page integer default 1, p_limit integer default 20,
  p_search text default '', p_sort_by text default 'created_at', p_sort_order text default 'desc'
) returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_result jsonb;
begin
  if p_page is null or p_page < 1 or p_limit is null or p_limit not between 1 and 100
    or p_sort_by is null or p_sort_by not in ('created_at', 'updated_at', 'name')
    or p_sort_order is null or p_sort_order not in ('asc', 'desc') then
    raise exception 'Invalid pagination or sorting' using errcode = '22023';
  end if;
  with filtered as materialized (
    select s.* from public.setlists s
    where user_id = p_user_id and deleted_at is null
      and (coalesce(p_search, '') = '' or name ilike '%' || p_search || '%')
  ), ordered as (
    select f.*, row_number() over (order by
      case when p_sort_order = 'asc' and p_sort_by = 'created_at' then created_at end asc,
      case when p_sort_order = 'desc' and p_sort_by = 'created_at' then created_at end desc,
      case when p_sort_order = 'asc' and p_sort_by = 'updated_at' then updated_at end asc,
      case when p_sort_order = 'desc' and p_sort_by = 'updated_at' then updated_at end desc,
      case when p_sort_order = 'asc' and p_sort_by = 'name' then name end asc,
      case when p_sort_order = 'desc' and p_sort_by = 'name' then name end desc,
      id asc) as ordinal from filtered f
  ), page as (
    select * from ordered order by ordinal limit p_limit offset (p_page::bigint - 1) * p_limit
  ), summaries as (
    select (to_jsonb(p) - 'ordinal') || jsonb_build_object(
      'song_count', count(song.id),
      'duration_seconds', coalesce(sum(song.duration_seconds::bigint), 0),
      'missing_duration_count', count(song.id) filter (where song.duration_seconds is null),
      'cover_image_urls', coalesce((select jsonb_agg(c.cover_image_url order by c.position)
        from (select s.cover_image_url, ss.position from public.setlist_songs ss
          join public.songs s on s.id = ss.song_id and s.user_id = p_user_id and s.deleted_at is null
          where ss.setlist_id = p.id and s.cover_image_url is not null order by ss.position limit 4) c), '[]'::jsonb)
    ) as summary, p.ordinal
    from page p left join public.setlist_songs ss on ss.setlist_id = p.id
      left join public.songs song on song.id = ss.song_id and song.user_id = p_user_id and song.deleted_at is null
    group by p, p.id, p.ordinal
  )
  select jsonb_build_object('data', coalesce((select jsonb_agg(summary order by ordinal) from summaries), '[]'::jsonb),
    'meta', jsonb_build_object('page', p_page, 'limit', p_limit, 'total', (select count(*) from filtered))) into v_result;
  return v_result;
end;
$$;

revoke all on function public.get_practice_summary(uuid) from public, anon, authenticated;
grant execute on function public.get_practice_summary(uuid) to service_role;
revoke all on function public.list_setlist_summaries(uuid, integer, integer, text, text, text) from public, anon, authenticated;
grant execute on function public.list_setlist_summaries(uuid, integer, integer, text, text, text) to service_role;

-- Allow swapping positions inside one transaction without intermediate collisions.
alter table public.setlist_songs drop constraint setlist_songs_setlist_id_position_key;
alter table public.setlist_songs add constraint setlist_songs_setlist_id_position_key
  unique (setlist_id, position) deferrable initially immediate;

create or replace function public.reorder_setlist_songs(p_user_id uuid, p_setlist_id uuid, p_song_ids uuid[])
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_count integer;
begin
  perform 1 from public.setlists where id = p_setlist_id and user_id = p_user_id and deleted_at is null for update;
  if not found then raise exception 'Setlist not found' using errcode = 'P0002'; end if;
  perform 1 from public.setlist_songs where setlist_id = p_setlist_id for update;
  select count(*) into v_count from public.setlist_songs ss
    join public.songs s on s.id = ss.song_id and s.user_id = p_user_id and s.deleted_at is null
    where ss.setlist_id = p_setlist_id;
  if p_song_ids is null or cardinality(p_song_ids) <> v_count
    or (select count(distinct id) from unnest(p_song_ids) ids(id)) <> v_count
    or exists (select 1 from unnest(p_song_ids) ids(id) where not exists (
      select 1 from public.setlist_songs ss join public.songs s on s.id = ss.song_id
      where ss.setlist_id = p_setlist_id and ss.song_id = ids.id and s.user_id = p_user_id and s.deleted_at is null
    )) then
    raise exception 'Order must contain all active songs exactly once' using errcode = '22023';
  end if;
  set constraints public.setlist_songs_setlist_id_position_key deferred;
  -- Preserve soft-deleted associations after the active repertoire, with unique positions.
  with inactive as (
    select ss.id, row_number() over (order by ss.position, ss.id) - 1 as ordinal
    from public.setlist_songs ss join public.songs s on s.id = ss.song_id
    where ss.setlist_id = p_setlist_id and (s.deleted_at is not null or s.user_id <> p_user_id)
  )
  update public.setlist_songs ss set position = v_count + inactive.ordinal
    from inactive where inactive.id = ss.id;
  update public.setlist_songs ss set position = ids.ordinality - 1
    from unnest(p_song_ids) with ordinality ids(song_id, ordinality)
    where ss.setlist_id = p_setlist_id and ss.song_id = ids.song_id;
  update public.setlists set updated_at = now() where id = p_setlist_id;
  set constraints public.setlist_songs_setlist_id_position_key immediate;
  return p_setlist_id;
end;
$$;
revoke all on function public.reorder_setlist_songs(uuid, uuid, uuid[]) from public, anon, authenticated;
grant execute on function public.reorder_setlist_songs(uuid, uuid, uuid[]) to service_role;
