create table public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_email text not null,
  amount numeric not null,
  plan text,
  status text check (status in ('completed', 'pending', 'failed')),
  created_at timestamptz default now()
);

create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_email text not null,
  plan text,
  status text check (status in ('active', 'canceled')),
  created_at timestamptz default now()
);

create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  link_id uuid not null references links(id) on delete cascade,
  user_email text not null,
  amount numeric not null,
  status text check (status in ('completed', 'pending', 'failed')) default 'pending',
  provider text check (provider in ('stripe', 'mpesa')) not null,
  created_at timestamptz default now()
);

alter table public.links add column if not exists is_paid boolean default false;

create table public.subscription_plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  price numeric not null,
  currency text default 'USD',
  description text,
  features text[] default '{}',
  status text check (status in ('active', 'draft')) default 'active',
  created_at timestamptz default now()
);

create table public.commerce_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  enable_link_monetization boolean default false,
  subscription_gateway boolean default false,
  revenue_analytics boolean default true,
  payment_methods text[] default '{}',
  updated_at timestamptz default now()
);
