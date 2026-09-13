/**
 * Duplicate Transaction Detection Algorithm
 * Identifies duplicate or double-counted entries across bank feeds, CSV imports, and manual entries.
 */

export interface CandidateTransaction {
  merchant: string;
  amount: number;
  transaction_date: string; // YYYY-MM-DD
  type?: string;
}

export interface DuplicateMatchResult {
  incomingTxn: CandidateTransaction;
  matchedExistingTxn?: CandidateTransaction & { id: string };
  isDuplicate: boolean;
  confidenceScore: number; // 0.0 to 1.0
  reason: string;
}

/**
 * Calculates Jaccard/Levenshtein string similarity between two merchant names.
 */
function stringSimilarity(s1: string, s2: string): number {
  const str1 = s1.toLowerCase().replace(/[^a-z0-9]/g, "");
  const str2 = s2.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (str1 === str2) return 1.0;
  if (str1.includes(str2) || str2.includes(str1)) return 0.85;

  const set1 = new Set(str1.split(""));
  const set2 = new Set(str2.split(""));
  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * Calculates days between two date strings (YYYY-MM-DD)
 */
function dayDifference(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1 + "T00:00:00").getTime();
  const d2 = new Date(dateStr2 + "T00:00:00").getTime();
  return Math.abs(d1 - d2) / 86_400_000;
}

/**
 * Scans a list of incoming candidate transactions against existing database transactions
 * and flags potential duplicate records.
 */
export function detectDuplicates(
  incomingTxns: CandidateTransaction[],
  existingTxns: (CandidateTransaction & { id: string })[],
  opts: { confidenceThreshold?: number; dateWindowDays?: number } = {}
): DuplicateMatchResult[] {
  const threshold = opts.confidenceThreshold ?? 0.8;
  const maxDays = opts.dateWindowDays ?? 2; // 48-hour tolerance window

  return incomingTxns.map((incoming) => {
    let bestMatch: (CandidateTransaction & { id: string }) | undefined = undefined;
    let highestConfidence = 0;
    let matchReason = "Unique transaction";

    for (const existing of existingTxns) {
      // 1. Amount must match exactly
      if (Math.abs(Number(incoming.amount) - Number(existing.amount)) > 0.01) {
        continue;
      }

      // 2. Date within maxDays window
      const daysDiff = dayDifference(incoming.transaction_date, existing.transaction_date);
      if (daysDiff > maxDays) {
        continue;
      }

      // 3. Merchant similarity check
      const merchantSim = stringSimilarity(incoming.merchant, existing.merchant);

      let confidence = 0;
      if (daysDiff === 0 && merchantSim === 1.0) {
        confidence = 1.0;
        matchReason = "Exact match on Date, Merchant, and Amount";
      } else if (daysDiff <= 1 && merchantSim >= 0.8) {
        confidence = 0.9;
        matchReason = `High similarity (${Math.round(merchantSim * 100)}%) within ${daysDiff} day window`;
      } else if (merchantSim >= 0.75) {
        confidence = 0.8;
        matchReason = `Fuzzy merchant match within ${daysDiff} day window`;
      }

      if (confidence > highestConfidence) {
        highestConfidence = confidence;
        bestMatch = existing;
      }
    }

    return {
      incomingTxn: incoming,
      matchedExistingTxn: bestMatch,
      isDuplicate: highestConfidence >= threshold,
      confidenceScore: highestConfidence,
      reason: matchReason,
    };
  });
}
