# Lydian API — NestJS + Supabase Architecture Guidelines

## 1. Project Goal

The Lydian backend must be built as a secure, modular and scalable NestJS API using Supabase as infrastructure.

The frontend must never access Supabase tables directly.

The intended architecture is:

```txt
Angular Frontend
   |
   | HTTP REST API
   v
NestJS Backend
   |
   | Supabase SDK / SQL / Storage
   v
Supabase
  ├── Auth
  ├── Postgres
  └── Storage
```

NestJS is the business layer.
Supabase is the infrastructure layer.

---

## 2. Core Architecture Decisions

### 2.1 Frontend must not access Supabase Database directly

The Angular app can use Supabase Auth for login/session handling, but it must not read or write application data directly from Supabase tables.

Allowed:

```txt
Angular -> Supabase Auth
Angular -> NestJS API -> Supabase Database
```

Not allowed:

```txt
Angular -> Supabase Database
```

Reason:

- centralizes business rules
- protects data access
- avoids exposing database structure
- keeps the frontend decoupled from Supabase
- makes future migration easier
- allows better logging, validation, caching and authorization

---

## 3. Authentication Strategy

Initial authentication strategy:

```txt
Supabase Auth + NestJS Guards
```

### Implementation Details
- **Global Auth Guard:** All routes are protected by default via `AuthGuard`.
- **JWT Validation:** The backend uses the `SupabaseAdminClient` to verify the Bearer token with Supabase Auth.
- **Request Context:** Validated user data is attached to the Request object as `request['user']`.

### Practical Usage

#### 1. Public Routes
To make a route or a whole controller public, use the `@Public()` decorator:

```ts
import { Public } from './common/decorators/public.decorator';

@Public()
@Get('health')
getHealth() {
  return { status: 'ok' };
}
```

#### 2. Accessing Current User
To access the authenticated user data in a controller, use the `@CurrentUser()` decorator:

```ts
import { CurrentUser } from './common/decorators/current-user.decorator';
import { AuthenticatedUser } from './common/types/authenticated-user.type';

@Get('me')
getMe(@CurrentUser() user: AuthenticatedUser) {
  return user;
}
```

Every protected endpoint must validate the JWT on the backend.
The frontend authentication state must never be blindly trusted.

---

## 4. Supabase Keys

### Public anon key

Can be used in the frontend only for authentication flows.

### Service role key

Must only exist on the backend.

Never expose the service role key to:

- Angular
- browser
- logs
- error responses
- public repositories
- CI logs

The service role key bypasses Row Level Security and must be treated as a high-risk secret.

---

## 5. Environment Variables

Use `.env` locally and secure environment variables in production.

Required initial variables:

```env
NODE_ENV=development
PORT=3000

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

CORS_ORIGIN=http://localhost:4200
```

Optional in the current backend-centric MVP:

```env
SUPABASE_ANON_KEY=
SUPABASE_JWT_SECRET=
```

The current API validates sessions through the Supabase SDK using the backend
service-role client. The anon key and local JWT secret should only become
required if a future server-side flow actually consumes them.

Future variables:

```env
REDIS_URL=
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
SENTRY_DSN=
POSTHOG_API_KEY=
```

Rules:

- never hardcode env values
- never commit `.env`
- always validate env vars on application startup
- fail fast if required env vars are missing

---

## 6. Recommended Folder Structure

