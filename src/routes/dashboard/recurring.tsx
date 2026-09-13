import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, CalendarClock, Pencil, Plus, Repeat, Trash2, Zap, Mail, RefreshCw } from "lucide-react";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { useAuth } from "@/hooks/use-auth";
import { useAccounts } from "@/hooks/queries/use-accounts";
import { useCategories } from "@/hooks/queries/use-categories";
import {
  useCreateRecurringTransaction,
  useDeleteRecurringTransaction,
  useRecurringTransactionSync,
  useRecurringTransactions,
  useUpdateRecurringTransaction,
  type RecurringTransaction,
} from "@/hooks/queries/use-recurring-transactions";
import {
  triggerRecurringAutomation,
  triggerBudgetThresholdCheck,
  sendEmailNotification,
} from "@/lib/notifications-automation";

export const Route = createFileRoute("/dashboard/recurring")({
  component: RecurringPage,
});

type TxType = "income" | "expense" | "transfer";
type Frequency = "weekly" | "biweekly" | "monthly" | "yearly";

const EMPTY_FORM = {
  merchant: "",
  amount: "",
  type: "expense" as TxType,
  category_id: "",
  account_id: "",
  payment_method: "UPI",
  frequency: "monthly" as Frequency,
  next_due_date: new Date().toISOString().slice(0, 10),
  remind_days_before: "3",
  description: "",
};

function daysUntil(date: string): number {
  const today = new Date().toISOString().slice(0, 10);
  return Math.round(
    (new Date(date + "T00:00:00").getTime() - new Date(today + "T00:00:00").getTime()) / 86_400_000,
  );
}

