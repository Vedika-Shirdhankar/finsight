import { a as __toESM } from "../_runtime.mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { C as Pencil, Z as CalendarClock, d as Trash2, et as Bell, x as Plus, y as Repeat } from "../_libs/lucide-react.mjs";
import { n as useAuth } from "./keys-C2024mUc.mjs";
import { t as useCategories } from "./use-categories-BSfFvBVL.mjs";
import { r as cn, t as Button } from "./button-PwNqyxv_.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, d as DialogDescription, f as DialogFooter, g as Label, h as Input, i as AlertDialogContent, l as Dialog, m as DialogTitle, n as AlertDialogAction, o as AlertDialogFooter, p as DialogHeader, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog, u as DialogContent } from "./alert-dialog-BVw1Eoof.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-DamjaduW.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { t as useAccounts } from "./use-accounts-BXpHOKmP.mjs";
import { c as useRecurringTransactions, l as useUpdateRecurringTransaction, n as useDeleteRecurringTransaction, s as useRecurringTransactionSync, t as useCreateRecurringTransaction } from "./use-recurring-transactions-D7kKxQUO.mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/radix-ui__react-switch.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/recurring-BQdkesQF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Switch = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
	className: cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className),
	...props,
	ref,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: cn("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0") })
}));
Switch.displayName = Switch$1.displayName;
var EMPTY_FORM = {
	merchant: "",
	amount: "",
	type: "expense",
	category_id: "",
	account_id: "",
	payment_method: "UPI",
	frequency: "monthly",
	next_due_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
	remind_days_before: "3",
	description: ""
};
function daysUntil(date) {
	const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	return Math.round(((/* @__PURE__ */ new Date(date + "T00:00:00")).getTime() - (/* @__PURE__ */ new Date(today + "T00:00:00")).getTime()) / 864e5);
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
	const [formOpen, setFormOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)(EMPTY_FORM);
	const [deleteTarget, setDeleteTarget] = (0, import_react.useState)(null);
	function openAdd() {
		setEditing(null);
		setForm(EMPTY_FORM);
		setFormOpen(true);
	}
	function openEdit(item) {
		setEditing(item);
		setForm({
			merchant: item.merchant,
			amount: String(item.amount),
			type: item.type,
			category_id: item.category_id ?? "",
			account_id: item.account_id ?? "",
			payment_method: item.payment_method,
			frequency: item.frequency,
			next_due_date: item.next_due_date,
			remind_days_before: String(item.remind_days_before),
			description: item.description ?? ""
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
			description: form.description || null
		};
		try {
			if (editing) {
				await updateItem.mutateAsync({
					id: editing.id,
					...payload
				});
				toast.success("Recurring item updated.");
			} else {
				await createItem.mutateAsync({
					...payload,
					is_active: true
				});
				toast.success("Recurring item created.");
			}
			setFormOpen(false);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Couldn't save recurring item.");
		}
	}
	async function toggleActive(item) {
		try {
			await updateItem.mutateAsync({
				id: item.id,
				is_active: !item.is_active
			});
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, { position: "top-right" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-xl font-bold",
					children: "Recurring & bills"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-mute",
					children: "Subscriptions and bills that repeat on a schedule."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: openAdd,
					className: "w-full sm:w-auto",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1.5 size-3.5" }), " Add recurring item"]
				})]
			}),
			upcoming.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-warning-signal/30 bg-warning-signal/5 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-2 flex items-center gap-2 text-sm font-semibold text-ink",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4 text-warning-signal" }), " Due soon"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-1.5",
					children: upcoming.map((item) => {
						const diff = daysUntil(item.next_due_date);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-mute",
								children: [
									item.merchant,
									" — ₹",
									Number(item.amount).toLocaleString("en-IN")
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-[10px] text-mute",
								children: diff === 0 ? "Due today" : diff === 1 ? "Due tomorrow" : `Due in ${diff} days`
							})]
						}, item.id);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto rounded-lg border border-line bg-raise",
				children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-8 text-center text-xs text-mute",
					children: "Loading…"
				}) : !recurring || recurring.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-10 text-center text-xs text-mute",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Repeat, { className: "mx-auto mb-2 size-5 text-mute" }), "No recurring items yet. Add a subscription or bill to get reminders before it's due."]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[680px] text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-line text-left text-[10px] font-mono uppercase tracking-wide text-mute",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-5 py-3",
								children: "Merchant"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-5 py-3",
								children: "Amount"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-5 py-3",
								children: "Frequency"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-5 py-3",
								children: "Next due"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-5 py-3",
								children: "Active"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-5 py-3 text-right",
								children: "Actions"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: recurring.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-line last:border-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-5 py-3 font-medium",
								children: item.merchant
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-5 py-3 text-mute",
								children: ["₹", Number(item.amount).toLocaleString("en-IN")]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-5 py-3 text-mute capitalize",
								children: item.frequency
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-5 py-3 text-mute",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, { className: "size-3.5" }), (/* @__PURE__ */ new Date(item.next_due_date + "T00:00:00")).toLocaleDateString("en-IN", {
										day: "numeric",
										month: "short",
										year: "numeric"
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-5 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
									checked: item.is_active,
									onCheckedChange: () => toggleActive(item)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-5 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-end gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "icon",
										className: "size-7",
										onClick: () => openEdit(item),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-3.5" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "icon",
										className: "size-7",
										onClick: () => setDeleteTarget(item),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5 text-danger-signal" })
									})]
								})
							})
						]
					}, item.id)) })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: formOpen,
				onOpenChange: setFormOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-h-[calc(100dvh-2rem)] overflow-y-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editing ? "Edit recurring item" : "Add recurring item" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "This will post a transaction automatically and remind you before it's due." })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 py-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-3 sm:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "merchant",
										children: "Merchant"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "merchant",
										value: form.merchant,
										onChange: (e) => setForm((f) => ({
											...f,
											merchant: e.target.value
										}))
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "amount",
										children: "Amount (₹)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "amount",
										type: "number",
										min: "0",
										step: "0.01",
										value: form.amount,
										onChange: (e) => setForm((f) => ({
											...f,
											amount: e.target.value
										}))
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-3 sm:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Type" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.type,
										onValueChange: (v) => setForm((f) => ({
											...f,
											type: v
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "income",
												children: "Income"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "expense",
												children: "Expense"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "transfer",
												children: "Transfer"
											})
										] })]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Category" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.category_id || "none",
										onValueChange: (v) => setForm((f) => ({
											...f,
											category_id: v === "none" ? "" : v
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "None" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "none",
											children: "None"
										}), categories?.filter((c) => c.kind === form.type).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: c.id,
											children: c.name
										}, c.id))] })]
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-3 sm:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Account" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.account_id || "none",
										onValueChange: (v) => setForm((f) => ({
											...f,
											account_id: v === "none" ? "" : v
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "None" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "none",
											children: "None"
										}), accounts?.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: a.id,
											children: a.name
										}, a.id))] })]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "method",
										children: "Payment method"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "method",
										value: form.payment_method,
										onChange: (e) => setForm((f) => ({
											...f,
											payment_method: e.target.value
										}))
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-3 sm:grid-cols-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Frequency" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: form.frequency,
											onValueChange: (v) => setForm((f) => ({
												...f,
												frequency: v
											})),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "weekly",
													children: "Weekly"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "biweekly",
													children: "Biweekly"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "monthly",
													children: "Monthly"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "yearly",
													children: "Yearly"
												})
											] })]
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "next-due",
											children: "Next due date"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "next-due",
											type: "date",
											value: form.next_due_date,
											onChange: (e) => setForm((f) => ({
												...f,
												next_due_date: e.target.value
											}))
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "remind",
											children: "Remind (days before)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "remind",
											type: "number",
											min: "0",
											max: "30",
											value: form.remind_days_before,
											onChange: (e) => setForm((f) => ({
												...f,
												remind_days_before: e.target.value
											}))
										})] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "description",
									children: "Description (optional)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "description",
									value: form.description,
									onChange: (e) => setForm((f) => ({
										...f,
										description: e.target.value
									}))
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setFormOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: submitForm,
							disabled: createItem.isPending || updateItem.isPending,
							children: editing ? "Save changes" : "Create"
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: !!deleteTarget,
				onOpenChange: (open) => !open && setDeleteTarget(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Delete recurring item?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [
					"This stops future transactions and reminders for \"",
					deleteTarget?.merchant,
					"\". Past transactions already posted won't be affected."
				] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					onClick: confirmDelete,
					children: "Delete"
				})] })] })
			})
		]
	});
}
//#endregion
export { RecurringPage as component };
