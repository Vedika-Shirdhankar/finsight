import { a as __toESM } from "../_runtime.mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { H as CircleCheck, P as FileDown, b as Radar, c as TriangleAlert, k as Lightbulb, l as TrendingUp, p as Sparkles, u as TrendingDown } from "../_libs/lucide-react.mjs";
import { a as XAxis, c as Bar, d as ResponsiveContainer, f as Tooltip, i as YAxis, l as Pie, n as PieChart, o as Line, s as CartesianGrid, t as ComposedChart, u as Cell } from "../_libs/recharts+[...].mjs";
import { n as useAuth } from "./keys-C2024mUc.mjs";
import { t as useCategories } from "./use-categories-BSfFvBVL.mjs";
import { n as useBudget } from "./use-budgets-B4foJmW9.mjs";
import { r as useTransactions } from "./use-transactions-Bc0pgBXv.mjs";
import { t as Button } from "./button-PwNqyxv_.mjs";
import { t as useAccounts } from "./use-accounts-BXpHOKmP.mjs";
import { n as forecastNextMonthSpend, t as detectAnomalies } from "./analytics-BcG96liB.mjs";
import { t as E } from "../_libs/jspdf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/insights-Dhf1bM1V.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Lightweight table renderer so this report does not require jspdf-autotable. */
function autoTable(doc, options) {
	const width = doc.internal.pageSize.getWidth() - options.margin.left - options.margin.right;
	const padding = options.styles?.cellPadding ?? 5;
	const fontSize = options.styles?.fontSize ?? 10;
	const rows = [...options.head, ...options.body];
	const columnWidth = width / Math.max(...rows.map((row) => row.length), 1);
	const rowHeight = fontSize + padding * 2;
	let y = options.startY;
	rows.forEach((row, rowIndex) => {
		const isHeader = rowIndex === 0;
		if (isHeader) {
			const color = options.headStyles?.fillColor ?? [
				23,
				23,
				23
			];
			doc.setFillColor(...color);
			doc.setTextColor(255);
		} else {
			doc.setFillColor(rowIndex % 2 === 0 ? 245 : 255, rowIndex % 2 === 0 ? 245 : 255, rowIndex % 2 === 0 ? 245 : 255);
			doc.setTextColor(0);
		}
		doc.rect(options.margin.left, y, width, rowHeight, "F");
		doc.setFont("helvetica", isHeader ? "bold" : "normal");
		doc.setFontSize(fontSize);
		row.forEach((value, columnIndex) => {
			const x = options.margin.left + columnIndex * columnWidth;
			doc.setDrawColor(210);
			doc.rect(x, y, columnWidth, rowHeight);
			doc.text(String(value), x + padding, y + fontSize + padding - 1, { maxWidth: columnWidth - padding * 2 });
		});
		y += rowHeight;
	});
	doc.setTextColor(0);
	doc.lastAutoTable = { finalY: y };
}
function fmt(n, currencySymbol) {
	return `${currencySymbol}${Math.round(n).toLocaleString("en-IN")}`;
}
/**
* Builds a one-page-ish monthly summary PDF from data the Insights page has
* already computed (real numbers, not a template) and triggers a download.
* Kept intentionally simple — a text/table report, not a pixel-perfect
* design — so it stays easy to extend later.
*/
function generateMonthlySummaryPdf(input) {
	const currency = input.currencySymbol ?? "₹";
	const doc = new E({
		unit: "pt",
		format: "a4"
	});
	const marginX = 40;
	let y = 50;
	doc.setFont("helvetica", "bold");
	doc.setFontSize(18);
	doc.text("FinSight — Monthly Summary", marginX, y);
	y += 22;
	doc.setFont("helvetica", "normal");
	doc.setFontSize(11);
	doc.setTextColor(90);
	doc.text(input.monthLabel, marginX, y);
	doc.setTextColor(0);
	y += 30;
	const net = input.income - input.expenses;
	const kpis = [
		["Total income", fmt(input.income, currency)],
		["Total expenses", fmt(input.expenses, currency)],
		["Net savings", fmt(net, currency)],
		["Transactions", String(input.transactionCount)]
	];
	autoTable(doc, {
		startY: y,
		margin: {
			left: marginX,
			right: marginX
		},
		head: [["Metric", "Value"]],
		body: kpis,
		theme: "grid",
		headStyles: { fillColor: [
			23,
			23,
			23
		] },
		styles: {
			fontSize: 10,
			cellPadding: 6
		}
	});
	y = doc.lastAutoTable.finalY + 24;
	if (input.categoryBreakdown.length > 0) {
		doc.setFont("helvetica", "bold");
		doc.setFontSize(13);
		doc.text("Spending by category", marginX, y);
		y += 8;
		const totalCategorized = input.categoryBreakdown.reduce((s, c) => s + c.value, 0);
		autoTable(doc, {
			startY: y + 6,
			margin: {
				left: marginX,
				right: marginX
			},
			head: [[
				"Category",
				"Amount",
				"% of total"
			]],
			body: input.categoryBreakdown.map((c) => [
				c.name,
				fmt(c.value, currency),
				totalCategorized > 0 ? `${(c.value / totalCategorized * 100).toFixed(1)}%` : "—"
			]),
			theme: "striped",
			headStyles: { fillColor: [
				23,
				23,
				23
			] },
			styles: {
				fontSize: 10,
				cellPadding: 5
			}
		});
		y = doc.lastAutoTable.finalY + 24;
	}
	if (input.budgetCategories.length > 0) {
		if (y > 650) {
			doc.addPage();
			y = 50;
		}
		doc.setFont("helvetica", "bold");
		doc.setFontSize(13);
		doc.text("Budget status", marginX, y);
		y += 8;
		autoTable(doc, {
			startY: y + 6,
			margin: {
				left: marginX,
				right: marginX
			},
			head: [[
				"Category",
				"Spent",
				"Limit",
				"Used"
			]],
			body: input.budgetCategories.map((b) => [
				b.name,
				fmt(b.spent, currency),
				fmt(b.limit, currency),
				b.limit > 0 ? `${Math.round(b.spent / b.limit * 100)}%` : "—"
			]),
			theme: "striped",
			headStyles: { fillColor: [
				23,
				23,
				23
			] },
			styles: {
				fontSize: 10,
				cellPadding: 5
			}
		});
		y = doc.lastAutoTable.finalY + 24;
	}
	if (y > 650) {
		doc.addPage();
		y = 50;
	}
	doc.setFont("helvetica", "bold");
	doc.setFontSize(13);
	doc.text("Unusual transactions", marginX, y);
	y += 8;
	if (input.anomalies.length > 0) {
		autoTable(doc, {
			startY: y + 6,
			margin: {
				left: marginX,
				right: marginX
			},
			head: [[
				"Merchant",
				"Category",
				"Amount",
				"Std. deviations above usual"
			]],
			body: input.anomalies.slice(0, 10).map((a) => [
				a.merchant,
				a.category,
				fmt(a.amount, currency),
				`${a.zScore.toFixed(1)}σ`
			]),
			theme: "striped",
			headStyles: { fillColor: [
				23,
				23,
				23
			] },
			styles: {
				fontSize: 10,
				cellPadding: 5
			}
		});
		y = doc.lastAutoTable.finalY + 24;
	} else {
		doc.setFont("helvetica", "normal");
		doc.setFontSize(10);
		doc.text("No transactions stood out as unusual this period.", marginX, y + 16);
		y += 34;
	}
	if (y > 700) {
		doc.addPage();
		y = 50;
	}
	doc.setFont("helvetica", "bold");
	doc.setFontSize(13);
	doc.text("Next month forecast", marginX, y);
	y += 18;
	doc.setFont("helvetica", "normal");
	doc.setFontSize(10);
	doc.text(input.forecast.hasEnoughData ? `Projected spend: ${fmt(input.forecast.projectedNextMonth, currency)} (${input.forecast.trendPct >= 0 ? "+" : ""}${input.forecast.trendPct.toFixed(1)}% vs last month), based on a trailing moving average.` : "Not enough monthly history yet for a reliable forecast.", marginX, y, { maxWidth: 515 });
	const filename = `finsight_summary_${input.monthLabel.replace(/\s+/g, "_").toLowerCase()}.pdf`;
	doc.save(filename);
}
function InsightsPage() {
	const { userId } = useAuth();
	const [timeRange, setTimeRange] = (0, import_react.useState)("30d");
	const { data: txns, isLoading } = useTransactions(userId, {});
	const { data: accounts } = useAccounts(userId);
	const { data: categories } = useCategories(userId);
	const { data: budget } = useBudget(userId);
	const transactions = txns || [];
	const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
	const expenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
	const totalVolume = income + expenses;
	const avgTxnValue = transactions.length > 0 ? totalVolume / transactions.length : 0;
	const categoryNameById = new Map((categories ?? []).map((c) => [c.id, c.name]));
	const categoryMap = {};
	transactions.filter((t) => t.type === "expense").forEach((t) => {
		const cat = t.category_id ? categoryNameById.get(t.category_id) ?? "Uncategorized" : "Uncategorized";
		categoryMap[cat] = (categoryMap[cat] || 0) + Number(t.amount);
	});
	const categoryData = Object.entries(categoryMap).map(([name, value]) => ({
		name,
		value
	})).sort((a, b) => b.value - a.value).slice(0, 6);
	const COLORS = [
		"#10b981",
		"#3b82f6",
		"#f59e0b",
		"#ef4444",
		"#8b5cf6",
		"#06b6d4"
	];
	const trendMap = {};
	transactions.forEach((t) => {
		const d = new Date(t.transaction_date);
		const key = t.transaction_date.slice(0, 7);
		const month = d.toLocaleString("default", { month: "short" });
		if (!trendMap[key]) trendMap[key] = {
			key,
			month,
			income: 0,
			expense: 0
		};
		if (t.type === "income") trendMap[key].income += Number(t.amount);
		if (t.type === "expense") trendMap[key].expense += Number(t.amount);
	});
	const sortedTrend = Object.values(trendMap).sort((a, b) => a.key.localeCompare(b.key));
	const monthlyTrend = sortedTrend.length > 0 ? sortedTrend : [
		{
			key: "",
			month: "Jan",
			income: 45e3,
			expense: 32e3
		},
		{
			key: "",
			month: "Feb",
			income: 52e3,
			expense: 34e3
		},
		{
			key: "",
			month: "Mar",
			income: 48e3,
			expense: 39e3
		},
		{
			key: "",
			month: "Apr",
			income: 61e3,
			expense: 41e3
		},
		{
			key: "",
			month: "May",
			income: 55e3,
			expense: 38e3
		},
		{
			key: "",
			month: "Jun",
			income: 65e3,
			expense: 42350
		}
	];
	const anomalies = detectAnomalies(transactions, categoryNameById);
	const topAnomaly = anomalies[0];
	const forecast = forecastNextMonthSpend(transactions);
	const forecastChartData = [...monthlyTrend.map((m) => ({
		month: m.month,
		actual: m.expense,
		forecast: void 0
	})), ...forecast.hasEnoughData ? [{
		month: "Next",
		actual: void 0,
		forecast: forecast.projectedNextMonth
	}] : []];
	if (forecast.hasEnoughData && forecastChartData.length >= 2) {
		const bridge = forecastChartData[forecastChartData.length - 2];
		if (bridge) bridge.forecast = bridge.actual;
	}
	const totalExpenseForConcentration = categoryData.reduce((s, c) => s + c.value, 0);
	const top2Share = totalExpenseForConcentration > 0 ? ((categoryData[0]?.value ?? 0) + (categoryData[1]?.value ?? 0)) / totalExpenseForConcentration : 0;
	const budgetCategories = budget?.budget_categories ?? [];
	const spendByCategory = /* @__PURE__ */ new Map();
	transactions.filter((t) => t.type === "expense" && t.category_id).forEach((t) => spendByCategory.set(t.category_id, (spendByCategory.get(t.category_id) ?? 0) + Number(t.amount)));
	const overBudgetCount = budgetCategories.filter((bc) => {
		const spent = spendByCategory.get(bc.category_id) ?? 0;
		return Number(bc.limit_amount) > 0 && spent / Number(bc.limit_amount) >= .8;
	}).length;
	const insights = [
		{
			title: "Category Concentration",
			desc: categoryData.length > 0 ? `Your top ${Math.min(2, categoryData.length)} spending ${categoryData.length > 1 ? "categories represent" : "category represents"} ${(top2Share * 100).toFixed(1)}% of tracked expenses.` : "Not enough categorized expense data yet to measure concentration.",
			type: top2Share > .5 ? "warning" : "neutral",
			icon: TriangleAlert,
			metric: categoryData.length > 0 ? `${(top2Share * 100).toFixed(1)}%` : "—"
		},
		{
			title: "Unusual Transaction",
			desc: topAnomaly ? `${topAnomaly.transaction.merchant ?? "A transaction"} in ${topAnomaly.categoryLabel} was ₹${Number(topAnomaly.transaction.amount).toLocaleString("en-IN")} — well above your usual spend there.` : "No transactions stand out as unusual compared to your recent history.",
			type: topAnomaly ? "warning" : "positive",
			icon: Radar,
			metric: topAnomaly ? `${topAnomaly.zScore.toFixed(1)}σ` : "Clear"
		},
		{
			title: "Next Month Forecast",
			desc: forecast.hasEnoughData ? `Based on your last ${Math.min(3, forecast.history.length)} months, projected spend is ₹${Math.round(forecast.projectedNextMonth).toLocaleString("en-IN")}, ${forecast.trendPct >= 0 ? "up" : "down"} ${Math.abs(forecast.trendPct).toFixed(1)}% vs last month.` : "Add a couple more months of transactions for a reliable forecast.",
			type: forecast.hasEnoughData && forecast.trendPct > 10 ? "warning" : "neutral",
			icon: forecast.trendPct >= 0 ? TrendingUp : TrendingDown,
			metric: forecast.hasEnoughData ? `₹${Math.round(forecast.projectedNextMonth).toLocaleString("en-IN")}` : "—"
		},
		{
			title: "Budget Health",
			desc: budgetCategories.length === 0 ? "No budget set up for this month yet." : overBudgetCount === 0 ? "All budget categories remain within safe operational bounds." : `${overBudgetCount} of ${budgetCategories.length} budget categories are at or near their limit.`,
			type: budgetCategories.length === 0 ? "neutral" : overBudgetCount === 0 ? "positive" : "warning",
			icon: overBudgetCount === 0 ? CircleCheck : Lightbulb,
			metric: budgetCategories.length === 0 ? "—" : overBudgetCount === 0 ? "Healthy" : `${overBudgetCount} at risk`
		}
	];
	function handleDownloadSummary() {
		const monthLabel = (/* @__PURE__ */ new Date()).toLocaleDateString("en-IN", {
			month: "long",
			year: "numeric"
		});
		const budgetRows = budgetCategories.map((bc) => ({
			name: categoryNameById.get(bc.category_id) ?? "Uncategorized",
			spent: spendByCategory.get(bc.category_id) ?? 0,
			limit: Number(bc.limit_amount)
		}));
		generateMonthlySummaryPdf({
			monthLabel,
			income,
			expenses,
			transactionCount: transactions.length,
			categoryBreakdown: categoryData,
			budgetCategories: budgetRows,
			anomalies: anomalies.slice(0, 10).map((a) => ({
				merchant: a.transaction.merchant ?? "Transaction",
				amount: Number(a.transaction.amount),
				category: a.categoryLabel,
				zScore: a.zScore
			})),
			forecast
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-2 text-[11px] font-mono uppercase tracking-[0.2em] text-signal",
					children: "Intelligence Engine"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-bold tracking-tight lg:text-4xl",
					children: "Financial Analytics & Insights"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-mute",
					children: "Transform raw payment telemetry into actionable financial decision signals."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: handleDownloadSummary,
					disabled: transactions.length === 0,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileDown, { className: "mr-1.5 size-3.5" }), " Monthly summary (PDF)"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex rounded-lg border border-line bg-panel p-1",
					children: [
						"7d",
						"30d",
						"6m",
						"1y"
					].map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setTimeRange(r),
						className: `rounded-md px-3 py-1.5 text-xs font-mono transition ${timeRange === r ? "bg-signal text-signal-foreground font-semibold" : "text-mute hover:text-ink"}`,
						children: r.toUpperCase()
					}, r))
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-line bg-panel p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] font-mono uppercase tracking-[0.14em] text-mute",
							children: "Total Volume"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 font-mono text-2xl font-bold",
							children: ["₹", totalVolume.toLocaleString("en-IN")]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1 text-xs text-signal",
							children: [
								"From ",
								transactions.length,
								" transactions"
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-line bg-panel p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] font-mono uppercase tracking-[0.14em] text-mute",
							children: "Avg Transaction"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 font-mono text-2xl font-bold",
							children: ["₹", Math.round(avgTxnValue).toLocaleString("en-IN")]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 text-xs text-mute",
							children: "Per transaction mean"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-line bg-panel p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] font-mono uppercase tracking-[0.14em] text-mute",
							children: "Total Income"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 font-mono text-2xl font-bold text-signal",
							children: ["₹", income.toLocaleString("en-IN")]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1 text-xs text-signal flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-3" }), " Incoming flows"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-line bg-panel p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] font-mono uppercase tracking-[0.14em] text-mute",
							children: "Total Expenses"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 font-mono text-2xl font-bold text-warning-signal",
							children: ["₹", expenses.toLocaleString("en-IN")]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1 text-xs text-warning-signal flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "size-3" }), " Outgoing flows"]
						})
					]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-5 text-signal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-bold",
					children: "Actionable Financial Signals"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
				children: insights.map(({ title, desc, type, icon: Icon, metric }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `rounded-xl border p-5 transition ${type === "warning" ? "border-warning-signal/30 bg-warning-signal/5" : type === "positive" ? "border-signal/30 bg-signal/5" : "border-line bg-panel"}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `size-5 ${type === "warning" ? "text-warning-signal" : type === "positive" ? "text-signal" : "text-mute"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-xs font-bold",
								children: metric
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 font-display font-semibold text-sm",
							children: title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-mute leading-relaxed",
							children: desc
						})
					]
				}, title))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8 grid gap-6 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-line bg-panel p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display font-bold",
						children: "Expense Trend & Forecast"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-mute",
						children: forecast.hasEnoughData ? "Actual monthly spend, with a projected next month based on a moving average." : "Comparative monthly activity timeline"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-64",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ComposedChart, {
							data: forecast.hasEnoughData ? forecastChartData : monthlyTrend,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: "#262626"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "month",
									stroke: "#737373",
									fontSize: 12
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									stroke: "#737373",
									fontSize: 12
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
									backgroundColor: "#171717",
									borderColor: "#262626",
									borderRadius: "8px"
								} }),
								forecast.hasEnoughData ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "actual",
									fill: "#f59e0b",
									radius: [
										4,
										4,
										0,
										0
									],
									name: "Actual expense"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									type: "monotone",
									dataKey: "forecast",
									stroke: "#8b5cf6",
									strokeWidth: 2,
									strokeDasharray: "5 4",
									dot: { r: 3 },
									name: "Forecast"
								})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "income",
									fill: "#10b981",
									radius: [
										4,
										4,
										0,
										0
									],
									name: "Income"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "expense",
									fill: "#f59e0b",
									radius: [
										4,
										4,
										0,
										0
									],
									name: "Expenses"
								})] })
							]
						})
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-line bg-panel p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display font-bold",
						children: "Category Distribution"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-mute",
						children: "Expenditure breakdown by merchant & category"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-64 flex items-center justify-center",
					children: categoryData.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm text-mute font-mono",
						children: "No expense data available"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
							data: categoryData,
							cx: "50%",
							cy: "50%",
							innerRadius: 55,
							outerRadius: 85,
							paddingAngle: 4,
							dataKey: "value",
							children: categoryData.map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
							backgroundColor: "#171717",
							borderColor: "#262626",
							borderRadius: "8px"
						} })] })
					})
				})]
			})]
		}),
		anomalies.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8 rounded-xl border border-warning-signal/30 bg-warning-signal/5 p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radar, { className: "size-5 text-warning-signal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display font-bold",
						children: "Unusual Transactions"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-4 text-xs text-mute",
					children: "Transactions flagged as statistical outliers vs. your typical spend in the same category."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2",
					children: anomalies.slice(0, 6).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between rounded-lg border border-line bg-panel px-4 py-2.5 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-medium text-ink",
							children: a.transaction.merchant ?? "Transaction"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-mute",
							children: [
								a.categoryLabel,
								" ·",
								" ",
								new Date(a.transaction.transaction_date).toLocaleDateString("en-IN", {
									day: "numeric",
									month: "short"
								})
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "font-mono font-semibold text-warning-signal",
								children: ["₹", Number(a.transaction.amount).toLocaleString("en-IN")]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "font-mono text-[10px] text-mute",
								children: [a.zScore.toFixed(1), "σ above usual"]
							})]
						})]
					}, a.transaction.id))
				})
			]
		})
	] });
}
//#endregion
export { InsightsPage as component };
