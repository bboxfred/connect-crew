-- Connect Crew — initial schema (CLAUDE.md §12)
-- Run in Supabase SQL editor after creating the project.

create extension if not exists "pgcrypto";

create table if not exists profile (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text,
  orgs jsonb,
  created_at timestamptz default now()
);

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text,
  title text,
  company text,
  email text,
  phone text,
  linkedin text,
  telegram_handle text,
  met_at text,
  met_date date,
  notes text,
  warmth_index int default 50,
  last_contact_at timestamptz,
  enrichment jsonb,
  created_at timestamptz default now()
);

create table if not exists interactions (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) on delete cascade,
  channel text,          -- telegram | gmail | whatsapp | card | voice
  direction text,        -- inbound | outbound
  content text,
  signals jsonb,         -- the 11 signal categories detected
  classification text,   -- hot | warm | cold | reactivation
  created_at timestamptz default now()
);

create table if not exists drafts (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) on delete cascade,
  channel text,
  draft_content text,
  reasoning text,
  status text default 'pending', -- pending | approved | sent | skipped
  created_at timestamptz default now()
);

create index if not exists contacts_warmth_idx on contacts (warmth_index desc);
create index if not exists interactions_contact_idx on interactions (contact_id, created_at desc);
create index if not exists drafts_status_idx on drafts (status, created_at desc);
