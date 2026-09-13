create type public.app_role as enum ('admin', 'moderator', 'user');
create type public.transaction_type as enum ('income', 'expense', 'transfer');
create type public.transaction_status as enum ('completed', 'pending', 'failed');
create type public.account_type as enum ('savings', 'checking', 'wallet', 'credit_card', 'cash');

create table public.profiles (
  user_id uuid primary key,
  full_name text not null default 'FinSight User',
  avatar_url text,
  currency text not null default 'INR',
  theme text not null default 'dark',
  notification_preferences jsonb not null default '{"budget_alerts": true, "spending_insights": true, "goal_updates": true, "security_alerts": true}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Users can view their own profile" on public.profiles for select to authenticated using (user_id = auth.uid());
create policy "Users can create their own profile" on public.profiles for insert to authenticated with check (user_id = auth.uid());
create policy "Users can update their own profile" on public.profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users can delete their own profile" on public.profiles for delete to authenticated using (user_id = auth.uid());

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users can view their own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

grant execute on function public.has_role(uuid, public.app_role) to authenticated;
grant execute on function public.has_role(uuid, public.app_role) to service_role;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  kind public.transaction_type not null default 'expense',
  color_token text not null default 'accent-blue',
  icon_key text not null default 'circle-dashed',
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "Users can view system and own categories" on public.categories for select to authenticated using (is_system = true or user_id = auth.uid());
create policy "Users can create own categories" on public.categories for insert to authenticated with check (user_id = auth.uid() and is_system = false);
create policy "Users can update own categories" on public.categories for update to authenticated using (user_id = auth.uid() and is_system = false) with check (user_id = auth.uid() and is_system = false);
create policy "Users can delete own categories" on public.categories for delete to authenticated using (user_id = auth.uid() and is_system = false);

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  type public.account_type not null,
  institution text,
  balance numeric(14,2) not null default 0,
  currency text not null default 'INR',
  is_simulated boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.accounts to authenticated;
grant all on public.accounts to service_role;
alter table public.accounts enable row level security;
create policy "Users can manage their own accounts" on public.accounts for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  account_id uuid references public.accounts(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  amount numeric(14,2) not null,
  type public.transaction_type not null,
  merchant text,
  payment_method text not null default 'UPI',
  status public.transaction_status not null default 'completed',
  sender text,
  receiver text,
  description text,
  transaction_date timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.transactions to authenticated;
grant all on public.transactions to service_role;
alter table public.transactions enable row level security;
create policy "Users can manage their own transactions" on public.transactions for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  month_start date not null,
  total_limit numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name, month_start)
);
grant select, insert, update, delete on public.budgets to authenticated;
grant all on public.budgets to service_role;
alter table public.budgets enable row level security;
create policy "Users can manage their own budgets" on public.budgets for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.budget_categories (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  limit_amount numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (budget_id, category_id)
);
grant select, insert, update, delete on public.budget_categories to authenticated;
grant all on public.budget_categories to service_role;
alter table public.budget_categories enable row level security;
create policy "Users can manage categories in their own budgets" on public.budget_categories for all to authenticated using (exists (select 1 from public.budgets where budgets.id = budget_categories.budget_id and budgets.user_id = auth.uid())) with check (exists (select 1 from public.budgets where budgets.id = budget_categories.budget_id and budgets.user_id = auth.uid()));

create table public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  target_amount numeric(14,2) not null,
  current_amount numeric(14,2) not null default 0,
  target_date date,
  color_token text not null default 'accent-green',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.savings_goals to authenticated;
grant all on public.savings_goals to service_role;
alter table public.savings_goals enable row level security;
create policy "Users can manage their own savings goals" on public.savings_goals for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  message text not null,
  kind text not null default 'neutral',
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "Users can manage their own notifications" on public.notifications for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

grant execute on function public.update_updated_at_column() to authenticated;
grant execute on function public.update_updated_at_column() to service_role;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.update_updated_at_column();
create trigger categories_updated_at before update on public.categories for each row execute function public.update_updated_at_column();
create trigger accounts_updated_at before update on public.accounts for each row execute function public.update_updated_at_column();
create trigger transactions_updated_at before update on public.transactions for each row execute function public.update_updated_at_column();
create trigger budgets_updated_at before update on public.budgets for each row execute function public.update_updated_at_column();
create trigger budget_categories_updated_at before update on public.budget_categories for each row execute function public.update_updated_at_column();
create trigger savings_goals_updated_at before update on public.savings_goals for each row execute function public.update_updated_at_column();
create trigger notifications_updated_at before update on public.notifications for each row execute function public.update_updated_at_column();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', 'FinSight User'))
  on conflict (user_id) do nothing;
  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id, role) do nothing;
  return new;
end;
$$;

grant execute on function public.handle_new_user() to service_role;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create index transactions_user_date_idx on public.transactions (user_id, transaction_date desc);
create index transactions_category_idx on public.transactions (category_id);
create index transactions_status_idx on public.transactions (status);
create index accounts_user_idx on public.accounts (user_id);
create index budgets_user_month_idx on public.budgets (user_id, month_start desc);
create index goals_user_idx on public.savings_goals (user_id);
create index notifications_user_read_idx on public.notifications (user_id, is_read, created_at desc);

insert into public.categories (name, kind, color_token, icon_key, is_system) values
  ('Food & Dining', 'expense', 'accent-green', 'utensils', true),
  ('Shopping', 'expense', 'accent-blue', 'shopping-bag', true),
  ('Transport', 'expense', 'accent-warn', 'car-front', true),
  ('Bills & Utilities', 'expense', 'accent-red', 'receipt', true),
  ('Entertainment', 'expense', 'accent-violet', 'film', true),
  ('Healthcare', 'expense', 'accent-teal', 'heart-pulse', true),
  ('Education', 'expense', 'accent-cyan', 'graduation-cap', true),
  ('Salary', 'income', 'accent-green', 'briefcase-business', true),
  ('Freelance', 'income', 'accent-blue', 'laptop', true),
  ('Other', 'expense', 'muted-foreground', 'circle-dashed', true);