```txt
src/
  main.ts
  app.module.ts

  config/
    env.schema.ts
    app.config.ts
    supabase.config.ts

  common/
    decorators/
      current-user.decorator.ts
    filters/
      http-exception.filter.ts
    guards/
      auth.guard.ts
    interceptors/
      response.interceptor.ts
    pipes/
    types/
      authenticated-user.type.ts

  infra/
    supabase/
      supabase.module.ts
      supabase.service.ts
      supabase-admin.client.ts
      supabase-auth.service.ts

  modules/
    auth/
      auth.module.ts
      auth.controller.ts
      auth.service.ts

    users/
      users.module.ts
      users.controller.ts
      users.service.ts
      repositories/
        users.repository.ts
      dto/
        update-user-profile.dto.ts
      entities/
        user.entity.ts

    songs/
      songs.module.ts
      songs.controller.ts
      songs.service.ts
      repositories/
        songs.repository.ts
      dto/
        create-song.dto.ts
        update-song.dto.ts
        song-response.dto.ts
      entities/
        song.entity.ts

    setlists/
      setlists.module.ts
      setlists.controller.ts
      setlists.service.ts
      repositories/
        setlists.repository.ts
      dto/
        create-setlist.dto.ts
        update-setlist.dto.ts
        add-song-to-setlist.dto.ts
      entities/
        setlist.entity.ts

    practice/
      practice.module.ts
      practice.controller.ts
      practice.service.ts
      repositories/
        practice.repository.ts
      dto/
      entities/
```

---

## 7. Clean Architecture Rules

### Controllers

Controllers are responsible only for:

- receiving requests
- applying route decorators
- calling services
- returning responses

Controllers must not contain:

- database queries
- Supabase calls
- business rules
- complex conditionals
- data mapping logic

### Services

Services are responsible for:

- business rules
- orchestration
- validation beyond DTO level
- authorization checks
- calling repositories
- calling external integrations

Services must not create Supabase clients directly.

### Repositories

Repositories are responsible for:

- database reads
- database writes
- query construction
- mapping raw database rows when needed

Repositories must not contain business rules.

### Infra Layer

The infra layer is responsible for:

- Supabase client creation
- storage providers
- external SDK configuration
- low-level integrations

Application modules should depend on abstractions as much as possible.

---

## 8. Supabase Access Pattern

Bad:

```ts
// Do not do this inside services
this.supabase.client.from('songs').select('*');
```

Good:

```ts
// songs.service.ts
return this.songsRepository.findByUserId(user.id);
```

```ts
// songs.repository.ts
return this.supabase.admin
  .from('songs')
  .select('*')
  .eq('user_id', userId);
```

### Storage Access Patterns

When dealing with Supabase Storage (e.g., file uploads, album covers, audio files):
- Do not expose buckets publicly unless explicitly required.
- The NestJS backend should generate and return **Signed URLs** for private files.
- File uploads should be validated (mime type, size) by the NestJS backend before being sent to Supabase Storage, or NestJS can generate a pre-signed upload URL for direct client-to-storage uploads if large files are expected.

---

## 9. API Standards

Use REST initially.

### Versioning
All endpoints must be versioned. The current default version is **v1**.
The URI pattern must be: `/v1/endpoint`

Recommended routes:

```txt
GET    /v1/health

GET    /v1/me
PATCH  /v1/me

GET    /v1/songs
GET    /v1/songs/:id
POST   /v1/songs
PATCH  /v1/songs/:id
DELETE /v1/songs/:id

GET    /v1/setlists
GET    /v1/setlists/:id
POST   /v1/setlists
PATCH  /v1/setlists/:id
DELETE /v1/setlists/:id

POST   /v1/setlists/:id/songs
DELETE /v1/setlists/:id/songs/:songId

GET    /v1/practice-sessions
POST   /v1/practice-sessions
GET    /v1/practice-sessions/:id
PATCH  /v1/practice-sessions/:id
DELETE /v1/practice-sessions/:id
```

---

## 10. Response Pattern

Use a consistent API response format.

Success:

```json
{
  "data": {}
}
```

Paginated success:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 120
  }
}
```

Error:

```json
{
  "statusCode": 400,
  "message": "Invalid request",
  "error": "Bad Request"
}
```

---

## 11. Validation

Use:

```txt
class-validator
class-transformer
```

Enable global validation pipe:

```ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

Every request body must use DTOs.

Do not accept raw untyped objects.

---

## 12. Security Best Practices

### Required

