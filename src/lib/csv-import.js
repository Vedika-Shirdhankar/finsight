import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";
import { auditLog } from "@/lib/audit-logger";

/** The fields a CSV column can be mapped onto. `date` and `amount` are required for a row to import. */
export const MAPPABLE_FIELDS = [
    { field: "date", label: "Transaction date", required: true },
    { field: "amount", label: "Amount", required: true },
    { field: "merchant", label: "Merchant", required: false },
    { field: "description", label: "Description", required: false },
    { field: "type", label: "Type (income/expense/transfer)", required: false },
    { field: "category", label: "Category name", required: false },
    { field: "payment_method", label: "Payment method", required: false },
];

/** Parses a CSV File in-browser. Rejects on a hard parse failure; per-row errors are returned separately. */
export function parseCsvFile(file) {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const headers = results.meta.fields ?? [];
                resolve({ headers, rows: results.data });
            },
            error: reject,
        });
    });
}

function normalizeAmount(raw) {
    const cleaned = raw.replace(/[^0-9.-]/g, "");
    if (!cleaned)
        return null;
    const value = Number(cleaned);
    return Number.isFinite(value) ? Math.abs(value) : null;
}

function normalizeDate(raw) {
    const d = new Date(raw);
    if (Number.isNaN(d.getTime()))
        return null;
    return d.toISOString();
}

function normalizeType(raw, amountSign) {
    const v = raw?.trim().toLowerCase();
    if (v === "income" || v === "expense" || v === "transfer")
        return v;
    // Fall back to sign of the original (pre-abs) amount if the CSV had one, else default expense.
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
export function mapCsvRows(parsed, mapping, categoryNameToId) {
    return parsed.rows.map((raw, rowIndex) => {
        const dateCol = mapping.date ? raw[mapping.date] : undefined;
        const amountCol = mapping.amount ? raw[mapping.amount] : undefined;
        if (!dateCol || !amountCol) {
            return { rowIndex, transaction: null, error: "Missing date or amount", raw };
        }
        const date = normalizeDate(dateCol);
        const amount = normalizeAmount(amountCol);
        if (!date)
            return { rowIndex, transaction: null, error: `Unrecognized date: "${dateCol}"`, raw };
        if (amount === null)
            return { rowIndex, transaction: null, error: `Unrecognized amount: "${amountCol}"`, raw };
        const rawAmountSign = Number(amountCol.replace(/[^0-9.-]/g, "")) || 0;
        const typeCol = mapping.type ? raw[mapping.type] : undefined;
        const categoryCol = mapping.category ? raw[mapping.category] : undefined;
        const categoryId = categoryCol ? categoryNameToId[categoryCol.trim().toLowerCase()] : undefined;
        const transaction = {
            transaction_date: date,
            amount,
            type: normalizeType(typeCol, rawAmountSign),
            merchant: mapping.merchant ? raw[mapping.merchant] || null : null,
            description: mapping.description ? raw[mapping.description] || null : null,
            payment_method: mapping.payment_method ? raw[mapping.payment_method] || "unknown" : "unknown",
            category_id: categoryId ?? null,
            status: "completed",
        };
        return { rowIndex, transaction, error: null, raw };
    });
}

/** Bulk-inserts the valid (non-errored) mapped rows for the given user. Returns the count inserted. */
export async function bulkInsertTransactions(userId, rows, importMetadata = {}) {
    const toInsert = rows
        .filter((r) => r.transaction !== null)
        .map((r) => ({ ...r.transaction, user_id: userId }));
    if (toInsert.length === 0)
        return 0;

    const { error, count } = await supabase.from("transactions").insert(toInsert, { count: "exact" });
    if (error)
        throw error;

    const insertedCount = count ?? toInsert.length;

    // Log IMPORT audit event
    await auditLog({
        userId,
        action: "IMPORT",
        resourceType: "transaction",
        resourceId: `batch_${Date.now()}`,
        metadata: {
            filename: importMetadata.filename || "import.csv",
            number_of_rows: importMetadata.totalRows || rows.length,
            successful_rows: insertedCount,
            failed_rows: importMetadata.failedRows || (rows.length - toInsert.length),
            duplicate_rows: importMetadata.duplicateRows || 0,
        },
    });

    return insertedCount;
}
