import { useEffect, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
  Sparkles,
  Zap,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { authService } from "@/lib/auth-service";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — FinSight" },
      {
        name: "description",
        content: "Sign in to your FinSight financial intelligence workspace.",
      },
      { property: "og:title", content: "Sign in — FinSight" },
      {
        property: "og:description",
        content: "Access your FinSight financial intelligence workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [needsConfirm, setNeedsConfirm] = useState(false);

  useEffect(() => {
    authService.getSession().then(({ user }) => {
      if (user) {
        void navigate({ to: "/dashboard" });
      }
    });
  }, [navigate]);

  const handleDemoLogin = () => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      authService.signInAsDemo();
      void navigate({ to: "/dashboard" });
    } catch (err) {
      setError("Failed to initialize demo workspace.");
    } finally {
      setBusy(false);
    }
  };

  const handlePrefillDemo = () => {
    setEmail("demo@finsight.app");
    setPassword("Demo@12345");
    setMode("login");
    setError("");
    setMessage("Demo credentials pre-filled. Click 'Sign in' below.");
  };

  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsNetworkError(false);
    setNeedsConfirm(false);

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }

    setBusy(true);

    try {
      if (mode === "login") {
        const result = await authService.signInWithPassword({ email, password });
        if (!result.success) {
          setError(result.error);
          setIsNetworkError(result.isNetworkError || false);
          if (result.needsConfirm) {
            setNeedsConfirm(true);
          }
          return;
        }
        void navigate({ to: "/dashboard" });
      } else {
        const result = await authService.signUp({ email, password, fullName });
        if (!result.success) {
          setError(result.error);
          setIsNetworkError(result.isNetworkError || false);
          return;
        }
        if (result.needsConfirm) {
          setNeedsConfirm(true);
          setMessage(result.message || "Check your email to confirm your account.");
          return;
        }
        void navigate({ to: "/dashboard" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-page text-ink">
      <div className="mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-2">
        {/* Left Hero Panel */}
        <div className="hidden border-r border-line p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <Link to="/" className="inline-flex items-center gap-3 font-display text-lg font-bold">
              <span className="fs-clip grid size-8 place-items-center bg-signal text-sm text-signal-foreground">
                F
              </span>
              FinSight
            </Link>
            <div className="mt-28 max-w-lg">
              <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-signal">
                Financial intelligence platform
              </div>
              <h1 className="mt-5 font-display text-6xl font-bold leading-[0.95]">
                Your money,
                <br />
                <span className="text-signal">decoded.</span>
              </h1>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-mute">
                Turn payment activity into a clearer view of your spending, savings, and financial momentum.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.16em] text-mute">
            <LockKeyhole className="size-4 text-signal" /> Protected workspace{" "}
            <span className="text-line">/</span> AES-256 Authenticated RLS
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 text-sm text-mute transition hover:text-ink lg:hidden"
            >
              <ArrowLeft className="size-4" /> Back to FinSight
            </Link>

            {/* Quick Demo Access Hero Banner */}
            <div className="mb-6 overflow-hidden rounded-xl border border-signal/30 bg-signal/10 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-display text-sm font-bold text-ink">
                    <Zap className="size-4 text-signal fill-signal" />
                    Instant Demo Workspace
                  </div>
                  <p className="text-xs text-mute leading-relaxed">
                    Test all analytics, AI Assistant, transactions, and budgets with pre-seeded data.
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={busy}
                  className="flex items-center gap-1.5 rounded-lg bg-signal px-3.5 py-2 text-xs font-semibold text-signal-foreground shadow-sm transition hover:brightness-110 disabled:opacity-50"
                >
                  <Sparkles className="size-3.5" />
                  Launch Demo Workspace
                </button>
                <button
                  type="button"
                  onClick={handlePrefillDemo}
                  className="rounded-lg border border-line bg-panel px-3 py-2 text-xs font-medium text-mute transition hover:border-signal/50 hover:text-ink"
                >
                  Prefill demo details
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="font-display text-3xl font-bold">
                {mode === "login" ? "Sign in to your workspace" : "Create your workspace"}
              </h2>
              <p className="mt-2 text-xs text-mute">
                {mode === "login"
                  ? "Access your live FinSight financial intelligence dashboard."
                  : "Start analyzing and forecasting your personal cash flows."}
              </p>
            </div>

            {/* Mode Switch Tabs */}
            <div className="mb-6 grid grid-cols-2 border-b border-line">
              <button
                className={`border-b-2 py-2.5 text-sm font-medium transition ${
                  mode === "login" ? "border-signal text-ink" : "border-transparent text-mute"
                }`}
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setMessage("");
                  setIsNetworkError(false);
                }}
              >
                Sign in
              </button>
              <button
                className={`border-b-2 py-2.5 text-sm font-medium transition ${
                  mode === "signup" ? "border-signal text-ink" : "border-transparent text-mute"
                }`}
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError("");
                  setMessage("");
                  setIsNetworkError(false);
                }}
              >
                Create account
              </button>
            </div>

            {/* Network / Offline Warning & Fallback */}
            {isNetworkError && (
              <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-xs text-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertTriangle className="size-4 text-amber-400" />
                  Remote Database Notice
                </div>
                <p className="leading-relaxed text-amber-300/90">
                  The remote authentication server is currently unreachable. You can continue testing all features instantly in Demo Mode:
                </p>
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="w-full rounded-lg bg-amber-500 px-3 py-2 font-semibold text-black hover:bg-amber-400 transition"
                >
                  Launch Demo Workspace
                </button>
              </div>
            )}

            {/* Error & Status Banners */}
            {error && !isNetworkError && (
              <div
                role="alert"
                className="mb-4 rounded-lg border border-danger-signal/30 bg-danger-signal/10 p-3 text-xs text-danger-signal flex items-start gap-2"
              >
                <ShieldAlert className="size-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div>{error}</div>
                  {error.includes("Invalid login credentials") && (
                    <div className="pt-1 text-[11px] text-mute">
                      Don't have an account yet? Switch to{" "}
                      <button
                        type="button"
                        onClick={() => setMode("signup")}
                        className="text-signal underline hover:brightness-110"
                      >
                        Create account
                      </button>{" "}
                      or use Demo Login.
                    </div>
                  )}
                </div>
              </div>
            )}

            {message && (
              <div
                role="status"
                className="mb-4 rounded-lg border border-signal/30 bg-signal/10 p-3 text-xs text-signal flex items-start gap-2"
              >
                <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                <span>{message}</span>
              </div>
            )}

            {needsConfirm && (
              <div className="mb-4 rounded-lg border border-line bg-raise p-3 text-xs space-y-2">
                <p className="text-mute">
                  Didn't receive the verification email or want to skip? You can explore the full application right now:
                </p>
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="w-full rounded-lg bg-signal/15 border border-signal/30 py-2 text-xs font-medium text-signal hover:bg-signal/25 transition"
                >
                  Continue in Demo Workspace
                </button>
              </div>
            )}

            {/* Primary Credentials Form */}
            <form onSubmit={submit} className="space-y-4">
              {mode === "signup" && (
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-mute">Full name</span>
                  <div className="relative">
                    <UserRound className="absolute left-3 top-3 size-4 text-mute" />
                    <input
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-lg border border-line bg-panel py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-signal"
                      placeholder="Aarav Mehta"
                    />
                  </div>
                </label>
              )}

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-mute">Email address</span>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 size-4 text-mute" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-line bg-panel py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-signal"
                    placeholder="you@example.com"
                  />
                </div>
              </label>

              <label className="block">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-medium text-mute">Password</span>
                  {mode === "login" && (
                    <Link
                      to="/reset-password"
                      className="text-[11px] text-mute transition hover:text-signal"
                    >
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-3 size-4 text-mute" />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-line bg-panel py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-signal"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-mute hover:text-ink"
                  >
                    <span className="sr-only">Toggle password visibility</span>
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </label>

              {mode === "signup" && (
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-mute">Confirm password</span>
                  <input
                    required
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-line bg-panel px-3 py-2.5 text-sm outline-none transition focus:border-signal"
                    placeholder="••••••••"
                  />
                </label>
              )}

              <button
                disabled={busy}
                type="submit"
                className="fs-clip mt-2 w-full bg-signal py-3 font-medium text-signal-foreground transition hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {busy ? (
                  "Authenticating..."
                ) : mode === "login" ? (
                  "Sign in"
                ) : (
                  "Create account"
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-[11px] text-mute space-y-2">
              <p>
                Testing or exploring?{" "}
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="font-medium text-signal hover:underline"
                >
                  Click here to launch the Demo Workspace
                </button>
              </p>
              <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-mute/70">
                End-to-End Encrypted Financial Intelligence
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

