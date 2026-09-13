import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Calculator, Pencil, PiggyBank, Plus, Trash2 } from "lucide-react";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  useCreateSavingsGoal,
  useDeleteSavingsGoal,
  useSavingsGoals,
  useUpdateSavingsGoal,
  useUpdateSavingsGoalProgress,
  type SavingsGoal,
} from "@/hooks/queries/use-savings-goals";

export const Route = createFileRoute("/dashboard/goals")({
  component: GoalsPage,
});

const COLOR_TOKENS = [
  "signal",
  "info-signal",
  "warning-signal",
  "danger-signal",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
];

const EMPTY_FORM = { name: "", target_amount: "", target_date: "", color_token: "signal" };

function GoalsPage() {
  const { userId } = useAuth();
  const { data: goals, isLoading } = useSavingsGoals(userId);

  const createGoal = useCreateSavingsGoal(userId);
  const updateGoal = useUpdateSavingsGoal(userId);
  const deleteGoal = useDeleteSavingsGoal(userId);
  const updateProgress = useUpdateSavingsGoalProgress(userId);

  // ---- Create / edit ----
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SavingsGoal | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }

  function openEdit(g: SavingsGoal) {
    setEditing(g);
    setForm({
      name: g.name,
      target_amount: String(g.target_amount),
      target_date: g.target_date ? g.target_date.slice(0, 10) : "",
      color_token: g.color_token,
    });
    setFormOpen(true);
  }

  async function submitForm() {
    const target = Number(form.target_amount);
    if (!form.name.trim() || !target || target <= 0) {
      toast.error("Enter a name and a positive target amount.");
      return;
    }
    const payload = {
      name: form.name.trim(),
      target_amount: target,
      target_date: form.target_date || null,
      color_token: form.color_token,
    };
    try {
      if (editing) {
        await updateGoal.mutateAsync({ id: editing.id, ...payload });
        toast.success("Goal updated.");
      } else {
        await createGoal.mutateAsync({ ...payload, current_amount: 0 });
        toast.success("Goal created.");
      }
      setFormOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save goal.");
    }
  }

  // ---- Delete ----
  const [deleteTarget, setDeleteTarget] = useState<SavingsGoal | null>(null);

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteGoal.mutateAsync(deleteTarget.id);
      toast.success("Goal deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't delete goal.");
    } finally {
      setDeleteTarget(null);
    }
  }

  // ---- Contribution ----
  const [contribTarget, setContribTarget] = useState<SavingsGoal | null>(null);
  const [contribAmount, setContribAmount] = useState("");

  async function submitContribution() {
    if (!contribTarget) return;
    const amount = Number(contribAmount);
    if (!amount || amount === 0) {
      toast.error("Enter a non-zero amount.");
      return;
    }
    const newAmount = Math.max(0, Number(contribTarget.current_amount) + amount);
    try {
      await updateProgress.mutateAsync({ id: contribTarget.id, current_amount: newAmount });
      toast.success(amount > 0 ? "Contribution added." : "Amount withdrawn.");
      setContribTarget(null);
      setContribAmount("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't update progress.");
    }
  }

  function GoalCalculator() {
    const [targetAmount, setTargetAmount] = useState(100000);
    const [months, setMonths] = useState(12);
    const [expectedReturnRate, setExpectedReturnRate] = useState(7);

    const r = expectedReturnRate / 100 / 12;
    const monthlyDeposit =
      r > 0
        ? (targetAmount * r) / (Math.pow(1 + r, Math.max(1, months)) - 1)
        : targetAmount / Math.max(1, months);

    return (
      <div className="mb-8 rounded-xl border border-line bg-panel p-6">
        <div className="flex items-center gap-2 font-display text-lg font-bold mb-1">
          <Calculator className="size-5 text-signal" /> Goal Deposit Calculator
        </div>
        <p className="text-xs text-mute mb-5">
          Estimate how much you need to save each month to hit your financial milestone.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs text-mute mb-1">Target Amount (₹)</label>
            <input
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(Number(e.target.value) || 0)}
              className="w-full rounded-lg border border-line bg-raise px-3 py-2 text-sm outline-none focus:border-signal"
            />
          </div>
          <div>
            <label className="block text-xs text-mute mb-1">Target Timeline (Months)</label>
            <input
              type="number"
              value={months}
              onChange={(e) => setMonths(Number(e.target.value) || 1)}
              className="w-full rounded-lg border border-line bg-raise px-3 py-2 text-sm outline-none focus:border-signal"
            />
          </div>
          <div>
            <label className="block text-xs text-mute mb-1">Est. Annual Return (%)</label>
            <input
              type="number"
              value={expectedReturnRate}
              onChange={(e) => setExpectedReturnRate(Number(e.target.value) || 0)}
              className="w-full rounded-lg border border-line bg-raise px-3 py-2 text-sm outline-none focus:border-signal"
            />
          </div>
        </div>

        <div className="mt-5 border-t border-line pt-4 flex items-center justify-between">
          <span className="text-xs text-mute font-mono">Required Monthly Savings Deposit:</span>
          <span className="font-mono text-xl font-bold text-signal">
            ₹{Math.round(monthlyDeposit).toLocaleString("en-IN")} / month
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Toaster position="top-right" theme="dark" />

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Savings goals</h1>
          <p className="mt-1 text-sm text-mute">Track progress toward what you're saving for.</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 size-4" /> New goal
        </Button>
      </div>

      <GoalCalculator />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading && (
          <div className="col-span-full py-6 text-center text-sm text-mute">Loading…</div>
        )}
        {!isLoading && goals?.length === 0 && (
          <div className="col-span-full flex flex-col items-center gap-3 py-10 text-center">
            <PiggyBank className="size-8 text-mute" />
            <p className="text-sm text-mute">
              No savings goals yet — set one to start tracking progress.
            </p>
          </div>
        )}
        {goals?.map((g) => {
          const pct =
            Number(g.target_amount) > 0
              ? Math.min(100, (Number(g.current_amount) / Number(g.target_amount)) * 100)
              : 0;
          return (
            <div key={g.id} className="group rounded-xl border border-line bg-panel p-5">
              <div className="flex items-start justify-between">
                <div className="font-display font-semibold">{g.name}</div>
                <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    onClick={() => openEdit(g)}
                    className="rounded p-1 text-mute hover:bg-raise hover:text-ink"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(g)}
                    className="rounded p-1 text-mute hover:bg-raise hover:text-danger-signal"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
              <div className="mt-1 font-mono text-xs text-mute">
                ₹{Number(g.current_amount).toLocaleString("en-IN")} of ₹
                {Number(g.target_amount).toLocaleString("en-IN")}
              </div>
              {g.target_date && (
                <div className="mt-0.5 text-[11px] text-mute">
                  By{" "}
                  {new Date(g.target_date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              )}
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-raise">
                <div className="h-full bg-signal" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-mono text-[11px] text-mute">{pct.toFixed(0)}%</span>
                <Button variant="outline" size="sm" onClick={() => setContribTarget(g)}>
                  Log contribution
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit goal" : "New savings goal"}</DialogTitle>
            <DialogDescription>What are you saving for?</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label htmlFor="goal-name">Name</Label>
              <Input
                id="goal-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="goal-target">Target amount (₹)</Label>
                <Input
                  id="goal-target"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.target_amount}
                  onChange={(e) => setForm((f) => ({ ...f, target_amount: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="goal-date">Target date (optional)</Label>
                <Input
                  id="goal-date"
                  type="date"
                  value={form.target_date}
                  onChange={(e) => setForm((f) => ({ ...f, target_date: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Color</Label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {COLOR_TOKENS.map((token) => (
                  <button
                    key={token}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, color_token: token }))}
                    className={`size-7 rounded-full border-2 ${form.color_token === token ? "border-ink" : "border-transparent"}`}
                    style={{ backgroundColor: `var(--color-${token})` }}
                    title={token}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitForm} disabled={createGoal.isPending || updateGoal.isPending}>
              {editing ? "Save changes" : "Create goal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log contribution dialog */}
      <Dialog open={!!contribTarget} onOpenChange={(open) => !open && setContribTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log contribution — {contribTarget?.name}</DialogTitle>
            <DialogDescription>Positive to add, negative to withdraw.</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="contrib-amount">Amount (₹)</Label>
            <Input
              id="contrib-amount"
              type="number"
              step="0.01"
              value={contribAmount}
              onChange={(e) => setContribAmount(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContribTarget(null)}>
              Cancel
            </Button>
            <Button onClick={submitContribution} disabled={updateProgress.isPending}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this goal?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.name}" and its progress will be permanently removed.
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
