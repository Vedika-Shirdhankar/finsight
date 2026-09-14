/**
 * Unit & Security Test Suite for FinSight Audit Logging System
 */
import { sanitizeAuditData, computeFieldDiff, auditLog } from "../lib/audit-logger.js";

async function runTests() {
  console.log("=== FinSight Audit Logging System Test Suite ===");
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${message}`);
      process.exitCode = 1;
    }
  }

  // Test 1: Secret Sanitization
  console.log("\n1. Testing Secret Sanitization Guard...");
  const rawPayload = {
    username: "vedika",
    password: "SuperSecretPassword123!",
    api_key: "sk_live_998877",
    nested: {
      auth_token: "bearer-token-abc",
      user_id: "user-123",
    },
  };
  const sanitized = sanitizeAuditData(rawPayload);
  assert(sanitized.password === "[REDACTED_SECRET]", "Password field redacted");
  assert(sanitized.api_key === "[REDACTED_SECRET]", "API key redacted");
  assert(sanitized.nested.auth_token === "[REDACTED_SECRET]", "Nested auth token redacted");
  assert(sanitized.username === "vedika", "Non-sensitive username preserved");

  // Test 2: Field Diff Calculation
  console.log("\n2. Testing Before/After Field Diff Generation...");
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

  // Test 3: CSV Import Metrics Metadata
  console.log("\n3. Testing CSV Import Metrics Metadata Payload...");
  const csvMeta = {
    filename: "september_transactions.csv",
    number_of_rows: 150,
    successful_rows: 142,
    failed_rows: 0,
    duplicate_rows: 8,
  };
  const sanitizedMeta = sanitizeAuditData(csvMeta);
  assert(sanitizedMeta.filename === "september_transactions.csv", "CSV filename recorded");
  assert(sanitizedMeta.successful_rows === 142, "Successful rows recorded");
  assert(sanitizedMeta.duplicate_rows === 8, "Duplicate rows metric recorded");

  // Test 4: Critical vs Non-Critical Failure Isolation
  console.log("\n4. Testing Audit Failure Isolation Policy...");
  const nonCriticalRes = await auditLog({
    userId: null, // intentionally missing to trigger error in non-critical mode
    action: "CREATE",
    resourceType: "transaction",
    isCritical: false,
  });
  assert(nonCriticalRes.success === false, "Non-critical audit call returned failure object gracefully without throwing");

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

  console.log(`\n=== Test Results: ${passed}/${total} passed ===\n`);
}

runTests();
