create type public.account_member_role as enum ('owner', 'editor', 'viewer');
create type public.member_status as enum ('pending', 'accepted');

create table public.account_members (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  invited_email text not null,
  role public.account_member_role not null default 'viewer',
  status public.member_status not null default 'pending',
  invited_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (account_id, invited_email)
);

create table public.transaction_splits (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  account_member_id uuid references public.account_members(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  share_amount numeric(14,2) not null check (share_amount >= 0),
  share_percent numeric(5,2) check (share_percent >= 0 and share_percent <= 100),
  is_settled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (account_member_id is not null or user_id is not null)
);

create index account_members_account_id_idx on public.account_members(account_id);
create index account_members_user_id_idx on public.account_members(user_id);
create index transaction_splits_transaction_id_idx on public.transaction_splits(transaction_id);

create trigger set_account_members_updated_at before update on public.account_members
for each row execute function public.update_updated_at_column();
create trigger set_transaction_splits_updated_at before update on public.transaction_splits
for each row execute function public.update_updated_at_column();

alter table public.account_members enable row level security;
alter table public.transaction_splits enable row level security;

create policy "Owners manage account members" on public.account_members for all to authenticated
using (exists (select 1 from public.accounts a where a.id = account_id and a.user_id = auth.uid()))
with check (exists (select 1 from public.accounts a where a.id = account_id and a.user_id = auth.uid()));
create policy "Members view own membership" on public.account_members for select to authenticated
using (user_id = auth.uid());

create policy "Account users view transaction splits" on public.transaction_splits for select to authenticated
using (exists (select 1 from public.transactions t left join public.accounts a on a.id = t.account_id where t.id = transaction_id and (t.user_id = auth.uid() or a.user_id = auth.uid() or exists (select 1 from public.account_members m where m.account_id = a.id and m.user_id = auth.uid() and m.status = 'accepted'))));
create policy "Owners and editors manage transaction splits" on public.transaction_splits for all to authenticated
using (exists (select 1 from public.transactions t join public.accounts a on a.id = t.account_id where t.id = transaction_id and (a.user_id = auth.uid() or exists (select 1 from public.account_members m where m.account_id = a.id and m.user_id = auth.uid() and m.status = 'accepted' and m.role in ('owner', 'editor')))))
with check (exists (select 1 from public.transactions t join public.accounts a on a.id = t.account_id where t.id = transaction_id and (a.user_id = auth.uid() or exists (select 1 from public.account_members m where m.account_id = a.id and m.user_id = auth.uid() and m.status = 'accepted' and m.role in ('owner', 'editor')))));

drop policy if exists "Users can manage their own accounts" on public.accounts;
drop policy if exists "Users can manage their own transactions" on public.transactions;

create policy "Owners and accepted members view accounts" on public.accounts for select to authenticated
using (user_id = auth.uid() or exists (select 1 from public.account_members m where m.account_id = id and m.user_id = auth.uid() and m.status = 'accepted'));
create policy "Users create their own accounts" on public.accounts for insert to authenticated with check (user_id = auth.uid());
create policy "Owners and editors update accounts" on public.accounts for update to authenticated
using (user_id = auth.uid() or exists (select 1 from public.account_members m where m.account_id = id and m.user_id = auth.uid() and m.status = 'accepted' and m.role in ('owner', 'editor')))
with check (user_id = auth.uid() or exists (select 1 from public.account_members m where m.account_id = id and m.user_id = auth.uid() and m.status = 'accepted' and m.role in ('owner', 'editor')));
create policy "Owners delete accounts" on public.accounts for delete to authenticated using (user_id = auth.uid());

create policy "Owners and accepted members view transactions" on public.transactions for select to authenticated
using (user_id = auth.uid() or exists (select 1 from public.accounts a join public.account_members m on m.account_id = a.id where a.id = account_id and m.user_id = auth.uid() and m.status = 'accepted'));
create policy "Owners and editors create transactions" on public.transactions for insert to authenticated
with check (user_id = auth.uid() and (account_id is null or exists (select 1 from public.accounts a where a.id = account_id and (a.user_id = auth.uid() or exists (select 1 from public.account_members m where m.account_id = a.id and m.user_id = auth.uid() and m.status = 'accepted' and m.role in ('owner', 'editor'))))));
create policy "Owners and editors update transactions" on public.transactions for update to authenticated
using (user_id = auth.uid() or exists (select 1 from public.accounts a join public.account_members m on m.account_id = a.id where a.id = account_id and m.user_id = auth.uid() and m.status = 'accepted' and m.role in ('owner', 'editor')))
with check (user_id = auth.uid() or exists (select 1 from public.accounts a join public.account_members m on m.account_id = a.id where a.id = account_id and m.user_id = auth.uid() and m.status = 'accepted' and m.role in ('owner', 'editor')));
create policy "Owners and editors delete transactions" on public.transactions for delete to authenticated
using (user_id = auth.uid() or exists (select 1 from public.accounts a join public.account_members m on m.account_id = a.id where a.id = account_id and m.user_id = auth.uid() and m.status = 'accepted' and m.role in ('owner', 'editor')));
