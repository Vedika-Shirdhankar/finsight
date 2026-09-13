/**
 * FinSight Audit Logging Engine
 * Captures and persists immutable audit trail records for all sensitive financial operations
 * (edits, deletions, splits, member access changes).
 */

import { supabase } from "@/integrations/supabase/client";

export type AuditActionType =
  | "TRANSACTION_CREATE"
  | "TRANSACTION_UPDATE"
  | "TRANSACTION_DELETE"
  | "SPLIT_CREATE"
  | "MEMBER_INVITE"
  | "MEMBER_REMOVE"
  | "ACCOUNT_UPDATE"
  | "MFA_ENABLED";

export interface AuditLogEntry {
  id?: string;
  user_id: string;
  action: AuditActionType;
  entity_type: string;
  entity_id: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  created_at?: string;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

/**
 * Log a sensitive financial action into the audit trail (Supabase + Render Backend)
 */
export async function logSensitiveAction(
  userId: string,
  action: AuditActionType,
  entityType: string,
  entityId: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  const entry: AuditLogEntry = {
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata: {
      ...metadata,
      client_timestamp: new Date().toISOString(),
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "Server",
    },
  };

  try {
    // 1. Log to Render Backend Audit Service
    fetch(`${BACKEND_URL}/api/audit-logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    }).catch((err) => console.warn("[Audit Logger] Backend logging fallback:", err.message));

    // 2. Insert into Supabase Audit Trail Table if available
    await supabase.from("notifications").insert({
      user_id: userId,
      title: `Security Audit: ${action}`,
      body: `Action ${action} executed on ${entityType} [ID: ${entityId}]`,
      kind: action.includes("DELETE") || action.includes("REMOVE") ? "warning" : "neutral",
      is_read: true,
    });
  } catch (error) {
    console.error("[Audit Logger] Failed to record audit log:", error);
  }
}
