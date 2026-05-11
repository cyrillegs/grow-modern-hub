-- 0001_init.sql
-- Initial schema: contacts (homepage form) + quotes (product quote requests)
-- Apply via Supabase dashboard → SQL Editor, or `supabase db push` once CLI is set up.

-- contacts: messages from the "Get In Touch" form on the homepage
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'replied', 'archived')),
  admin_notes text
);

-- quotes: product quote requests (currently mocked in AdminQuotes)
create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text not null,
  product text not null,
  quantity text not null,
  message text,
  status text not null default 'pending' check (status in ('pending', 'processed', 'cancelled')),
  admin_notes text
);

-- Indexes for the admin list (sorted by created_at desc, filtered by status)
create index contacts_created_at_idx on public.contacts (created_at desc);
create index contacts_status_idx on public.contacts (status);
create index quotes_created_at_idx on public.quotes (created_at desc);
create index quotes_status_idx on public.quotes (status);

-- Row-Level Security: lock everything by default, then grant explicit policies.
alter table public.contacts enable row level security;
alter table public.quotes enable row level security;

-- Public (anon) role: INSERT only. Visitors can submit forms.
create policy "anon can insert contacts"
  on public.contacts for insert
  to anon, authenticated
  with check (true);

create policy "anon can insert quotes"
  on public.quotes for insert
  to anon, authenticated
  with check (true);

-- Authenticated role (admin): full read/write.
create policy "authenticated can read contacts"
  on public.contacts for select
  to authenticated
  using (true);

create policy "authenticated can update contacts"
  on public.contacts for update
  to authenticated
  using (true)
  with check (true);

create policy "authenticated can delete contacts"
  on public.contacts for delete
  to authenticated
  using (true);

create policy "authenticated can read quotes"
  on public.quotes for select
  to authenticated
  using (true);

create policy "authenticated can update quotes"
  on public.quotes for update
  to authenticated
  using (true)
  with check (true);

create policy "authenticated can delete quotes"
  on public.quotes for delete
  to authenticated
  using (true);
