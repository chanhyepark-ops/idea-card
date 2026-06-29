create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.ideas enable row level security;

create policy "Allow public read ideas"
on public.ideas
for select
to anon
using (true);

create policy "Allow public insert ideas"
on public.ideas
for insert
to anon
with check (true);

create policy "Allow public update ideas"
on public.ideas
for update
to anon
using (true)
with check (true);

create policy "Allow public delete ideas"
on public.ideas
for delete
to anon
using (true);
