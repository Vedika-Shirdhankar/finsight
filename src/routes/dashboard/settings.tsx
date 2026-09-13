import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { User, Bell, Shield, Moon, Save, KeyRound, CheckCircle2, Lock, History } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import {
  getNotificationPreferences,
  useProfile,
  useUpdateProfile,
} from "@/hooks/queries/use-profile";
import { initialize2FA, verify2FACode, type MfaSetupResult } from "@/lib/mfa";
import { logSensitiveAction } from "@/lib/audit-logger";

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

  // 2FA / Security State
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaSetup, setMfaSetup] = useState<MfaSetupResult | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [mfaVerifying, setMfaVerifying] = useState(false);
  const [mfaMessage, setMfaMessage] = useState("");

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!profile) return;
    setCurrency(profile.currency);
    setTheme(profile.theme);
    const prefs = getNotificationPreferences(profile);
    setBudgetAlerts(prefs.budget_alerts);
    setSpendingInsights(prefs.spending_insights);
    if (profile.full_name) setFullName(profile.full_name);
  }, [profile]);

  useEffect(() => {
    if (!userId) return;
    // Fetch Audit Trail Logs
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data) setAuditLogs(data);
      });
  }, [userId]);

  async function handleStart2FASetup() {
    setMfaMessage("");
    const setup = await initialize2FA();
    setMfaSetup(setup);
  }

  async function handleVerify2FA() {
    if (!mfaSetup || !totpCode || totpCode.length !== 6) {
      setMfaMessage("Please enter a valid 6-digit TOTP code.");
      return;
    }
    setMfaVerifying(true);
    const isValid = await verify2FACode(mfaSetup.factorId, totpCode);
    setMfaVerifying(false);

    if (isValid) {
      setMfaEnabled(true);
      setMfaSetup(null);
      setMfaMessage("Two-Factor Authentication (2FA) successfully enabled!");
      if (userId) {
        logSensitiveAction(userId, "MFA_ENABLED", "user_profile", userId, { factorType: "totp" });
      }
    } else {
      setMfaMessage("Invalid 6-digit verification code. Please try again.");
    }
  }

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
      if (userId) {
        logSensitiveAction(userId, "ACCOUNT_UPDATE", "user_profile", userId, { currency, theme });
      }
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
    <div className="max-w-4xl space-y-6">
      <div className="mb-8">
        <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.2em] text-signal">
          Preferences & Security
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight lg:text-4xl">
          Security & Account Settings
        </h1>
        <p className="mt-2 text-sm text-mute">
          Manage identity security, Two-Factor Authentication (2FA), audit logs, and notification preferences.
        </p>
      </div>

      {message && (
        <div className="rounded-lg border border-signal/30 bg-signal/10 px-4 py-3 text-sm text-signal">
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

        {/* Two-Factor Authentication (2FA / MFA) Hardening */}
        <div className="rounded-xl border border-line bg-panel p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-line pb-4 mb-6">
            <div className="flex items-center gap-3">
              <KeyRound className="size-5 text-signal" />
              <div>
                <h2 className="font-display text-lg font-bold">Two-Factor Authentication (2FA)</h2>
                <p className="text-xs text-mute">Protect your financial accounts with TOTP Authenticator apps (Google Authenticator / Authy).</p>
              </div>
            </div>
            {mfaEnabled ? (
              <span className="inline-flex items-center gap-1 rounded bg-signal/20 px-2.5 py-1 font-mono text-xs text-signal font-semibold">
                <CheckCircle2 className="size-3.5" /> 2FA Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded bg-warning-signal/20 px-2.5 py-1 font-mono text-xs text-warning-signal">
                <Lock className="size-3.5" /> Disabled
              </span>
            )}
          </div>

          {mfaMessage && (
            <div className="mb-4 rounded-lg border border-signal/30 bg-signal/10 px-4 py-2.5 text-xs text-signal">
              {mfaMessage}
            </div>
          )}

          {!mfaEnabled && !mfaSetup && (
            <button
              type="button"
              onClick={handleStart2FASetup}
              className="fs-clip bg-signal px-4 py-2 text-xs font-medium text-signal-foreground hover:brightness-110"
            >
              Enable 2FA Authenticator
            </button>
          )}

          {mfaSetup && !mfaEnabled && (
            <div className="space-y-4 rounded-lg border border-line bg-raise p-4">
              <div className="text-xs font-semibold text-ink">Step 1: Scan QR Code or Copy Secret Key</div>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <img src={mfaSetup.qrCodeUrl} alt="2FA QR Code" className="size-32 rounded border border-line bg-white p-1" />
                <div className="space-y-1">
                  <div className="text-xs text-mute">Secret Key:</div>
                  <code className="block font-mono text-xs bg-panel p-2 rounded border border-line text-signal select-all">
                    {mfaSetup.secret}
                  </code>
                  <div className="text-[11px] text-mute">Scan this QR code with Google Authenticator or 1Password.</div>
                </div>
              </div>

              <div className="text-xs font-semibold text-ink pt-2">Step 2: Enter 6-Digit Verification Code</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.trim())}
                  className="w-36 rounded-lg border border-line bg-panel px-3 py-2 font-mono text-center text-sm outline-none focus:border-signal"
                />
                <button
                  type="button"
                  onClick={handleVerify2FA}
                  disabled={mfaVerifying}
                  className="fs-clip bg-signal px-4 py-2 text-xs font-medium text-signal-foreground hover:brightness-110"
                >
                  {mfaVerifying ? "Verifying..." : "Verify & Activate 2FA"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Security Audit Trail Viewer */}
        <div className="rounded-xl border border-line bg-panel p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-line pb-4 mb-4">
            <History className="size-5 text-signal" />
            <div>
              <h2 className="font-display text-lg font-bold">Security Audit Trail</h2>
              <p className="text-xs text-mute">Immutable security ledger tracking sensitive transaction edits, deletions, and access changes.</p>
            </div>
          </div>

          <div className="space-y-2">
            {auditLogs.length === 0 ? (
              <div className="py-6 text-center text-xs font-mono text-mute">No security audit records logged yet.</div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between rounded-lg border border-line bg-raise px-3 py-2 text-xs">
                  <div>
                    <div className="font-medium text-ink">{log.title}</div>
                    <div className="text-[11px] text-mute">{log.body}</div>
                  </div>
                  <div className="font-mono text-[10px] text-mute">
                    {new Date(log.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              ))
            )}
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
