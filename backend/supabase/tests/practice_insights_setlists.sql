-- Execute against a disposable database after all migrations. Fixtures roll back.
begin;
insert into auth.users (id, email, raw_user_meta_data) values
 ('00000000-0000-4000-8000-000000000001', 'insights-one@example.test', '{}'::jsonb),
 ('00000000-0000-4000-8000-000000000002', 'insights-two@example.test', '{}'::jsonb);
insert into public.user_practice_goals(user_id, timezone, daily_target_seconds, weekly_target_days)
 values ('00000000-0000-4000-8000-000000000001', 'Pacific/Kiritimati', 60, 1);
insert into public.songs(id, user_id, title, artist, duration_seconds, learning_status, cover_image_url) values
 ('00000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000001', 'One', 'Artist', 120, 'mastered', 'https://example.test/one.png'),
 ('00000000-0000-4000-8000-000000000012', '00000000-0000-4000-8000-000000000001', 'Two', 'Artist', null, 'learning', 'https://example.test/two.png'),
 ('00000000-0000-4000-8000-000000000013', '00000000-0000-4000-8000-000000000002', 'Other', 'Artist', 900, 'mastered', null),
 ('00000000-0000-4000-8000-000000000014', '00000000-0000-4000-8000-000000000001', 'Deleted', 'Artist', 300, 'mastered', null);
update public.songs set deleted_at = now() where id = '00000000-0000-4000-8000-000000000014';

-- More than the PostgREST default 1000-row cap: aggregates must use the complete history.
insert into public.practice_sessions(user_id, started_at, ended_at, duration_seconds)
 select '00000000-0000-4000-8000-000000000001',
 (((now() at time zone 'Pacific/Kiritimati')::date - 1)::timestamp + interval '12 hours') at time zone 'Pacific/Kiritimati',
 (((now() at time zone 'Pacific/Kiritimati')::date - 1)::timestamp + interval '12 hours 1 second') at time zone 'Pacific/Kiritimati', 1
 from generate_series(1, 1100);
insert into public.practice_sessions(id, user_id, started_at, ended_at, duration_seconds) values
 ('00000000-0000-4000-8000-000000000021', '00000000-0000-4000-8000-000000000001', now() - interval '1 microsecond', now(), 60),
 ('00000000-0000-4000-8000-000000000022', '00000000-0000-4000-8000-000000000001', now() - interval '1 hour', null, 999),
 ('00000000-0000-4000-8000-000000000023', '00000000-0000-4000-8000-000000000002', now() - interval '1 hour', now(), 999),
 ('00000000-0000-4000-8000-000000000024', '00000000-0000-4000-8000-000000000001', now() - interval '1 hour', now(), 999);
update public.practice_sessions set deleted_at = now() where id = '00000000-0000-4000-8000-000000000024';
insert into public.practice_sessions(user_id, started_at, ended_at, duration_minutes)
 values ('00000000-0000-4000-8000-000000000001', now() - interval '40 days', now() - interval '40 days' + interval '2 minutes', 2);
insert into public.practice_session_songs(id, practice_session_id, song_id, seconds_practiced, practiced_bpm, quality_rating, repetitions) values
 ('00000000-0000-4000-8000-000000000031', '00000000-0000-4000-8000-000000000021', '00000000-0000-4000-8000-000000000011', 60, 100, 4, 3);
insert into public.practice_session_techniques(practice_session_song_id, technique_id)
 select '00000000-0000-4000-8000-000000000031', id from public.techniques where key in ('bends', 'legato');

insert into public.setlists(id, user_id, name) values
 ('00000000-0000-4000-8000-000000000041', '00000000-0000-4000-8000-000000000001', 'Alpha'),
 ('00000000-0000-4000-8000-000000000042', '00000000-0000-4000-8000-000000000001', 'Beta'),
 ('00000000-0000-4000-8000-000000000043', '00000000-0000-4000-8000-000000000002', 'Other');
insert into public.setlist_songs(setlist_id, song_id, position) values
 ('00000000-0000-4000-8000-000000000041', '00000000-0000-4000-8000-000000000011', 0),
 ('00000000-0000-4000-8000-000000000041', '00000000-0000-4000-8000-000000000012', 1),
 ('00000000-0000-4000-8000-000000000041', '00000000-0000-4000-8000-000000000014', 2),
 ('00000000-0000-4000-8000-000000000041', '00000000-0000-4000-8000-000000000013', 3);

