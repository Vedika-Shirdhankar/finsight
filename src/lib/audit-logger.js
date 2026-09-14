/**
 * FinSight Centralized Audit Logging Service
 * Captures, computes diffs, sanitizes secrets, and persists immutable audit trail records.
 *
 * Answers: Who did what, to which resource, when, and what changed?
 */
import { supabase } from "../integrations/supabase/client.js";

const BACKEND_URL = (typeof import.meta !== "undefined" && import.meta.env?.VITE_BACKEND_URL) || "http://localhost:5000";

// Sensitive key patterns to automatically strip from audit logs
const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /service_role/i,
  /api_key/i,
  /bearer/i,
  /private_key/i,
  /ssn/i,
  /cvv/i,
  /auth_code/i,
];

/**
 * Recursively sanitizes data to prevent secrets from ever reaching audit logs.
 */
export function sanitizeAuditData(data) {
  if (data === null || data === undefined) return data;
  if (typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeAuditData(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
    if (isSensitive) {
      sanitized[key] = "[REDACTED_SECRET]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeAuditData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Computes a field-level before/after diff between old and new state.
 * Reduces raw database payloads into readable change sets.
 */
export function computeFieldDiff(oldObj, newObj) {
  if (!oldObj || !newObj) return null;

  const diff = {};
  const ignoredFields = new Set(["created_at", "updated_at", "id", "user_id"]);
  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

  for (const key of allKeys) {
    if (ignoredFields.has(key)) continue;

    const oldVal = oldObj[key];
    const newVal = newObj[key];

    // Stringify objects or compare primitive values
    const oldStr = JSON.stringify(oldVal ?? null);
    const newStr = JSON.stringify(newVal ?? null);

    if (oldStr !== newStr) {
      diff[key] = {
        before: oldVal ?? null,
        after: newVal ?? null,
      };
    }
  }

  return Object.keys(diff).length > 0 ? sanitizeAuditData(diff) : null;
}

/**
 * Helper to persist audit logs in local storage as a fallback when DB table is not yet provisioned.
 */
function saveLocalAuditLog(recordPayload) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const existing = JSON.parse(window.localStorage.getItem("finsight_audit_logs_local") || "[]");
      const newEntry = {
        id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        ...recordPayload,
        created_at: new Date().toISOString(),
      };
      // Prevent duplicates
      const filtered = existing.filter((e) => e.id !== newEntry.id);
      const updated = [newEntry, ...filtered].slice(0, 300);
      window.localStorage.setItem("finsight_audit_logs_local", JSON.stringify(updated));
    }
  } catch (e) {
    console.warn("[Audit Logger] LocalStorage fallback notice:", e.message);
  }
}

/**
 * Centralized Audit Log Dispatcher
 *
 * @param {Object} params
 * @param {string} params.userId - Authenticated user ID
 * @param {string} params.action - Action performed (e.g. CREATE, UPDATE, DELETE, IMPORT, MEMBER_ADDED)
 * @param {string} params.resourceType - Resource category (transaction, account, budget, savings_goal, recurring_transaction, account_member, profile)
 * @param {string|number} [params.resourceId] - Affected resource ID
 * @param {Object} [params.oldData] - Prior data snapshot (for UPDATE/DELETE)
 * @param {Object} [params.newData] - Updated/created snapshot (for CREATE/UPDATE)
 * @param {Object} [params.metadata] - Extra contextual information (e.g. filename, row counts)
 * @param {boolean} [params.isCritical=false] - If true, audit log failure throws explicit error (security operations)
 */
export async function auditLog({
  userId,
  action,
  resourceType,
  resourceId = null,
  oldData = null,
  newData = null,
  metadata = {},
  isCritical = false,
}) {
  if (!userId) {
    console.warn("[Audit Logger] Cannot log audit event: Missing userId");
    if (isCritical) {
      throw new Error("Security Audit Failure: Missing userId");
    }
    return { success: false, error: "Missing userId" };
  }

  // Compute field diff if old and new data are present for an UPDATE
  let processedOld = sanitizeAuditData(oldData);
  let processedNew = sanitizeAuditData(newData);
  let computedDiff = null;

  if (action === "UPDATE" && oldData && newData) {
    computedDiff = computeFieldDiff(oldData, newData);
    processedOld = { diff: computedDiff };
    processedNew = { summary: "Updated fields recorded in diff" };
  }

  const recordPayload = {
    user_id: userId,
    action: action.toUpperCase(),
    resource_type: resourceType.toLowerCase(),
    resource_id: resourceId ? String(resourceId) : null,
    old_data: processedOld,
    new_data: processedNew,
    metadata: sanitizeAuditData({
      ...metadata,
      diff: computedDiff,
      client_timestamp: new Date().toISOString(),
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "Server",
    }),
  };

  // Always persist to client local storage as fallback so UI displays events immediately
  saveLocalAuditLog(recordPayload);

  try {
    // 1. Primary persistence: Insert into Supabase public.audit_logs table
    const { data, error } = await supabase
      .from("audit_logs")
      .insert(recordPayload)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // 2. Secondary telemetry dispatch to Render backend API if available (non-blocking)
    if (BACKEND_URL) {
      fetch(`${BACKEND_URL}/api/audit-logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recordPayload),
      }).catch((err) =>
        console.warn("[Audit Logger] Render backend audit mirror notice:", err.message)
      );
    }

    return { success: true, data };
  } catch (error) {
    console.warn(`[Audit Logger] Supabase table insert notice [${action} ${resourceType}]:`, error.message);

    // FAILURE BEHAVIOR POLICY:
    // Security-critical ops throw so callers block unsafe operations.
    // Standard UI operations log warning to avoid failing valid user financial transactions.
    if (isCritical) {
      throw new Error(`Security Audit Failure: ${error.message}`);
    }

    return { success: false, error: error.message };
  }
}

/**
 * Backward compatibility wrapper for existing logSensitiveAction calls
 */
export async function logSensitiveAction(userId, action, entityType, entityId, metadata = {}) {
  return auditLog({
    userId,
    action,
    resourceType: entityType,
    resourceId: entityId,
    metadata,
    isCritical: false,
  });
}
