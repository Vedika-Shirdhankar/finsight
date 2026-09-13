create type public.recurrence_frequency as enum ('weekly', 'biweekly', 'monthly', 'yearly');

create table public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  account_id uuid references public.accounts(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  amount numeric(14,2) not null,
  type public.transaction_type not null,
  merchant text not null,
  payment_method text not null default 'UPI',
  description text,
  frequency public.recurrence_frequency not null default 'monthly',
  next_due_date date not null,
  is_active boolean not null default true,
  remind_days_before integer not null default 3,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.recurring_transactions to authenticated;
grant all on public.recurring_transactions to service_role;
alter table public.recurring_transactions enable row level security;
create policy "Users can manage their own recurring transactions" on public.recurring_transactions
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create trigger recurring_transactions_updated_at before update on public.recurring_transactions
  for each row execute function public.update_updated_at_column();

create index recurring_transactions_user_due_idx on public.recurring_transactions (user_id, next_due_date)
  where is_active;
