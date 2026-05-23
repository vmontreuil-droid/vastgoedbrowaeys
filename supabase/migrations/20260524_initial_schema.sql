-- =====================================================================
-- Vastgoed Browaeys — initieel database-schema voor klantenportaal
-- =====================================================================
-- Tabellen:
--   profiles            — basisprofiel per klant (1:1 met auth.users)
--   dossiers            — verkoop- of huurdossier per klant
--   dossier_steps       — voortgangsstappen per dossier
--   appointments        — bezichtigingen & andere afspraken
--   documents           — gedeelde bestanden per dossier
--   search_criteria     — koper-zoekers: criteria voor pand-meldingen
--   notifications       — interne meldingen (nieuwe match, document, …)
--
-- Alle tabellen hebben RLS aan. Klanten zien alleen hun eigen dossiers;
-- de makelaar (rol 'agent') ziet alles via een service-role flow.
-- =====================================================================

create extension if not exists "uuid-ossp";

-- =====================================================================
-- PROFILES — 1:1 koppeling met auth.users
-- =====================================================================
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text not null,
  first_name      text,
  last_name       text,
  phone           text,
  role            text not null default 'client' check (role in ('client', 'agent')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role);

alter table public.profiles enable row level security;

create policy "Profiles: users can read their own profile"
  on public.profiles for select
  using ((select auth.uid()) = id);

create policy "Profiles: users can update their own profile"
  on public.profiles for update
  using ((select auth.uid()) = id);

create policy "Profiles: agents can read all"
  on public.profiles for select
  using (
    exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'agent')
  );

-- =====================================================================
-- DOSSIERS — verkoop- of huurdossier per klant
-- =====================================================================
create table public.dossiers (
  id               uuid primary key default uuid_generate_v4(),
  client_id        uuid not null references public.profiles(id) on delete cascade,
  type             text not null check (type in ('verkoop', 'verhuur', 'koop_zoeker', 'huur_zoeker')),
  status           text not null default 'open' check (status in ('open', 'in_behandeling', 'onder_optie', 'verkocht', 'verhuurd', 'geannuleerd')),
  property_address text,
  property_zip     text,
  property_city    text,
  property_type    text,
  asking_price     numeric(12, 2),
  reference        text unique,
  opened_at        timestamptz not null default now(),
  closed_at        timestamptz,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index dossiers_client_id_idx on public.dossiers(client_id);
create index dossiers_status_idx on public.dossiers(status);

alter table public.dossiers enable row level security;

create policy "Dossiers: clients see only their own"
  on public.dossiers for select
  using (client_id = (select auth.uid()));

create policy "Dossiers: agents see all"
  on public.dossiers for select
  using (
    exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'agent')
  );

create policy "Dossiers: agents can insert/update/delete"
  on public.dossiers for all
  using (
    exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'agent')
  );

-- =====================================================================
-- DOSSIER STEPS — voortgangsstappen per dossier
-- =====================================================================
create table public.dossier_steps (
  id           uuid primary key default uuid_generate_v4(),
  dossier_id   uuid not null references public.dossiers(id) on delete cascade,
  label        text not null,
  status       text not null default 'pending' check (status in ('pending', 'done', 'skipped')),
  done_at      date,
  order_index  integer not null default 0,
  created_at   timestamptz not null default now()
);

create index dossier_steps_dossier_id_idx on public.dossier_steps(dossier_id);

alter table public.dossier_steps enable row level security;

create policy "Dossier steps: visible to dossier client + agents"
  on public.dossier_steps for select
  using (
    exists (
      select 1 from public.dossiers d
      where d.id = dossier_id
        and (d.client_id = (select auth.uid())
             or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'agent'))
    )
  );

create policy "Dossier steps: agents only modify"
  on public.dossier_steps for all
  using (
    exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'agent')
  );

-- =====================================================================
-- APPOINTMENTS — bezichtigingen & andere afspraken
-- =====================================================================
create table public.appointments (
  id              uuid primary key default uuid_generate_v4(),
  dossier_id      uuid not null references public.dossiers(id) on delete cascade,
  title           text not null,
  appointment_at  timestamptz not null,
  duration_min    integer not null default 30,
  location        text,
  notes           text,
  status          text not null default 'planned' check (status in ('planned', 'confirmed', 'completed', 'cancelled')),
  created_at      timestamptz not null default now()
);

create index appointments_dossier_id_idx on public.appointments(dossier_id);
create index appointments_at_idx on public.appointments(appointment_at);

alter table public.appointments enable row level security;

create policy "Appointments: visible to dossier client + agents"
  on public.appointments for select
  using (
    exists (
      select 1 from public.dossiers d
      where d.id = dossier_id
        and (d.client_id = (select auth.uid())
             or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'agent'))
    )
  );

create policy "Appointments: agents only modify"
  on public.appointments for all
  using (
    exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'agent')
  );

-- =====================================================================
-- DOCUMENTS — gedeelde bestanden per dossier
-- =====================================================================
create table public.documents (
  id          uuid primary key default uuid_generate_v4(),
  dossier_id  uuid not null references public.dossiers(id) on delete cascade,
  name        text not null,
  category    text check (category in ('compromis', 'schatting', 'epc', 'asbest', 'stedenbouw', 'plaatsbeschrijving', 'huurcontract', 'foto', 'overig')),
  storage_path text not null,
  size_bytes  bigint,
  mime_type   text,
  uploaded_by uuid references public.profiles(id),
  created_at  timestamptz not null default now()
);

create index documents_dossier_id_idx on public.documents(dossier_id);

alter table public.documents enable row level security;

create policy "Documents: visible to dossier client + agents"
  on public.documents for select
  using (
    exists (
      select 1 from public.dossiers d
      where d.id = dossier_id
        and (d.client_id = (select auth.uid())
             or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'agent'))
    )
  );

create policy "Documents: agents only insert/modify"
  on public.documents for all
  using (
    exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'agent')
  );

-- =====================================================================
-- SEARCH CRITERIA — koper-zoekers
-- =====================================================================
create table public.search_criteria (
  id              uuid primary key default uuid_generate_v4(),
  client_id       uuid not null references public.profiles(id) on delete cascade,
  active          boolean not null default true,
  types           text[] not null default '{}',
  cities          text[] not null default '{}',
  max_price       numeric(12, 2),
  min_bedrooms    integer,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index search_criteria_client_id_idx on public.search_criteria(client_id);
create index search_criteria_active_idx on public.search_criteria(active);

alter table public.search_criteria enable row level security;

create policy "Search criteria: clients see/modify only their own"
  on public.search_criteria for all
  using (client_id = (select auth.uid()));

create policy "Search criteria: agents see all"
  on public.search_criteria for select
  using (
    exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'agent')
  );

-- =====================================================================
-- NOTIFICATIONS — interne meldingen
-- =====================================================================
create table public.notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null check (type in ('new_match', 'new_document', 'appointment_reminder', 'dossier_update', 'message')),
  title       text not null,
  body        text,
  link        text,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index notifications_user_id_idx on public.notifications(user_id);
create index notifications_unread_idx on public.notifications(user_id, read_at) where read_at is null;

alter table public.notifications enable row level security;

create policy "Notifications: users see only their own"
  on public.notifications for all
  using (user_id = (select auth.uid()));

-- =====================================================================
-- TRIGGER: auto-create profile op auth.users insert
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- TRIGGER: auto-update updated_at
-- =====================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger dossiers_updated_at before update on public.dossiers for each row execute function public.set_updated_at();
create trigger search_criteria_updated_at before update on public.search_criteria for each row execute function public.set_updated_at();
