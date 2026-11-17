begin;
insert into public.password_recovery_requests(token_hash, email_hash, created_at, expires_at) values
 (repeat('a', 64), repeat('b', 64), now(), now() + interval '1 hour'),
 (repeat('c', 64), repeat('b', 64), now() - interval '2 hours', now() - interval '1 minute');
do $$ declare matches integer; begin
 assert not has_table_privilege('anon', 'public.password_recovery_requests', 'select');
 assert not has_table_privilege('authenticated', 'public.password_recovery_requests', 'update');
 assert has_table_privilege('service_role', 'public.password_recovery_requests', 'update');
 update public.password_recovery_requests set consumed_at = now()
 where token_hash = repeat('a',64) and email_hash = repeat('x',64) and consumed_at is null and expires_at > now();
 get diagnostics matches = row_count;
 assert matches = 0, 'Foreign email must not redeem proof';
 update public.password_recovery_requests set consumed_at = now()
 where token_hash = repeat('c',64) and email_hash = repeat('b',64) and consumed_at is null and expires_at > now();
 get diagnostics matches = row_count;
 assert matches = 0, 'Expired proof must not be consumed';
 update public.password_recovery_requests set consumed_at = now()
 where token_hash = repeat('a',64) and email_hash = repeat('b',64) and consumed_at is null and expires_at > now();
 get diagnostics matches = row_count;
 assert matches = 1, 'Valid proof must succeed once';
 update public.password_recovery_requests set consumed_at = now()
 where token_hash = repeat('a',64) and email_hash = repeat('b',64) and consumed_at is null and expires_at > now();
 get diagnostics matches = row_count;
 assert matches = 0, 'Proof reuse must fail';
end $$;
rollback;
