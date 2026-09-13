import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Database,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { getAdminOverview, type AdminOverview } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin control center — FinSight" },
      {
        name: "description",
        content: "Privacy-safe platform analytics and administration for FinSight.",
      },
      { property: "og:title", content: "Admin control center — FinSight" },
      {
        property: "og:description",
        content: "Review platform health through aggregate FinSight intelligence.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const shortDate = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const chartColors = [
  "var(--signal)",
  "var(--info-signal)",
  "var(--warning-signal)",
  "var(--danger-signal)",
  "var(--mute)",
];

function formatMoney(value: number) {
  return money.format(value).replace("₹", "₹");
}

function AdminPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [tab, setTab] = useState<"overview" | "users" | "transactions">("overview");
  const adminQuery = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => getAdminOverview(),
    staleTime: 60_000,
  });

  async function signOut() {
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-page text-ink">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-line bg-panel transition-transform lg:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <Link to="/dashboard" className="flex items-center gap-3 font-display text-lg font-bold">
            <span className="fs-clip grid size-8 place-items-center bg-signal text-sm text-signal-foreground">
              F
            </span>
            FinSight
          </Link>
          <button
            onClick={() => setMenuOpen(false)}
            className="text-mute lg:hidden"
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="p-4">
          <div className="mb-6 rounded-lg border border-signal/30 bg-signal/10 px-3 py-3">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-signal">
              <ShieldCheck className="size-3.5" /> Admin scope
            </div>
            <div className="mt-2 text-sm font-medium">Platform operations</div>
            <div className="mt-1 text-[10px] leading-relaxed text-mute">
              Aggregate data only. Private financial details stay hidden.
            </div>
          </div>
          <div className="mb-2 px-3 text-[10px] font-mono uppercase tracking-[0.2em] text-mute">
            Control center
          </div>
          <nav className="space-y-1">
            {(
              [
                ["overview", "Overview", LayoutDashboard],
                ["users", "Users", Users],
                ["transactions", "Transactions", FileText],
              ] as const
            ).map(([value, label, Icon]) => (
              <button
                key={value}
                onClick={() => {
                  setTab(value);
                  setMenuOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${tab === value ? "bg-signal/10 font-medium text-signal" : "text-mute hover:bg-raise hover:text-ink"}`}
              >
                <Icon className="size-[17px]" />
                {label}
              </button>
            ))}
          </nav>
          <div className="mt-8 border-t border-line pt-5">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-mute transition hover:bg-raise hover:text-ink"
            >
              <ArrowLeft className="size-[17px]" /> Personal workspace
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 border-t border-line p-4">
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-mute transition hover:bg-raise hover:text-danger-signal"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-page/85 px-5 backdrop-blur lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMenuOpen(true)}
              className="text-mute lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </button>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-signal">
                FinSight / restricted
              </div>
              <div className="font-display text-sm font-semibold">Admin control center</div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-signal/30 bg-signal/10 px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.12em] text-signal">
            <ShieldCheck className="size-3.5" /> Role verified
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] p-5 lg:p-8">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.2em] text-signal">
                Platform intelligence / aggregate view
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight lg:text-4xl">
                Keep the platform in signal.
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-mute">
                Monitor adoption, financial activity, and system health without exposing private
                user transactions.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.12em] text-mute">
              <Activity className="size-4 text-signal" /> Live access scope
            </div>
          </div>
          {adminQuery.isPending && <LoadingState />}
          {adminQuery.isError && (
            <ErrorState
              message={
                adminQuery.error instanceof Error
                  ? adminQuery.error.message
                  : "This admin view could not load."
              }
            />
          )}
          {adminQuery.data && <AdminContent data={adminQuery.data} tab={tab} />}
        </main>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className="h-32 animate-pulse rounded-xl border border-line bg-panel" />
      <div className="h-32 animate-pulse rounded-xl border border-line bg-panel" />
      <div className="h-32 animate-pulse rounded-xl border border-line bg-panel" />
      <div className="h-32 animate-pulse rounded-xl border border-line bg-panel" />
      <div className="h-96 animate-pulse rounded-xl border border-line bg-panel sm:col-span-2 xl:col-span-4" />
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-danger-signal/30 bg-danger-signal/10 p-6">
      <div className="flex items-center gap-3 text-danger-signal">
        <ShieldCheck className="size-5" />
        <span className="font-medium">Admin access unavailable</span>
      </div>
      <p className="mt-2 text-sm text-mute">
        {message.includes("Forbidden")
          ? "Your signed-in account does not have the admin role."
          : "We couldn't retrieve platform analytics right now."}
      </p>
    </div>
  );
}

function AdminContent({
  data,
  tab,
}: {
  data: AdminOverview;
  tab: "overview" | "users" | "transactions";
}) {
  if (tab === "users") return <UsersPanel users={data.users} />;
  if (tab === "transactions") return <TransactionsPanel data={data} />;
  return <OverviewPanel data={data} />;
}

function OverviewPanel({ data }: { data: AdminOverview }) {
  const k = data.kpis;
  const kpis = [
    [
      "Total users",
      k.totalUsers.toLocaleString("en-IN"),
      `${k.newUsers30d} joined in 30d`,
      Users,
      "text-signal",
    ],
    [
      "Active users",
      k.activeUsers30d.toLocaleString("en-IN"),
      "transaction activity / 30d",
      Activity,
      "text-info-signal",
    ],
    [
      "Transaction volume",
      formatMoney(k.volume),
      `${k.totalTransactions.toLocaleString("en-IN")} records`,
      CircleDollarSign,
      "text-warning-signal",
    ],
    [
      "Platform savings",
      `${k.platformSavingsRate.toFixed(1)}%`,
      `${k.accounts} accounts tracked`,
      WalletCards,
      "text-signal",
    ],
  ] as const;
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(([label, value, note, Icon, color]) => (
          <div key={label} className="rounded-xl border border-line bg-panel p-5">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.14em] text-mute">
              <span>{label}</span>
              <Icon className={`size-4 ${color}`} />
            </div>
            <div className="mt-3 font-mono text-2xl font-bold tracking-tight">{value}</div>
            <div className="mt-2 text-xs text-mute">{note}</div>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <section className="rounded-xl border border-line bg-panel p-5 xl:col-span-2">
          <SectionHeader
            icon={BarChart3}
            title="Platform flow"
            copy="Aggregate income, expenses, and transaction count over six months."
          />
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthly} barGap={4}>
                <CartesianGrid stroke="var(--line)" vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "var(--mute)", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--mute)", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${Math.round(value / 1000)}k`}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="income" fill="var(--signal)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="expenses" fill="var(--warning-signal)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-xl border border-line bg-panel p-5">
          <SectionHeader
            icon={Database}
            title="Platform footprint"
            copy="Current product adoption across the workspace."
          />
          <div className="mt-6 space-y-5">
            {(
              [
                ["Transactions", k.totalTransactions, FileText],
                ["Accounts", k.accounts, WalletCards],
                ["Budgets", k.budgets, BarChart3],
                ["Savings goals", k.goals, CircleDollarSign],
              ] as [string, number, LucideIcon][]
            ).map(([label, value, Icon]) => (
              <div key={label} className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-lg bg-raise text-signal">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm">{label}</div>
                  <div className="mt-1 h-1.5 rounded-full bg-raise">
                    <div
                      className="h-full rounded-full bg-signal"
                      style={{
                        width: `${Math.min(100, (Number(value) / Math.max(1, k.totalUsers)) * 12)}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="font-mono text-sm">{Number(value).toLocaleString("en-IN")}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-panel p-5">
          <SectionHeader
            icon={BarChart3}
            title="Expense concentration"
            copy="Top categories across all users, shown as totals only."
          />
          <div className="mt-5 space-y-4">
            {data.categories.slice(0, 6).map((item, index) => (
              <div key={item.name}>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span>{item.name}</span>
                  <span className="font-mono text-mute">{formatMoney(item.total)}</span>
                </div>
                <div className="h-2 rounded-full bg-raise">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(3, (item.total / Math.max(1, data.categories[0]?.total ?? 1)) * 100)}%`,
                      backgroundColor: chartColors[index % chartColors.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-xl border border-line bg-panel p-5">
          <SectionHeader
            icon={CheckCircle2}
            title="Data quality signals"
            copy="Operational checks for the current dataset."
          />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ["Role coverage", `${k.admins} admin${k.admins === 1 ? "" : "s"}`, "verified"],
              [
                "Completion",
                `${data.statuses.find((s) => s.name === "completed")?.count ?? 0} completed`,
                "transactions",
              ],
              ["Average value", formatMoney(k.avgTransactionValue), "per transaction"],
              ["Privacy mode", "Aggregate only", "enabled"],
            ].map(([label, value, note]) => (
              <div key={label} className="rounded-lg border border-line bg-raise p-4">
                <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-mute">
                  {label}
                </div>
                <div className="mt-2 font-mono text-lg font-semibold">{value}</div>
                <div className="mt-1 text-[11px] text-signal">{note}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function UsersPanel({ users }: { users: AdminOverview["users"] }) {
  return (
    <section className="rounded-xl border border-line bg-panel">
      <div className="border-b border-line p-5">
        <SectionHeader
          icon={Users}
          title="User directory"
          copy="Pseudonymous operational view. Email addresses and private profile fields are never returned."
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-line text-[10px] font-mono uppercase tracking-[0.14em] text-mute">
            <tr>
              <th className="px-5 py-4">User</th>
              <th className="px-5 py-4">Role</th>
              <th className="px-5 py-4">Joined</th>
              <th className="px-5 py-4">Transactions</th>
              <th className="px-5 py-4">Last activity</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.pseudonym} className="border-b border-line/70 last:border-0">
                <td className="px-5 py-4 font-mono text-xs">{user.pseudonym}</td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-mono uppercase ${user.role === "admin" ? "bg-signal/10 text-signal" : "bg-raise text-mute"}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-4 text-xs text-mute">
                  {shortDate.format(new Date(user.joined))}
                </td>
                <td className="px-5 py-4 font-mono text-xs">
                  {user.transactions.toLocaleString("en-IN")}
                </td>
                <td className="px-5 py-4 text-xs text-mute">
                  {user.lastActive ? shortDate.format(new Date(user.lastActive)) : "No activity"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <EmptyState copy="No users are available yet." />}
      </div>
    </section>
  );
}

function TransactionsPanel({ data }: { data: AdminOverview }) {
  const methods = useMemo(() => data.methods, [data.methods]);
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <section className="rounded-xl border border-line bg-panel p-5 xl:col-span-2">
        <SectionHeader
          icon={FileText}
          title="Transaction operations"
          copy="System-wide counts and payment-method volume. Individual records remain private."
        />
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {data.statuses.map((status) => (
            <div key={status.name} className="rounded-lg border border-line bg-raise p-4">
              <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-mute">
                {status.name}
              </div>
              <div className="mt-2 font-mono text-2xl font-bold">
                {status.count.toLocaleString("en-IN")}
              </div>
              <div className="mt-1 text-xs text-mute">transactions</div>
            </div>
          ))}
        </div>
        <div className="mt-6 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={methods} layout="vertical" margin={{ left: 16, right: 12 }}>
              <CartesianGrid stroke="var(--line)" horizontal={false} strokeDasharray="3 3" />
              <XAxis
                type="number"
                tick={{ fill: "var(--mute)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                width={80}
                tick={{ fill: "var(--mute)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" fill="var(--info-signal)" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="rounded-xl border border-line bg-panel p-5">
        <SectionHeader
          icon={CircleDollarSign}
          title="Payment mix"
          copy="Count and aggregate volume by method."
        />
        <div className="mt-5 space-y-4">
          {methods.map((method, index) => (
            <div key={method.name} className="flex items-center gap-3">
              <div
                className="size-2 rounded-full"
                style={{ backgroundColor: chartColors[index % chartColors.length] }}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm">{method.name}</div>
                <div className="text-xs text-mute">{formatMoney(method.total)}</div>
              </div>
              <div className="font-mono text-xs text-mute">{method.count}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  copy,
}: {
  icon: LucideIcon;
  title: string;
  copy: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-signal/10 text-signal">
        <Icon className="size-4" />
      </div>
      <div>
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-xs text-mute">{copy}</p>
      </div>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-panel px-3 py-2 text-xs shadow-xl">
      <div className="mb-1 font-mono text-mute">{label}</div>
      {payload.map((item) => (
        <div key={item.name} className="flex gap-3">
          <span>{item.name}</span>
          <span className="font-mono">
            {typeof item.value === "number" ? formatMoney(item.value) : item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ copy }: { copy: string }) {
  return <div className="p-10 text-center text-sm text-mute">{copy}</div>;
}
