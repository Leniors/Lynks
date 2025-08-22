-- Enable Row Level Security on links table
alter table public.links enable row level security;

-- Allow users to insert links only for themselves
create policy "Users can insert their own links"
on public.links
for insert
with check (auth.uid() = user_id);

-- Allow users to select only their own links
create policy "Users can view their own links"
on public.links
for select
using (auth.uid() = user_id);

-- Allow users to update only their own links
create policy "Users can update their own links"
on public.links
for update
using (auth.uid() = user_id);

-- Allow users to delete only their own links
create policy "Users can delete their own links"
on public.links
for delete
using (auth.uid() = user_id);