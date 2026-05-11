-- 0002_keepalive.sql
-- A trivial table the GitHub Actions keepalive workflow can SELECT from,
-- so the Supabase free-tier project doesn't pause after 1 week of inactivity.
-- Remove this once the site has real traffic.

create table public.keepalive (
  id int primary key,
  last_pinged timestamptz not null default now()
);

insert into public.keepalive (id) values (1);

alter table public.keepalive enable row level security;

create policy "anon can read keepalive"
  on public.keepalive for select
  to anon, authenticated
  using (true);
