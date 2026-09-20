/**
 * FinSight Production-Grade Duplicate Transaction Detection Engine
 * 
 * Accurately flags double-counted entries across bank feeds, CSV imports, and manual submissions.
 * Prevents false positives on legitimate recurring subscriptions (e.g. Netflix, Rent)
 * through monthly cycle recurrence discrimination.
 */

// Common merchant affixes to strip during semantic normalization
const STRIP_AFFIXES = [
    /^upi[-_\s]+/i,
    /^pos[-_\s]+/i,
    /^ach[-_\s]+/i,
    /^neft[-_\s]+/i,
    /^rtgs[-_\s]+/i,
    /^imps[-_\s]+/i,
    /^in\*\s*/i,
    /\s*(pvt|ltd|limited|inc|corp|corporation|llc|co)\.?$/i,
    /\s*india$/i,
    /\s*direct$/i,
    /\s*pay$/i,
];

/**
 * Normalizes merchant names by lowercasing, removing legal affixes, and stripping special characters.
 * 
 * @param {string} rawMerchant - Raw merchant string from CSV/Bank feed
 * @returns {string} Clean normalized identifier
 */
export function normalizeMerchant(rawMerchant) {
    if (!rawMerchant || typeof rawMerchant !== "string") return "";
    let cleaned = rawMerchant.trim().toLowerCase();

    for (const pattern of STRIP_AFFIXES) {
        cleaned = cleaned.replace(pattern, "").trim();
    }

    return cleaned.replace(/[^a-z0-9]/g, "");
}

/**
 * Calculates string similarity between two merchant strings using normalized Jaccard Bigram metric.
 * 
 * @param {string} s1 - Merchant 1
 * @param {string} s2 - Merchant 2
 * @returns {number} Float similarity between 0.0 and 1.0
 */
export function stringSimilarity(s1, s2) {
    const n1 = normalizeMerchant(s1);
    const n2 = normalizeMerchant(s2);

    if (!n1 && !n2) return 1.0;
    if (!n1 || !n2) return 0.0;
    if (n1 === n2) return 1.0;

    // Substring containment match (e.g., "Swiggy" in "Swiggy Bangalore")
    if (n1.includes(n2) || n2.includes(n1)) return 0.88;

    // Bigram character set comparison
    const getBigrams = (str) => {
        const bigrams = new Set();
        for (let i = 0; i < str.length - 1; i++) {
            bigrams.add(str.slice(i, i + 2));
        }
        return bigrams;
    };

    const b1 = getBigrams(n1);
    const b2 = getBigrams(n2);

    if (b1.size === 0 || b2.size === 0) {
        // Fallback to character unigram
        const c1 = new Set(n1.split(""));
        const c2 = new Set(n2.split(""));
        const intersection = new Set([...c1].filter((x) => c2.has(x)));
        const union = new Set([...c1, ...c2]);
        return union.size === 0 ? 0 : intersection.size / union.size;
    }

    const intersection = new Set([...b1].filter((x) => b2.has(x)));
    const union = new Set([...b1, ...b2]);
    return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * Calculates days between two date strings (YYYY-MM-DD or ISO strings).
 */
export function dayDifference(dateStr1, dateStr2) {
    if (!dateStr1 || !dateStr2) return Infinity;
    const d1 = new Date(dateStr1.slice(0, 10) + "T00:00:00").getTime();
    const d2 = new Date(dateStr2.slice(0, 10) + "T00:00:00").getTime();
    if (isNaN(d1) || isNaN(d2)) return Infinity;
    return Math.abs(d1 - d2) / 86_400_000;
}

/**
 * Scans candidate incoming transactions against existing records.
 * Identifies duplicate entries while preventing false positives on legitimate monthly recurring bills.
 * 
 * @param {Array} incomingTxns - Candidates to evaluate
 * @param {Array} existingTxns - Known transactions in database
 * @param {Object} [opts={}] - Options (confidenceThreshold, dateWindowDays)
 * @returns {Array} List of evaluation objects with duplicate status, confidence score, and explanation
 */
export function detectDuplicates(incomingTxns = [], existingTxns = [], opts = {}) {
    const threshold = opts.confidenceThreshold ?? 0.8;
    const maxDays = opts.dateWindowDays ?? 2; // 48-hour duplicate tolerance window

    return (incomingTxns || []).map((incoming) => {
        let bestMatch = undefined;
        let highestConfidence = 0;
        let matchReason = "Unique transaction";
        let isRecurringLegitimate = false;

        const incomingAmt = Math.abs(Number(incoming.amount || 0));
        const incomingMerchant = incoming.merchant || incoming.description || "";

        for (const existing of (existingTxns || [])) {
            // Avoid comparing to self if ID is identical
            if (incoming.id && existing.id && incoming.id === existing.id) continue;

            const existingAmt = Math.abs(Number(existing.amount || 0));
            const existingMerchant = existing.merchant || existing.description || "";

            // 1. Amount Check (exact currency match)
            if (Math.abs(incomingAmt - existingAmt) > 0.01) {
                continue;
            }

            const daysDiff = dayDifference(incoming.transaction_date, existing.transaction_date);
            const merchantSim = stringSimilarity(incomingMerchant, existingMerchant);

            // 2. Legitimate Monthly Recurring Discrimination (27 to 33 days apart)
            // E.g. Netflix subscription billed on the 14th of each month
            if (daysDiff >= 26 && daysDiff <= 35 && merchantSim >= 0.80) {
                isRecurringLegitimate = true;
                continue; // Do not flag legitimate monthly recurring charges as duplicates
            }

            // 3. Duplicate Window Check (within 0 - maxDays)
            if (daysDiff <= maxDays) {
                let confidence = 0;
                let reason = "";

                if (daysDiff === 0 && merchantSim >= 0.95) {
                    confidence = 1.0;
                    reason = "Exact match on Date, Merchant, and Amount";
                } else if (daysDiff <= 1 && merchantSim >= 0.85) {
                    confidence = 0.92;
                    reason = `High merchant similarity (${Math.round(merchantSim * 100)}%) within 24h window`;
                } else if (daysDiff <= maxDays && merchantSim >= 0.75) {
                    confidence = 0.82;
                    reason = `Fuzzy merchant match (${Math.round(merchantSim * 100)}%) within ${Math.round(daysDiff)} day window`;
                }

                if (confidence > highestConfidence) {
                    highestConfidence = confidence;
                    bestMatch = existing;
                    matchReason = reason;
                }
            }
        }

        if (isRecurringLegitimate && highestConfidence < threshold) {
            matchReason = "Legitimate recurring transaction (monthly cycle match)";
        }

        return {
            incomingTxn: incoming,
            matchedExistingTxn: bestMatch,
            isDuplicate: highestConfidence >= threshold,
            confidenceScore: Number(highestConfidence.toFixed(2)),
            reason: matchReason,
            isRecurringPattern: isRecurringLegitimate,
        };
    });
}
