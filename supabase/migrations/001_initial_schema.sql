create extension if not exists "pgcrypto";

create type public.decision_category as enum (
  'work',
  'school',
  'money',
  'health',
  'relationships',
  'personal',
  'other'
);

create type public.decision_status as enum (
  'open',
  'committed',
  'deferred',
  'delegated',
  'deleted'
);

create type public.decision_stakes as enum ('low', 'medium', 'high');
create type public.pro_con_kind as enum ('pro', 'con');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.decisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 160),
  description text not null default '',
  category public.decision_category not null default 'other',
  status public.decision_status not null default 'open',
  deadline date,
  review_date date,
  stakes public.decision_stakes not null default 'medium',
  emotional_load integer not null default 3 check (emotional_load between 1 and 5),
  time_impact integer not null default 3 check (time_impact between 1 and 5),
  money_impact integer not null default 1 check (money_impact between 1 and 5),
  confidence integer not null default 3 check (confidence between 1 and 5),
  blockers text[] not null default '{}',
  missing_information text[] not null default '{}',
  next_action text not null default '',
  final_decision text not null default '',
  resolution_reason text not null default '',
  outcome_notes text not null default '',
  delegated_to text not null default '',
  defer_reason text not null default '',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.decision_options (
  id uuid primary key default gen_random_uuid(),
  decision_id uuid not null references public.decisions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 160),
  description text not null default '',
  is_selected boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.decision_option_pros_cons (
  id uuid primary key default gen_random_uuid(),
  option_id uuid not null references public.decision_options(id) on delete cascade,
  decision_id uuid not null references public.decisions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind public.pro_con_kind not null,
  body text not null check (char_length(body) between 2 and 500),
  created_at timestamptz not null default now()
);

create table public.decision_events (
  id uuid primary key default gen_random_uuid(),
  decision_id uuid not null references public.decisions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  title text not null,
  body text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_decisions_updated_at
before update on public.decisions
for each row execute function public.set_updated_at();

create trigger set_decision_options_updated_at
before update on public.decision_options
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        updated_at = now();
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create index decisions_user_status_idx on public.decisions(user_id, status);
create index decisions_user_deadline_idx on public.decisions(user_id, deadline);
create index decisions_user_category_idx on public.decisions(user_id, category);
create index decision_options_decision_idx on public.decision_options(decision_id);
create index decision_pros_cons_option_idx on public.decision_option_pros_cons(option_id);
create index decision_events_decision_idx on public.decision_events(decision_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.decisions enable row level security;
alter table public.decision_options enable row level security;
alter table public.decision_option_pros_cons enable row level security;
alter table public.decision_events enable row level security;

create policy "profiles are readable by owner"
on public.profiles for select
using (id = auth.uid());

create policy "profiles are editable by owner"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "decisions are readable by owner"
on public.decisions for select
using (user_id = auth.uid());

create policy "decisions are insertable by owner"
on public.decisions for insert
with check (user_id = auth.uid());

create policy "decisions are editable by owner"
on public.decisions for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "decisions are deletable by owner"
on public.decisions for delete
using (user_id = auth.uid());

create policy "options are readable by owner"
on public.decision_options for select
using (user_id = auth.uid());

create policy "options are insertable by owner"
on public.decision_options for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.decisions d
    where d.id = decision_id and d.user_id = auth.uid()
  )
);

create policy "options are editable by owner"
on public.decision_options for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "options are deletable by owner"
on public.decision_options for delete
using (user_id = auth.uid());

create policy "pros cons are readable by owner"
on public.decision_option_pros_cons for select
using (user_id = auth.uid());

create policy "pros cons are insertable by owner"
on public.decision_option_pros_cons for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.decision_options o
    where o.id = option_id and o.user_id = auth.uid()
  )
  and exists (
    select 1 from public.decisions d
    where d.id = decision_id and d.user_id = auth.uid()
  )
);

create policy "pros cons are editable by owner"
on public.decision_option_pros_cons for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "pros cons are deletable by owner"
on public.decision_option_pros_cons for delete
using (user_id = auth.uid());

create policy "events are readable by owner"
on public.decision_events for select
using (user_id = auth.uid());

create policy "events are insertable by owner"
on public.decision_events for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.decisions d
    where d.id = decision_id and d.user_id = auth.uid()
  )
);

create policy "events are deletable by owner"
on public.decision_events for delete
using (user_id = auth.uid());
