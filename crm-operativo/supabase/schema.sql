create extension if not exists "pgcrypto";

create table if not exists public.crm_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('meta', 'mercadolibre')),
  event_id text not null,
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'processed', 'failed')),
  attempts integer not null default 0,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  last_error text,
  unique (provider, event_id)
);

create index if not exists crm_webhook_events_pending_idx
  on public.crm_webhook_events (received_at)
  where status = 'pending';

alter table public.crm_webhook_events enable row level security;

create table if not exists public.crm_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique check (username ~ '^[A-Za-z0-9]{8,}$'),
  email text not null unique,
  password_hash text not null,
  name text not null,
  role text not null check (role in ('admin', 'supervisor', 'agent', 'viewer')) default 'viewer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_integrations (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  name text not null,
  status text not null default 'online',
  messages text,
  last_sync text,
  account_name text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_conversations (
  id uuid primary key default gen_random_uuid(),
  customer text not null,
  channel text not null,
  status text not null default 'new',
  last_message text not null,
  unread integer not null default 0,
  updated_at text not null default 'Hace 1 min',
  created_at timestamptz not null default now()
);

create table if not exists public.crm_tickets (
  id uuid primary key default gen_random_uuid(),
  customer text not null,
  channel text not null,
  priority text not null check (priority in ('alta', 'media', 'baja')) default 'media',
  status text not null default 'Nuevo',
  created_at text not null default 'Hace 1h',
  claim_type text not null default 'consulta',
  created_at_ts timestamptz not null default now()
);

alter table public.crm_users drop constraint if exists crm_users_password_hash_check;

delete from public.crm_users
where (username, email) in (
  ('adminCRM01', 'admin@crm.local'),
  ('supervisorCRM1', 'supervisor@crm.local'),
  ('agentCRM01', 'agent@crm.local'),
  ('viewerCRM01', 'viewer@crm.local')
);

insert into public.crm_integrations (provider, name, status, messages, last_sync, account_name, enabled)
values
  ('facebook', 'Meta Pages', 'online', '1.330 mensajes', 'Hace 2 minutos', 'Tienda Central', true),
  ('instagram', 'Instagram DM', 'syncing', '842 mensajes', 'Sincronizando', '@tienda.central', true),
  ('mercadolibre', 'Mercado Libre Orders', 'warning', '368 mensajes', 'Hace 18 minutos', 'Cuenta ML - 2026', true)
on conflict do nothing;

insert into public.crm_conversations (customer, channel, status, last_message, unread, updated_at)
values
  ('Marta Gálvez', 'facebook', 'pending', 'Solicito información sobre el reembolso del pedido 2310', 3, 'Hace 6 min'),
  ('Helena Rivas', 'instagram', 'assigned', 'El paquete llegó tarde y el estado no coincide con el tracking', 1, 'Hace 18 min'),
  ('Javier León', 'mercadolibre', 'new', 'Pregunta por la entrega del pedido #ML-8902', 5, 'Hace 23 min')
on conflict do nothing;

insert into public.crm_tickets (customer, channel, priority, status, created_at, claim_type)
values
  ('Marta Gálvez', 'facebook', 'alta', 'Reembolso', 'Hace 5h', 'reembolso'),
  ('Helena Rivas', 'instagram', 'media', 'En revisión', 'Hace 9h', 'incidencia'),
  ('Javier León', 'mercadolibre', 'alta', 'Nuevo', 'Hace 12h', 'pedido')
on conflict do nothing;

alter table public.crm_users enable row level security;
alter table public.crm_integrations enable row level security;
alter table public.crm_conversations enable row level security;
alter table public.crm_tickets enable row level security;

revoke all on public.crm_users, public.crm_integrations, public.crm_conversations, public.crm_tickets, public.crm_webhook_events from anon, authenticated;
