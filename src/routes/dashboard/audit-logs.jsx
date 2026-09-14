import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ShieldCheck,
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  RotateCcw,
  ArrowRight,
  Lock,
  Layers,
  Activity,
  CheckCircle2,
  Clock,
  Code2,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useAuditLogs } from "@/hooks/queries/use-audit-logs";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/audit-logs")({
  head: () => ({
    meta: [
      { title: "Audit Trail & Compliance — FinSight" },
      { name: "description", content: "Immutable append-only audit log of all financial operations." },
    ],
  }),
  component: AuditLogsPage,
});

const ACTIONS = [
  "ALL",
  "CREATE",
  "UPDATE",
  "DELETE",
  "IMPORT",
  "MEMBER_ADDED",
  "MEMBER_REMOVED",
  "PERMISSION_CHANGED",
];

const RESOURCE_TYPES = [
  "ALL",
  "transaction",
  "account",
  "budget",
  "budget_category",
  "savings_goal",
  "recurring_transaction",
  "account_member",
];

function getActionBadgeStyle(action) {
  switch (action?.toUpperCase()) {
    case "CREATE":
      return "border-signal/30 bg-signal/10 text-signal";
    case "UPDATE":
      return "border-info-signal/30 bg-info-signal/10 text-info-signal";
    case "DELETE":
      return "border-danger-signal/30 bg-danger-signal/10 text-danger-signal";
    case "IMPORT":
      return "border-purple-500/30 bg-purple-500/10 text-purple-400";
    case "MEMBER_ADDED":
    case "MEMBER_REMOVED":
    case "PERMISSION_CHANGED":
      return "border-warning-signal/30 bg-warning-signal/10 text-warning-signal";
    default:
      return "border-line bg-panel text-mute";
  }
}

