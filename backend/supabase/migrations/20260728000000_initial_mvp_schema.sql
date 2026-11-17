create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  avatar_url text,
  main_instrument text,
  experience_level text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.songs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  artist text not null check (char_length(artist) between 1 and 200),
  album text,
  genre text,
  musical_key text,
  capo integer check (capo between 0 and 24),
  tuning text,
  bpm integer check (bpm between 1 and 400),
  difficulty text check (difficulty is null or difficulty in ('beginner', 'intermediate', 'advanced')),
  spotify_track_id text,
  spotify_preview_url text,
  spotify_external_url text,
  cover_image_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.setlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 200),
  description text,
  visibility text not null default 'private'
    check (visibility in ('private', 'public', 'unlisted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.setlist_songs (
  id uuid primary key default gen_random_uuid(),
  setlist_id uuid not null references public.setlists(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  position integer not null check (position >= 0),
  notes text,
  created_at timestamptz not null default now(),
  unique (setlist_id, song_id),
  unique (setlist_id, position)
);

create table public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text check (title is null or char_length(title) between 1 and 200),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_minutes integer check (duration_minutes is null or duration_minutes >= 0),
  notes text,
  mood text,
  focus_area text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (ended_at is null or ended_at >= started_at)
);

create table public.practice_session_songs (
  id uuid primary key default gen_random_uuid(),
  practice_session_id uuid not null references public.practice_sessions(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  minutes_practiced integer check (minutes_practiced is null or minutes_practiced >= 0),
  notes text,
  progress_rating integer check (progress_rating between 1 and 5),
  created_at timestamptz not null default now(),
  unique (practice_session_id, song_id)
);

create index songs_user_id_idx on public.songs(user_id) where deleted_at is null;
create index songs_title_idx on public.songs(title);
create index songs_artist_idx on public.songs(artist);
create index songs_spotify_track_id_idx on public.songs(spotify_track_id);
create index setlists_user_id_idx on public.setlists(user_id) where deleted_at is null;
create index setlist_songs_setlist_id_idx on public.setlist_songs(setlist_id);
create index setlist_songs_song_id_idx on public.setlist_songs(song_id);
create index practice_sessions_user_id_idx on public.practice_sessions(user_id) where deleted_at is null;
create index practice_sessions_started_at_idx on public.practice_sessions(started_at);
create index practice_session_songs_session_id_idx on public.practice_session_songs(practice_session_id);
create index practice_session_songs_song_id_idx on public.practice_session_songs(song_id);

create trigger set_users_updated_at before update on public.users
for each row execute function public.set_updated_at();
create trigger set_songs_updated_at before update on public.songs
for each row execute function public.set_updated_at();
create trigger set_setlists_updated_at before update on public.setlists
for each row execute function public.set_updated_at();
create trigger set_practice_sessions_updated_at before update on public.practice_sessions
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, email, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.users enable row level security;
alter table public.songs enable row level security;
alter table public.setlists enable row level security;
alter table public.setlist_songs enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.practice_session_songs enable row level security;

create policy "users_own_profile" on public.users
for all to authenticated using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "songs_owned_by_user" on public.songs
for all to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "setlists_readable_by_owner_or_public" on public.setlists
for select to authenticated using (
  (select auth.uid()) = user_id or visibility in ('public', 'unlisted')
);
create policy "setlists_writable_by_owner" on public.setlists
for all to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "setlist_songs_readable_through_setlist" on public.setlist_songs
for select to authenticated using (
  exists (
    select 1 from public.setlists
    where setlists.id = setlist_songs.setlist_id
      and (setlists.user_id = (select auth.uid()) or setlists.visibility in ('public', 'unlisted'))
  )
);
create policy "setlist_songs_writable_by_owner" on public.setlist_songs
for all to authenticated using (
  exists (
    select 1 from public.setlists
    where setlists.id = setlist_songs.setlist_id
      and setlists.user_id = (select auth.uid())
  )
) with check (
  exists (
    select 1 from public.setlists
    where setlists.id = setlist_songs.setlist_id
      and setlists.user_id = (select auth.uid())
  )
);

create policy "practice_sessions_owned_by_user" on public.practice_sessions
for all to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "practice_session_songs_owned_by_user" on public.practice_session_songs
for all to authenticated using (
  exists (
    select 1 from public.practice_sessions
    where practice_sessions.id = practice_session_songs.practice_session_id
      and practice_sessions.user_id = (select auth.uid())
  )
) with check (
  exists (
    select 1 from public.practice_sessions
    where practice_sessions.id = practice_session_songs.practice_session_id
      and practice_sessions.user_id = (select auth.uid())
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lydian-assets',
  'lydian-assets',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
