alter table public.songs
  add column duration_seconds integer,
  add column provider text,
  add column provider_track_id text,
  add column preview_url text,
  add column external_url text,
  add column learning_status text not null default 'new',
  add column target_bpm integer,
  add column priority integer not null default 0,
  add column last_practiced_at timestamptz;

alter table public.songs
  add constraint songs_duration_seconds_check
    check (duration_seconds is null or duration_seconds >= 0),
  add constraint songs_provider_check
    check (provider is null or provider in ('apple_music', 'spotify', 'manual', 'other')),
  add constraint songs_learning_status_check
    check (learning_status in ('new', 'learning', 'maintaining', 'mastered', 'archived')),
  add constraint songs_target_bpm_check
    check (target_bpm is null or target_bpm between 1 and 400),
  add constraint songs_priority_check
    check (priority between 0 and 5);

update public.songs
set
  provider = case
    when spotify_track_id is not null then 'spotify'
    else provider
  end,
  provider_track_id = coalesce(provider_track_id, spotify_track_id),
  preview_url = coalesce(preview_url, spotify_preview_url),
  external_url = coalesce(external_url, spotify_external_url);

create index songs_provider_track_idx
  on public.songs(user_id, provider, provider_track_id)
  where deleted_at is null and provider_track_id is not null;
create index songs_learning_status_idx
  on public.songs(user_id, learning_status)
  where deleted_at is null;
create index songs_last_practiced_at_idx
  on public.songs(user_id, last_practiced_at)
  where deleted_at is null;

alter table public.practice_sessions
  add column duration_seconds integer,
  add column paused_seconds integer not null default 0;

update public.practice_sessions
set duration_seconds = duration_minutes * 60
where duration_seconds is null and duration_minutes is not null;

alter table public.practice_sessions
  add constraint practice_sessions_duration_seconds_check
    check (duration_seconds is null or duration_seconds >= 0),
  add constraint practice_sessions_paused_seconds_check
    check (paused_seconds >= 0);

alter table public.practice_session_songs
  add column seconds_practiced integer,
  add column practiced_bpm integer,
  add column repetitions integer,
  add column quality_rating integer;

update public.practice_session_songs
set seconds_practiced = minutes_practiced * 60
where seconds_practiced is null and minutes_practiced is not null;

alter table public.practice_session_songs
  add constraint practice_session_songs_seconds_check
    check (seconds_practiced is null or seconds_practiced >= 0),
  add constraint practice_session_songs_bpm_check
    check (practiced_bpm is null or practiced_bpm between 1 and 400),
  add constraint practice_session_songs_repetitions_check
    check (repetitions is null or repetitions >= 0),
  add constraint practice_session_songs_quality_check
    check (quality_rating is null or quality_rating between 1 and 5);

