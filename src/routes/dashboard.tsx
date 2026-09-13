import { useEffect, useState } from "react";
import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  AreaChart,
  Bell,
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  PieChart,
  Repeat,
  Search,
  Settings,
  Target,
  WalletCards,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useNotificationSync,
} from "@/hooks/queries/use-notifications";
import { useRecurringTransactionSync } from "@/hooks/queries/use-recurring-transactions";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — FinSight" },
      { name: "description", content: "Your FinSight financial intelligence dashboard." },
      { property: "og:title", content: "Dashboard — FinSight" },
      {
        property: "og:description",
        content: "See your spending, savings, and financial signals at a glance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardLayout,
});

// Route path -> nav item. Add a new entry here whenever a new dashboard
// sub-page is added under src/routes/dashboard/.
const navItems = [
  { label: "Overview", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Transactions", icon: FileText, to: "/dashboard/transactions" },
  { label: "Analytics", icon: AreaChart, to: "/dashboard/insights" },
  { label: "Accounts", icon: WalletCards, to: "/dashboard/accounts" },
  { label: "Budgets", icon: PieChart, to: "/dashboard/budgets" },
  { label: "Savings goals", icon: Target, to: "/dashboard/goals" },
  { label: "Recurring & bills", icon: Repeat, to: "/dashboard/recurring" },
] as const;

function DashboardLayout() {
  const navigate = useNavigate();
  const { user, userId, loading } = useAuth();
  useNotificationSync(userId);
  useRecurringTransactionSync(userId);
  const { data: notifications } = useNotifications(userId);
  const markRead = useMarkNotificationRead(userId);
  const markAllRead = useMarkAllNotificationsRead(userId);
  const unreadCount = notifications?.filter((n) => !n.is_read).length ?? 0;
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Client-side auth guard: bounce signed-out visitors to /auth. `loading`
  // gates this so we don't redirect during the initial session check.
  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    void navigate({ to: "/auth" });
  }

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-page text-mute text-sm font-mono">
        Loading your dashboard…
      </div>
    );
  }

  const initials =
    (user.user_metadata?.["full_name"] as string | undefined)
      ?.split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ||
    user.email?.slice(0, 2).toUpperCase() ||
    "??";

  const searchResults = [
    { title: "Transactions History", link: "/dashboard/transactions", type: "Page" },
    { title: "Analytics & Intelligence", link: "/dashboard/insights", type: "Page" },
    { title: "Financial Accounts", link: "/dashboard/accounts", type: "Page" },
    { title: "Monthly Budgets", link: "/dashboard/budgets", type: "Page" },
    { title: "Savings Goals", link: "/dashboard/goals", type: "Page" },
    { title: "Account Settings", link: "/dashboard/settings", type: "Page" },
  ].filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-page text-ink">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-line bg-panel transition-transform lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <Link to="/" className="flex items-center gap-3 font-display text-lg font-bold">
            <span className="fs-clip grid size-8 place-items-center bg-signal text-sm text-signal-foreground">
              F
            </span>
            FinSight
          </Link>
          <button onClick={() => setMenuOpen(false)} className="text-mute lg:hidden">
            <X className="size-5" />
          </button>
        </div>
        <div className="p-4">
          <div className="mb-6 rounded-lg border border-line bg-raise px-3 py-2.5">
            <div className="text-[9px] font-mono uppercase tracking-[0.18em] text-mute">
              Workspace
            </div>
            <div className="mt-1 flex items-center justify-between text-sm font-medium">
              Personal finances <ChevronDown className="size-4 text-mute" />
            </div>
          </div>
          <div className="mb-2 px-3 text-[10px] font-mono uppercase tracking-[0.2em] text-mute">
            Intelligence
          </div>
          <nav className="space-y-1">
            {navItems.map(({ label, icon: Icon, to }) => {
              const active = pathname === to;
              return (
                <Link
                  key={label}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  to={to as any}
                  onClick={() => setMenuOpen(false)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                    active
                      ? "bg-signal/10 font-medium text-signal"
                      : "text-mute hover:bg-raise hover:text-ink"
                  }`}
                >
                  <Icon className="size-[17px]" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="mb-2 mt-8 px-3 text-[10px] font-mono uppercase tracking-[0.2em] text-mute">
            Workspace
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => setNotificationsOpen(true)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-mute transition hover:bg-raise hover:text-ink"
            >
              <Bell className="size-[17px]" />
              Notifications
            </button>
            <Link
              to="/dashboard/settings"
              onClick={() => setMenuOpen(false)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                pathname === "/dashboard/settings"
                  ? "bg-signal/10 font-medium text-signal"
                  : "text-mute hover:bg-raise hover:text-ink"
              }`}
            >
              <Settings className="size-[17px]" />
              Settings
            </Link>
          </nav>
        </div>
        <div className="absolute bottom-0 left-0 right-0 border-t border-line p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-lg bg-signal/15 font-display font-bold text-signal">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">
                {(user.user_metadata?.["full_name"] as string | undefined) || user.email}
              </div>
              <div className="truncate text-[10px] font-mono text-mute">PERSONAL</div>
            </div>
            <button
              onClick={signOut}
              className="ml-auto text-mute hover:text-danger-signal"
              title="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>
      {menuOpen && (
        <button
          aria-label="Close navigation menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
        />
      )}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-page/85 px-4 backdrop-blur sm:px-5 lg:px-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setMenuOpen(true)} className="text-mute lg:hidden">
              <Menu className="size-5" />
            </button>
            <div className="font-display text-sm font-semibold">Financial overview</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-line bg-raise px-3 py-1.5 text-xs text-mute transition hover:border-signal/40 hover:text-ink"
            >
              <Search className="size-3.5" />
              <span className="hidden sm:inline">Search…</span>
              <kbd className="hidden rounded bg-page px-1.5 py-0.5 text-[10px] font-mono sm:inline">Ctrl K</kbd>
            </button>
            <button
              onClick={() => setNotificationsOpen(true)}
              className="relative p-2 text-mute hover:text-ink"
            >
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 grid size-4 place-items-center rounded-full bg-signal text-[9px] font-bold text-signal-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <div className="relative">
              <button
                onClick={() => setProfileMenu(!profileMenu)}
                className="flex items-center gap-2"
              >
                <div className="grid size-8 place-items-center rounded-lg bg-signal/15 text-xs font-bold text-signal">
                  {initials}
                </div>
                <ChevronDown className="hidden size-3 text-mute sm:block" />
              </button>
              {profileMenu && (
                <div className="absolute right-0 top-10 w-40 rounded-lg border border-line bg-panel p-1 shadow-xl">
                  <button
                    onClick={signOut}
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-mute hover:bg-raise hover:text-danger-signal"
                  >
                    <LogOut className="size-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Global Search Modal (Ctrl + K) */}
        {searchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-20 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-xl border border-line bg-panel p-4 shadow-2xl">
              <div className="flex items-center gap-3 border-b border-line pb-3">
                <Search className="size-4 text-mute" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pages, transactions, budgets…"
                  className="w-full bg-transparent text-sm outline-none"
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="text-xs text-mute hover:text-ink"
                >
                  ESC
                </button>
              </div>
              <div className="mt-3 max-h-72 overflow-y-auto space-y-1">
                {searchResults.length === 0 ? (
                  <div className="py-6 text-center text-xs text-mute">
                    No matching routes or items found.
                  </div>
                ) : (
                  searchResults.map((item) => (
                    <Link
                      key={item.title}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      to={item.link as any}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-xs transition hover:bg-raise"
                    >
                      <span className="font-medium text-ink">{item.title}</span>
                      <span className="rounded bg-raise px-2 py-0.5 font-mono text-[10px] text-mute">
                        {item.type}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notifications Drawer */}
        {notificationsOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-sm border-l border-line bg-panel p-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div className="flex items-center gap-2">
                  <Bell className="size-4 text-signal" />
                  <h2 className="font-display font-bold">Notifications</h2>
                </div>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllRead.mutate()}
                      className="text-[10px] font-mono uppercase tracking-wide text-signal hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="text-mute hover:text-ink"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
              <div className="mt-4 space-y-3 max-h-[calc(100vh-8rem)] overflow-y-auto">
                {!notifications || notifications.length === 0 ? (
                  <div className="py-10 text-center text-xs text-mute">
                    You're all caught up — no notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => !n.is_read && markRead.mutate(n.id)}
                      className={`block w-full rounded-lg border p-3 text-left text-xs transition ${
                        !n.is_read
                          ? n.kind === "warning"
                            ? "border-danger-signal/30 bg-danger-signal/5"
                            : "border-signal/30 bg-signal/5"
                          : "border-line bg-raise"
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span>{n.title}</span>
                        <span className="text-[10px] font-mono text-mute">
                          {new Date(n.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                      <p className="mt-1 text-mute leading-relaxed">{n.message}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <main className="mx-auto max-w-[1600px] p-4 sm:p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
