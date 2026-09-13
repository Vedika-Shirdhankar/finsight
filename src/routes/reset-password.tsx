import { useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { LockKeyhole } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — FinSight" },
      { name: "description", content: "Set a new password for your FinSight account." },
      { property: "og:title", content: "Reset password — FinSight" },
      { property: "og:description", content: "Set a new password for your FinSight account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [recovery, setRecovery] = useState(false);
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const result = recovery
      ? await supabase.auth.updateUser({ password })
      : await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
    setBusy(false);
    if (result.error) setError(result.error.message);
    else {
      setMessage(
        recovery
          ? "Password updated. You can now sign in."
          : "Check your email for a secure reset link.",
      );
      if (recovery) void navigate({ to: "/auth" });
    }
  }
  return (
    <main className="grid min-h-screen place-items-center bg-page px-6 text-ink">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-12 inline-flex items-center gap-3 font-display text-lg font-bold"
        >
          <span className="fs-clip grid size-8 place-items-center bg-signal text-sm text-signal-foreground">
            F
          </span>
          FinSight
        </Link>
        <div className="rounded-xl border border-line bg-panel p-8">
          <div className="grid size-11 place-items-center rounded-lg bg-signal/10 text-signal">
            <LockKeyhole className="size-5" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-bold">
            {recovery ? "Choose a new password" : "Reset your password"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-mute">
            {recovery
              ? "Use a strong password to keep your financial workspace protected."
              : "We’ll send a secure recovery link to your email."}
          </p>
          <form className="mt-8 space-y-4" onSubmit={submit}>
            {!recovery && (
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-line bg-raise px-3 py-3 text-sm outline-none focus:border-signal"
                placeholder="you@example.com"
              />
            )}
            {recovery && (
              <input
                required
                minLength={8}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-line bg-raise px-3 py-3 text-sm outline-none focus:border-signal"
                placeholder="New password"
              />
            )}
            {error && (
              <div role="alert" className="text-sm text-danger-signal">
                {error}
              </div>
            )}
            {message && (
              <div role="status" className="text-sm text-signal">
                {message}
              </div>
            )}
            <button
              disabled={busy}
              className="fs-clip w-full bg-signal py-3 font-medium text-signal-foreground disabled:opacity-50"
            >
              {busy ? "Working..." : recovery ? "Update password" : "Send reset link"}
            </button>
          </form>
          <Link to="/auth" className="mt-6 block text-center text-sm text-mute hover:text-signal">
            Back to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