function RecurringPage() {
  const { userId, user } = useAuth();
  const { data: recurring, isLoading } = useRecurringTransactions(userId);
  const { data: accounts } = useAccounts(userId);
  const { data: categories } = useCategories(userId);
  const { upcoming } = useRecurringTransactionSync(userId);

  const createItem = useCreateRecurringTransaction(userId);
  const updateItem = useUpdateRecurringTransaction(userId);
  const deleteItem = useDeleteRecurringTransaction(userId);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringTransaction | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<RecurringTransaction | null>(null);
  const [isAutomating, setIsAutomating] = useState(false);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }

  function openEdit(item: RecurringTransaction) {
    setEditing(item);
    setForm({
      merchant: item.merchant,
      amount: String(item.amount),
      type: item.type as TxType,
      category_id: item.category_id ?? "",
      account_id: item.account_id ?? "",
      payment_method: item.payment_method ?? "UPI",
      frequency: (item.frequency as Frequency) ?? "monthly",
      next_due_date: item.next_due_date,
      remind_days_before: String(item.remind_days_before ?? 3),
      description: item.description ?? "",
    });
    setFormOpen(true);
  }

  async function handleRunAutomation() {
    setIsAutomating(true);
    try {
      const res = await triggerRecurringAutomation();
      await triggerBudgetThresholdCheck();
      if (res.success) {
        toast.success(
          `Automation Sweep Complete! Processed ${res.result?.processed ?? 0} due payments.`
        );
      } else {
        toast.info("Automation sweep finished (Supabase or Render connected).");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to execute automation sweep.");
    } finally {
      setIsAutomating(false);
    }
  }

  async function handleSendTestEmail() {
    const recipient = user?.email || "user@example.com";
    toast.promise(
      sendEmailNotification(
        recipient,
        "FinSight Alert: Budget Threshold & Recurring Payment Processed",
        "Your scheduled recurring transactions and budget thresholds have been processed automatically."
      ),
      {
        loading: "Dispatching email notification...",
        success: (data) => `Email notification sent to ${recipient}!`,
        error: "Failed to send email notification.",
      }
    );
  }

  async function save() {
    if (!form.merchant.trim() || !form.amount) {
      toast.error("Please fill in merchant and amount.");
      return;
    }
    const payload = {
      merchant: form.merchant.trim(),
      amount: Number(form.amount),
      type: form.type,
      category_id: form.category_id || null,
      account_id: form.account_id || null,
      payment_method: form.payment_method,
      frequency: form.frequency,
      next_due_date: form.next_due_date,
      remind_days_before: Number(form.remind_days_before) || 3,
      description: form.description || null,
    };
    try {
      if (editing) {
        await updateItem.mutateAsync({ id: editing.id, ...payload });
        toast.success("Recurring item updated.");
      } else {
        await createItem.mutateAsync({ ...payload, is_active: true });
        toast.success("Recurring item created.");
      }
      setFormOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save recurring item.");
    }
  }

  async function toggleActive(item: RecurringTransaction) {
    try {
      await updateItem.mutateAsync({ id: item.id, is_active: !item.is_active });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't update item.");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteItem.mutateAsync(deleteTarget.id);
      toast.success("Recurring item deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't delete item.");
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-bold">Recurring & Automation Engine</h1>
          <p className="text-sm text-mute">
            Auto-generate recurring transactions, budget threshold alerts, and email notifications.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRunAutomation}
            disabled={isAutomating}
          >
            <RefreshCw className={`mr-1.5 size-3.5 ${isAutomating ? "animate-spin" : ""}`} />
            Run Automation Sweep
          </Button>
          <Button size="sm" variant="outline" onClick={handleSendTestEmail}>
            <Mail className="mr-1.5 size-3.5 text-signal" /> Dispatch Email Alert
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus className="mr-1.5 size-3.5" /> Add recurring item
          </Button>
        </div>
      </div>

      {upcoming.length > 0 && (
        <div className="rounded-lg border border-warning-signal/30 bg-warning-signal/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
            <Bell className="size-4 text-warning-signal" /> Due soon
          </div>
          <div className="flex flex-wrap gap-2">
            {upcoming.map((u) => {
              const d = daysUntil(u.next_due_date);
              return (
                <span
                  key={u.id}
                  className="inline-flex items-center gap-1.5 rounded border border-line bg-panel px-2.5 py-1 font-mono text-xs text-ink"
                >
                  <span className="font-medium">{u.merchant}</span>
                  <span className="text-warning-signal">₹{Number(u.amount).toLocaleString("en-IN")}</span>
                  <span className="text-mute">
                    ({d === 0 ? "Due today" : `in ${d}d`})
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-line bg-panel shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-sm font-mono text-mute">Loading recurring items...</div>
        ) : !recurring || recurring.length === 0 ? (
          <div className="p-8 text-center">
            <Repeat className="mx-auto size-8 text-mute" />
            <p className="mt-2 font-display text-sm font-semibold">No recurring items</p>
            <p className="mt-1 text-xs text-mute">Add your subscriptions, rent, or salary to track recurring bills.</p>
            <Button size="sm" onClick={openAdd} className="mt-4">
              <Plus className="mr-1.5 size-3.5" /> Add recurring item
            </Button>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="border-b border-line bg-raise/50 font-mono text-[10px] uppercase text-mute">
              <tr>
                <th className="px-5 py-3">Merchant</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Frequency</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Next due</th>
                <th className="px-5 py-3">Active</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {recurring.map((item) => (
                <tr key={item.id} className="hover:bg-raise/30">
                  <td className="px-5 py-3 font-medium text-ink">{item.merchant}</td>
                  <td className="px-5 py-3 font-mono capitalize text-mute">{item.type}</td>
                  <td className="px-5 py-3 font-mono capitalize text-mute">{item.frequency}</td>
                  <td className="px-5 py-3 font-mono font-semibold">
                    ₹{Number(item.amount).toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-3 font-mono text-mute">
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock className="size-3.5" />
                      {new Date(item.next_due_date + "T00:00:00").toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Switch checked={item.is_active} onCheckedChange={() => toggleActive(item)} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => openEdit(item)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => setDeleteTarget(item)}
                      >
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

      {/* Add / Edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit recurring item" : "Add recurring item"}</DialogTitle>
            <DialogDescription>
              This will post a transaction automatically and remind you before it's due.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="merchant">Merchant</Label>
                <Input
                  id="merchant"
                  value={form.merchant}
                  onChange={(e) => setForm((f) => ({ ...f, merchant: e.target.value }))}
                  placeholder="e.g. Netflix, Salary, Rent"
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
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
              <div>
                <Label>Frequency</Label>
                <Select
                  value={form.frequency}
                  onValueChange={(v) => setForm((f) => ({ ...f, frequency: v as Frequency }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="next_due_date">Next due date</Label>
                <Input
                  id="next_due_date"
                  type="date"
                  value={form.next_due_date}
                  onChange={(e) => setForm((f) => ({ ...f, next_due_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="remind_days">Remind days before</Label>
                <Input
                  id="remind_days"
                  type="number"
                  value={form.remind_days_before}
                  onChange={(e) => setForm((f) => ({ ...f, remind_days_before: e.target.value }))}
                />
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
            <Button onClick={save}>{editing ? "Save changes" : "Create recurring"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete recurring item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will stop future automated postings for "{deleteTarget?.merchant}". Past transactions will remain intact.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-danger-signal text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
