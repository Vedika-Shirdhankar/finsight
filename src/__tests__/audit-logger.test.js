/**
 * FinSight Audit Logging & Security Sanitization Test Suite
 */
import { sanitizeAuditData, computeFieldDiff, auditLog } from "../lib/audit-logger.js";

export async function runAuditTests() {
    console.log("=== 3. Audit Logging & Security Tests ===");
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

    // 1. Secret Sanitization Guard
    console.log("  [Secret Sanitization Guard]");
    const rawPayload = {
        username: "vedika",
        password: "SuperSecretPassword123!",
        api_key: "sk_live_998877",
        service_role_key: "secret_srv_key",
        nested: {
            auth_token: "bearer-token-abc",
            user_id: "user-123",
        },
    };
    const sanitized = sanitizeAuditData(rawPayload);
    assert(sanitized.password === "[REDACTED_SECRET]", "Password field redacted");
    assert(sanitized.api_key === "[REDACTED_SECRET]", "API key redacted");
    assert(sanitized.service_role_key === "[REDACTED_SECRET]", "Service role key redacted");
    assert(sanitized.nested.auth_token === "[REDACTED_SECRET]", "Nested auth token redacted");
    assert(sanitized.username === "vedika", "Non-sensitive username preserved");

    // 2. Field Diff Computation
    console.log("  [Before/After Field Diff]");
    const oldTxn = {
        amount: 2500,
        category_id: "cat-shopping",
        merchant: "Amazon",
        payment_method: "UPI",
        updated_at: "2026-09-14T08:00:00Z",
    };
    const newTxn = {
        amount: 2200,
        category_id: "cat-food",
        merchant: "Amazon",
        payment_method: "UPI",
        updated_at: "2026-09-14T08:30:00Z",
    };
    const diff = computeFieldDiff(oldTxn, newTxn);
    assert(diff !== null, "Diff computed for transaction update");
    assert(diff.amount.before === 2500 && diff.amount.after === 2200, "Amount diff correctly computed (2500 -> 2200)");
    assert(diff.category_id.before === "cat-shopping" && diff.category_id.after === "cat-food", "Category diff correctly computed");
    assert(diff.merchant === undefined, "Unchanged merchant field omitted from diff");
    assert(diff.updated_at === undefined, "Internal metadata updated_at omitted from diff");

    // 3. Security Failure Policy
    console.log("  [Security Failure Isolation Policy]");
    const nonCriticalRes = await auditLog({
        userId: null,
        action: "CREATE",
        resourceType: "transaction",
        isCritical: false,
    });
    assert(nonCriticalRes.success === false, "Non-critical audit call returned failure object gracefully");

    let threwError = false;
    try {
        await auditLog({
            userId: null,
            action: "AUTH_ELEVATION",
            resourceType: "profile",
            isCritical: true,
        });
    } catch (err) {
        threwError = true;
    }
    assert(threwError === true, "Critical audit call threw error as mandated by security policy");

    console.log(`Audit Suite: ${passed}/${total} passed.
`);
    return { passed, total };
}