- validate JWT on every protected endpoint
- validate resource ownership
- validate request body with DTOs
- sanitize user-controlled input when needed
- never expose internal errors
- never expose database errors directly
- never expose stack traces in production
- enable CORS only for allowed origins
- use rate limiting
- use Helmet
- use HTTPS in production

### Recommended packages

```bash
npm install @nestjs/config @supabase/supabase-js class-validator class-transformer helmet
npm install @nestjs/throttler
```

---

## 13. Authorization Rules

Authentication confirms who the user is.

Authorization confirms what the user can access.

Every user-owned resource must include `user_id`.

Example:

```txt
songs.user_id
setlists.user_id
practice_sessions.user_id
```

When fetching a resource, always filter by both:

```txt
id
user_id
```

Example:

```ts
.eq('id', songId)
.eq('user_id', userId)
```

Never fetch by `id` only for user-owned resources.

---

## 14. Row Level Security

Even if the backend uses the service role key, RLS should still be enabled where possible.

Reason:

- protects against future mistakes
- allows safe usage of anon key for auth-related flows
- keeps database security explicit
- protects future direct access use cases if needed

However, the main application data flow should remain:

```txt
NestJS -> Supabase with service role key
```

RLS is an additional safety layer, not the main application authorization layer.

---

## 15. Initial Database Modeling & Migrations

### Migrations Strategy
All database schema changes must be managed via versioned migrations, not via manual changes in the Supabase Dashboard.
- We will use the **Supabase CLI** to generate and apply pure SQL migrations.
- This ensures the database state is reproducible across local, staging, and production environments.

### General Modeling Rules
Use `snake_case` for database names.

Use `uuid` primary keys.

Use `created_at`, `updated_at` and optionally `deleted_at`.

---

# 15.1 users

Stores the application profile related to the Supabase Auth user.

```sql
create table public.users (
  id uuid primary key,
  email text not null unique,
  display_name text,
  avatar_url text,
  main_instrument text,
  experience_level text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
```

### User Profile Lifecycle (Auth Trigger)
The `public.users` table should be automatically populated when a new user signs up via Supabase Auth.
We will use a Postgres Database Trigger to ensure atomic creation:

```sql
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

Notes:

- `id` should match Supabase Auth `auth.users.id`
- do not store passwords
- auth data remains in Supabase Auth

---

# 15.2 songs

Stores user-created songs or imported song references.

```sql
create table public.songs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,

  title text not null,
  artist text not null,
  album text,
  genre text,

  musical_key text,
  capo integer,
  tuning text,
  bpm integer,
  difficulty text,

  spotify_track_id text,
  spotify_preview_url text,
  spotify_external_url text,
  cover_image_url text,

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
```

Suggested indexes:

```sql
create index songs_user_id_idx on public.songs(user_id);
create index songs_title_idx on public.songs(title);
create index songs_artist_idx on public.songs(artist);
create index songs_spotify_track_id_idx on public.songs(spotify_track_id);
```

---

# 15.3 setlists

Stores user setlists.

```sql
create table public.setlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,

  name text not null,
  description text,
  visibility text not null default 'private',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
