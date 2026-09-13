import { ArrowRight, BarChart3, LockKeyhole, Sparkles, WalletCards } from "lucide-react";
import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FinSight — Turn transactions into financial intelligence" },
      {
        name: "description",
        content:
          "A focused fintech workspace for understanding spending, savings, and financial activity.",
      },
      { property: "og:title", content: "FinSight — Financial intelligence" },
      {
        property: "og:description",
        content: "Turn raw payment data into decisions you can trust.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const bars = [70, 54, 82, 62, 76, 48, 88, 60, 74, 92];

function LandingPage() {
  return (
    <main className="min-h-screen bg-page text-ink antialiased">
      <div className="border-b border-line bg-panel/70 px-6 py-2 overflow-hidden">
        <div className="fs-ticker flex w-max whitespace-nowrap text-[10px] font-mono uppercase tracking-[0.18em] text-mute">
          {[
            "UPI 12.4M txn/day",
            "Savings rate 34.8%",
            "Avg txn ₹1,872",
            "Food +23% MoM",
            "98.2% success",
            "UPI 12.4M txn/day",
            "Savings rate 34.8%",
            "Avg txn ₹1,872",
            "Food +23% MoM",
            "98.2% success",
          ].map((item, index) => (
            <span className="px-6" key={`${item}-${index}`}>
              <span className={index % 4 === 3 ? "text-warning-signal" : "text-signal"}>
                {index % 4 === 3 ? "▼" : "▲"}
              </span>{" "}
              {item}
            </span>
          ))}
        </div>
      </div>
      <header className="sticky top-0 z-20 border-b border-line bg-page/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="fs-clip grid size-8 place-items-center bg-signal font-display text-sm font-bold text-signal-foreground">
              F
            </div>
            <span className="font-display text-lg font-bold tracking-tight">FinSight</span>
            <span className="hidden rounded border border-line px-2 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-mute sm:inline">
              v1
            </span>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-mute lg:flex">
            <a href="#why" className="transition hover:text-ink">
              Why FinSight
            </a>
            <a href="#analytics" className="transition hover:text-ink">
              Analytics
            </a>
            <a href="#security" className="transition hover:text-ink">
              Security
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/auth"
              className="hidden text-sm text-mute transition hover:text-ink sm:block"
            >
              Sign in
            </Link>
            <Link
              to="/auth"
              className="fs-clip bg-signal px-4 py-2 text-sm font-medium text-signal-foreground transition hover:brightness-110"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>
      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 fs-grid opacity-30" />
        <div className="relative mx-auto grid max-w-[1440px] items-center gap-12 px-6 py-16 lg:grid-cols-12 lg:px-10 lg:py-24">
          <div className="lg:col-span-5">
            <div className="fs-rise inline-flex items-center gap-2 rounded-full border border-signal/30 bg-signal/5 px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.2em] text-signal">
              <span className="size-1.5 rounded-full bg-signal" /> Financial intelligence platform
            </div>
            <h1 className="fs-rise-1 mt-6 font-display text-5xl font-bold leading-[0.95] tracking-tight lg:text-7xl">
              Turn transactions
              <br />
              into financial
              <br />
              <span className="text-signal">intelligence.</span>
            </h1>
            <p className="fs-rise-2 mt-6 max-w-md text-lg leading-relaxed text-mute">
              FinSight transforms raw payment data into actionable insights — spending patterns,
              savings behavior, and category-level intelligence. No noise. Just signal.
            </p>
            <div className="fs-rise-3 mt-8 flex flex-wrap gap-4">
              <Link
                to="/auth"
                className="fs-clip bg-signal px-6 py-3.5 font-medium text-signal-foreground transition hover:brightness-110"
              >
                Get started <ArrowRight className="ml-1 inline size-4" />
              </Link>
              <Link
                to="/dashboard"
                className="fs-clip border border-line px-6 py-3.5 font-medium transition hover:border-signal/50"
              >
                View demo
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-5 text-[10px] font-mono uppercase tracking-[0.15em] text-mute">
              <span>JWT secured</span>
              <span className="text-line">/</span>
              <span>Role based</span>
              <span className="text-line">/</span>
              <span>Simulated data</span>
            </div>
          </div>
          <div className="lg:col-span-7">
            <TerminalPreview />
          </div>
        </div>
      </section>
      <section id="why" className="border-b border-line">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-6 py-16 lg:grid-cols-12 lg:px-10">
          <div className="lg:col-span-4">
            <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-signal">
              01 — Why FinSight
            </div>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight">
              From raw ledgers to decisions you can trust.
            </h2>
            <p className="mt-4 leading-relaxed text-mute">
              Most banking apps stop at a transaction list. FinSight builds the intelligence layer
              on top — answering real financial questions, not just recording them.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
            <Feature
              icon={<WalletCards />}
              index="02"
              title="Transaction management"
              copy="Unified ledger with search, filters, sorting, and a full detail timeline across UPI, cards, and bank transfers."
            />
            <Feature
              icon={<BarChart3 />}
              index="03"
              title="Financial analytics"
              copy="Income vs expense, category distribution, and savings trends — every chart answers a financial question."
            />
            <Feature
              icon={<Sparkles />}
              index="04"
              title="Smart insights"
              copy="Calculated, severity-rated, and actionable signals instead of random charts or generic advice."
            />
            <Feature
              icon={<LockKeyhole />}
              index="05"
              title="Secure by design"
              copy="Protected accounts, role-aware access, validation, and simulated data with no real banking credentials."
            />
          </div>
        </div>
      </section>
      <section id="analytics" className="border-b border-line">
        <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-10">
          <div className="mb-8 max-w-xl">
            <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-signal">
              06 — Analytics core
            </div>
            <h2 className="mt-4 font-display text-4xl font-bold">See the shape of your money.</h2>
            <p className="mt-4 text-mute">
              Spending concentration, savings momentum, and category movement come together in a
              workspace that is easy to scan and hard to misread.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <InsightBand
              title="Savings rate"
              value="34.8%"
              note="Above your 3-month average"
              tone="text-signal"
            />
            <InsightBand
              title="Food spending"
              value="+23%"
              note="Compared with last month"
              tone="text-warning-signal"
            />
            <InsightBand
              title="Avg. transaction"
              value="₹1,872"
              note="Across 228 simulated transactions"
              tone="text-info-signal"
            />
          </div>
        </div>
      </section>
      <section id="security" className="border-b border-line">
        <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-6 py-16 lg:grid-cols-12 lg:px-10">
          <div className="lg:col-span-7">
            <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-signal">
              07 — Security
            </div>
            <h2 className="mt-4 font-display text-4xl font-bold">
              Built like a bank.
              <br />
              Felt like a SaaS.
            </h2>
            <p className="mt-4 max-w-lg leading-relaxed text-mute">
              Protected authentication, password hygiene, role-aware permissions, input validation,
              and a relational data model ready for real services. No real bank credentials are
              collected.
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-xl border border-signal/30 bg-signal/5 p-8">
              <div className="font-display text-2xl font-bold">
                Ready to see your money clearly?
              </div>
              <p className="mt-3 text-sm text-mute">
                Open the demo workspace with simulated INR data and real product interactions.
              </p>
              <Link
                to="/dashboard"
                className="fs-clip mt-6 block bg-signal py-3.5 text-center font-medium text-signal-foreground transition hover:brightness-110"
              >
                Launch FinSight <ArrowRight className="ml-1 inline size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <footer className="mx-auto flex max-w-[1440px] flex-col justify-between gap-3 px-6 py-8 text-center text-[10px] font-mono uppercase tracking-[0.15em] text-mute sm:flex-row sm:text-left lg:px-10">
        <span>© 2026 FinSight — simulated financial data</span>
        <span>React · TanStack Start · Lovable Cloud</span>
      </footer>
    </main>
  );
}

function Feature({
  icon,
  index,
  title,
  copy,
}: {
  icon: React.ReactNode;
  index: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-panel p-6 transition hover:border-signal/40">
      <div className="flex items-center justify-between text-mute">
        <span className="text-[11px] font-mono tracking-[0.16em]">{index}</span>
        <span className="text-signal [&>svg]:size-5">{icon}</span>
      </div>
      <div className="mt-4 font-display text-xl font-semibold">{title}</div>
      <p className="mt-2 text-sm leading-relaxed text-mute">{copy}</p>
    </div>
  );
}
function InsightBand({
  title,
  value,
  note,
  tone,
}: {
  title: string;
  value: string;
  note: string;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-panel p-6">
      <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-mute">{title}</div>
      <div className={`mt-4 font-mono text-3xl font-bold ${tone}`}>{value}</div>
      <div className="mt-2 text-sm text-mute">{note}</div>
    </div>
  );
}
function TerminalPreview() {
  return (
    <div className="fs-rise-2 overflow-hidden rounded-xl border border-line bg-panel shadow-2xl shadow-black/30">
      <div className="flex items-center justify-between border-b border-line bg-raise/60 px-4 py-3">
        <div className="flex gap-2">
          <span className="size-2.5 rounded-full bg-danger-signal/80" />
          <span className="size-2.5 rounded-full bg-warning-signal/80" />
          <span className="size-2.5 rounded-full bg-signal/80" />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-mute">
          FinSight Terminal — Overview
        </span>
        <span className="text-[10px] font-mono text-signal">● LIVE</span>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            ["Total balance", "₹85,420", "▲ 4.2%", "text-signal"],
            ["Savings rate", "34.8%", "▲ 11%", "text-signal"],
            ["Monthly income", "₹65.0k", "₹65,000", "text-info-signal"],
            ["Expenses", "₹42,350", "▼ 8.1%", "text-warning-signal"],
          ].map(([label, value, delta, tone]) => (
            <div className="rounded-lg border border-line bg-raise p-4" key={label}>
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-mute">
                <span>{label}</span>
                <span className={`font-mono ${tone}`}>{delta}</span>
              </div>
              <div className="mt-2 font-mono text-2xl font-bold">{value}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-lg border border-line bg-raise p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.16em] text-mute">
              Income vs expenses — 30D
            </span>
            <span className="text-[10px] font-mono text-signal">
              income <span className="text-warning-signal">expense</span>
            </span>
          </div>
          <div className="fs-tick flex h-28 items-end gap-2">
            {bars.map((height, index) => (
              <div key={index} className="flex flex-1 items-end gap-1">
                <div className="flex-1 rounded-t bg-signal/70" style={{ height: `${height}%` }} />
                <div
                  className="w-1/3 rounded-t bg-warning-signal/80"
                  style={{ height: `${Math.max(32, height - 24)}%` }}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 rounded-lg border border-line bg-raise p-4">
          <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-mute">
            <span>Recent transactions</span>
            <span>View all →</span>
          </div>
          <div className="divide-y divide-line">
            <div className="flex items-center justify-between py-2.5">
              <div>
                <div className="text-sm font-medium">Swiggy · Zomato</div>
                <div className="text-[11px] font-mono text-mute">UPI · Food &amp; Dining</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm font-semibold text-danger-signal">−₹428</div>
                <div className="text-[10px] font-mono text-mute">Completed</div>
              </div>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <div>
                <div className="text-sm font-medium">Salary — Acme Corp</div>
                <div className="text-[11px] font-mono text-mute">Bank transfer · Income</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm font-semibold text-signal">+₹65,000</div>
                <div className="text-[10px] font-mono text-mute">Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
