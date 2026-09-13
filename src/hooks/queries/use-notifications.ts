import { useEffect, useMemo, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { queryKeys } from "./keys";
import { useCategories } from "./use-categories";
import { useBudget } from "./use-budgets";
import { useSavingsGoals } from "./use-savings-goals";
import { useTransactions } from "./use-transactions";
import { getNotificationPreferences, useProfile } from "./use-profile";
import { detectAnomalies } from "@/lib/analytics";

export type NotificationKind = "warning" | "positive" | "neutral";
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
type NotificationInsert = Database["public"]["Tables"]["notifications"]["Insert"];

/** Fetches the signed-in user's notifications, most recent first. */
export function useNotifications(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.notifications(userId ?? ""),
    queryFn: async (): Promise<Notification[]> => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useMarkNotificationRead(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications(userId ?? "") });
    },
  });
}

export function useMarkAllNotificationsRead(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!userId) return;
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications(userId ?? "") });
    },
  });
}

export function useDeleteNotification(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications(userId ?? "") });
    },
  });
}

function monthEnd(monthStart: string) {
  const d = new Date(monthStart + "T00:00:00");
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  return d.toISOString().slice(0, 10) + "T23:59:59";
}

const GOAL_MILESTONES = [50, 75, 100];
const BUDGET_ALERT_PCT = 80;

/**
 * Watches the current month's budget categories and savings goals, and
 * writes a notification row the first time a threshold is crossed
 * (80%/100% of a budget category, or a 50/75/100% savings-goal milestone).
 * Dedupes against existing notifications for the same period so it's safe
 * to mount this on every dashboard load without spamming the feed.
 */
export function useNotificationSync(userId: string | null) {
  const monthStart = useMemo(() => new Date().toISOString().slice(0, 8) + "01", []);
  const ninetyDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 90);
    return d.toISOString().slice(0, 10);
  }, []);
  const { data: budget } = useBudget(userId, monthStart);
  const { data: categories } = useCategories(userId);
  const { data: goals } = useSavingsGoals(userId);
  const { data: monthExpenses } = useTransactions(userId, {
    from: monthStart,
    to: monthEnd(monthStart),
    type: "expense",
  });
  const { data: recentExpenses } = useTransactions(userId, {
    from: ninetyDaysAgo,
    type: "expense",
  });
  const { data: existing } = useNotifications(userId);
  const { data: profile } = useProfile(userId);
  const prefs = getNotificationPreferences(profile);
  const queryClient = useQueryClient();
  const ranFor = useRef<string | null>(null);

  useEffect(() => {
    if (
      !userId ||
      !budget ||
      !categories ||
      !goals ||
      !monthExpenses ||
      !recentExpenses ||
      !existing ||
      !profile
    )
      return;

    // Only run once per data snapshot (keyed on counts) to avoid re-checking on every render.
    const snapshotKey = `${budget.id}:${monthExpenses.length}:${recentExpenses.length}:${goals
      .map((g) => g.current_amount)
      .join(",")}:${prefs.budget_alerts}:${prefs.spending_insights}`;
    if (ranFor.current === snapshotKey) return;
    ranFor.current = snapshotKey;

    const spendByCategory = new Map<string, number>();
    for (const t of monthExpenses) {
      if (!t.category_id) continue;
      spendByCategory.set(
        t.category_id,
        (spendByCategory.get(t.category_id) ?? 0) + Number(t.amount),
      );
    }
    const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "a category";

    const toInsert: NotificationInsert[] = [];
    const existsAlready = (title: string, message: string) =>
      existing.some((n) => n.title === title && n.message === message);

    for (const bc of budget.budget_categories) {
      if (!prefs.budget_alerts) break;
      const spent = spendByCategory.get(bc.category_id) ?? 0;
      const limit = Number(bc.limit_amount);
      if (limit <= 0) continue;
      const pct = (spent / limit) * 100;
      const name = categoryName(bc.category_id);

      if (pct >= 100) {
        const title = "Budget exceeded";
        const message = `${name} spending has gone over its ₹${limit.toLocaleString("en-IN")} monthly budget.`;
        if (!existsAlready(title, message))
          toInsert.push({ user_id: userId, title, message, kind: "warning" });
      } else if (pct >= BUDGET_ALERT_PCT) {
        const title = "Budget limit alert";
        const message = `${name} spending reached ${Math.round(pct)}% of its ₹${limit.toLocaleString(
          "en-IN",
        )} monthly budget.`;
        if (!existsAlready(title, message))
          toInsert.push({ user_id: userId, title, message, kind: "warning" });
      }
    }

    for (const goal of goals) {
      if (!prefs.spending_insights) break;
      const target = Number(goal.target_amount);
      if (target <= 0) continue;
      const pct = (Number(goal.current_amount) / target) * 100;
      for (const milestone of GOAL_MILESTONES) {
        if (pct < milestone) continue;
        const title = milestone === 100 ? "Savings goal reached" : "Savings milestone";
        const message =
          milestone === 100
            ? `Congratulations! You reached your "${goal.name}" goal.`
            : `You're ${milestone}% of the way to your "${goal.name}" goal.`;
        if (!existsAlready(title, message))
          toInsert.push({ user_id: userId, title, message, kind: "positive" });
      }
    }

    if (prefs.spending_insights) {
      const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));
      const anomalies = detectAnomalies(recentExpenses, categoryNameById);
      // Only surface anomalies from the last 7 days so this doesn't dredge up old transactions
      // every time the sync runs, and cap how many we insert at once.
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentAnomalies = anomalies
        .filter((a) => new Date(a.transaction.transaction_date) >= sevenDaysAgo)
        .slice(0, 5);

      for (const a of recentAnomalies) {
        const title = "Unusual transaction";
        const message = `${a.transaction.merchant ?? "A transaction"} for ₹${Number(
          a.transaction.amount,
        ).toLocaleString(
          "en-IN",
        )} in ${a.categoryLabel} is much higher than your usual spending there.`;
        if (!existsAlready(title, message))
          toInsert.push({ user_id: userId, title, message, kind: "warning" });
      }
    }

    if (toInsert.length > 0) {
      void supabase
        .from("notifications")
        .insert(toInsert)
        .then(({ error }) => {
          if (!error) queryClient.invalidateQueries({ queryKey: queryKeys.notifications(userId) });
        });
    }
  }, [
    userId,
    budget,
    categories,
    goals,
    monthExpenses,
    recentExpenses,
    existing,
    profile,
    prefs.budget_alerts,
    prefs.spending_insights,
    queryClient,
  ]);
}
