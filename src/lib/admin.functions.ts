import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

/**
 * Admin analytics are strictly aggregate/anonymised.
 * Admins never receive another person's transactions, merchants, notes,
 * balances, emails or account numbers — only counts, totals and pseudonyms.
 */

function pseudonym(userId: string) {
  return `USR-${userId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

async function assertAdmin(context: { supabase: SupabaseClient<Database>; userId: string }) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId);
  if (error) throw new Error("Unable to verify permissions");
  const isAdmin = (data ?? []).some((r: { role: string }) => r.role === "admin");
  if (!isAdmin) throw new Error("Forbidden: admin access required");
}

export type AdminOverview = {
  kpis: {
    totalUsers: number;
    newUsers30d: number;
    activeUsers30d: number;
    admins: number;
    totalTransactions: number;
    volume: number;
    income: number;
    expenses: number;
    avgTransactionValue: number;
    platformSavingsRate: number;
    accounts: number;
    budgets: number;
    goals: number;
  };
  monthly: { month: string; income: number; expenses: number; count: number }[];
  categories: { name: string; total: number; count: number }[];
  methods: { name: string; count: number; total: number }[];
  statuses: { name: string; count: number }[];
  users: {
    pseudonym: string;
    role: string;
    joined: string;
    transactions: number;
    lastActive: string | null;
  }[];
};

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminOverview> => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [profilesRes, rolesRes, txRes, catRes, accRes, budRes, goalRes] = await Promise.all([
      supabaseAdmin.from("profiles").select("user_id, created_at"),
      supabaseAdmin.from("user_roles").select("user_id, role"),
      supabaseAdmin
        .from("transactions")
        .select("user_id, amount, type, category_id, payment_method, status, transaction_date"),
      supabaseAdmin.from("categories").select("id, name"),
      supabaseAdmin.from("accounts").select("id"),
      supabaseAdmin.from("budgets").select("id"),
      supabaseAdmin.from("savings_goals").select("id"),
    ]);

    const err =
      profilesRes.error ||
      rolesRes.error ||
      txRes.error ||
      catRes.error ||
      accRes.error ||
      budRes.error ||
      goalRes.error;
    if (err) throw new Error(err.message);

    const profiles = profilesRes.data ?? [];
    const roles = rolesRes.data ?? [];
    const txs = txRes.data ?? [];
    const catName = new Map((catRes.data ?? []).map((c) => [c.id, c.name]));

    const now = Date.now();
    const days30 = now - 30 * 864e5;

    let income = 0;
    let expenses = 0;
    let volume = 0;
    const perUser = new Map<string, { count: number; last: string | null }>();
    const monthly = new Map<string, { income: number; expenses: number; count: number }>();
    const categories = new Map<string, { total: number; count: number }>();
    const methods = new Map<string, { count: number; total: number }>();
    const statuses = new Map<string, number>();
    const active = new Set<string>();

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      monthly.set(d.toISOString().slice(0, 7), { income: 0, expenses: 0, count: 0 });
    }

    for (const t of txs) {
      const amount = Number(t.amount) || 0;
      volume += Math.abs(amount);
      if (t.type === "income") income += amount;
      else if (t.type === "expense") expenses += Math.abs(amount);

      const ts = t.transaction_date;
      if (ts && new Date(ts).getTime() >= days30) active.add(t.user_id);

      const u = perUser.get(t.user_id) ?? { count: 0, last: null };
      u.count += 1;
      if (!u.last || (ts && ts > u.last)) u.last = ts;
      perUser.set(t.user_id, u);

      const key = (ts ?? "").slice(0, 7);
      const bucket = monthly.get(key);
      if (bucket) {
        bucket.count += 1;
        if (t.type === "income") bucket.income += amount;
        else if (t.type === "expense") bucket.expenses += Math.abs(amount);
      }

      if (t.type === "expense") {
        const cname = (t.category_id && catName.get(t.category_id)) || "Uncategorised";
        const c = categories.get(cname) ?? { total: 0, count: 0 };
        c.total += Math.abs(amount);
        c.count += 1;
        categories.set(cname, c);
      }

      const m = methods.get(t.payment_method) ?? { count: 0, total: 0 };
      m.count += 1;
      m.total += Math.abs(amount);
      methods.set(t.payment_method, m);

      statuses.set(t.status, (statuses.get(t.status) ?? 0) + 1);
    }

    const roleOf = new Map<string, string>();
    for (const r of roles) {
      const current = roleOf.get(r.user_id);
      if (r.role === "admin" || !current) roleOf.set(r.user_id, r.role);
    }

    return {
      kpis: {
        totalUsers: profiles.length,
        newUsers30d: profiles.filter((p) => new Date(p.created_at).getTime() >= days30).length,
        activeUsers30d: active.size,
        admins: roles.filter((r) => r.role === "admin").length,
        totalTransactions: txs.length,
        volume,
        income,
        expenses,
        avgTransactionValue: txs.length ? volume / txs.length : 0,
        platformSavingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
        accounts: (accRes.data ?? []).length,
        budgets: (budRes.data ?? []).length,
        goals: (goalRes.data ?? []).length,
      },
      monthly: [...monthly.entries()].map(([month, v]) => ({ month, ...v })),
      categories: [...categories.entries()]
        .map(([name, v]) => ({ name, ...v }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 8),
      methods: [...methods.entries()]
        .map(([name, v]) => ({ name, ...v }))
        .sort((a, b) => b.count - a.count),
      statuses: [...statuses.entries()].map(([name, count]) => ({ name, count })),
      users: profiles
        .map((p) => ({
          pseudonym: pseudonym(p.user_id),
          role: roleOf.get(p.user_id) ?? "user",
          joined: p.created_at,
          transactions: perUser.get(p.user_id)?.count ?? 0,
          lastActive: perUser.get(p.user_id)?.last ?? null,
        }))
        .sort((a, b) => (a.joined < b.joined ? 1 : -1)),
    };
  });

export const getMyRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const roles = (data ?? []).map((r: { role: string }) => r.role);
    return { roles, isAdmin: roles.includes("admin") };
  });
