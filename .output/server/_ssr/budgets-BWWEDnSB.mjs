import { a as __toESM } from "../_runtime.mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { C as Pencil, G as ChevronLeft, W as ChevronRight, d as Trash2, x as Plus } from "../_libs/lucide-react.mjs";
import { n as useAuth } from "./keys-C2024mUc.mjs";
import { t as useCategories } from "./use-categories-BSfFvBVL.mjs";
import { a as useUpdateBudgetCategory, i as useDeleteBudgetCategory, n as useBudget, r as useCreateBudget, t as useAddBudgetCategory } from "./use-budgets-B4foJmW9.mjs";
import { r as useTransactions } from "./use-transactions-Bc0pgBXv.mjs";
import { t as Button } from "./button-PwNqyxv_.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, d as DialogDescription, f as DialogFooter, g as Label, h as Input, i as AlertDialogContent, l as Dialog, m as DialogTitle, n as AlertDialogAction, o as AlertDialogFooter, p as DialogHeader, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog, u as DialogContent } from "./alert-dialog-BVw1Eoof.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-DamjaduW.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/budgets-BWWEDnSB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function monthLabel(monthStart) {
	return (/* @__PURE__ */ new Date(monthStart + "T00:00:00")).toLocaleDateString("en-IN", {
		month: "long",
		year: "numeric"
	});
}
function shiftMonth(monthStart, delta) {
	const d = /* @__PURE__ */ new Date(monthStart + "T00:00:00");
	d.setMonth(d.getMonth() + delta);
	return d.toISOString().slice(0, 8) + "01";
}
function monthEnd(monthStart) {
	const d = /* @__PURE__ */ new Date(monthStart + "T00:00:00");
	d.setMonth(d.getMonth() + 1);
	d.setDate(0);
	return d.toISOString().slice(0, 10) + "T23:59:59";
}
function BudgetsPage() {
	const { userId } = useAuth();
	const [monthStart, setMonthStart] = (0, import_react.useState)(() => (/* @__PURE__ */ new Date()).toISOString().slice(0, 8) + "01");
	const { data: budget, isLoading } = useBudget(userId, monthStart);
	const { data: categories } = useCategories(userId);
	const { data: monthExpenses } = useTransactions(userId, {
		from: monthStart,
		to: monthEnd(monthStart),
		type: "expense"
	});
	const createBudget = useCreateBudget(userId);
	const addCategory = useAddBudgetCategory(userId);
	const updateCategory = useUpdateBudgetCategory(userId);
	const deleteCategory = useDeleteBudgetCategory(userId);
	const spendByCategory = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const t of monthExpenses ?? []) {
			if (!t.category_id) continue;
			map.set(t.category_id, (map.get(t.category_id) ?? 0) + Number(t.amount));
		}
		return map;
	}, [monthExpenses]);
	const totalSpent = (monthExpenses ?? []).reduce((s, t) => s + Number(t.amount), 0);
	const [createOpen, setCreateOpen] = (0, import_react.useState)(false);
	const [budgetName, setBudgetName] = (0, import_react.useState)("Monthly budget");
	const [totalLimit, setTotalLimit] = (0, import_react.useState)("");
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
				month_start: monthStart
			});
			toast.success("Budget created.");
			setCreateOpen(false);
			setTotalLimit("");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Couldn't create budget.");
		}
	}
	const [categoryDialogOpen, setCategoryDialogOpen] = (0, import_react.useState)(false);
	const [editingCategory, setEditingCategory] = (0, import_react.useState)(null);
	const [categoryId, setCategoryId] = (0, import_react.useState)("");
	const [limitAmount, setLimitAmount] = (0, import_react.useState)("");
	function openAddCategory() {
		setEditingCategory(null);
		setCategoryId("");
		setLimitAmount("");
		setCategoryDialogOpen(true);
	}
	function openEditCategory(bc) {
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
				await updateCategory.mutateAsync({
					id: editingCategory.id,
					limit_amount: limit
				});
				toast.success("Category limit updated.");
			} else if (budget) {
				await addCategory.mutateAsync({
					budget_id: budget.id,
					category_id: categoryId,
					limit_amount: limit
				});
				toast.success("Category limit added.");
			}
			setCategoryDialogOpen(false);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Couldn't save category limit.");
		}
	}
	const [deleteTarget, setDeleteTarget] = (0, import_react.useState)(null);
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
	const availableCategories = (categories ?? []).filter((c) => c.kind === "expense" && (editingCategory ? c.id === editingCategory.category_id : !usedCategoryIds.has(c.id)));
	const categoryName = (id) => categories?.find((c) => c.id === id)?.name ?? "Uncategorized";
	const totalPct = budget && Number(budget.total_limit) > 0 ? Math.min(100, totalSpent / Number(budget.total_limit) * 100) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
			position: "top-right",
			theme: "dark"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-bold tracking-tight",
				children: "Budgets"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-mute",
				children: "Track spending limits by category, month by month."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => setMonthStart((m) => shiftMonth(m, -1)),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "min-w-[130px] text-center text-sm font-medium",
						children: monthLabel(monthStart)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => setMonthStart((m) => shiftMonth(m, 1)),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl border border-line bg-panel p-5",
			children: [
				isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "py-6 text-center text-sm text-mute",
					children: "Loading…"
				}),
				!isLoading && !budget && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center gap-3 py-8 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-mute",
						children: [
							"No budget set for ",
							monthLabel(monthStart),
							" yet."
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => setCreateOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 size-4" }), " Create budget"]
					})]
				}),
				budget && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-display text-lg font-semibold",
							children: budget.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-mono text-sm text-mute",
							children: [
								"₹",
								totalSpent.toLocaleString("en-IN"),
								" of ₹",
								Number(budget.total_limit).toLocaleString("en-IN")
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 h-2 overflow-hidden rounded-full bg-raise",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `h-full ${totalPct >= 100 ? "bg-danger-signal" : totalPct >= 80 ? "bg-warning-signal" : "bg-signal"}`,
							style: { width: `${totalPct}%` }
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs font-mono uppercase tracking-[0.14em] text-mute",
							children: "Category limits"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: openAddCategory,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1.5 size-3.5" }), " Add category"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 divide-y divide-line",
						children: [budget.budget_categories.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "py-4 text-sm text-mute",
							children: "No category limits set yet."
						}), budget.budget_categories.map((bc) => {
							const spent = spendByCategory.get(bc.category_id) ?? 0;
							const pct = Number(bc.limit_amount) > 0 ? Math.min(100, spent / Number(bc.limit_amount) * 100) : 0;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "group py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: categoryName(bc.category_id) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-mono text-xs text-mute",
											children: [
												"₹",
												spent.toLocaleString("en-IN"),
												" / ₹",
												Number(bc.limit_amount).toLocaleString("en-IN")
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex gap-1 opacity-0 transition group-hover:opacity-100",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => openEditCategory(bc),
												className: "rounded p-1 text-mute hover:bg-raise hover:text-ink",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-3.5" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => setDeleteTarget(bc),
												className: "rounded p-1 text-mute hover:bg-raise hover:text-danger-signal",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
											})]
										})]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1.5 h-1.5 overflow-hidden rounded-full bg-raise",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: `h-full ${pct >= 100 ? "bg-danger-signal" : pct >= 80 ? "bg-warning-signal" : "bg-signal"}`,
										style: { width: `${pct}%` }
									})
								})]
							}, bc.id);
						})]
					})
				] })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: createOpen,
			onOpenChange: setCreateOpen,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Create budget for ", monthLabel(monthStart)] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Set an overall spending limit for the month." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "budget-name",
						children: "Name"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "budget-name",
						value: budgetName,
						onChange: (e) => setBudgetName(e.target.value)
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "budget-limit",
						children: "Total limit (₹)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "budget-limit",
						type: "number",
						min: "0",
						step: "0.01",
						value: totalLimit,
						onChange: (e) => setTotalLimit(e.target.value)
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => setCreateOpen(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: submitCreateBudget,
					disabled: createBudget.isPending,
					children: "Create"
				})] })
			] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: categoryDialogOpen,
			onOpenChange: setCategoryDialogOpen,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editingCategory ? "Edit category limit" : "Add category limit" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Set a spending cap for one category this month." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Category" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: categoryId,
						onValueChange: setCategoryId,
						disabled: !!editingCategory,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choose a category" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: availableCategories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: c.id,
							children: c.name
						}, c.id)) })]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "cat-limit",
						children: "Limit (₹)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "cat-limit",
						type: "number",
						min: "0",
						step: "0.01",
						value: limitAmount,
						onChange: (e) => setLimitAmount(e.target.value)
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => setCategoryDialogOpen(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: submitCategoryLimit,
					disabled: addCategory.isPending || updateCategory.isPending,
					children: editingCategory ? "Save changes" : "Add"
				})] })
			] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
			open: !!deleteTarget,
			onOpenChange: (open) => !open && setDeleteTarget(null),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Remove this category limit?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [
				"The limit for \"",
				deleteTarget ? categoryName(deleteTarget.category_id) : "",
				"\" will be removed. Existing transactions aren't affected."
			] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
				onClick: confirmDeleteCategory,
				children: "Remove"
			})] })] })
		})
	] });
}
//#endregion
export { BudgetsPage as component };
