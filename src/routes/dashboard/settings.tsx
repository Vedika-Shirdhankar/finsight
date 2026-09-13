import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { User, Bell, Shield, Moon, Save } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import {
  getNotificationPreferences,
  useProfile,
  useUpdateProfile,
} from "@/hooks/queries/use-profile";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

export function SettingsPage() {
  const { user, userId } = useAuth();
  const { data: profile } = useProfile(userId);
  const updateProfile = useUpdateProfile(userId);

  const [fullName, setFullName] = useState((user?.user_metadata?.["full_name"] as string) || "");
  const [currency, setCurrency] = useState("INR");
  const [theme, setTheme] = useState("dark");
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [spendingInsights, setSpendingInsights] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Once the profile row loads, hydrate the form with the saved values
  // instead of the hardcoded defaults above.
  useEffect(() => {
    if (!profile) return;
    setCurrency(profile.currency);
    setTheme(profile.theme);
    const prefs = getNotificationPreferences(profile);
    setBudgetAlerts(prefs.budget_alerts);
    setSpendingInsights(prefs.spending_insights);
    if (profile.full_name) setFullName(profile.full_name);
  }, [profile]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    });

    let profileError: { message: string } | null = null;
    try {
      await updateProfile.mutateAsync({
        full_name: fullName,
        currency,
        theme,
        notification_preferences: {
          budget_alerts: budgetAlerts,
          spending_insights: spendingInsights,
        },
      });
    } catch (err) {
      profileError = err as { message: string };
    }

    setSaving(false);
    const error = authError ?? profileError;
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Profile settings updated successfully!");
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.2em] text-signal">
          Preferences
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight lg:text-4xl">
          Account Settings
        </h1>
        <p className="mt-2 text-sm text-mute">
          Manage your personal profile, notification preferences, and workspace configuration.
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-lg border border-signal/30 bg-signal/10 px-4 py-3 text-sm text-signal">
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="rounded-xl border border-line bg-panel p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-6 border-b border-line pb-4">
            <User className="size-5 text-signal" />
            <h2 className="font-display text-lg font-bold">Profile Identity</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-mute mb-1">Full Name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Aarav Mehta"
                className="w-full rounded-lg border border-line bg-raise px-3 py-2 text-sm outline-none focus:border-signal"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-mute mb-1">Email Address</label>
              <input
                disabled
                value={user?.email || ""}
                className="w-full rounded-lg border border-line bg-raise/50 px-3 py-2 text-sm text-mute cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Currency & Workspace Preferences */}
        <div className="rounded-xl border border-line bg-panel p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-6 border-b border-line pb-4">
            <Moon className="size-5 text-signal" />
            <h2 className="font-display text-lg font-bold">Workspace Preferences</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-mute mb-1">Base Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-lg border border-line bg-raise px-3 py-2 text-sm outline-none focus:border-signal"
              >
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-mute mb-1">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full rounded-lg border border-line bg-raise px-3 py-2 text-sm outline-none focus:border-signal"
              >
                <option value="dark">Dark Bloomberg Mode (Default)</option>
                <option value="light">Light Slate Mode</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="rounded-xl border border-line bg-panel p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-6 border-b border-line pb-4">
            <Bell className="size-5 text-signal" />
            <h2 className="font-display text-lg font-bold">Alert & Notification Signals</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-medium">Budget Limit Thresholds</div>
                <div className="text-xs text-mute">
                  Alert when spending breaches 80% of budget cap
                </div>
              </div>
              <input
                type="checkbox"
                checked={budgetAlerts}
                onChange={(e) => setBudgetAlerts(e.target.checked)}
                className="size-4 accent-emerald-500"
              />
            </label>
            <label className="flex items-start justify-between gap-4 border-t border-line pt-4">
              <div>
                <div className="text-sm font-medium">Weekly Intelligence Summary</div>
                <div className="text-xs text-mute">
                  Receive automated category concentration & savings insights
                </div>
              </div>
              <input
                type="checkbox"
                checked={spendingInsights}
                onChange={(e) => setSpendingInsights(e.target.checked)}
                className="size-4 accent-emerald-500"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-stretch sm:justify-end">
          <button
            type="submit"
            disabled={saving}
            className="fs-clip flex w-full items-center justify-center gap-2 bg-signal px-6 py-2.5 text-sm font-medium text-signal-foreground hover:brightness-110 disabled:opacity-50 sm:w-auto"
          >
            <Save className="size-4" /> {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
