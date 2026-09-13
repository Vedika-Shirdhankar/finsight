// The project currently does not ship jspdf's type declarations. Keep the
// import for the browser bundle while allowing TypeScript to compile this
// module until the dependency is installed with its typings.
// @ts-expect-error jspdf is provided by the application runtime
import jsPDF from "jspdf";

type TableOptions = {
  startY: number;
  margin: { left: number; right: number };
  head: string[][];
  body: string[][];
  theme?: "grid" | "striped";
  styles?: { fontSize?: number; cellPadding?: number };
  headStyles?: { fillColor?: [number, number, number] };
};

/** Lightweight table renderer so this report does not require jspdf-autotable. */
function autoTable(doc: jsPDF, options: TableOptions) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const width = pageWidth - options.margin.left - options.margin.right;
  const padding = options.styles?.cellPadding ?? 5;
  const fontSize = options.styles?.fontSize ?? 10;
  const rows = [...options.head, ...options.body];
  const columnCount = Math.max(...rows.map((row) => row.length), 1);
  const columnWidth = width / columnCount;
  const rowHeight = fontSize + padding * 2;
  let y = options.startY;

  rows.forEach((row, rowIndex) => {
    const isHeader = rowIndex === 0;
    if (isHeader) {
      const color = options.headStyles?.fillColor ?? [23, 23, 23];
      doc.setFillColor(...color);
      doc.setTextColor(255);
    } else {
      doc.setFillColor(
        rowIndex % 2 === 0 ? 245 : 255,
        rowIndex % 2 === 0 ? 245 : 255,
        rowIndex % 2 === 0 ? 245 : 255,
      );
      doc.setTextColor(0);
    }
    doc.rect(options.margin.left, y, width, rowHeight, "F");
    doc.setFont("helvetica", isHeader ? "bold" : "normal");
    doc.setFontSize(fontSize);
    row.forEach((value, columnIndex) => {
      const x = options.margin.left + columnIndex * columnWidth;
      doc.setDrawColor(210);
      doc.rect(x, y, columnWidth, rowHeight);
      doc.text(String(value), x + padding, y + fontSize + padding - 1, {
        maxWidth: columnWidth - padding * 2,
      });
    });
    y += rowHeight;
  });
  doc.setTextColor(0);
  (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable = { finalY: y };
}

export interface MonthlySummaryInput {
  monthLabel: string;
  currencySymbol?: string;
  income: number;
  expenses: number;
  transactionCount: number;
  categoryBreakdown: { name: string; value: number }[];
  budgetCategories: { name: string; spent: number; limit: number }[];
  anomalies: { merchant: string; amount: number; category: string; zScore: number }[];
  forecast: { hasEnoughData: boolean; projectedNextMonth: number; trendPct: number };
}

function fmt(n: number, currencySymbol: string) {
  return `${currencySymbol}${Math.round(n).toLocaleString("en-IN")}`;
}

/**
 * Builds a one-page-ish monthly summary PDF from data the Insights page has
 * already computed (real numbers, not a template) and triggers a download.
 * Kept intentionally simple — a text/table report, not a pixel-perfect
 * design — so it stays easy to extend later.
 */
export function generateMonthlySummaryPdf(input: MonthlySummaryInput) {
  const currency = input.currencySymbol ?? "₹";
  const doc = new jsPDF({ unit: "pt", format: "a4" });
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

  // ---- KPI row ----
  const net = input.income - input.expenses;
  const kpis: [string, string][] = [
    ["Total income", fmt(input.income, currency)],
    ["Total expenses", fmt(input.expenses, currency)],
    ["Net savings", fmt(net, currency)],
    ["Transactions", String(input.transactionCount)],
  ];
  autoTable(doc, {
    startY: y,
    margin: { left: marginX, right: marginX },
    head: [["Metric", "Value"]],
    body: kpis,
    theme: "grid",
    headStyles: { fillColor: [23, 23, 23] },
    styles: { fontSize: 10, cellPadding: 6 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24;

  // ---- Category breakdown ----
  if (input.categoryBreakdown.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Spending by category", marginX, y);
    y += 8;
    const totalCategorized = input.categoryBreakdown.reduce((s, c) => s + c.value, 0);
    autoTable(doc, {
      startY: y + 6,
      margin: { left: marginX, right: marginX },
      head: [["Category", "Amount", "% of total"]],
      body: input.categoryBreakdown.map((c) => [
        c.name,
        fmt(c.value, currency),
        totalCategorized > 0 ? `${((c.value / totalCategorized) * 100).toFixed(1)}%` : "—",
      ]),
      theme: "striped",
      headStyles: { fillColor: [23, 23, 23] },
      styles: { fontSize: 10, cellPadding: 5 },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24;
  }

  // ---- Budget status ----
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
      margin: { left: marginX, right: marginX },
      head: [["Category", "Spent", "Limit", "Used"]],
      body: input.budgetCategories.map((b) => [
        b.name,
        fmt(b.spent, currency),
        fmt(b.limit, currency),
        b.limit > 0 ? `${Math.round((b.spent / b.limit) * 100)}%` : "—",
      ]),
      theme: "striped",
      headStyles: { fillColor: [23, 23, 23] },
      styles: { fontSize: 10, cellPadding: 5 },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24;
  }

  // ---- Anomalies ----
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
      margin: { left: marginX, right: marginX },
      head: [["Merchant", "Category", "Amount", "Std. deviations above usual"]],
      body: input.anomalies
        .slice(0, 10)
        .map((a) => [a.merchant, a.category, fmt(a.amount, currency), `${a.zScore.toFixed(1)}σ`]),
      theme: "striped",
      headStyles: { fillColor: [23, 23, 23] },
      styles: { fontSize: 10, cellPadding: 5 },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24;
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("No transactions stood out as unusual this period.", marginX, y + 16);
    y += 34;
  }

  // ---- Forecast ----
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
  doc.text(
    input.forecast.hasEnoughData
      ? `Projected spend: ${fmt(input.forecast.projectedNextMonth, currency)} (${
          input.forecast.trendPct >= 0 ? "+" : ""
        }${input.forecast.trendPct.toFixed(1)}% vs last month), based on a trailing moving average.`
      : "Not enough monthly history yet for a reliable forecast.",
    marginX,
    y,
    { maxWidth: 515 },
  );

  const filename = `finsight_summary_${input.monthLabel.replace(/\s+/g, "_").toLowerCase()}.pdf`;
  doc.save(filename);
}
