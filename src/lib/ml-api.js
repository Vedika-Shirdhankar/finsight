/**
 * FinSight ML Anomaly Detection API Client
 *
 * Connects the FinSight React frontend to the standalone FastAPI Machine Learning microservice.
 * Communicates via VITE_ML_API_URL environment variable.
 */

const ML_API_BASE_URL =
  import.meta.env.VITE_ML_API_URL || "http://localhost:8000";

/**
 * Analyzes transaction history using the FastAPI Isolation Forest ML endpoint.
 *
 * @param {Array<Object>} transactions Raw FinSight transaction list
 * @returns {Promise<Object>} Structured prediction results and summary metrics
 */
export async function analyzeTransactions(transactions = []) {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return {
      success: false,
      reason: "empty_data",
      message: "No transactions available for analysis.",
      summary: { total: 0, anomaliesCount: 0, anomalyPct: 0 },
      results: [],
    };
  }

  if (transactions.length < 3) {
    return {
      success: false,
      reason: "insufficient_data",
      message: "More transaction history is required for reliable ML analysis (minimum 3 transactions).",
      summary: { total: transactions.length, anomaliesCount: 0, anomalyPct: 0 },
      results: [],
    };
  }

  // Sanitize transactions: pass only required schema fields to ML API
  // Do NOT include auth tokens, private keys, or passwords
  const sanitizedTransactions = transactions.map((t) => ({
    id: t.id ? String(t.id) : undefined,
    amount: Number(t.amount) || 0,
    type: t.type || "expense",
    merchant: t.merchant || "Unknown",
    payment_method: t.payment_method || "UPI",
    description: t.description || "",
    transaction_date: t.transaction_date || new Date().toISOString(),
  }));

  try {
    const response = await fetch(`${ML_API_BASE_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transactions: sanitizedTransactions }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        reason: "api_error",
        message: `ML API responded with status ${response.status}.`,
        error: errorText,
        summary: { total: transactions.length, anomaliesCount: 0, anomalyPct: 0 },
        results: [],
      };
    }

    const data = await response.json();
    const predictions = data.results || data.predictions || [];

    // Create lookup map of transaction id -> original transaction object
    const txMap = new Map();
    transactions.forEach((t, index) => {
      const key = t.id ? String(t.id) : `idx_${index}`;
      txMap.set(key, t);
    });

    // Enrich prediction items with original transaction details
    const enrichedResults = predictions.map((pred, index) => {
      const key = pred.transaction_id || `idx_${index}`;
      const originalTx = txMap.get(key) || transactions[index] || {};
      return {
        ...pred,
        transaction: originalTx,
      };
    });

    // Filter anomalies and calculate summary metrics
    const anomalies = enrichedResults.filter((r) => r.is_anomaly);
    const total = enrichedResults.length;
    const anomaliesCount = anomalies.length;
    const anomalyPct = total > 0 ? Number(((anomaliesCount / total) * 100).toFixed(1)) : 0;

    // Sort enriched results so anomalies appear first, sorted by score ascending (more negative = more anomalous)
    enrichedResults.sort((a, b) => {
      if (a.is_anomaly && !b.is_anomaly) return -1;
      if (!a.is_anomaly && b.is_anomaly) return 1;
      return a.anomaly_score - b.anomaly_score;
    });

    return {
      success: true,
      summary: {
        total,
        anomaliesCount,
        anomalyPct,
      },
      results: enrichedResults,
    };
  } catch (err) {
    console.error("[FinSight ML API] Network error during prediction:", err);
    return {
      success: false,
      reason: "api_unavailable",
      message: "ML analysis is currently unavailable. Please try again.",
      error: err.message,
      summary: { total: transactions.length, anomaliesCount: 0, anomalyPct: 0 },
      results: [],
    };
  }
}

/**
 * Checks health status of the FastAPI ML microservice.
 */
export async function checkMlHealth() {
  try {
    const response = await fetch(`${ML_API_BASE_URL}/health`);
    if (response.ok) {
      return await response.json();
    }
    return { status: "unhealthy", model_loaded: false };
  } catch {
    return { status: "offline", model_loaded: false };
  }
}