```

Allowed `visibility` values initially:

```txt
private
public
unlisted
```

Suggested indexes:

```sql
create index setlists_user_id_idx on public.setlists(user_id);
```

---

# 15.4 setlist_songs

Join table between setlists and songs.

```sql
create table public.setlist_songs (
  id uuid primary key default gen_random_uuid(),

  setlist_id uuid not null references public.setlists(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,

  position integer not null,
  notes text,

  created_at timestamptz not null default now(),

  unique(setlist_id, song_id),
  unique(setlist_id, position)
);
```

Suggested indexes:

```sql
create index setlist_songs_setlist_id_idx on public.setlist_songs(setlist_id);
create index setlist_songs_song_id_idx on public.setlist_songs(song_id);
```

---

# 15.5 practice_sessions

Stores practice logs.

```sql
create table public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,

  title text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_minutes integer,

  notes text,
  mood text,
  focus_area text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
```

Suggested indexes:

```sql
create index practice_sessions_user_id_idx on public.practice_sessions(user_id);
create index practice_sessions_started_at_idx on public.practice_sessions(started_at);
```

---

# 15.6 practice_session_songs

Optional table to connect practice sessions with songs.

```sql
create table public.practice_session_songs (
  id uuid primary key default gen_random_uuid(),

  practice_session_id uuid not null references public.practice_sessions(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,

  minutes_practiced integer,
  notes text,
  progress_rating integer,

  created_at timestamptz not null default now()
);
```

Suggested indexes:

```sql
create index practice_session_songs_session_id_idx on public.practice_session_songs(practice_session_id);
create index practice_session_songs_song_id_idx on public.practice_session_songs(song_id);
```

---

## 15.7 Practice data foundation

The practice domain evolves incrementally without breaking the MVP contracts.
Legacy minute fields and Spotify-specific columns remain readable while new
clients migrate to precise and provider-neutral fields.

### Time precision

- `practice_sessions.duration_seconds` is the canonical session duration.
- `practice_sessions.paused_seconds` stores total paused time for the MVP.
- `practice_session_songs.seconds_practiced` is the canonical per-song time.
- Minute fields are compatibility projections and must not be used for new
  calculations.

### Song learning metadata

Songs may store `duration_seconds`, neutral provider metadata,
`learning_status`, `target_bpm`, `priority` and `last_practiced_at`. Provider
metadata must not be coupled to Apple Music or Spotify in new integrations.

### Goals and timezone

`user_practice_goals` stores daily target seconds, weekly target days and an
IANA timezone. Day/week boundaries and streak calculations belong to the
backend; the frontend must not infer them from the browser timezone.

### Techniques

`techniques` is a curated global catalog. `song_techniques` describes the
techniques required by a song and `practice_session_techniques` records what
was actually practiced. Free-form notes remain supported, but must not be used
as the source for skill metrics.

### Atomic session lifecycle

Starting and finishing a session span multiple tables and must remain atomic.
The repositories call the versioned SQL functions
`start_practice_session(...)` and `finish_practice_session(...)`; controllers
and services must not reproduce those transactions as sequential writes.
Both functions receive the authenticated `user_id`, verify ownership in the
transaction and are executable only by the backend service role.

### Read models

`GET /v1/practice-sessions/history` is an enriched, paginated read model for
history screens. It includes songs and techniques in one repository query to
avoid list-then-detail N+1 requests. Dashboard/Profile aggregates should be
built later over these canonical fields rather than over UI-specific mocks.

---

## 16. Soft Delete Strategy

For main user entities, prefer soft delete using:

```txt
deleted_at
```

Default queries must ignore deleted records:

```sql
where deleted_at is null
```

Hard delete can be used for join tables when appropriate.

---

## 17. Timestamps

All main tables should have:

```txt
created_at
updated_at
```

Use database triggers or application-level updates to maintain `updated_at`.

Recommended database function:

```sql
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
```

Example trigger:

```sql
create trigger set_songs_updated_at
before update on public.songs
for each row
execute function public.set_updated_at();
```

---

## 18. Pagination

Every list endpoint should support pagination.

Query params:

```txt
page
limit
search
sort_by
sort_order
```

Default:

```txt
page=1
limit=20
```

Maximum allowed limit:

```txt
100
```

---

## 19. Error Handling

Use NestJS exceptions.

Examples:

```txt
BadRequestException
UnauthorizedException
ForbiddenException
NotFoundException
ConflictException
InternalServerErrorException
```

### Postgres Error Mapping
Do not throw raw Supabase/Postgres errors directly to the client.
Map database errors to safe application errors within the Repositories or an Interceptor/Filter.

For example:
- Postgres code `23505` (unique_violation) -> `ConflictException`
- Postgres code `23503` (foreign_key_violation) -> `BadRequestException` or `NotFoundException` depending on context.

This prevents the codebase from being cluttered with DB-specific conditionals and prevents leaking schema details to the client.

---

## 20. Logging

Log:

- request id
- route
- method
- user id when available
- status code
- duration
- error type

Never log:

- access tokens
- refresh tokens
- Supabase service role key
- passwords
- API keys

---

## 21. CORS

CORS must be restricted.

Development:

```txt
http://localhost:4200
```

Production:

```txt
https://lydianmusic.com
```

Do not use wildcard CORS in production.

---

## 22. Rate Limiting

Apply global rate limiting using `@nestjs/throttler`.

### Global Policy
- **TTL:** 60 seconds
- **Limit:** 60 requests per minute

More strict limits should be added later for:

- auth-sensitive endpoints
- Spotify API proxy endpoints
- recommendation endpoints
- billing webhooks

---

## 23. Health Check

Create a public health check endpoint:

```txt
GET /health
```

Response:

```json
{
  "status": "ok"
}
```

Do not expose secrets, database URLs or internal diagnostics.

---

## 24. Testing Strategy

Minimum testing strategy:

- unit tests for services
- unit tests for guards
- unit tests for repositories with mocked Supabase client
- e2e tests for critical API endpoints

AI Agents must create tests when implementing non-trivial business logic.

---

## 25. Initial Development Order

Recommended implementation order:

```txt
1. [DONE] Project setup
2. [DONE] Config module and env validation
3. [DONE] Supabase infra module
4. [DONE] Auth guard for Supabase JWT
5. [DONE] Current user decorator
6. [DONE] Users module
7. [DONE] Songs module
8. [DONE] Setlists module
9. [DONE] Practice sessions module
10. [DONE] Global error handling
11. [DONE] Pagination helpers
12. [DONE] Initial unit and auth e2e tests
```

---

## 26. MVP API Scope

Initial MVP should include:

### Auth

```txt
GET /me
PATCH /me
```

### Songs

```txt
GET /songs
GET /songs/:id
POST /songs
PATCH /songs/:id
DELETE /songs/:id
```

### Setlists

```txt
GET /setlists
GET /setlists/:id
POST /setlists
PATCH /setlists/:id
DELETE /setlists/:id
POST /setlists/:id/songs
DELETE /setlists/:id/songs/:songId
```

### Practice

```txt
GET /practice-sessions
POST /practice-sessions
GET /practice-sessions/:id
PATCH /practice-sessions/:id
DELETE /practice-sessions/:id
```

---

## 27. AI Agent Rules

When an AI Agent works on this project, it must follow these rules:

1. Do not put business logic in controllers.
2. Do not access Supabase directly from controllers.
3. Do not access Supabase directly from services.
4. Use repositories for database operations.
5. Use DTOs for all request bodies.
6. Use typed entities or interfaces for responses.
7. Validate ownership of all user-owned resources.
8. Never fetch user-owned resources by `id` only.
9. Never expose secrets.
10. Never log tokens.
11. Keep modules isolated.
12. Prefer small services and small files.
13. Do not create duplicate helpers.
14. Follow existing naming conventions.
15. Add tests for important logic.
16. Keep the backend as the source of truth.
17. Treat Supabase as infrastructure, not as the application architecture.

---

## 28. Future Modules

Do not implement these initially unless requested.

Future modules:

```txt
spotify/
billing/
recommendations/
notifications/
analytics/
collaboration/
```

Recommended order after MVP:

```txt
1. Spotify integration
2. Stripe billing
3. Resend emails
4. Redis cache
5. Recommendations
6. Collaboration/realtime
```

---

---

# 30. Authentication Architecture

Lydian authentication architecture must follow a backend-centric authentication strategy.

The frontend must never directly communicate with Supabase Auth SDK.

Architecture:

```txt
Angular Frontend
   |
   | HTTP Requests + Cookies
   v
NestJS API
   |
   | Supabase Auth API
   v
Supabase Auth
```

The backend is the single source of truth for authentication and session handling.

---

# 30.1 Authentication Flow

Authentication flow:

```txt
1. Angular sends login/signup request to NestJS
2. NestJS communicates with Supabase Auth
3. Supabase returns session data
4. NestJS stores tokens in HttpOnly cookies
5. Angular automatically sends cookies in future requests
6. NestJS validates session on protected endpoints
```

Frontend must never store authentication tokens manually.

---

# 30.2 Forbidden Authentication Patterns

The frontend MUST NOT:

* use localStorage for auth tokens
* use sessionStorage for auth tokens
* manually persist JWTs
* manually attach Authorization Bearer tokens
* directly call Supabase Auth SDK
* directly call Supabase database

Forbidden:

```txt
localStorage.setItem('token', ...)
```

Forbidden:

```txt
Authorization: Bearer ...
```

The frontend must rely only on HttpOnly cookies.

---

# 30.3 Cookie-Based Authentication

Authentication must use:

```txt
HttpOnly cookies
```

Reasons:

* prevents token access through JavaScript
* mitigates XSS token theft
* centralizes session handling
* keeps frontend simpler
* improves security architecture

Recommended cookie configuration:

```txt
httpOnly: true
secure: true (production)
sameSite: 'lax'
```

Access tokens and refresh tokens must be stored in separate cookies.

---

# 30.4 Angular Authentication Rules

Angular must:

* communicate only with NestJS endpoints
* use `withCredentials: true`
* never access tokens directly
* never decode JWTs manually
* never persist auth data locally

Example interceptor:

```ts
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  return next(
    req.clone({
      withCredentials: true,
    }),
  );
};
```

The frontend should treat authentication as a session-based system rather than a token-managed system.

---

# 30.5 NestJS Authentication Responsibilities

NestJS is responsible for:

* login
* signup
* logout
* refresh token flow
* session validation
* token exchange
* social login callbacks
* setting cookies
* clearing cookies
* authorization guards

NestJS must communicate with Supabase Auth internally.

---

# 30.6 Supabase Responsibilities

Supabase Auth is responsible for:

* password authentication
* OAuth authentication
* session generation
* refresh token generation
* email confirmation
* password reset
* JWT signing
* user identity management

Supabase should not manage frontend sessions directly.

NestJS must orchestrate the authentication lifecycle.

---

# 30.7 Social Login Architecture

Social login must also remain backend-centric.

Flow:

```txt
Angular
   |
GET /auth/google
   |
NestJS
   |
Supabase OAuth
   |
Google
   |
Supabase Callback
   |
NestJS Callback
   |
HttpOnly Cookies
   |
Angular Redirect
```

Frontend should never receive raw OAuth provider tokens.

---

# 30.8 Auth Endpoints

Recommended initial auth endpoints:

```txt
POST /auth/signup
POST /auth/login
POST /auth/logout
POST /auth/refresh
GET  /auth/me

GET  /auth/google
GET  /auth/github
GET  /auth/callback
```

---

# 30.9 CSRF Considerations

Because authentication uses cookies, CSRF protection should be considered.

Initial MVP may use:

```txt
sameSite: 'lax'
```

Future production hardening may include:

* CSRF tokens
* origin validation
* stricter sameSite policies

---

# 30.10 Cookie Security Rules

Production cookies must use:

```txt
secure: true
```

Development may temporarily use:

```txt
secure: false
```

Cookies must:

* have proper expiration
* use minimal scope/path
* never expose tokens to JavaScript
* be cleared on logout

---

# 30.11 Session Validation

Protected routes must validate the authenticated user on every request.

Frontend authentication state must never be blindly trusted.

Authentication guards must validate:

* access token validity
* expiration
* user existence
* revoked sessions when applicable

---

# 30.12 Final Authentication Principle

Authentication architecture must prioritize:

```txt
security
simplicity
backend ownership
frontend isolation
future scalability
```

The frontend should behave as a thin client.

NestJS should own the authentication lifecycle.
