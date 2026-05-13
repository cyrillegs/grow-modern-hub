-- 0003_admin_replies.sql
-- Log every outgoing admin reply (sent via the in-app compose modal).
-- Replaces what would otherwise live in the admin's Gmail Sent folder.

create table public.admin_replies (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source_table text not null check (source_table in ('quotes', 'contacts')),
  source_id uuid not null,
  to_email text not null,
  subject text not null,
  body text not null,
  sent_by_user_id uuid references auth.users(id) on delete set null
);

create index admin_replies_source_idx on public.admin_replies (source_table, source_id, created_at desc);
create index admin_replies_created_at_idx on public.admin_replies (created_at desc);

alter table public.admin_replies enable row level security;

-- Only authenticated users (admins) can read or write replies.
create policy "authenticated can read admin_replies"
  on public.admin_replies for select
  to authenticated
  using (true);

create policy "authenticated can insert admin_replies"
  on public.admin_replies for insert
  to authenticated
  with check (true);
