import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Helper to read local audit log fallback records
 */
function getLocalAuditLogs(userId, options = {}) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return [];
    const local = JSON.parse(window.localStorage.getItem("finsight_audit_logs_local") || "[]");

    const { action = "", resourceType = "", search = "" } = options;

    return local.filter((log) => {
      if (log.user_id && userId && log.user_id !== userId && !options.isAdmin) return false;
      if (action && log.action?.toUpperCase() !== action.toUpperCase()) return false;
      if (resourceType && log.resource_type?.toLowerCase() !== resourceType.toLowerCase()) return false;
      if (search) {
        const s = search.toLowerCase();
        const str = `${log.action} ${log.resource_type} ${log.resource_id} ${JSON.stringify(log.metadata)}`.toLowerCase();
        if (!str.includes(s)) return false;
      }
      return true;
    });
  } catch (e) {
    return [];
  }
}

/**
 * TanStack Query hook for server-side paginated and filtered Audit Logs.
 * Merges Supabase records with client local fallback records for seamless visualization.
 */
export function useAuditLogs(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    action = "",
    resourceType = "",
    startDate = null,
    endDate = null,
    search = "",
    targetUserId = null,
  } = options;

  return useQuery({
    queryKey: [
      "audit-logs",
      userId ?? "",
      page,
      limit,
      action,
      resourceType,
      startDate,
      endDate,
      search,
      targetUserId,
    ],
    queryFn: async () => {
      if (!userId) throw new Error("Not signed in");

      const localLogs = getLocalAuditLogs(userId, options);

      // Try RPC first for server-side paginated & total-counted search
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc("get_audit_logs", {
          p_user_id: targetUserId || (options.isAdmin ? null : userId),
          p_action: action || null,
          p_resource_type: resourceType || null,
          p_start_date: startDate ? new Date(startDate).toISOString() : null,
          p_end_date: endDate ? new Date(endDate).toISOString() : null,
          p_search: search || null,
          p_page: page,
          p_limit: limit,
        });

        if (!rpcError && Array.isArray(rpcData) && rpcData.length > 0) {
          const totalCount = rpcData[0]?.total_count ? Number(rpcData[0].total_count) : rpcData.length;
          const totalPages = Math.max(1, Math.ceil(totalCount / limit));
          return {
            logs: rpcData.map(({ total_count, ...log }) => log),
            totalCount,
            totalPages,
            page,
            limit,
          };
        }
      } catch (e) {
        // RPC fallback
      }

      // Try direct table query
      try {
        let query = supabase
          .from("audit_logs")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false });

        if (!options.isAdmin || targetUserId) {
          query = query.eq("user_id", targetUserId || userId);
        }

        if (action) {
          query = query.eq("action", action.toUpperCase());
        }

        if (resourceType) {
          query = query.eq("resource_type", resourceType.toLowerCase());
        }

        if (startDate) {
          query = query.gte("created_at", new Date(startDate).toISOString());
        }

        if (endDate) {
          query = query.lte("created_at", new Date(endDate).toISOString());
        }

        if (search) {
          query = query.or(`action.ilike.%${search}%,resource_type.ilike.%${search}%,resource_id.ilike.%${search}%`);
        }

        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data, count, error } = await query;

        if (!error && Array.isArray(data) && data.length > 0) {
          const totalCount = count ?? data.length;
          const totalPages = Math.max(1, Math.ceil(totalCount / limit));

          // Combine DB records with local fallback entries
          const dbIds = new Set(data.map((d) => d.id));
          const uniqueLocal = localLogs.filter((l) => !dbIds.has(l.id));
          const merged = [...data, ...uniqueLocal].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

          return {
            logs: merged.slice(0, limit),
            totalCount: Math.max(totalCount, merged.length),
            totalPages: Math.max(1, Math.ceil(Math.max(totalCount, merged.length) / limit)),
            page,
            limit,
          };
        }
      } catch (e) {
        // Table query fallback
      }

      // If remote database table is not yet provisioned, seamlessly display client local fallback logs
      const totalCount = localLogs.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / limit));
      const from = (page - 1) * limit;
      const paginatedLocal = localLogs.slice(from, from + limit);

      return {
        logs: paginatedLocal,
        totalCount,
        totalPages,
        page,
        limit,
      };
    },
    enabled: !!userId,
    keepPreviousData: true,
  });
}
