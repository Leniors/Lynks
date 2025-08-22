-- =========================
-- Safe schema setup for commerce tables
-- =========================

-- transactions table
create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_email text not null,
  amount numeric not null,
  plan text,
  status text check (status in ('completed', 'pending', 'failed')),
  created_at timestamptz default now()
);

-- subscriptions table
create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_email text not null,
  plan text,
  status text check (status in ('active', 'canceled')),
  created_at timestamptz default now()
);

-- payments table
create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  link_id uuid not null references links(id) on delete cascade,
  user_email text not null,
  amount numeric not null,
  status text check (status in ('completed', 'pending', 'failed')) default 'pending',
  provider text check (provider in ('stripe', 'mpesa')) not null,
  created_at timestamptz default now()
);

-- links monetization toggle
alter table public.links 
add column if not exists is_paid boolean default false;

-- subscription_plans table
create table if not exists public.subscription_plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  price numeric not null,
  currency text default 'USD',
  description text,
  features text[] default '{}',
  status text check (status in ('active', 'draft')) default 'active',
  created_at timestamptz default now()
);

-- commerce_settings table
create table if not exists public.commerce_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  enable_link_monetization boolean default false,
  subscription_gateway boolean default false,
  revenue_analytics boolean default true,
  payment_methods text[] default '{}',
  updated_at timestamptz default now()
);

-- =========================
-- Enable RLS for all tables
-- =========================
alter table public.transactions enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.links enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.commerce_settings enable row level security;

-- =========================
-- Policies
-- =========================

-- LINKS (monetization toggle) — avoid duplicate policy name
drop policy if exists "Users can view their own links" on public.links;
create policy "Users can view their own links"
on public.links for select
using (auth.uid() = user_id);

drop policy if exists "Users can update their own links" on public.links;
create policy "Users can update their own links"
on public.links for update
using (auth.uid() = user_id);

-- TRANSACTIONS
drop policy if exists "Users view their own transactions" on public.transactions;
create policy "Users view their own transactions"
on public.transactions for select
using (auth.uid() = (select id from auth.users where email = user_email));

-- SUBSCRIPTIONS
drop policy if exists "Users view their own subscriptions" on public.subscriptions;
create policy "Users view their own subscriptions"
on public.subscriptions for select
using (auth.uid() = (select id from auth.users where email = user_email));

-- PAYMENTS
drop policy if exists "Users view their own payments" on public.payments;
create policy "Users view their own payments"
on public.payments for select
using (auth.uid() = (select id from auth.users where email = user_email));

-- SUBSCRIPTION PLANS (publicly viewable, owner can manage)
drop policy if exists "Anyone can view active plans" on public.subscription_plans;
create policy "Anyone can view active plans"
on public.subscription_plans for select
using (status = 'active');

-- COMMERCE SETTINGS
drop policy if exists "Users view their own settings" on public.commerce_settings;
create policy "Users view their own settings"
on public.commerce_settings for select
using (auth.uid() = user_id);

drop policy if exists "Users update their own settings" on public.commerce_settings;
create policy "Users update their own settings"
on public.commerce_settings for update
using (auth.uid() = user_id);
