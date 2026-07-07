-- ============================================================
-- JACKPOT WIRE — Supabase schema
-- Run this once in Supabase Dashboard > SQL Editor > New query
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- WINS FEED ----------
create table if not exists wins (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  game text not null,
  wager numeric not null,
  multiplier numeric not null,
  payout numeric not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- ---------- LEADERBOARD ----------
create table if not exists leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  place int not null unique,
  player text not null,
  points numeric not null default 0,
  prize text,
  updated_at timestamptz not null default now()
);

-- single row holding prize pool + countdown deadline
create table if not exists leaderboard_meta (
  id int primary key default 1,
  prize_pool text not null default '$1,000,000.00',
  ends_at timestamptz,
  constraint singleton check (id = 1)
);

insert into leaderboard_meta (id, prize_pool, ends_at)
values (1, '$1,000,000.00', now() + interval '30 days')
on conflict (id) do nothing;

-- ---------- ROW LEVEL SECURITY ----------
alter table wins enable row level security;
alter table leaderboard_entries enable row level security;
alter table leaderboard_meta enable row level security;

-- anyone can read (public site)
create policy "public read wins" on wins
  for select using (true);

create policy "public read leaderboard" on leaderboard_entries
  for select using (true);

create policy "public read meta" on leaderboard_meta
  for select using (true);

-- only a logged-in admin (Supabase Auth) can write
create policy "auth insert wins" on wins
  for insert with check (auth.role() = 'authenticated');

create policy "auth delete wins" on wins
  for delete using (auth.role() = 'authenticated');

create policy "auth all leaderboard" on leaderboard_entries
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "auth update meta" on leaderboard_meta
  for update using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
