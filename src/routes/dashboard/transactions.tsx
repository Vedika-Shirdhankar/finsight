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
  Building2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { predictCategory } from "@/lib/auto-categorize";
import { detectDuplicates } from "@/lib/duplicate-detector";
import {
  SUPPORTED_INSTITUTIONS,
  connectLiveBankFeed,
  fetchLiveBankTelemetry,
  type BankInstitution,
} from "@/lib/bank-sync";
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

  const categoryNameById = useMemo(
    () => new Map((categories ?? []).map((c) => [c.id, c.name])),
    [categories]
  );
  const accountNameById = useMemo(
    () => new Map((accounts ?? []).map((a) => [a.id, a.name])),
    [accounts]
  );

  function clearFilters() {
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

  // ---- Live Bank Sync State ----
  const [bankSyncOpen, setBankSyncOpen] = useState(false);
  const [selectedInst, setSelectedInst] = useState<BankInstitution | null>(null);
  const [isSyncingBank, setIsSyncingBank] = useState(false);

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

  function handleMerchantChange(merchant: string) {
    setForm((prev) => {
      const updated = { ...prev, merchant };
      if (!editing && merchant && (!prev.category_id || prev.category_id === "")) {
        const pred = predictCategory(merchant, categories || []);
        if (pred.categoryId) {
          updated.category_id = pred.categoryId;
          toast.info(`Auto-categorized as "${pred.categoryName}" (${Math.round(pred.confidence * 100)}% match)`);
        }
      }
      return updated;
    });
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

  // ---- Delete confirmation ----
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

  // ---- Live Bank Sync Integration ----
  async function handleSyncBankFeed(inst: BankInstitution) {
    if (!userId) return;
    setIsSyncingBank(true);
    setSelectedInst(inst);
    try {
      const conn = await connectLiveBankFeed(inst.id, userId);
      toast.info(conn.message || `Connecting to ${inst.name}...`);

      const telemetry = await fetchLiveBankTelemetry(inst.id);

      // Check duplicates
      const candidates = telemetry.map((t) => ({
        merchant: t.merchant,
        amount: t.amount,
        transaction_date: t.transaction_date,
        type: t.type,
      }));

      const duplicates = detectDuplicates(candidates, transactions || []);
      const uniqueCandidates = duplicates.filter((d) => !d.isDuplicate);

      if (uniqueCandidates.length === 0) {
        toast.info(`Bank feed synced. All ${telemetry.length} items already exist in ledger.`);
        setBankSyncOpen(false);
        setIsSyncingBank(false);
        return;
      }

      // Map rows with auto-categorization
      const rowsToInsert = uniqueCandidates.map((c) => {
        const pred = predictCategory(c.incomingTxn.merchant, categories || []);
        return {
          transaction: {
            transaction_date: new Date(c.incomingTxn.transaction_date).toISOString(),
            amount: c.incomingTxn.amount,
            type: (c.incomingTxn.type as TxType) || "expense",
            merchant: c.incomingTxn.merchant,
            description: `Live bank telemetry sync from ${inst.name}`,
            category_id: pred.categoryId || null,
            account_id: accounts?.[0]?.id || null,
            payment_method: "UPI",
            status: "completed" as const,
          },
        };
      });

      const count = await bulkInsertTransactions(userId, rowsToInsert);
      toast.success(`Synced ${count} new telemetry transactions from ${inst.name}! (${telemetry.length - count} duplicates filtered)`);
      queryClient.invalidateQueries({ queryKey: ["transactions", userId] });
      setBankSyncOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to sync bank telemetry.");
    } finally {
      setIsSyncingBank(false);
      setSelectedInst(null);
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
      (categories ?? []).map((c) => [c.name.trim().toLowerCase(), c.id])
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
      `finsight_transactions_${new Date().toISOString().slice(0, 10)}.csv`
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
          <h1 className="font-display text-2xl font-bold tracking-tight">Transactions & Telemetry</h1>
          <p className="mt-1 text-sm text-mute">
            Live bank feeds, account aggregator sync, and transaction management.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
          <Button variant="outline" onClick={() => setBankSyncOpen(true)} className="w-full sm:w-auto border-signal/30 text-signal">
            <Building2 className="mr-2 size-4" /> Sync Live Bank (AA/Plaid)
          </Button>
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
            {(categories ?? []).map((c) => (
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
            {(accounts ?? []).map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(search ||
          typeFilter !== "all" ||
          categoryFilter !== "all" ||
          accountFilter !== "all" ||
          fromDate ||
          toDate) && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-mute">
            <X className="mr-1 size-3.5" /> Clear
          </Button>
        )}
      </div>

      {/* Ledger Table */}
      <div className="overflow-hidden rounded-xl border border-line bg-panel shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-sm font-mono text-mute">Loading transactions…</div>
        ) : !transactions || transactions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-display text-sm font-semibold">No transactions found</p>
            <p className="mt-1 text-xs text-mute">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="border-b border-line bg-raise/50 font-mono text-[10px] uppercase text-mute">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Merchant</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Account</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {pageItems.map((t) => (
                <tr key={t.id} className="hover:bg-raise/30">
                  <td className="px-5 py-3 font-mono text-mute">
                    {new Date(t.transaction_date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3 font-medium text-ink">
                    {t.merchant ?? "—"}
                    {t.description && (
                      <span className="block text-[11px] font-normal text-mute">{t.description}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-mute">
                    {t.category_id ? (categoryNameById.get(t.category_id) ?? "—") : "Uncategorized"}
                  </td>
                  <td className="px-5 py-3 text-mute">
                    {t.account_id ? (accountNameById.get(t.account_id) ?? "—") : "—"}
                  </td>
                  <td className="px-5 py-3 font-mono capitalize text-mute">{t.type}</td>
                  <td
                    className={`px-5 py-3 text-right font-mono font-semibold ${
                      t.type === "income" ? "text-signal" : "text-ink"
                    }`}
                  >
                    {t.type === "income" ? "+" : "−"}₹{Number(t.amount).toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="size-7" onClick={() => openEdit(t)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-7" onClick={() => setDeleteTarget(t)}>
                        <Trash2 className="size-3.5 text-danger-signal" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Live Bank Feed / Account Aggregator Dialog */}
      <Dialog open={bankSyncOpen} onOpenChange={setBankSyncOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="size-5 text-signal" /> Live Bank & Account Aggregator (AA) Sync
            </DialogTitle>
            <DialogDescription>
              Connect to India's Account Aggregator framework or Plaid to fetch real-time bank telemetry.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            {SUPPORTED_INSTITUTIONS.map((inst) => (
              <div
                key={inst.id}
                className="flex items-center justify-between rounded-lg border border-line bg-raise p-3 transition hover:border-signal/40"
              >
                <div>
                  <div className="font-display font-semibold text-sm">{inst.name}</div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {inst.supportedMethods.map((m) => (
                      <span key={m} className="rounded bg-panel border border-line px-1.5 py-0.5 text-[9px] font-mono text-mute">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSyncBankFeed(inst)}
                  disabled={isSyncingBank}
                >
                  {isSyncingBank && selectedInst?.id === inst.id ? (
                    <RefreshCw className="mr-1.5 size-3.5 animate-spin" />
                  ) : (
                    <ShieldCheck className="mr-1.5 size-3.5 text-signal" />
                  )}
                  Connect
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add / Edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
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
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="merchant">Merchant</Label>
                <Input
                  id="merchant"
                  value={form.merchant}
                  onChange={(e) => handleMerchantChange(e.target.value)}
                  placeholder="e.g. Swiggy, Uber, Amazon"
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm((f) => ({ ...f, type: v as TxType }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Category</Label>
                <Select
                  value={form.category_id}
                  onValueChange={(v) => setForm((f) => ({ ...f, category_id: v }))}
                >
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {(categories || []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Account</Label>
                <Select
                  value={form.account_id}
                  onValueChange={(v) => setForm((f) => ({ ...f, account_id: v }))}
                >
                  <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                  <SelectContent>
                    {(accounts || []).map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={submitForm}>{editing ? "Save changes" : "Add transaction"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
