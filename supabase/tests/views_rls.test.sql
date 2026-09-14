begin;

create extension if not exists pgtap with schema extensions;

select plan(29);

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
  not has_function_privilege('anon', 'public.increment_view(text)', 'execute'),
  'anon cannot execute increment_view'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'public.increment_view(text)',
    'execute'
  ),
  'authenticated cannot execute increment_view'
);
select ok(
  has_function_privilege(
    'service_role',
    'public.increment_view(text)',
    'execute'
  ),
  'service_role can execute increment_view'
);
select ok(
  (select prosecdef from pg_proc where oid = 'public.increment_view(text)'::regprocedure),
  'increment_view is security definer'
);
select is(
  (
    select pg_get_userbyid(proowner)
    from pg_proc
    where oid = 'public.increment_view(text)'::regprocedure
  ),
  'postgres',
  'increment_view has the locked postgres owner'
);
select ok(
  (
    select proconfig @> array['search_path=public, pg_temp']
    from pg_proc
    where oid = 'public.increment_view(text)'::regprocedure
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
  $$ select public.increment_view('permission-test-target') $$,
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
  $$ select public.increment_view('permission-test-target') $$,
  '42501',
  null,
  'authenticated function execution is denied'
);
reset role;

set local role service_role;
select is(
  public.increment_view('permission-test-target'),
  8::bigint,
  'service_role atomically increments and returns the target count'
);
select is(
  public.increment_view('URLSearchParams'),
  1::bigint,
  'service_role atomically creates the first count for a known content slug'
);
reset role;

select results_eq(
  $$ select view_count from public.views where slug = 'permission-test-control' $$,
  array[11::bigint],
  'the server mutation leaves other slugs unchanged'
);

select * from finish();
rollback;
