-- Allow select on auth.users so policy checks pass
grant select on auth.users to authenticated;

-- Fix transactions select policy
drop policy if exists "Users view their own transactions" on public.transactions;
create policy "Users view their own transactions"
on public.transactions for select
using (
  auth.uid() = (
    select id from auth.users where email = user_email
  )
);
