/**
 * FinSight Duplicate Detection & Recurrence Discrimination Test Suite
 */
import {
    detectDuplicates,
    normalizeMerchant,
    stringSimilarity,
    dayDifference,
} from "../lib/duplicate-detector.js";

export async function runDuplicateDetectorTests() {
    console.log("=== 2. Duplicate Detection & Recurrence Tests ===");
    let passed = 0;
    let total = 0;

    function assert(condition, message) {
        total++;
        if (condition) {
            console.log(`  ✓ PASS: ${message}`);
            passed++;
        } else {
            console.error(`  ✗ FAIL: ${message}`);
            process.exitCode = 1;
        }
    }

    // 1. Normalization & String Similarity
    console.log("  [Semantic Merchant Normalization]");
    assert(normalizeMerchant("UPI-Swiggy-Bangalore") === "swiggybangalore", "Strips UPI prefix");
    assert(normalizeMerchant("POS* Uber India Pvt Ltd") === "uber", "Strips POS prefix, India, and Pvt Ltd affixes");
    assert(stringSimilarity("Swiggy Direct", "Swiggy Bangalore") >= 0.85, "Recognizes common merchant root");

    // 2. Exact Duplicate (Same Date, Merchant, Amount)
    console.log("  [Exact & Near Duplicate Scenarios]");
    const existingLedger = [
        { id: "e1", merchant: "Amazon India", amount: 1499, transaction_date: "2026-09-14" },
        { id: "e2", merchant: "Swiggy", amount: 349, transaction_date: "2026-09-14" },
        // Previous month's Netflix charge
        { id: "e3", merchant: "Netflix", amount: 649, transaction_date: "2026-08-14" },
    ];

    const candidates = [
        // True duplicate
        { id: "c1", merchant: "Amazon IN", amount: 1499, transaction_date: "2026-09-14" },
        // 24h near duplicate
        { id: "c2", merchant: "UPI Swiggy Bangalore", amount: 349, transaction_date: "2026-09-15" },
        // Different amount -> NOT duplicate
        { id: "c3", merchant: "Swiggy", amount: 799, transaction_date: "2026-09-14" },
        // Legitimate Monthly Recurring (Netflix 31 days later) -> MUST NOT BE DUPLICATE
        { id: "c4", merchant: "Netflix Entertainment", amount: 649, transaction_date: "2026-09-14" },
    ];

    const results = detectDuplicates(candidates, existingLedger);

    assert(results[0].isDuplicate === true, "Flagged exact Amazon duplicate (100% confidence)");
    assert(results[0].confidenceScore >= 0.9, "High confidence on normalized Amazon match");

    assert(results[1].isDuplicate === true, "Flagged 24h window Swiggy duplicate");
    assert(results[1].confidenceScore >= 0.8, "High confidence on Swiggy duplicate");

    assert(results[2].isDuplicate === false, "Different amount (799 vs 349) correctly NOT marked as duplicate");

    assert(results[3].isDuplicate === false, "Legitimate monthly recurring subscription (Netflix 31d cycle) NOT flagged as duplicate");
    assert(results[3].isRecurringPattern === true, "Identified monthly recurrence pattern");

    console.log(`Duplicate Detector Suite: ${passed}/${total} passed.
`);
    return { passed, total };
}
