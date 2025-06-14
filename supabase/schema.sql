
-- Users Table
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamp with time zone default now()
);

-- Trades Table
create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) not null,
  symbol text not null,
  side text check (side in ('long', 'short')) not null,
  size numeric not null,
  entry_price numeric,
  exit_price numeric,
  opened_at timestamp with time zone default now(),
  closed_at timestamp with time zone,
  analysis text,
  chart_path text
);

-- Annotations Table
create table if not exists public.annotations (
  id uuid primary key default gen_random_uuid(),
  trade_id uuid references public.trades(id) not null,
  data jsonb not null
);

-- Strategies Table
create table if not exists public.strategies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) not null,
  name text not null,
  rules jsonb not null,
  is_public boolean default false,
  created_at timestamp with time zone default now()
);

-- Trade Stats Table
create table if not exists public.trade_stats (
  id uuid primary key default gen_random_uuid(),
  trade_id uuid references public.trades(id) not null,
  pl numeric,
  win_loss boolean
);
