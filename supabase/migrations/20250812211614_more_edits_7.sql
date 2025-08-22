drop policy if exists "Users can view their own commerce settings" on public.commerce_settings;
create policy "Users can view their own commerce settings"
on public.commerce_settings for select
using (auth.uid() = user_id);