function formatDate(isoStr) {
  if (!isoStr) return "—";
  const d = new Date(isoStr);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function formatSummary(log) {
  const { action, resource_type, old_data, new_data, metadata } = log;

  if (action === "IMPORT" && metadata) {
    const total = metadata.number_of_rows ?? metadata.successful_rows ?? 0;
    const dups = metadata.duplicate_rows ?? 0;
    const file = metadata.filename ? ` (${metadata.filename})` : "";
    return `Imported ${total} rows${file} · ${dups} duplicates`;
  }

  if (action === "UPDATE") {
    const diff = metadata?.diff || old_data?.diff;
    if (diff) {
      const keys = Object.keys(diff);
      const changes = keys
        .map((k) => `${k}: ${diff[k]?.before ?? "null"} → ${diff[k]?.after ?? "null"}`)
        .join(", ");
      return changes ? changes : "Updated resource properties";
    }
    return "Updated resource properties";
  }

  if (action === "CREATE") {
    if (new_data?.merchant) return `Created ${resource_type}: ${new_data.merchant} (₹${Number(new_data.amount || 0).toLocaleString("en-IN")})`;
    if (new_data?.name) return `Created ${resource_type}: ${new_data.name}`;
    if (metadata?.name) return `Created ${resource_type}: ${metadata.name}`;
    return `Created new ${resource_type}`;
  }

  if (action === "DELETE") {
    if (old_data?.merchant) return `Deleted ${resource_type}: ${old_data.merchant}`;
    if (old_data?.name) return `Deleted ${resource_type}: ${old_data.name}`;
    if (metadata?.merchant) return `Deleted ${resource_type}: ${metadata.merchant}`;
    return `Deleted ${resource_type} #${log.resource_id || ""}`;
  }

  if (action === "MEMBER_ADDED") return `Invited member: ${metadata?.invited_email || "user"}`;
  if (action === "MEMBER_REMOVED") return `Removed member: ${metadata?.member_email || "user"}`;
  if (action === "PERMISSION_CHANGED") return `Role changed: ${metadata?.old_role || "member"} → ${metadata?.new_role || "admin"}`;

  return `${action} on ${resource_type}`;
}

export function AuditLogsPage() {
  const { userId } = useAuth();
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [action, setAction] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);

  const { data, isLoading, error, refetch } = useAuditLogs(userId, {
    page,
    limit,
    action: action === "ALL" ? "" : action,
    resourceType: resourceType === "ALL" ? "" : resourceType,
    startDate,
    endDate,
    search,
  });

  const logs = data?.logs || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 1;

  function handleResetFilters() {
    setAction("");
    setResourceType("");
    setSearch("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-signal/30 bg-signal/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-signal">
            <Lock className="size-3" /> Append-Only RLS Security Active
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight lg:text-4xl">
            Audit Trail & Compliance Logs
          </h1>
          <p className="mt-2 text-sm text-mute">
            Immutable timeline recording who modified what financial resource and when.
          </p>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs text-signal">
          <ShieldCheck className="size-4" /> System Verified
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-xl border border-line bg-panel p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-mute">
            <Filter className="size-3.5 text-signal" /> Audit Query Filters
          </div>
          {(action || resourceType || search || startDate || endDate) && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-xs text-signal hover:underline font-mono"
            >
              <RotateCcw className="size-3" /> Reset Filters
            </button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-mute" />
            <input
              type="text"
              placeholder="Search Resource ID / Summary..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-line bg-raise py-2 pl-9 pr-3 text-xs text-ink placeholder-mute focus:border-signal focus:outline-none"
            />
          </div>

          {/* Action Filter */}
          <div>
            <select
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-line bg-raise px-3 py-2 text-xs text-ink focus:border-signal focus:outline-none"
            >
              <option value="">All Actions</option>
              {ACTIONS.filter((a) => a !== "ALL").map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Resource Type Filter */}
          <div>
            <select
              value={resourceType}
              onChange={(e) => {
                setResourceType(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-line bg-raise px-3 py-2 text-xs text-ink focus:border-signal focus:outline-none"
            >
              <option value="">All Resource Types</option>
              {RESOURCE_TYPES.filter((r) => r !== "ALL").map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-line bg-raise px-3 py-2 text-xs text-ink focus:border-signal focus:outline-none"
            />
          </div>

          {/* End Date */}
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-line bg-raise px-3 py-2 text-xs text-ink focus:border-signal focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Audit Trail Table */}
      <div className="rounded-xl border border-line bg-panel shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-line bg-raise/50 font-mono text-[10px] uppercase tracking-wider text-mute">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Action</th>
                <th className="px-5 py-3.5">Resource</th>
                <th className="px-5 py-3.5">Resource ID</th>
                <th className="px-5 py-3.5">Audit Summary</th>
                <th className="px-5 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-mute font-mono">
                    Loading audit records...
                  </td>
                </tr>
              )}

              {!isLoading && logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-mute">
                    <ShieldCheck className="mx-auto size-8 mb-2 text-signal opacity-50" />
                    No audit records match your query filters.
                  </td>
                </tr>
              )}

              {!isLoading &&
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-raise/30 transition">
                    <td className="whitespace-nowrap px-5 py-3.5 font-mono text-[11px] text-mute">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase ${getActionBadgeStyle(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 font-mono font-medium text-ink">
                      {log.resource_type}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 font-mono text-[11px] text-mute truncate max-w-[120px]">
                      {log.resource_id || "—"}
                    </td>
                    <td className="px-5 py-3.5 font-sans text-xs text-ink max-w-[360px] truncate">
                      {formatSummary(log)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-line bg-raise px-2.5 py-1 text-[11px] font-medium text-mute hover:border-signal/40 hover:text-ink transition"
                      >
                        <Eye className="size-3 text-signal" /> Inspect
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Footer */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-line bg-panel px-5 py-3.5 sm:flex-row font-mono text-xs">
          <div className="text-mute">
            Showing <span className="text-ink font-semibold">{totalCount > 0 ? (page - 1) * limit + 1 : 0}</span> to{" "}
            <span className="text-ink font-semibold">{Math.min(page * limit, totalCount)}</span> of{" "}
            <span className="text-ink font-semibold">{totalCount}</span> audit entries
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 px-2.5 text-xs"
            >
              <ChevronLeft className="size-3.5 mr-1" /> Prev
            </Button>
            <span className="text-mute px-2">
              Page <span className="text-ink">{page}</span> of <span className="text-ink">{totalPages}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 px-2.5 text-xs"
            >
              Next <ChevronRight className="size-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Details Inspector Modal */}
      {selectedLog && (
        <AuditLogModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  );
}

function AuditLogModal({ log, onClose }) {
  const [activeTab, setActiveTab] = useState("diff");
  const diff = log.metadata?.diff || log.old_data?.diff;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-xl border border-line bg-panel shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4 bg-raise/40">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-lg border border-line bg-panel text-signal">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <div className="font-display font-bold text-base text-ink">
                Audit Entry #{log.id.slice(0, 8)}
              </div>
              <div className="font-mono text-xs text-mute">
                {formatDate(log.created_at)}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-mute hover:bg-raise hover:text-ink"
          >
            ✕
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-line bg-panel px-6 font-mono text-xs">
          <button
            onClick={() => setActiveTab("diff")}
            className={`border-b-2 py-3 px-4 transition font-medium ${
              activeTab === "diff"
                ? "border-signal text-signal font-bold"
                : "border-transparent text-mute hover:text-ink"
            }`}
          >
            Formatted Changes & Diff
          </button>
          <button
            onClick={() => setActiveTab("json")}
            className={`border-b-2 py-3 px-4 transition font-medium ${
              activeTab === "json"
                ? "border-signal text-signal font-bold"
                : "border-transparent text-mute hover:text-ink"
            }`}
          >
            <Code2 className="inline size-3.5 mr-1" /> Developer Metadata (JSON)
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {/* Metadata Overview Card */}
          <div className="grid gap-3 sm:grid-cols-3 rounded-lg border border-line bg-raise p-4 text-xs font-mono">
            <div>
              <div className="text-[10px] text-mute uppercase">Action</div>
              <div className="mt-1 font-bold text-signal">{log.action}</div>
            </div>
            <div>
              <div className="text-[10px] text-mute uppercase">Resource Type</div>
              <div className="mt-1 text-ink">{log.resource_type}</div>
            </div>
            <div>
              <div className="text-[10px] text-mute uppercase">Resource ID</div>
              <div className="mt-1 text-ink truncate">{log.resource_id || "—"}</div>
            </div>
          </div>

          {activeTab === "diff" && (
            <div className="space-y-4">
              {log.action === "UPDATE" && diff ? (
                <div className="space-y-2">
                  <div className="text-xs font-mono uppercase tracking-wider text-mute">
                    Property Changes (Before → After)
                  </div>
                  <div className="divide-y divide-line rounded-lg border border-line bg-raise">
                    {Object.entries(diff).map(([key, change]) => (
                      <div
                        key={key}
                        className="grid grid-cols-3 gap-2 p-3 text-xs font-mono"
                      >
                        <span className="font-semibold text-ink uppercase text-[11px]">
                          {key.replace("_", " ")}
                        </span>
                        <span className="text-danger-signal/90 truncate">
                          {String(change.before ?? "null")}
                        </span>
                        <span className="text-signal flex items-center gap-1 truncate font-semibold">
                          <ArrowRight className="size-3 shrink-0" />{" "}
                          {String(change.after ?? "null")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs font-mono uppercase tracking-wider text-mute">
                    Audit Event Summary
                  </div>
                  <div className="rounded-lg border border-line bg-raise p-4 text-xs space-y-2">
                    <p className="font-medium text-ink">{formatSummary(log)}</p>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="mt-3 border-t border-line/60 pt-3 space-y-1 font-mono text-[11px] text-mute">
                        {Object.entries(log.metadata)
                          .filter(([k]) => k !== "diff" && k !== "user_agent")
                          .map(([k, v]) => (
                            <div key={k} className="flex justify-between">
                              <span className="capitalize">{k.replace("_", " ")}:</span>
                              <span className="text-ink">{JSON.stringify(v)}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "json" && (
            <div>
              <div className="mb-2 text-xs font-mono uppercase tracking-wider text-mute">
                Sanitized Database Record
              </div>
              <pre className="rounded-lg border border-line bg-raise p-4 font-mono text-[11px] text-signal overflow-x-auto">
                {JSON.stringify(log, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-line bg-raise/30 px-6 py-3 text-right">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Inspector
          </Button>
        </div>
      </div>
    </div>
  );
}
