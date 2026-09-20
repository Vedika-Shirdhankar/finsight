/**
 * FinSight Assistant Orchestration Service
 * 
 * Coordinates the full natural language query lifecycle:
 * Input Sanitization -> Intent Extraction -> Authorization Check -> Tool Execution -> Result Formatting -> Audit Logging
 */

import { parseUserIntent } from "./intent-parser.js";
import { dispatchToolExecution } from "./tool-executor.js";
import { auditLog } from "../audit-logger.js";

/**
 * Processes a natural-language assistant query.
 * 
 * @param {string} prompt - Raw user query
 * @param {Object} context - Authenticated user context { userId, transactions, budget, goals, recurringTxns, categories, accounts }
 * @returns {Promise<Object>} Assistant response object with structured card and action handlers
 */
export async function processAssistantMessage(prompt, context = {}) {
    if (!context.userId) {
        return {
            id: String(Date.now()),
            role: "assistant",
            result: {
                type: "SECURITY_REFUSAL",
                title: "Authentication Required",
                message: "You must be signed in to query your personal financial intelligence.",
            },
            timestamp: new Date().toISOString(),
        };
    }

    // 1. Parse intent & extract entities
    const intent = parseUserIntent(prompt, context.categories || []);

    // 2. Dispatch allowlisted tool execution
    const result = dispatchToolExecution(intent, context);

    // 3. Record Safe Audit Log Entry (Telemetry without sensitive data leakage)
    await auditLog({
        userId: context.userId,
        action: "ASSISTANT_QUERY",
        resourceType: "assistant",
        metadata: {
            intent: intent.intent,
            isSafe: intent.isSafe,
            resultType: result.type,
            hasConfirmation: !!result.requiresConfirmation,
        },
        isCritical: false,
    }).catch(() => {});

    return {
        id: String(Date.now()),
        role: "assistant",
        intent: intent.intent,
        result,
        timestamp: new Date().toISOString(),
    };
}
