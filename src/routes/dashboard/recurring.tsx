import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, CalendarClock, Pencil, Plus, Repeat, Trash2 } from "lucide-react";
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
  const { userId } = useAuth();
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
      payment_method: item.payment_method,
      frequency: item.frequency as Frequency,
      next_due_date: item.next_due_date,
      remind_days_before: String(item.remind_days_before),
      description: item.description ?? "",
    });
    setFormOpen(true);
  }

  async function submitForm() {
    const amount = Number(form.amount);
    if (!form.merchant.trim() || !amount || amount <= 0 || !form.next_due_date) {
      toast.error("Enter a merchant, a positive amount, and a next due date.");
      return;
    }
    const payload = {
      merchant: form.merchant.trim(),
      amount,
      type: form.type,
      category_id: form.category_id || null,
      account_id: form.account_id || null,
      payment_method: form.payment_method || "UPI",
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
          <h1 className="font-display text-xl font-bold">Recurring & bills</h1>
          <p className="text-sm text-mute">Subscriptions and bills that repeat on a schedule.</p>
        </div>
        <Button size="sm" onClick={openAdd} className="w-full sm:w-auto">
          <Plus className="mr-1.5 size-3.5" /> Add recurring item
        </Button>
      </div>

      {upcoming.length > 0 && (
        <div className="rounded-lg border border-warning-signal/30 bg-warning-signal/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
            <Bell className="size-4 text-warning-signal" /> Due soon
          </div>
          <div className="space-y-1.5">
            {upcoming.map((item) => {
              const diff = daysUntil(item.next_due_date);
              return (
                <div key={item.id} className="flex items-center justify-between text-xs">
                  <span className="text-mute">
                    {item.merchant} — ₹{Number(item.amount).toLocaleString("en-IN")}
                  </span>
                  <span className="font-mono text-[10px] text-mute">
                    {diff === 0 ? "Due today" : diff === 1 ? "Due tomorrow" : `Due in ${diff} days`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-line bg-raise">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-mute">Loading…</div>
        ) : !recurring || recurring.length === 0 ? (
          <div className="p-10 text-center text-xs text-mute">
            <Repeat className="mx-auto mb-2 size-5 text-mute" />
            No recurring items yet. Add a subscription or bill to get reminders before it's due.
          </div>
        ) : (
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[10px] font-mono uppercase tracking-wide text-mute">
                <th className="px-5 py-3">Merchant</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Frequency</th>
                <th className="px-5 py-3">Next due</th>
                <th className="px-5 py-3">Active</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recurring.map((item) => (
                <tr key={item.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 font-medium">{item.merchant}</td>
                  <td className="px-5 py-3 text-mute">
                    ₹{Number(item.amount).toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-3 text-mute capitalize">{item.frequency}</td>
                  <td className="px-5 py-3 text-mute">
                    <span className="inline-flex items-center gap-1.5">
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
              <div>
                <Label htmlFor="method">Payment method</Label>
                <Input
                  id="method"
                  value={form.payment_method}
                  onChange={(e) => setForm((f) => ({ ...f, payment_method: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label>Frequency</Label>
                <Select
                  value={form.frequency}
                  onValueChange={(v) => setForm((f) => ({ ...f, frequency: v as Frequency }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Biweekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="next-due">Next due date</Label>
                <Input
                  id="next-due"
                  type="date"
                  value={form.next_due_date}
                  onChange={(e) => setForm((f) => ({ ...f, next_due_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="remind">Remind (days before)</Label>
                <Input
                  id="remind"
                  type="number"
                  min="0"
                  max="30"
                  value={form.remind_days_before}
                  onChange={(e) => setForm((f) => ({ ...f, remind_days_before: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitForm} disabled={createItem.isPending || updateItem.isPending}>
              {editing ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete recurring item?</AlertDialogTitle>
            <AlertDialogDescription>
              This stops future transactions and reminders for "{deleteTarget?.merchant}". Past
              transactions already posted won't be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