create table public.user_practice_goals (
  user_id uuid primary key references public.users(id) on delete cascade,
  daily_target_seconds integer not null default 1800
    check (daily_target_seconds between 60 and 86400),
  weekly_target_days integer not null default 5
    check (weekly_target_days between 1 and 7),
  timezone text not null default 'UTC'
    check (char_length(timezone) between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_user_practice_goals_updated_at
before update on public.user_practice_goals
for each row execute function public.set_updated_at();

create table public.techniques (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (char_length(key) between 1 and 80),
  name text not null check (char_length(name) between 1 and 120),
  category text not null check (char_length(category) between 1 and 80),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_techniques_updated_at
before update on public.techniques
for each row execute function public.set_updated_at();

create table public.song_techniques (
  song_id uuid not null references public.songs(id) on delete cascade,
  technique_id uuid not null references public.techniques(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (song_id, technique_id)
);

create table public.practice_session_techniques (
  practice_session_song_id uuid not null
    references public.practice_session_songs(id) on delete cascade,
  technique_id uuid not null references public.techniques(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (practice_session_song_id, technique_id)
);

create index song_techniques_technique_idx
  on public.song_techniques(technique_id);
create index practice_session_techniques_technique_idx
  on public.practice_session_techniques(technique_id);

insert into public.techniques (key, name, category)
values
  ('alternate-picking', 'Palhetada alternada', 'articulation'),
  ('down-picking', 'Down picking', 'articulation'),
  ('fingerstyle', 'Fingerstyle', 'articulation'),
  ('legato', 'Legato', 'articulation'),
  ('palm-muting', 'Palm mute', 'articulation'),
  ('bends', 'Bends', 'expression'),
  ('vibrato', 'Vibrato', 'expression'),
  ('slides', 'Slides', 'expression'),
  ('chords', 'Acordes', 'harmony'),
  ('scales', 'Escalas', 'theory'),
  ('sight-reading', 'Leitura à primeira vista', 'reading'),
  ('rhythm', 'Precisão rítmica', 'rhythm')
on conflict (key) do nothing;

alter table public.user_practice_goals enable row level security;
alter table public.techniques enable row level security;
alter table public.song_techniques enable row level security;
alter table public.practice_session_techniques enable row level security;

create policy "user_practice_goals_owned_by_user"
on public.user_practice_goals
for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "techniques_readable_by_authenticated"
on public.techniques
for select to authenticated
using (active = true);

create policy "song_techniques_owned_by_user"
on public.song_techniques
for all to authenticated
using (
  exists (
    select 1
    from public.songs
    where songs.id = song_techniques.song_id
      and songs.user_id = (select auth.uid())
      and songs.deleted_at is null
  )
)
with check (
  exists (
    select 1
    from public.songs
    where songs.id = song_techniques.song_id
      and songs.user_id = (select auth.uid())
      and songs.deleted_at is null
  )
);

create policy "practice_session_techniques_owned_by_user"
on public.practice_session_techniques
for all to authenticated
using (
  exists (
    select 1
    from public.practice_session_songs pss
    join public.practice_sessions ps on ps.id = pss.practice_session_id
    where pss.id = practice_session_techniques.practice_session_song_id
      and ps.user_id = (select auth.uid())
      and ps.deleted_at is null
  )
)
with check (
  exists (
    select 1
    from public.practice_session_songs pss
    join public.practice_sessions ps on ps.id = pss.practice_session_id
    where pss.id = practice_session_techniques.practice_session_song_id
      and ps.user_id = (select auth.uid())
      and ps.deleted_at is null
  )
);

create or replace function public.start_practice_session(
  p_user_id uuid,
  p_song_id uuid,
  p_title text default null,
  p_started_at timestamptz default now(),
  p_notes text default null,
  p_mood text default null,
  p_focus_area text default null,
  p_practiced_bpm integer default null,
  p_technique_ids uuid[] default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  created_session_id uuid;
  created_session_song_id uuid;
  requested_techniques integer;
  valid_techniques integer;
begin
  if not exists (
    select 1 from public.songs
    where id = p_song_id and user_id = p_user_id and deleted_at is null
  ) then
    raise exception using errcode = 'P0002', message = 'Song not found';
  end if;

  requested_techniques := cardinality(coalesce(p_technique_ids, '{}'::uuid[]));
  if p_technique_ids is not null and requested_techniques > 0 then
    select count(*) into valid_techniques
    from public.techniques
    where id = any(p_technique_ids) and active = true;
    if valid_techniques <> requested_techniques then
      raise exception using errcode = '23503', message = 'Invalid technique';
    end if;
  end if;

  insert into public.practice_sessions (
    user_id, title, started_at, notes, mood, focus_area
  ) values (
    p_user_id, p_title, coalesce(p_started_at, now()), p_notes, p_mood, p_focus_area
  ) returning id into created_session_id;

  insert into public.practice_session_songs (
    practice_session_id, song_id, practiced_bpm
  ) values (
    created_session_id, p_song_id, p_practiced_bpm
  ) returning id into created_session_song_id;

  insert into public.practice_session_techniques (
    practice_session_song_id, technique_id
  )
  select created_session_song_id, technique_id
  from unnest(coalesce(p_technique_ids, '{}'::uuid[])) as technique_id;

  return created_session_id;
end;
$$;

create or replace function public.finish_practice_session(
  p_user_id uuid,
  p_session_id uuid,
  p_song_id uuid,
  p_ended_at timestamptz,
  p_duration_seconds integer,
  p_paused_seconds integer default 0,
  p_notes text default null,
  p_mood text default null,
  p_focus_area text default null,
  p_song_notes text default null,
  p_seconds_practiced integer default null,
  p_practiced_bpm integer default null,
  p_progress_rating integer default null,
  p_repetitions integer default null,
  p_quality_rating integer default null,
  p_technique_ids uuid[] default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  owned_session_started_at timestamptz;
  owned_session_song_id uuid;
  requested_techniques integer;
  valid_techniques integer;
begin
  select started_at into owned_session_started_at
  from public.practice_sessions
  where id = p_session_id and user_id = p_user_id and deleted_at is null
  for update;

  if owned_session_started_at is null then
    raise exception using errcode = 'P0002', message = 'Practice session not found';
  end if;

  if p_ended_at < owned_session_started_at then
    raise exception using errcode = '22007', message = 'ended_at must be after started_at';
  end if;

  select id into owned_session_song_id
  from public.practice_session_songs
  where practice_session_id = p_session_id and song_id = p_song_id
  for update;

  if owned_session_song_id is null then
    raise exception using errcode = 'P0002', message = 'Practice session song not found';
  end if;

  requested_techniques := cardinality(coalesce(p_technique_ids, '{}'::uuid[]));
  if p_technique_ids is not null and requested_techniques > 0 then
    select count(*) into valid_techniques
    from public.techniques
    where id = any(p_technique_ids) and active = true;
    if valid_techniques <> requested_techniques then
      raise exception using errcode = '23503', message = 'Invalid technique';
    end if;
  end if;

  update public.practice_sessions
  set
    ended_at = p_ended_at,
    duration_seconds = p_duration_seconds,
    duration_minutes = floor(p_duration_seconds / 60.0)::integer,
    paused_seconds = coalesce(p_paused_seconds, 0),
    notes = coalesce(p_notes, notes),
    mood = coalesce(p_mood, mood),
    focus_area = coalesce(p_focus_area, focus_area)
  where id = p_session_id and user_id = p_user_id and deleted_at is null;

  update public.practice_session_songs
  set
    seconds_practiced = coalesce(p_seconds_practiced, p_duration_seconds),
    minutes_practiced = floor(coalesce(p_seconds_practiced, p_duration_seconds) / 60.0)::integer,
    notes = coalesce(p_song_notes, notes),
    practiced_bpm = coalesce(p_practiced_bpm, practiced_bpm),
    progress_rating = coalesce(p_progress_rating, progress_rating),
    repetitions = coalesce(p_repetitions, repetitions),
    quality_rating = coalesce(p_quality_rating, quality_rating)
  where id = owned_session_song_id;

  if p_technique_ids is not null then
    delete from public.practice_session_techniques
    where practice_session_song_id = owned_session_song_id;

    insert into public.practice_session_techniques (
      practice_session_song_id, technique_id
    )
    select owned_session_song_id, technique_id
    from unnest(p_technique_ids) as technique_id;
  end if;

  update public.songs
  set last_practiced_at = p_ended_at
  where id = p_song_id and user_id = p_user_id and deleted_at is null;

  return p_session_id;
end;
$$;

revoke all on function public.start_practice_session(
  uuid, uuid, text, timestamptz, text, text, text, integer, uuid[]
) from public;
revoke all on function public.finish_practice_session(
  uuid, uuid, uuid, timestamptz, integer, integer, text, text, text,
  text, integer, integer, integer, integer, integer, uuid[]
) from public;

grant execute on function public.start_practice_session(
  uuid, uuid, text, timestamptz, text, text, text, integer, uuid[]
) to service_role;
grant execute on function public.finish_practice_session(
  uuid, uuid, uuid, timestamptz, integer, integer, text, text, text,
  text, integer, integer, integer, integer, integer, uuid[]
) to service_role;
