import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "./keys";
import { auditLog } from "@/lib/audit-logger";

export function useAccountMembers(accountId) {
    return useQuery({
        queryKey: queryKeys.accountMembers(accountId ?? ""),
        enabled: !!accountId,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("account_members")
                .select("*")
                .eq("account_id", accountId)
                .order("created_at");
            if (error)
                throw error;
            return data;
        },
    });
}

export function useInviteMember(accountId, invitedByUserId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ invitedEmail, role }) => {
            if (!invitedByUserId)
                throw new Error("Not signed in");
            const { data, error } = await supabase
                .from("account_members")
                .insert({
                    account_id: accountId,
                    invited_by: invitedByUserId,
                    invited_email: invitedEmail.trim().toLowerCase(),
                    role,
                    status: "pending",
                })
                .select()
                .single();
            if (error)
                throw error;

            await auditLog({
                userId: invitedByUserId,
                action: "MEMBER_ADDED",
                resourceType: "account_member",
                resourceId: data.id,
                newData: data,
                metadata: {
                    account_id: accountId,
                    invited_email: invitedEmail,
                    role,
                },
            });

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.accountMembers(accountId) });
            queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
        },
    });
}

export function useUpdateMemberRole(accountId, currentUserId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, role }) => {
            const { data: oldMember } = await supabase
                .from("account_members")
                .select("*")
                .eq("id", id)
                .maybeSingle();

            const { data, error } = await supabase
                .from("account_members")
                .update({ role })
                .eq("id", id)
                .select()
                .single();

            if (error)
                throw error;

            if (currentUserId || data.invited_by) {
                await auditLog({
                    userId: currentUserId || data.invited_by,
                    action: "PERMISSION_CHANGED",
                    resourceType: "account_member",
                    resourceId: data.id,
                    oldData: oldMember,
                    newData: data,
                    metadata: {
                        account_id: accountId,
                        member_email: data.invited_email,
                        old_role: oldMember?.role,
                        new_role: role,
                    },
                });
            }

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.accountMembers(accountId) });
            queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
        },
    });
}

export function useRemoveMember(accountId, currentUserId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const { data: oldMember } = await supabase
                .from("account_members")
                .select("*")
                .eq("id", id)
                .maybeSingle();

            const { error } = await supabase.from("account_members").delete().eq("id", id);
            if (error)
                throw error;

            if (currentUserId || oldMember?.invited_by) {
                await auditLog({
                    userId: currentUserId || oldMember?.invited_by,
                    action: "MEMBER_REMOVED",
                    resourceType: "account_member",
                    resourceId: id,
                    oldData: oldMember,
                    metadata: {
                        account_id: accountId,
                        member_email: oldMember?.invited_email,
                    },
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.accountMembers(accountId) });
            queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
        },
    });
}
