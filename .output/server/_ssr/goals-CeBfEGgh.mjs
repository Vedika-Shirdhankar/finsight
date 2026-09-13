import { a as __toESM } from "../_runtime.mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { C as Pencil, Q as Calculator, S as PiggyBank, d as Trash2, x as Plus } from "../_libs/lucide-react.mjs";
import { n as useAuth } from "./keys-C2024mUc.mjs";
import { t as Button } from "./button-PwNqyxv_.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, d as DialogDescription, f as DialogFooter, g as Label, h as Input, i as AlertDialogContent, l as Dialog, m as DialogTitle, n as AlertDialogAction, o as AlertDialogFooter, p as DialogHeader, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog, u as DialogContent } from "./alert-dialog-BVw1Eoof.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { a as useUpdateSavingsGoalProgress, i as useUpdateSavingsGoal, n as useDeleteSavingsGoal, r as useSavingsGoals, t as useCreateSavingsGoal } from "./use-savings-goals-pV_2YW7V.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/goals-CeBfEGgh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var COLOR_TOKENS = [
	"signal",
	"info-signal",
	"warning-signal",
	"danger-signal",
	"chart-1",
	"chart-2",
	"chart-3",
	"chart-4",
	"chart-5"
];
var EMPTY_FORM = {
	name: "",
	target_amount: "",
	target_date: "",
	color_token: "signal"
};
function GoalsPage() {
	const { userId } = useAuth();
	const { data: goals, isLoading } = useSavingsGoals(userId);
	const createGoal = useCreateSavingsGoal(userId);
	const updateGoal = useUpdateSavingsGoal(userId);
	const deleteGoal = useDeleteSavingsGoal(userId);
	const updateProgress = useUpdateSavingsGoalProgress(userId);
	const [formOpen, setFormOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)(EMPTY_FORM);
	function openAdd() {
		setEditing(null);
		setForm(EMPTY_FORM);
		setFormOpen(true);
	}
	function openEdit(g) {
		setEditing(g);
		setForm({
			name: g.name,
			target_amount: String(g.target_amount),
			target_date: g.target_date ? g.target_date.slice(0, 10) : "",
			color_token: g.color_token
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
			color_token: form.color_token
		};
		try {
			if (editing) {
				await updateGoal.mutateAsync({
					id: editing.id,
					...payload
				});
				toast.success("Goal updated.");
			} else {
				await createGoal.mutateAsync({
					...payload,
					current_amount: 0
				});
				toast.success("Goal created.");
			}
			setFormOpen(false);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Couldn't save goal.");
		}
	}
	const [deleteTarget, setDeleteTarget] = (0, import_react.useState)(null);
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
	const [contribTarget, setContribTarget] = (0, import_react.useState)(null);
	const [contribAmount, setContribAmount] = (0, import_react.useState)("");
	async function submitContribution() {
		if (!contribTarget) return;
		const amount = Number(contribAmount);
		if (!amount || amount === 0) {
			toast.error("Enter a non-zero amount.");
			return;
		}
		const newAmount = Math.max(0, Number(contribTarget.current_amount) + amount);
		try {
			await updateProgress.mutateAsync({
				id: contribTarget.id,
				current_amount: newAmount
			});
			toast.success(amount > 0 ? "Contribution added." : "Amount withdrawn.");
			setContribTarget(null);
			setContribAmount("");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Couldn't update progress.");
		}
	}
	function GoalCalculator() {
		const [targetAmount, setTargetAmount] = (0, import_react.useState)(1e5);
		const [months, setMonths] = (0, import_react.useState)(12);
		const [expectedReturnRate, setExpectedReturnRate] = (0, import_react.useState)(7);
		const r = expectedReturnRate / 100 / 12;
		const monthlyDeposit = r > 0 ? targetAmount * r / (Math.pow(1 + r, Math.max(1, months)) - 1) : targetAmount / Math.max(1, months);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-8 rounded-xl border border-line bg-panel p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 font-display text-lg font-bold mb-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calculator, { className: "size-5 text-signal" }), " Goal Deposit Calculator"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-mute mb-5",
					children: "Estimate how much you need to save each month to hit your financial milestone."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "block text-xs text-mute mb-1",
							children: "Target Amount (₹)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							value: targetAmount,
							onChange: (e) => setTargetAmount(Number(e.target.value) || 0),
							className: "w-full rounded-lg border border-line bg-raise px-3 py-2 text-sm outline-none focus:border-signal"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "block text-xs text-mute mb-1",
							children: "Target Timeline (Months)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							value: months,
							onChange: (e) => setMonths(Number(e.target.value) || 1),
							className: "w-full rounded-lg border border-line bg-raise px-3 py-2 text-sm outline-none focus:border-signal"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "block text-xs text-mute mb-1",
							children: "Est. Annual Return (%)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							value: expectedReturnRate,
							onChange: (e) => setExpectedReturnRate(Number(e.target.value) || 0),
							className: "w-full rounded-lg border border-line bg-raise px-3 py-2 text-sm outline-none focus:border-signal"
						})] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 border-t border-line pt-4 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-mute font-mono",
						children: "Required Monthly Savings Deposit:"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-mono text-xl font-bold text-signal",
						children: [
							"₹",
							Math.round(monthlyDeposit).toLocaleString("en-IN"),
							" / month"
						]
					})]
				})
			]
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
			position: "top-right",
			theme: "dark"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-bold tracking-tight",
				children: "Savings goals"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-mute",
				children: "Track progress toward what you're saving for."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: openAdd,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 size-4" }), " New goal"]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoalCalculator, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
			children: [
				isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "col-span-full py-6 text-center text-sm text-mute",
					children: "Loading…"
				}),
				!isLoading && goals?.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "col-span-full flex flex-col items-center gap-3 py-10 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PiggyBank, { className: "size-8 text-mute" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-mute",
						children: "No savings goals yet — set one to start tracking progress."
					})]
				}),
				goals?.map((g) => {
					const pct = Number(g.target_amount) > 0 ? Math.min(100, Number(g.current_amount) / Number(g.target_amount) * 100) : 0;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "group rounded-xl border border-line bg-panel p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-display font-semibold",
									children: g.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-1 opacity-0 transition group-hover:opacity-100",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => openEdit(g),
										className: "rounded p-1 text-mute hover:bg-raise hover:text-ink",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-3.5" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setDeleteTarget(g),
										className: "rounded p-1 text-mute hover:bg-raise hover:text-danger-signal",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 font-mono text-xs text-mute",
								children: [
									"₹",
									Number(g.current_amount).toLocaleString("en-IN"),
									" of ₹",
									Number(g.target_amount).toLocaleString("en-IN")
								]
							}),
							g.target_date && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-0.5 text-[11px] text-mute",
								children: [
									"By",
									" ",
									new Date(g.target_date).toLocaleDateString("en-IN", {
										day: "2-digit",
										month: "short",
										year: "numeric"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 h-2 overflow-hidden rounded-full bg-raise",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-full bg-signal",
									style: { width: `${pct}%` }
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono text-[11px] text-mute",
									children: [pct.toFixed(0), "%"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => setContribTarget(g),
									children: "Log contribution"
								})]
							})
						]
					}, g.id);
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: formOpen,
			onOpenChange: setFormOpen,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editing ? "Edit goal" : "New savings goal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "What are you saving for?" })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "goal-name",
							children: "Name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "goal-name",
							value: form.name,
							onChange: (e) => setForm((f) => ({
								...f,
								name: e.target.value
							}))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "goal-target",
								children: "Target amount (₹)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "goal-target",
								type: "number",
								min: "0",
								step: "0.01",
								value: form.target_amount,
								onChange: (e) => setForm((f) => ({
									...f,
									target_amount: e.target.value
								}))
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "goal-date",
								children: "Target date (optional)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "goal-date",
								type: "date",
								value: form.target_date,
								onChange: (e) => setForm((f) => ({
									...f,
									target_date: e.target.value
								}))
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Color" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1.5 flex flex-wrap gap-2",
							children: COLOR_TOKENS.map((token) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setForm((f) => ({
									...f,
									color_token: token
								})),
								className: `size-7 rounded-full border-2 ${form.color_token === token ? "border-ink" : "border-transparent"}`,
								style: { backgroundColor: `var(--color-${token})` },
								title: token
							}, token))
						})] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => setFormOpen(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: submitForm,
					disabled: createGoal.isPending || updateGoal.isPending,
					children: editing ? "Save changes" : "Create goal"
				})] })
			] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: !!contribTarget,
			onOpenChange: (open) => !open && setContribTarget(null),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Log contribution — ", contribTarget?.name] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Positive to add, negative to withdraw." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "contrib-amount",
						children: "Amount (₹)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "contrib-amount",
						type: "number",
						step: "0.01",
						value: contribAmount,
						onChange: (e) => setContribAmount(e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => setContribTarget(null),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: submitContribution,
					disabled: updateProgress.isPending,
					children: "Save"
				})] })
			] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
			open: !!deleteTarget,
			onOpenChange: (open) => !open && setDeleteTarget(null),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Delete this goal?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [
				"\"",
				deleteTarget?.name,
				"\" and its progress will be permanently removed."
			] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
				onClick: confirmDelete,
				children: "Delete"
			})] })] })
		})
	] });
}
//#endregion
export { GoalsPage as component };
