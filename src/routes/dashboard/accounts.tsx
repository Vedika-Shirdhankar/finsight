import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Wallet, Plus, CreditCard, Building2, Landmark, Coins, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useAccounts, useCreateAccount } from "@/hooks/queries/use-accounts";
import type { Database } from "@/integrations/supabase/types";
import { InviteMemberDialog } from "@/components/dashboard/invite-member-dialog";
import { MemberContributionList } from "@/components/dashboard/member-contribution-list";

export const Route = createFileRoute("/dashboard/accounts")({
  component: AccountsPage,
});

type AccountType = Database["public"]["Enums"]["account_type"];

const accountTypeIcons: Record<AccountType, typeof Landmark> = {
  savings: Landmark,
  checking: Building2,
  wallet: Wallet,
  credit_card: CreditCard,
  cash: Coins,
};

export function AccountsPage() {
  const { userId } = useAuth();
  const { data: accounts, isLoading } = useAccounts(userId);
  const createAccount = useCreateAccount(userId);

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("savings");
  const [institution, setInstitution] = useState("");
  const [balance, setBalance] = useState("");
  const [inviteAccountId, setInviteAccountId] = useState<string | null>(null);

  const totalBalance = accounts?.reduce((sum, a) => sum + Number(a.balance), 0) ?? 0;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await createAccount.mutateAsync({
      name,
      type,
      institution: institution || null,
      balance: Number(balance) || 0,
      currency: "INR",
      is_simulated: true,
    });
    setName("");
    setInstitution("");
    setBalance("");
    setModalOpen(false);
  }

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.2em] text-signal">
            Account Management
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight lg:text-4xl">
            Simulated Financial Accounts
          </h1>
          <p className="mt-2 text-sm text-mute">
            Manage your digital wallets, checking, savings, and credit balances.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="fs-clip flex w-full items-center justify-center gap-2 bg-signal px-4 py-2 text-sm font-medium text-signal-foreground hover:brightness-110 sm:w-auto"
        >
          <Plus className="size-4" /> Add account
        </button>
      </div>

      {/* Simulated account notice */}
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-line bg-panel p-4 text-xs text-mute">
        <ShieldAlert className="size-5 shrink-0 text-signal" />
        <span>
          <strong>Simulated Workspace:</strong> Accounts listed below are simulated demo profiles
          for financial modeling. No real bank APIs or payment processors are linked.
        </span>
      </div>

      {/* Total Balance Banner */}
      <div className="mb-8 rounded-xl border border-line bg-panel p-6">
        <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-mute">
          Net Financial Position
        </div>
        <div className="mt-2 font-mono text-3xl font-bold text-signal">
          ₹{totalBalance.toLocaleString("en-IN")}
        </div>
        <div className="mt-1 text-xs text-mute">Across {accounts?.length || 0} active accounts</div>
      </div>

      {/* Accounts Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && (
          <div className="col-span-full py-12 text-center text-sm font-mono text-mute">
            Loading accounts…
          </div>
        )}
        {!isLoading && accounts?.length === 0 && (
          <div className="col-span-full py-12 text-center text-sm text-mute border border-dashed border-line rounded-xl p-8">
            No financial accounts created yet. Click "Add account" above to create your first
            simulated wallet or bank profile.
          </div>
        )}
        {accounts?.map((acc) => {
          const Icon = accountTypeIcons[acc.type] || Landmark;
          return (
            <div
              key={acc.id}
              className="rounded-xl border border-line bg-panel p-5 transition hover:border-signal/40"
            >
              <div className="flex items-center justify-between">
                <div className="grid size-10 place-items-center rounded-lg bg-raise text-signal border border-line">
                  <Icon className="size-5" />
                </div>
                <span className="rounded bg-raise px-2 py-1 text-[10px] font-mono uppercase text-mute">
                  {acc.type.replace("_", " ")}
                </span>
              </div>
              <div className="mt-4 font-display font-bold text-lg">{acc.name}</div>
              <div className="text-xs text-mute">{acc.institution || "Personal Wallet"}</div>
              <div className="mt-4 border-t border-line pt-3 flex items-center justify-between">
                <span className="text-xs text-mute font-mono">Balance</span>
                <span className="font-mono text-xl font-bold text-ink">
                  ₹{Number(acc.balance).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-[.14em] text-mute">
                  Shared members
                </span>
                {acc.user_id === userId && (
                  <button
                    onClick={() => setInviteAccountId(acc.id)}
                    className="text-xs font-medium text-signal hover:underline"
                  >
                    Invite
                  </button>
                )}
              </div>
              <MemberContributionList accountId={acc.id} accountTotal={Number(acc.balance)} />
            </div>
          );
        })}
      </div>

      {/* Create Account Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-xl border border-line bg-panel p-4 shadow-2xl sm:p-6">
            <h2 className="font-display text-xl font-bold">Add Simulated Account</h2>
            <p className="mt-1 text-xs text-mute">
              Create a new financial bucket to track transactions.
            </p>
            <form onSubmit={handleCreate} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-mute mb-1">Account Name</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. HDFC Main Savings"
                  className="w-full rounded-lg border border-line bg-raise px-3 py-2 text-sm outline-none focus:border-signal"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-mute mb-1">Account Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as AccountType)}
                  className="w-full rounded-lg border border-line bg-raise px-3 py-2 text-sm outline-none focus:border-signal"
                >
                  <option value="savings">Savings Account</option>
                  <option value="checking">Checking Account</option>
                  <option value="wallet">Digital Wallet</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-mute mb-1">
                  Institution (Optional)
                </label>
                <input
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. HDFC Bank, PayTM"
                  className="w-full rounded-lg border border-line bg-raise px-3 py-2 text-sm outline-none focus:border-signal"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-mute mb-1">
                  Initial Balance (₹)
                </label>
                <input
                  type="number"
                  required
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="50000"
                  className="w-full rounded-lg border border-line bg-raise px-3 py-2 text-sm outline-none focus:border-signal"
                />
              </div>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-full rounded-lg border border-line px-4 py-2 text-xs font-medium text-mute hover:text-ink sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAccount.isPending}
                  className="fs-clip w-full bg-signal px-4 py-2 text-xs font-medium text-signal-foreground hover:brightness-110 disabled:opacity-50 sm:w-auto"
                >
                  {createAccount.isPending ? "Creating…" : "Save Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {inviteAccountId && (
        <InviteMemberDialog
          accountId={inviteAccountId}
          userId={userId}
          open
          onClose={() => setInviteAccountId(null)}
        />
      )}
    </div>
  );
}
