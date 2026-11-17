-- One-use proof sent only through the recovery email's redirect URL.
-- No plaintext email or bearer token is stored.
create table public.password_recovery_requests (
  token_hash text primary key check (char_length(token_hash) = 64),
  email_hash text not null check (char_length(email_hash) = 64),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  constraint recovery_request_expiry_check check (expires_at > created_at)
);
alter table public.password_recovery_requests enable row level security;
revoke all on table public.password_recovery_requests from public, anon, authenticated;
grant select, insert, update, delete on table public.password_recovery_requests to service_role;
create index password_recovery_requests_expiry_idx on public.password_recovery_requests(expires_at);
