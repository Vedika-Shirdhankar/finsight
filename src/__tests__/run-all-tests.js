/**
 * FinSight Master Test Runner
 * Executes Analytics, Duplicate Detection, and Audit Security Test Suites.
 */
import { runAnalyticsTests } from "./analytics.test.js";
import { runDuplicateDetectorTests } from "./duplicate-detector.test.js";
import { runAuditTests } from "./audit-logger.test.js";

async function runAll() {
    console.log("==================================================");
    console.log("  FINSIGHT MASTER ENGINEERING TEST SUITE");
    console.log("==================================================\n");

    const t1 = await runAnalyticsTests();
    const t2 = await runDuplicateDetectorTests();
    const t3 = await runAuditTests();

    const totalPassed = t1.passed + t2.passed + t3.passed;
    const totalTests = t1.total + t2.total + t3.total;

    console.log("==================================================");
    console.log(`  FINAL RESULTS: ${totalPassed}/${totalTests} TESTS PASSED`);
    console.log("==================================================");

    if (totalPassed < totalTests) {
        process.exit(1);
    }
}

runAll().catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
});
