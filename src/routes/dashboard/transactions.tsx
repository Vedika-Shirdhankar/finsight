import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useAccounts } from "@/hooks/queries/use-accounts";
import { useCategories } from "@/hooks/queries/use-categories";
import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransactions,
  useUpdateTransaction,
  type Transaction,
  type TransactionFilters,
} from "@/hooks/queries/use-transactions";
import {
  bulkInsertTransactions,
  mapCsvRows,
  parseCsvFile,
  MAPPABLE_FIELDS,
  type ColumnMapping,
  type MappedRow,
  type ParsedCsv,
} from "@/lib/csv-import";
import type { Database } from "@/integrations/supabase/types";
import { SplitTransactionDialog } from "@/components/dashboard/split-transaction-dialog";
import type { TransactionSplitInput } from "@/hooks/queries/use-transactions";

export const Route = createFileRoute("/dashboard/transactions")({
  component: TransactionsPage,
});

type TxType = Database["public"]["Enums"]["transaction_type"];
const PAGE_SIZE = 15;

const EMPTY_FORM = {
  transaction_date: new Date().toISOString().slice(0, 10),
  amount: "",
  type: "expense" as TxType,
  merchant: "",
  description: "",
  category_id: "",
  account_id: "",
  payment_method: "card",
};

function TransactionsPage() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  // ---- Filters ----
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TxType | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  const filters: TransactionFilters = useMemo(() => {
    const f: TransactionFilters = {};
    if (search) f.search = search;
    if (typeFilter !== "all") f.type = typeFilter;
    if (categoryFilter !== "all") f.categoryId = categoryFilter;
    if (accountFilter !== "all") f.accountId = accountFilter;
    if (fromDate) f.from = fromDate;
    if (toDate) f.to = toDate;
    return f;
  }, [search, typeFilter, categoryFilter, accountFilter, fromDate, toDate]);

  const { data: transactions, isLoading } = useTransactions(userId, filters);
  const { data: accounts } = useAccounts(userId);
  const { data: categories } = useCategories(userId);

  const createTxn = useCreateTransaction(userId);
  const updateTxn = useUpdateTransaction(userId);
  const deleteTxn = useDeleteTransaction(userId);

  const totalPages = Math.max(1, Math.ceil((transactions?.length ?? 0) / PAGE_SIZE));
  const pageItems = (transactions ?? []).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function resetFilters() {
    setSearch("");
    setTypeFilter("all");
    setCategoryFilter("all");
    setAccountFilter("all");
    setFromDate("");
    setToDate("");
    setPage(1);
  }

  // ---- Add / Edit modal ----
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [splitOpen, setSplitOpen] = useState(false);
  const [splits, setSplits] = useState<TransactionSplitInput[]>([]);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setSplits([]);
    setFormOpen(true);
  }

  function openEdit(t: Transaction) {
    setEditing(t);
    setForm({
      transaction_date: t.transaction_date.slice(0, 10),
      amount: String(t.amount),
      type: t.type,
      merchant: t.merchant ?? "",
      description: t.description ?? "",
      category_id: t.category_id ?? "",
      account_id: t.account_id ?? "",
      payment_method: t.payment_method,
    });
    setFormOpen(true);
  }

  async function submitForm() {
    const amount = Number(form.amount);
    if (!form.transaction_date || !amount || amount <= 0) {
      toast.error("Enter a valid date and a positive amount.");
      return;
    }
    const payload = {
      transaction_date: new Date(form.transaction_date).toISOString(),
      amount,
      type: form.type,
      merchant: form.merchant || null,
      description: form.description || null,
      category_id: form.category_id || null,
      account_id: form.account_id || null,
      payment_method: form.payment_method || "unknown",
      status: "completed" as const,
    };
    try {
      if (editing) {
        await updateTxn.mutateAsync({ id: editing.id, ...payload });
        toast.success("Transaction updated.");
      } else {
        await createTxn.mutateAsync({ ...payload, splits });
        toast.success("Transaction added.");
      }
      setFormOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  // ---- Delete ----
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteTxn.mutateAsync(deleteTarget.id);
      toast.success("Transaction deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't delete transaction.");
    } finally {
      setDeleteTarget(null);
    }
  }

  // ---- CSV import ----
  const [csvOpen, setCsvOpen] = useState(false);
  const [csvStep, setCsvStep] = useState<"select" | "map" | "preview">("select");
  const [parsedCsv, setParsedCsv] = useState<ParsedCsv | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [mappedRows, setMappedRows] = useState<MappedRow[]>([]);
  const [importing, setImporting] = useState(false);

  function resetCsv() {
    setCsvStep("select");
    setParsedCsv(null);
    setMapping({});
    setMappedRows([]);
  }

  async function handleCsvFile(file: File) {
    try {
      const parsed = await parseCsvFile(file);
      setParsedCsv(parsed);
      setCsvStep("map");
    } catch {
      toast.error("Couldn't read that CSV file.");
    }
  }

  function goToPreview() {
    if (!parsedCsv) return;
    const categoryNameToId = Object.fromEntries(
      (categories ?? []).map((c) => [c.name.trim().toLowerCase(), c.id]),
    );
    const mapped = mapCsvRows(parsedCsv, mapping, categoryNameToId);
    setMappedRows(mapped);
    setCsvStep("preview");
  }

  async function confirmImport() {
    if (!userId) return;
    setImporting(true);
    try {
      const count = await bulkInsertTransactions(userId, mappedRows);
      toast.success(`Imported ${count} transaction${count === 1 ? "" : "s"}.`);
      queryClient.invalidateQueries({ queryKey: ["transactions", userId] });
      setCsvOpen(false);
      resetCsv();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setImporting(false);
    }
  }

  const validCount = mappedRows.filter((r) => r.transaction !== null).length;
  const errorCount = mappedRows.length - validCount;
  const dateMapped = !!mapping.date;
  const amountMapped = !!mapping.amount;

  function exportToCsv() {
    if (!transactions || transactions.length === 0) {
      toast.error("No transactions to export.");
      return;
    }
    const headers = [
      "Date",
      "Type",
      "Merchant",
      "Amount",
      "Status",
      "Payment Method",
      "Description",
    ];
    const rows = transactions.map((t) => [
      new Date(t.transaction_date).toISOString().slice(0, 10),
      t.type,
      `"${(t.merchant || "").replace(/"/g, '""')}"`,
      t.amount,
      t.status,
      t.payment_method,
      `"${(t.description || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `finsight_transactions_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Transactions exported to CSV!");
  }

  return (
    <div>
      <Toaster position="top-right" theme="dark" />

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="mt-1 text-sm text-mute">All your income and expenses in one place.</p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
          <Button variant="outline" onClick={exportToCsv} className="w-full sm:w-auto">
            <Download className="mr-2 size-4" /> Export CSV
          </Button>
          <Button variant="outline" onClick={() => setCsvOpen(true)} className="w-full sm:w-auto">
            <Upload className="mr-2 size-4" /> Import CSV
          </Button>
          <Button onClick={openAdd} className="w-full sm:w-auto">
            <Plus className="mr-2 size-4" /> Add transaction
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 gap-2 rounded-xl border border-line bg-panel p-3 sm:flex sm:flex-wrap sm:items-center">
        <div className="relative w-full sm:min-w-[180px] sm:flex-1">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-mute" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search merchant…"
            className="pl-8"
          />
        </div>

        <Select
          value={typeFilter}
          onValueChange={(v) => {
            setTypeFilter(v as TxType | "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[130px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={categoryFilter}
          onValueChange={(v) => {
            setCategoryFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={accountFilter}
          onValueChange={(v) => {
            setAccountFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Account" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All accounts</SelectItem>
            {accounts?.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={fromDate}
          onChange={(e) => {
            setFromDate(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-[150px]"
        />
        <span className="hidden text-xs text-mute sm:inline">to</span>
        <Input
          type="date"
          value={toDate}
          onChange={(e) => {
            setToDate(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-[150px]"
        />

        {(search ||
          typeFilter !== "all" ||
          categoryFilter !== "all" ||
          accountFilter !== "all" ||
          fromDate ||
          toDate) && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="text-mute">
            <X className="mr-1 size-3.5" /> Clear
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-panel">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[10px] font-mono uppercase tracking-[0.12em] text-mute">
              <th className="px-5 py-3">Merchant</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Method</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Amount</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-mute">
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading && pageItems.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-mute">
                  <div className="flex items-center justify-center gap-2">
                    <Filter className="size-3.5" /> No transactions match your filters.
                  </div>
                </td>
              </tr>
            )}
            {pageItems.map((t) => (
              <tr key={t.id} className="group">
                <td className="px-5 py-3">{t.merchant ?? t.description ?? "—"}</td>
                <td className="px-5 py-3 font-mono text-xs text-mute">
                  {new Date(t.transaction_date).toLocaleDateString("en-IN")}
                </td>
                <td className="px-5 py-3 text-xs text-mute">{t.payment_method}</td>
                <td className="px-5 py-3 text-xs text-mute capitalize">{t.status}</td>
                <td
                  className={`px-5 py-3 text-right font-mono font-semibold ${t.type === "income" ? "text-signal" : "text-ink"}`}
                >
                  {t.type === "income" ? "+" : "−"}₹{Number(t.amount).toLocaleString("en-IN")}
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1 transition sm:opacity-0 sm:group-hover:opacity-100">
                    <button
                      onClick={() => openEdit(t)}
                      className="rounded p-1.5 text-mute hover:bg-raise hover:text-ink"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(t)}
                      className="rounded p-1.5 text-mute hover:bg-raise hover:text-danger-signal"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-line px-5 py-3 text-xs text-mute">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit transaction" : "Add transaction"}</DialogTitle>
            <DialogDescription>Enter the details of this transaction.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.transaction_date}
                  onChange={(e) => setForm((f) => ({ ...f, transaction_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                />
              </div>
            </div>
            {!editing && form.account_id && Number(form.amount) > 0 && (
              <div className="flex items-center justify-between rounded-lg border border-line bg-raise p-3">
                <div>
                  <div className="text-sm font-medium">Split transaction</div>
                  <div className="text-xs text-mute">
                    {splits.length
                      ? `${splits.length} member shares ready`
                      : "Divide this expense across members"}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSplitOpen(true)}
                >
                  {splits.length ? "Edit split" : "Add split"}
                </Button>
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm((f) => ({ ...f, type: v as TxType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={form.category_id || "none"}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, category_id: v === "none" ? "" : v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {categories
                      ?.filter((c) => c.kind === form.type)
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="merchant">Merchant</Label>
                <Input
                  id="merchant"
                  value={form.merchant}
                  onChange={(e) => setForm((f) => ({ ...f, merchant: e.target.value }))}
                />
              </div>
              <div>
                <Label>Account</Label>
                <Select
                  value={form.account_id || "none"}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, account_id: v === "none" ? "" : v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {accounts?.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="method">Payment method</Label>
                <Input
                  id="method"
                  value={form.payment_method}
                  onChange={(e) => setForm((f) => ({ ...f, payment_method: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitForm} disabled={createTxn.isPending || updateTxn.isPending}>
              {editing ? "Save changes" : "Add transaction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {form.account_id && (
        <SplitTransactionDialog
          accountId={form.account_id}
          amount={Number(form.amount) || 0}
          open={splitOpen}
          onClose={() => setSplitOpen(false)}
          onSave={setSplits}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This can't be undone.{" "}
              {deleteTarget?.merchant ? `"${deleteTarget.merchant}"` : "This transaction"} will be
              permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CSV import */}
      <Dialog
        open={csvOpen}
        onOpenChange={(open) => {
          setCsvOpen(open);
          if (!open) resetCsv();
        }}
      >
        <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import transactions from CSV</DialogTitle>
            <DialogDescription>
              {csvStep === "select" && "Choose a CSV file exported from your bank or another app."}
              {csvStep === "map" && "Match each CSV column to a transaction field."}
              {csvStep === "preview" && "Review before importing."}
            </DialogDescription>
          </DialogHeader>

          {csvStep === "select" && (
            <div className="py-4">
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => e.target.files?.[0] && handleCsvFile(e.target.files[0])}
              />
            </div>
          )}

          {csvStep === "map" && parsedCsv && (
            <div className="grid max-h-[50vh] gap-3 overflow-y-auto py-2">
              {MAPPABLE_FIELDS.map(({ field, label, required }) => (
                <div key={field} className="grid gap-2 sm:grid-cols-2 sm:items-center sm:gap-3">
                  <Label>
                    {label}
                    {required && <span className="text-danger-signal"> *</span>}
                  </Label>
                  <Select
                    value={mapping[field] ?? "none"}
                    onValueChange={(v) =>
                      setMapping((m) => ({ ...m, [field]: v === "none" ? undefined : v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Not mapped" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not mapped</SelectItem>
                      {parsedCsv.headers.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}

          {csvStep === "preview" && (
            <div className="py-2">
              <div className="mb-3 flex gap-4 text-sm">
                <span className="text-signal">{validCount} ready to import</span>
                {errorCount > 0 && (
                  <span className="text-danger-signal">{errorCount} will be skipped</span>
                )}
              </div>
              <div className="max-h-[40vh] overflow-y-auto rounded-lg border border-line">
                <table className="w-full min-w-[480px] text-xs">
                  <thead>
                    <tr className="border-b border-line text-left text-mute">
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Merchant</th>
                      <th className="px-3 py-2 text-right">Amount</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {mappedRows.slice(0, 50).map((r) => (
                      <tr key={r.rowIndex}>
                        <td className="px-3 py-1.5 font-mono">
                          {r.transaction?.transaction_date?.slice(0, 10) ?? "—"}
                        </td>
                        <td className="px-3 py-1.5">{r.transaction?.merchant ?? "—"}</td>
                        <td className="px-3 py-1.5 text-right font-mono">
                          {r.transaction ? `₹${r.transaction.amount}` : "—"}
                        </td>
                        <td
                          className={`px-3 py-1.5 ${r.error ? "text-danger-signal" : "text-signal"}`}
                        >
                          {r.error ?? "OK"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <DialogFooter>
            {csvStep === "map" && (
              <Button onClick={goToPreview} disabled={!dateMapped || !amountMapped}>
                Preview import
              </Button>
            )}
            {csvStep === "preview" && (
              <Button onClick={confirmImport} disabled={importing || validCount === 0}>
                {importing ? "Importing…" : `Import ${validCount} transactions`}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
