import { a as __toESM } from "../_runtime.mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-PdxCd9pa.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { i as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { C as Pencil, G as ChevronLeft, L as Download, M as Funnel, W as ChevronRight, _ as Search, d as Trash2, s as Upload, t as X, x as Plus } from "../_libs/lucide-react.mjs";
import { n as useAuth } from "./keys-C2024mUc.mjs";
import { t as useCategories } from "./use-categories-BSfFvBVL.mjs";
import { i as useUpdateTransaction, n as useDeleteTransaction, r as useTransactions, t as useCreateTransaction } from "./use-transactions-Bc0pgBXv.mjs";
import { t as Button } from "./button-PwNqyxv_.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, d as DialogDescription, f as DialogFooter, g as Label, h as Input, i as AlertDialogContent, l as Dialog, m as DialogTitle, n as AlertDialogAction, o as AlertDialogFooter, p as DialogHeader, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog, u as DialogContent } from "./alert-dialog-BVw1Eoof.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-DamjaduW.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { t as useAccounts } from "./use-accounts-BXpHOKmP.mjs";
import { t as useAccountMembers } from "./use-account-members-8yCSN_Z-.mjs";
import { t as require_papaparse } from "../_libs/papaparse.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/transactions-jG0QkCrc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_papaparse = /* @__PURE__ */ __toESM(require_papaparse());
var MAPPABLE_FIELDS = [
	{
		field: "date",
		label: "Transaction date",
		required: true
	},
	{
		field: "amount",
		label: "Amount",
		required: true
	},
	{
		field: "merchant",
		label: "Merchant",
		required: false
	},
	{
		field: "description",
		label: "Description",
		required: false
	},
	{
		field: "type",
		label: "Type (income/expense/transfer)",
		required: false
	},
	{
		field: "category",
		label: "Category name",
		required: false
	},
	{
		field: "payment_method",
		label: "Payment method",
		required: false
	}
];
/** Parses a CSV File in-browser. Rejects on a hard parse failure; per-row errors are returned separately. */
function parseCsvFile(file) {
	return new Promise((resolve, reject) => {
		import_papaparse.default.parse(file, {
			header: true,
			skipEmptyLines: true,
			complete: (results) => {
				resolve({
					headers: results.meta.fields ?? [],
					rows: results.data
				});
			},
			error: (err) => reject(err)
		});
	});
}
function normalizeAmount(raw) {
	const cleaned = raw.replace(/[^0-9.-]/g, "");
	if (!cleaned) return null;
	const value = Number(cleaned);
	return Number.isFinite(value) ? Math.abs(value) : null;
}
function normalizeDate(raw) {
	const d = new Date(raw);
	if (Number.isNaN(d.getTime())) return null;
	return d.toISOString();
}
function normalizeType(raw, amountSign) {
	const v = raw?.trim().toLowerCase();
	if (v === "income" || v === "expense" || v === "transfer") return v;
	return amountSign < 0 ? "expense" : "expense";
}
/**
* Applies a column mapping to parsed rows and validates each one. Rows that
* fail validation are still returned (with `error` set) so the preview step
* can show the user exactly what will be skipped.
*
* `categoryNameToId` lets the caller resolve a free-text category column to
* an existing category_id (case-insensitive match); unmatched names are left
* uncategorized rather than failing the row.
*/
function mapCsvRows(parsed, mapping, categoryNameToId = {}) {
	return parsed.rows.map((raw, rowIndex) => {
		const dateCol = mapping.date ? raw[mapping.date] : void 0;
		const amountCol = mapping.amount ? raw[mapping.amount] : void 0;
		if (!dateCol || !amountCol) return {
			rowIndex,
			transaction: null,
			error: "Missing date or amount",
			raw
		};
		const date = normalizeDate(dateCol);
		const amount = normalizeAmount(amountCol);
		if (!date) return {
			rowIndex,
			transaction: null,
			error: `Unrecognized date: "${dateCol}"`,
			raw
		};
		if (amount === null) return {
			rowIndex,
			transaction: null,
			error: `Unrecognized amount: "${amountCol}"`,
			raw
		};
		const rawAmountSign = Number(amountCol.replace(/[^0-9.-]/g, "")) || 0;
		const typeCol = mapping.type ? raw[mapping.type] : void 0;
		const categoryCol = mapping.category ? raw[mapping.category] : void 0;
		const categoryId = categoryCol ? categoryNameToId[categoryCol.trim().toLowerCase()] : void 0;
		return {
			rowIndex,
			transaction: {
				transaction_date: date,
				amount,
				type: normalizeType(typeCol, rawAmountSign),
				merchant: mapping.merchant ? raw[mapping.merchant] || null : null,
				description: mapping.description ? raw[mapping.description] || null : null,
				payment_method: mapping.payment_method ? raw[mapping.payment_method] || "unknown" : "unknown",
				category_id: categoryId ?? null,
				status: "completed"
			},
			error: null,
			raw
		};
	});
}
/** Bulk-inserts the valid (non-errored) mapped rows for the given user. Returns the count inserted. */
async function bulkInsertTransactions(userId, rows) {
	const toInsert = rows.filter((r) => r.transaction !== null).map((r) => ({
		...r.transaction,
		user_id: userId
	}));
	if (toInsert.length === 0) return 0;
	const { error, count } = await supabase.from("transactions").insert(toInsert, { count: "exact" });
	if (error) throw error;
	return count ?? toInsert.length;
}
function SplitTransactionDialog({ accountId, amount, open, onClose, onSave }) {
	const { data: members } = useAccountMembers(accountId);
	const [selected, setSelected] = (0, import_react.useState)([]);
	const [values, setValues] = (0, import_react.useState)({});
	(0, import_react.useEffect)(() => {
		if (open) {
			const ids = members?.filter((member) => member.status === "accepted").map((member) => member.id) ?? [];
			setSelected(ids);
			const equal = ids.length ? (amount / ids.length).toFixed(2) : "";
			setValues(Object.fromEntries(ids.map((id) => [id, equal])));
		}
	}, [
		open,
		members,
		amount
	]);
	if (!open) return null;
	const total = selected.reduce((sum, id) => sum + (Number(values[id]) || 0), 0);
	const valid = selected.length > 0 && Math.abs(total - amount) < .01;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-xl border border-line bg-panel p-6 shadow-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-bold",
					children: "Split transaction"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-xs text-mute",
					children: [
						"Allocate ₹",
						amount.toLocaleString("en-IN"),
						" across accepted account members."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 space-y-3",
					children: members?.filter((member) => member.status === "accepted").map((member) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-3 rounded-lg border border-line bg-raise p-3 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: selected.includes(member.id),
								onChange: (event) => setSelected((ids) => event.target.checked ? [...ids, member.id] : ids.filter((id) => id !== member.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex-1",
								children: member.invited_email
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								disabled: !selected.includes(member.id),
								type: "number",
								min: "0",
								step: "0.01",
								value: values[member.id] ?? "",
								onChange: (event) => setValues((current) => ({
									...current,
									[member.id]: event.target.value
								})),
								className: "w-28 rounded border border-line bg-panel px-2 py-1 text-right font-mono text-xs"
							})
						]
					}, member.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `mt-3 text-xs ${valid ? "text-signal" : "text-warning-signal"}`,
					children: [
						"Allocated: ₹",
						total.toLocaleString("en-IN"),
						" / ₹",
						amount.toLocaleString("en-IN")
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex justify-end gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "rounded-lg border border-line px-4 py-2 text-xs text-mute",
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						disabled: !valid,
						onClick: () => {
							onSave(selected.map((id) => ({
								account_member_id: id,
								share_amount: Number(values[id]),
								share_percent: amount ? Number(values[id]) / amount * 100 : null
							})));
							onClose();
						},
						className: "fs-clip bg-signal px-4 py-2 text-xs font-medium text-signal-foreground disabled:opacity-50",
						children: "Save split"
					})]
				})
			]
		})
	});
}
var PAGE_SIZE = 15;
var EMPTY_FORM = {
	transaction_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
	amount: "",
	type: "expense",
	merchant: "",
	description: "",
	category_id: "",
	account_id: "",
	payment_method: "card"
};
function TransactionsPage() {
	const { userId } = useAuth();
	const queryClient = useQueryClient();
	const [search, setSearch] = (0, import_react.useState)("");
	const [typeFilter, setTypeFilter] = (0, import_react.useState)("all");
	const [categoryFilter, setCategoryFilter] = (0, import_react.useState)("all");
	const [accountFilter, setAccountFilter] = (0, import_react.useState)("all");
	const [fromDate, setFromDate] = (0, import_react.useState)("");
	const [toDate, setToDate] = (0, import_react.useState)("");
	const [page, setPage] = (0, import_react.useState)(1);
	const filters = (0, import_react.useMemo)(() => {
		const f = {};
		if (search) f.search = search;
		if (typeFilter !== "all") f.type = typeFilter;
		if (categoryFilter !== "all") f.categoryId = categoryFilter;
		if (accountFilter !== "all") f.accountId = accountFilter;
		if (fromDate) f.from = fromDate;
		if (toDate) f.to = toDate;
		return f;
	}, [
		search,
		typeFilter,
		categoryFilter,
		accountFilter,
		fromDate,
		toDate
	]);
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
	const [formOpen, setFormOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)(EMPTY_FORM);
	const [splitOpen, setSplitOpen] = (0, import_react.useState)(false);
	const [splits, setSplits] = (0, import_react.useState)([]);
	function openAdd() {
		setEditing(null);
		setForm(EMPTY_FORM);
		setSplits([]);
		setFormOpen(true);
	}
	function openEdit(t) {
		setEditing(t);
		setForm({
			transaction_date: t.transaction_date.slice(0, 10),
			amount: String(t.amount),
			type: t.type,
			merchant: t.merchant ?? "",
			description: t.description ?? "",
			category_id: t.category_id ?? "",
			account_id: t.account_id ?? "",
			payment_method: t.payment_method
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
			status: "completed"
		};
		try {
			if (editing) {
				await updateTxn.mutateAsync({
					id: editing.id,
					...payload
				});
				toast.success("Transaction updated.");
			} else {
				await createTxn.mutateAsync({
					...payload,
					splits
				});
				toast.success("Transaction added.");
			}
			setFormOpen(false);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Something went wrong.");
		}
	}
	const [deleteTarget, setDeleteTarget] = (0, import_react.useState)(null);
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
	const [csvOpen, setCsvOpen] = (0, import_react.useState)(false);
	const [csvStep, setCsvStep] = (0, import_react.useState)("select");
	const [parsedCsv, setParsedCsv] = (0, import_react.useState)(null);
	const [mapping, setMapping] = (0, import_react.useState)({});
	const [mappedRows, setMappedRows] = (0, import_react.useState)([]);
	const [importing, setImporting] = (0, import_react.useState)(false);
	function resetCsv() {
		setCsvStep("select");
		setParsedCsv(null);
		setMapping({});
		setMappedRows([]);
	}
	async function handleCsvFile(file) {
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
		const categoryNameToId = Object.fromEntries((categories ?? []).map((c) => [c.name.trim().toLowerCase(), c.id]));
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
			"Description"
		];
		const rows = transactions.map((t) => [
			new Date(t.transaction_date).toISOString().slice(0, 10),
			t.type,
			`"${(t.merchant || "").replace(/"/g, "\"\"")}"`,
			t.amount,
			t.status,
			t.payment_method,
			`"${(t.description || "").replace(/"/g, "\"\"")}"`
		]);
		const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.setAttribute("href", url);
		link.setAttribute("download", `finsight_transactions_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		toast.success("Transactions exported to CSV!");
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
				children: "Transactions"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-mute",
				children: "All your income and expenses in one place."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 gap-2 sm:flex sm:flex-wrap",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						onClick: exportToCsv,
						className: "w-full sm:w-auto",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-2 size-4" }), " Export CSV"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						onClick: () => setCsvOpen(true),
						className: "w-full sm:w-auto",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "mr-2 size-4" }), " Import CSV"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: openAdd,
						className: "w-full sm:w-auto",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 size-4" }), " Add transaction"]
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 grid grid-cols-1 gap-2 rounded-xl border border-line bg-panel p-3 sm:flex sm:flex-wrap sm:items-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative w-full sm:min-w-[180px] sm:flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-mute" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: search,
						onChange: (e) => {
							setSearch(e.target.value);
							setPage(1);
						},
						placeholder: "Search merchant…",
						className: "pl-8"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: typeFilter,
					onValueChange: (v) => {
						setTypeFilter(v);
						setPage(1);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "w-full sm:w-[130px]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Type" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "all",
							children: "All types"
						}),
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
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: categoryFilter,
					onValueChange: (v) => {
						setCategoryFilter(v);
						setPage(1);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "w-full sm:w-[150px]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Category" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "all",
						children: "All categories"
					}), categories?.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: c.id,
						children: c.name
					}, c.id))] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: accountFilter,
					onValueChange: (v) => {
						setAccountFilter(v);
						setPage(1);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "w-full sm:w-[150px]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Account" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "all",
						children: "All accounts"
					}), accounts?.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: a.id,
						children: a.name
					}, a.id))] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "date",
					value: fromDate,
					onChange: (e) => {
						setFromDate(e.target.value);
						setPage(1);
					},
					className: "w-full sm:w-[150px]"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "hidden text-xs text-mute sm:inline",
					children: "to"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "date",
					value: toDate,
					onChange: (e) => {
						setToDate(e.target.value);
						setPage(1);
					},
					className: "w-full sm:w-[150px]"
				}),
				(search || typeFilter !== "all" || categoryFilter !== "all" || accountFilter !== "all" || fromDate || toDate) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: resetFilters,
					className: "text-mute",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "mr-1 size-3.5" }), " Clear"]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "overflow-x-auto rounded-xl border border-line bg-panel",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[680px] text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-line text-left text-[10px] font-mono uppercase tracking-[0.12em] text-mute",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-5 py-3",
							children: "Merchant"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-5 py-3",
							children: "Date"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-5 py-3",
							children: "Method"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-5 py-3",
							children: "Status"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-5 py-3 text-right",
							children: "Amount"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-5 py-3 text-right",
							children: "Actions"
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", {
					className: "divide-y divide-line",
					children: [
						isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 6,
							className: "px-5 py-6 text-center text-mute",
							children: "Loading…"
						}) }),
						!isLoading && pageItems.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 6,
							className: "px-5 py-6 text-center text-mute",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: "size-3.5" }), " No transactions match your filters."]
							})
						}) }),
						pageItems.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "group",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3",
									children: t.merchant ?? t.description ?? "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3 font-mono text-xs text-mute",
									children: new Date(t.transaction_date).toLocaleDateString("en-IN")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3 text-xs text-mute",
									children: t.payment_method
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3 text-xs text-mute capitalize",
									children: t.status
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: `px-5 py-3 text-right font-mono font-semibold ${t.type === "income" ? "text-signal" : "text-ink"}`,
									children: [
										t.type === "income" ? "+" : "−",
										"₹",
										Number(t.amount).toLocaleString("en-IN")
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-end gap-1 transition sm:opacity-0 sm:group-hover:opacity-100",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => openEdit(t),
											className: "rounded p-1.5 text-mute hover:bg-raise hover:text-ink",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-3.5" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => setDeleteTarget(t),
											className: "rounded p-1.5 text-mute hover:bg-raise hover:text-danger-signal",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
										})]
									})
								})
							]
						}, t.id))
					]
				})]
			}), totalPages > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between border-t border-line px-5 py-3 text-xs text-mute",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					"Page ",
					page,
					" of ",
					totalPages
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						disabled: page <= 1,
						onClick: () => setPage((p) => p - 1),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-3.5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						disabled: page >= totalPages,
						onClick: () => setPage((p) => p + 1),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3.5" })
					})]
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: formOpen,
			onOpenChange: setFormOpen,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				className: "max-h-[calc(100dvh-2rem)] overflow-y-auto",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editing ? "Edit transaction" : "Add transaction" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Enter the details of this transaction." })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 py-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "date",
									children: "Date"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "date",
									type: "date",
									value: form.transaction_date,
									onChange: (e) => setForm((f) => ({
										...f,
										transaction_date: e.target.value
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
							!editing && form.account_id && Number(form.amount) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between rounded-lg border border-line bg-raise p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-medium",
									children: "Split transaction"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-mute",
									children: splits.length ? `${splits.length} member shares ready` : "Divide this expense across members"
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "outline",
									size: "sm",
									onClick: () => setSplitOpen(true),
									children: splits.length ? "Edit split" : "Add split"
								})]
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
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Account" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
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
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "method",
									children: "Payment method"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "method",
									value: form.payment_method,
									onChange: (e) => setForm((f) => ({
										...f,
										payment_method: e.target.value
									}))
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "description",
									children: "Description"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "description",
									value: form.description,
									onChange: (e) => setForm((f) => ({
										...f,
										description: e.target.value
									}))
								})] })]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => setFormOpen(false),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: submitForm,
						disabled: createTxn.isPending || updateTxn.isPending,
						children: editing ? "Save changes" : "Add transaction"
					})] })
				]
			})
		}),
		form.account_id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SplitTransactionDialog, {
			accountId: form.account_id,
			amount: Number(form.amount) || 0,
			open: splitOpen,
			onClose: () => setSplitOpen(false),
			onSave: setSplits
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
			open: !!deleteTarget,
			onOpenChange: (open) => !open && setDeleteTarget(null),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Delete this transaction?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [
				"This can't be undone.",
				" ",
				deleteTarget?.merchant ? `"${deleteTarget.merchant}"` : "This transaction",
				" will be permanently removed."
			] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
				onClick: confirmDelete,
				children: "Delete"
			})] })] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: csvOpen,
			onOpenChange: (open) => {
				setCsvOpen(open);
				if (!open) resetCsv();
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				className: "max-h-[calc(100dvh-2rem)] max-w-2xl overflow-y-auto",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Import transactions from CSV" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
						csvStep === "select" && "Choose a CSV file exported from your bank or another app.",
						csvStep === "map" && "Match each CSV column to a transaction field.",
						csvStep === "preview" && "Review before importing."
					] })] }),
					csvStep === "select" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "py-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "file",
							accept: ".csv",
							onChange: (e) => e.target.files?.[0] && handleCsvFile(e.target.files[0])
						})
					}),
					csvStep === "map" && parsedCsv && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid max-h-[50vh] gap-3 overflow-y-auto py-2",
						children: MAPPABLE_FIELDS.map(({ field, label, required }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2 sm:grid-cols-2 sm:items-center sm:gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: [label, required && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-danger-signal",
								children: " *"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: mapping[field] ?? "none",
								onValueChange: (v) => setMapping((m) => ({
									...m,
									[field]: v === "none" ? void 0 : v
								})),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Not mapped" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "none",
									children: "Not mapped"
								}), parsedCsv.headers.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: h,
									children: h
								}, h))] })]
							})]
						}, field))
					}),
					csvStep === "preview" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-3 flex gap-4 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-signal",
								children: [validCount, " ready to import"]
							}), errorCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-danger-signal",
								children: [errorCount, " will be skipped"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "max-h-[40vh] overflow-y-auto rounded-lg border border-line",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full min-w-[480px] text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-line text-left text-mute",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-3 py-2",
											children: "Date"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-3 py-2",
											children: "Merchant"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-3 py-2 text-right",
											children: "Amount"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-3 py-2",
											children: "Status"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
									className: "divide-y divide-line",
									children: mappedRows.slice(0, 50).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-1.5 font-mono",
											children: r.transaction?.transaction_date?.slice(0, 10) ?? "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-1.5",
											children: r.transaction?.merchant ?? "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-1.5 text-right font-mono",
											children: r.transaction ? `₹${r.transaction.amount}` : "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: `px-3 py-1.5 ${r.error ? "text-danger-signal" : "text-signal"}`,
											children: r.error ?? "OK"
										})
									] }, r.rowIndex))
								})]
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [csvStep === "map" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: goToPreview,
						disabled: !dateMapped || !amountMapped,
						children: "Preview import"
					}), csvStep === "preview" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: confirmImport,
						disabled: importing || validCount === 0,
						children: importing ? "Importing…" : `Import ${validCount} transactions`
					})] })
				]
			})
		})
	] });
}
//#endregion
export { TransactionsPage as component };
