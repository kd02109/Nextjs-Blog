begin;

create extension if not exists pgtap with schema extensions;

select plan(48);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.views'::regclass),
  'views has row level security enabled'
);
select is(
  (
    select count(*)::integer
    from pg_policies
    where schemaname = 'public'
      and tablename = 'views'
      and cmd <> 'SELECT'
  ),
  0,
  'views has no public mutation policies'
);

select ok(
  (select relrowsecurity from pg_class where oid = 'private.view_events'::regclass),
  'private view events have row level security enabled'
);
select is(
  (
    select count(*)::integer
    from pg_policies
    where schemaname = 'private' and tablename = 'view_events'
  ),
  0,
  'private view events have no public policies'
);
select columns_are(
  'private',
  'view_events',
  array['slug', 'visitor_hash', 'viewed_on'],
  'private view events store only the derived hash and deduplication keys'
);
select ok(
  not has_schema_privilege('anon', 'private', 'usage'),
  'anon cannot use the private schema'
);
select ok(
  not has_schema_privilege('authenticated', 'private', 'usage'),
  'authenticated cannot use the private schema'
);
select ok(
  not has_table_privilege('anon', 'private.view_events', 'select'),
  'anon cannot select private view events'
);
select ok(
  not has_table_privilege('anon', 'private.view_events', 'insert'),
  'anon cannot insert private view events'
);
select ok(
  not has_table_privilege('anon', 'private.view_events', 'update'),
  'anon cannot update private view events'
);
select ok(
  not has_table_privilege('anon', 'private.view_events', 'delete'),
  'anon cannot delete private view events'
);
select ok(
  not has_table_privilege('authenticated', 'private.view_events', 'select'),
  'authenticated cannot select private view events'
);
select ok(
  not has_table_privilege('authenticated', 'private.view_events', 'insert'),
  'authenticated cannot insert private view events'
);
select ok(
  not has_table_privilege('authenticated', 'private.view_events', 'update'),
  'authenticated cannot update private view events'
);
select ok(
  not has_table_privilege('authenticated', 'private.view_events', 'delete'),
  'authenticated cannot delete private view events'
);

select ok(
  has_table_privilege('anon', 'public.views', 'select'),
  'anon can select public view counts'
);
select ok(
  has_table_privilege('authenticated', 'public.views', 'select'),
  'authenticated can select public view counts'
);

select ok(
  not has_table_privilege('anon', 'public.views', 'insert'),
  'anon cannot insert view rows'
);
select ok(
  not has_table_privilege('anon', 'public.views', 'update'),
  'anon cannot update view rows'
);
select ok(
  not has_table_privilege('anon', 'public.views', 'delete'),
  'anon cannot delete view rows'
);
select ok(
  not has_table_privilege('authenticated', 'public.views', 'insert'),
  'authenticated cannot insert view rows'
);
select ok(
  not has_table_privilege('authenticated', 'public.views', 'update'),
  'authenticated cannot update view rows'
);
select ok(
  not has_table_privilege('authenticated', 'public.views', 'delete'),
  'authenticated cannot delete view rows'
);

select ok(
  not has_function_privilege(
    'anon',
    'public.increment_view(text,text)',
    'execute'
  ),
  'anon cannot execute increment_view'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'public.increment_view(text,text)',
    'execute'
  ),
  'authenticated cannot execute increment_view'
);
select ok(
  has_function_privilege(
    'service_role',
    'public.increment_view(text,text)',
    'execute'
  ),
  'service_role can execute increment_view'
);
select ok(
  to_regprocedure('public.increment_view(text)') is null,
  'the unrestricted one-argument increment function no longer exists'
);
select ok(
  (select prosecdef from pg_proc where oid = 'public.increment_view(text,text)'::regprocedure),
  'increment_view is security definer'
);
select is(
  (
    select pg_get_userbyid(proowner)
    from pg_proc
    where oid = 'public.increment_view(text,text)'::regprocedure
  ),
  'postgres',
  'increment_view has the locked postgres owner'
);
select ok(
  (
    select proconfig @> array['search_path=public, pg_temp']
    from pg_proc
    where oid = 'public.increment_view(text,text)'::regprocedure
  ),
  'increment_view has an explicit safe search_path'
);

set local role postgres;
insert into public.views (slug, view_count)
values ('permission-test-target', 7), ('permission-test-control', 11);
reset role;

set local role anon;
select results_eq(
  $$ select view_count from public.views where slug = 'permission-test-target' $$,
  array[7::bigint],
  'anon can read the public view count'
);
select throws_ok(
  $$ insert into public.views (slug, view_count) values ('anon-insert', 1) $$,
  '42501',
  null,
  'anon insert is denied'
);
select throws_ok(
  $$ update public.views set view_count = 99 where slug = 'permission-test-target' $$,
  '42501',
  null,
  'anon update is denied'
);
select throws_ok(
  $$ delete from public.views where slug = 'permission-test-target' $$,
  '42501',
  null,
  'anon delete is denied'
);
select throws_ok(
  $$ select public.increment_view('permission-test-target', repeat('a', 64)) $$,
  '42501',
  null,
  'anon function execution is denied'
);
reset role;

set local role authenticated;
select results_eq(
  $$ select view_count from public.views where slug = 'permission-test-target' $$,
  array[7::bigint],
  'authenticated can read the public view count'
);
select throws_ok(
  $$ insert into public.views (slug, view_count) values ('authenticated-insert', 1) $$,
  '42501',
  null,
  'authenticated insert is denied'
);
select throws_ok(
  $$ update public.views set view_count = 99 where slug = 'permission-test-target' $$,
  '42501',
  null,
  'authenticated update is denied'
);
select throws_ok(
  $$ delete from public.views where slug = 'permission-test-target' $$,
  '42501',
  null,
  'authenticated delete is denied'
);
select throws_ok(
  $$ select public.increment_view('permission-test-target', repeat('a', 64)) $$,
  '42501',
  null,
  'authenticated function execution is denied'
);
reset role;

set local role service_role;
select is(
  public.increment_view('permission-test-target', repeat('a', 64)),
  8::bigint,
  'service_role atomically increments and returns the target count'
);
select is(
  public.increment_view('permission-test-target', repeat('a', 64)),
  8::bigint,
  'a repeated visitor does not increment the same slug twice in one day'
);
select is(
  public.increment_view('permission-test-target', repeat('b', 64)),
  9::bigint,
  'a different visitor increments the same slug'
);
select throws_ok(
  $$ select public.increment_view('permission-test-target', 'raw-address') $$,
  '22023',
  'invalid visitor hash',
  'the function rejects a value that is not a derived visitor hash'
);
select is(
  public.increment_view('URLSearchParams', repeat('c', 64)),
  1::bigint,
  'service_role atomically creates the first count for a known content slug'
);
reset role;

select results_eq(
  $$ select view_count from public.views where slug = 'permission-test-target' $$,
  array[9::bigint],
  'only unique visitor events increment the target count'
);
select results_eq(
  $$ select count(*)::bigint from private.view_events where slug = 'permission-test-target' $$,
  array[2::bigint],
  'the private event table stores one row per unique daily visitor hash'
);

select results_eq(
  $$ select view_count from public.views where slug = 'permission-test-control' $$,
  array[11::bigint],
  'the server mutation leaves other slugs unchanged'
);

select * from finish();
rollback;
