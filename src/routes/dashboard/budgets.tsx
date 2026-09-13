import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useCategories } from "@/hooks/queries/use-categories";
import { useTransactions } from "@/hooks/queries/use-transactions";
import {
  useAddBudgetCategory,
  useBudget,
  useCreateBudget,
  useDeleteBudgetCategory,
  useUpdateBudgetCategory,
  type BudgetCategory,
} from "@/hooks/queries/use-budgets";

export const Route = createFileRoute("/dashboard/budgets")({
  component: BudgetsPage,
});

function monthLabel(monthStart: string) {
  return new Date(monthStart + "T00:00:00").toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function shiftMonth(monthStart: string, delta: number) {
  const d = new Date(monthStart + "T00:00:00");
  d.setMonth(d.getMonth() + delta);
  return d.toISOString().slice(0, 8) + "01";
}

function monthEnd(monthStart: string) {
  const d = new Date(monthStart + "T00:00:00");
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  return d.toISOString().slice(0, 10) + "T23:59:59";
}

function BudgetsPage() {
  const { userId } = useAuth();
  const [monthStart, setMonthStart] = useState(() => new Date().toISOString().slice(0, 8) + "01");

  const { data: budget, isLoading } = useBudget(userId, monthStart);
  const { data: categories } = useCategories(userId);
  const { data: monthExpenses } = useTransactions(userId, {
    from: monthStart,
    to: monthEnd(monthStart),
    type: "expense",
  });

  const createBudget = useCreateBudget(userId);
  const addCategory = useAddBudgetCategory(userId);
  const updateCategory = useUpdateBudgetCategory(userId);
  const deleteCategory = useDeleteBudgetCategory(userId);

  const spendByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of monthExpenses ?? []) {
      if (!t.category_id) continue;
      map.set(t.category_id, (map.get(t.category_id) ?? 0) + Number(t.amount));
    }
    return map;
  }, [monthExpenses]);

  const totalSpent = (monthExpenses ?? []).reduce((s, t) => s + Number(t.amount), 0);

  // ---- Create budget ----
  const [createOpen, setCreateOpen] = useState(false);
  const [budgetName, setBudgetName] = useState("Monthly budget");
  const [totalLimit, setTotalLimit] = useState("");

  async function submitCreateBudget() {
    const limit = Number(totalLimit);
    if (!budgetName.trim() || !limit || limit <= 0) {
      toast.error("Enter a name and a positive limit.");
      return;
    }
    try {
      await createBudget.mutateAsync({
        name: budgetName.trim(),
        total_limit: limit,
        month_start: monthStart,
      });
      toast.success("Budget created.");
      setCreateOpen(false);
      setTotalLimit("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't create budget.");
    }
  }

  // ---- Add / edit category limit ----
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const [limitAmount, setLimitAmount] = useState("");

  function openAddCategory() {
    setEditingCategory(null);
    setCategoryId("");
    setLimitAmount("");
    setCategoryDialogOpen(true);
  }

  function openEditCategory(bc: BudgetCategory) {
    setEditingCategory(bc);
    setCategoryId(bc.category_id);
    setLimitAmount(String(bc.limit_amount));
    setCategoryDialogOpen(true);
  }

  async function submitCategoryLimit() {
    const limit = Number(limitAmount);
    if (!limit || limit <= 0) {
      toast.error("Enter a positive limit amount.");
      return;
    }
    if (!editingCategory && !categoryId) {
      toast.error("Choose a category.");
      return;
    }
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, limit_amount: limit });
        toast.success("Category limit updated.");
      } else if (budget) {
        await addCategory.mutateAsync({
          budget_id: budget.id,
          category_id: categoryId,
          limit_amount: limit,
        });
        toast.success("Category limit added.");
      }
      setCategoryDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save category limit.");
    }
  }

  const [deleteTarget, setDeleteTarget] = useState<BudgetCategory | null>(null);

  async function confirmDeleteCategory() {
    if (!deleteTarget) return;
    try {
      await deleteCategory.mutateAsync(deleteTarget.id);
      toast.success("Category limit removed.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't remove category limit.");
    } finally {
      setDeleteTarget(null);
    }
  }

  const usedCategoryIds = new Set((budget?.budget_categories ?? []).map((bc) => bc.category_id));
  const availableCategories = (categories ?? []).filter(
    (c) =>
      c.kind === "expense" &&
      (editingCategory ? c.id === editingCategory.category_id : !usedCategoryIds.has(c.id)),
  );
  const categoryName = (id: string) =>
    categories?.find((c) => c.id === id)?.name ?? "Uncategorized";

  const totalPct =
    budget && Number(budget.total_limit) > 0
      ? Math.min(100, (totalSpent / Number(budget.total_limit)) * 100)
      : 0;

  return (
    <div>
      <Toaster position="top-right" theme="dark" />

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Budgets</h1>
          <p className="mt-1 text-sm text-mute">
            Track spending limits by category, month by month.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMonthStart((m) => shiftMonth(m, -1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-[130px] text-center text-sm font-medium">
            {monthLabel(monthStart)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMonthStart((m) => shiftMonth(m, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-panel p-5">
        {isLoading && <div className="py-6 text-center text-sm text-mute">Loading…</div>}

        {!isLoading && !budget && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-sm text-mute">No budget set for {monthLabel(monthStart)} yet.</p>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 size-4" /> Create budget
            </Button>
          </div>
        )}

        {budget && (
          <div>
            <div className="flex items-baseline justify-between">
              <div className="font-display text-lg font-semibold">{budget.name}</div>
              <div className="font-mono text-sm text-mute">
                ₹{totalSpent.toLocaleString("en-IN")} of ₹
                {Number(budget.total_limit).toLocaleString("en-IN")}
              </div>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-raise">
              <div
                className={`h-full ${totalPct >= 100 ? "bg-danger-signal" : totalPct >= 80 ? "bg-warning-signal" : "bg-signal"}`}
                style={{ width: `${totalPct}%` }}
              />
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-xs font-mono uppercase tracking-[0.14em] text-mute">
                Category limits
              </div>
              <Button variant="outline" size="sm" onClick={openAddCategory}>
                <Plus className="mr-1.5 size-3.5" /> Add category
              </Button>
            </div>

            <div className="mt-3 divide-y divide-line">
              {budget.budget_categories.length === 0 && (
                <div className="py-4 text-sm text-mute">No category limits set yet.</div>
              )}
              {budget.budget_categories.map((bc) => {
                const spent = spendByCategory.get(bc.category_id) ?? 0;
                const pct =
                  Number(bc.limit_amount) > 0
                    ? Math.min(100, (spent / Number(bc.limit_amount)) * 100)
                    : 0;
                return (
                  <div key={bc.id} className="group py-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>{categoryName(bc.category_id)}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-mute">
                          ₹{spent.toLocaleString("en-IN")} / ₹
                          {Number(bc.limit_amount).toLocaleString("en-IN")}
                        </span>
                        <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                          <button
                            onClick={() => openEditCategory(bc)}
                            className="rounded p-1 text-mute hover:bg-raise hover:text-ink"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(bc)}
                            className="rounded p-1 text-mute hover:bg-raise hover:text-danger-signal"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-raise">
                      <div
                        className={`h-full ${pct >= 100 ? "bg-danger-signal" : pct >= 80 ? "bg-warning-signal" : "bg-signal"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Create budget dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create budget for {monthLabel(monthStart)}</DialogTitle>
            <DialogDescription>Set an overall spending limit for the month.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label htmlFor="budget-name">Name</Label>
              <Input
                id="budget-name"
                value={budgetName}
                onChange={(e) => setBudgetName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="budget-limit">Total limit (₹)</Label>
              <Input
                id="budget-limit"
                type="number"
                min="0"
                step="0.01"
                value={totalLimit}
                onChange={(e) => setTotalLimit(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitCreateBudget} disabled={createBudget.isPending}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add / edit category limit dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit category limit" : "Add category limit"}
            </DialogTitle>
            <DialogDescription>Set a spending cap for one category this month.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId} disabled={!!editingCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cat-limit">Limit (₹)</Label>
              <Input
                id="cat-limit"
                type="number"
                min="0"
                step="0.01"
                value={limitAmount}
                onChange={(e) => setLimitAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitCategoryLimit}
              disabled={addCategory.isPending || updateCategory.isPending}
            >
              {editingCategory ? "Save changes" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete category limit confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this category limit?</AlertDialogTitle>
            <AlertDialogDescription>
              The limit for "{deleteTarget ? categoryName(deleteTarget.category_id) : ""}" will be
              removed. Existing transactions aren't affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCategory}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