do $$
declare summary jsonb; result jsonb; empty_summary jsonb;
begin
 summary := public.get_practice_summary('00000000-0000-4000-8000-000000000001');
 assert (summary #>> '{totals,session_count}')::integer = 1102, 'All completed owned sessions must count';
 assert (summary #>> '{totals,duration_seconds}')::integer = 1280, 'Full history and minute fallback';
 assert (summary #>> '{daily,duration_seconds}')::integer = 60, 'Timezone day boundary';
 assert summary ->> 'timezone' = 'Pacific/Kiritimati';
 assert (summary #>> '{daily,goal_reached}')::boolean;
 assert (summary #>> '{streak,current_days}')::integer = 2;
 assert (summary #>> '{streak,longest_days}')::integer = 2;
 assert (summary #>> '{totals,mastered_songs}')::integer = 1, 'Deleted and foreign songs excluded';
 assert (summary #>> '{totals,average_bpm}')::numeric = 100;
 assert jsonb_array_length(summary -> 'calendar') = 7;
 assert jsonb_array_length(summary -> 'weekly_evolution') = 12;
 assert jsonb_array_length(summary -> 'skills') = 2;
 assert (summary #>> '{skills,0,seconds_practiced}')::integer = 60, 'Technique time not duplicated by other techniques';
 assert (summary #>> '{achievements,0,unlocked}')::boolean;
 assert not (summary #>> '{achievements,1,unlocked}')::boolean;
 assert not has_function_privilege('authenticated', 'public.get_practice_summary(uuid)', 'execute');
 assert not has_function_privilege('anon', 'public.list_setlist_summaries(uuid,integer,integer,text,text,text)', 'execute');

 result := public.list_setlist_summaries('00000000-0000-4000-8000-000000000001', 1, 1, '', 'name', 'asc');
 assert (result #>> '{meta,total}')::integer = 2;
 assert jsonb_array_length(result -> 'data') = 1;
 assert result #>> '{data,0,name}' = 'Alpha';
 assert (result #>> '{data,0,song_count}')::integer = 2;
 assert (result #>> '{data,0,duration_seconds}')::integer = 120;
 assert (result #>> '{data,0,missing_duration_count}')::integer = 1;
 assert result #>> '{data,0,cover_image_urls,0}' = 'https://example.test/one.png';
 result := public.list_setlist_summaries('00000000-0000-4000-8000-000000000001', 1, 20, 'Beta', 'name', 'asc');
 assert (result #>> '{meta,total}')::integer = 1;
 assert (result #>> '{data,0,song_count}')::integer = 0;
 assert result #> '{data,0,cover_image_urls}' = '[]'::jsonb;
 result := public.list_setlist_summaries('00000000-0000-4000-8000-000000000001', 99, 20);
 assert jsonb_array_length(result -> 'data') = 0;
 assert (result #>> '{meta,total}')::integer = 2;

 perform public.reorder_setlist_songs('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000041', array['00000000-0000-4000-8000-000000000012','00000000-0000-4000-8000-000000000011']::uuid[]);
 assert (select position = 0 from public.setlist_songs where setlist_id = '00000000-0000-4000-8000-000000000041' and song_id = '00000000-0000-4000-8000-000000000012');
 begin
  perform public.reorder_setlist_songs('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000041', array['00000000-0000-4000-8000-000000000011']::uuid[]);
  raise exception 'Incomplete order accepted';
 exception when sqlstate '22023' then null; end;
 assert (select position = 0 from public.setlist_songs where setlist_id = '00000000-0000-4000-8000-000000000041' and song_id = '00000000-0000-4000-8000-000000000012'), 'Rejected reorder must not mutate positions';
 begin
  perform public.reorder_setlist_songs('00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000041', '{}'::uuid[]);
  raise exception 'Foreign reorder accepted';
 exception when sqlstate 'P0002' then null; end;

 delete from public.practice_sessions where user_id = '00000000-0000-4000-8000-000000000002';
 empty_summary := public.get_practice_summary('00000000-0000-4000-8000-000000000002');
 assert empty_summary ->> 'timezone' = 'UTC';
 assert (empty_summary #>> '{totals,duration_seconds}')::integer = 0;
 assert (empty_summary #>> '{streak,current_days}')::integer = 0;
 assert empty_summary -> 'skills' = '[]'::jsonb;
 assert empty_summary #> '{totals,average_bpm}' = 'null'::jsonb;
 -- Historical consecutive days across the New York DST change stay consecutive.
 insert into public.user_practice_goals(user_id, timezone) values ('00000000-0000-4000-8000-000000000002', 'America/New_York');
 insert into public.practice_sessions(user_id, started_at, ended_at, duration_seconds)
 select '00000000-0000-4000-8000-000000000002', d at time zone 'America/New_York',
   (d at time zone 'America/New_York') + interval '60 seconds', 60
 from generate_series(timestamp '2026-03-05 12:00:00', timestamp '2026-03-11 12:00:00', interval '1 day') d;
 empty_summary := public.get_practice_summary('00000000-0000-4000-8000-000000000002');
 assert (empty_summary #>> '{streak,longest_days}')::integer = 7;
 assert (empty_summary #>> '{achievements,1,unlocked}')::boolean;
 -- Missing today's practice preserves yesterday's streak, then a gap breaks it.
 delete from public.practice_sessions where id = '00000000-0000-4000-8000-000000000021';
 summary := public.get_practice_summary('00000000-0000-4000-8000-000000000001');
 assert (summary #>> '{streak,current_days}')::integer = 1;
 update public.practice_sessions set started_at = started_at - interval '2 days', ended_at = ended_at - interval '2 days'
   where user_id = '00000000-0000-4000-8000-000000000001';
 summary := public.get_practice_summary('00000000-0000-4000-8000-000000000001');
 assert (summary #>> '{streak,current_days}')::integer = 0;
 begin
  perform public.list_setlist_summaries('00000000-0000-4000-8000-000000000001', 0, 20);
  raise exception 'Invalid page accepted';
 exception when sqlstate '22023' then null; end;
 begin
  perform public.reorder_setlist_songs('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000041', array['00000000-0000-4000-8000-000000000011','00000000-0000-4000-8000-000000000011']::uuid[]);
  raise exception 'Duplicate order accepted';
 exception when sqlstate '22023' then null; end;

end $$;
rollback;
