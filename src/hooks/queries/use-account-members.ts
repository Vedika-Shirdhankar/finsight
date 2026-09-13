import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { queryKeys } from "./keys";

export type AccountMember = Database["public"]["Tables"]["account_members"]["Row"];
type MemberRole = Database["public"]["Enums"]["account_member_role"];

export function useAccountMembers(accountId: string | null) {
  return useQuery({
    queryKey: queryKeys.accountMembers(accountId ?? ""),
    enabled: !!accountId,
    queryFn: async (): Promise<AccountMember[]> => {
      const { data, error } = await supabase
        .from("account_members")
        .select("*")
        .eq("account_id", accountId!)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

export function useInviteMember(accountId: string, invitedByUserId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ invitedEmail, role }: { invitedEmail: string; role: MemberRole }) => {
      if (!invitedByUserId) throw new Error("Not signed in");
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
      if (error) throw error;
      return data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.accountMembers(accountId) }),
  });
}

export function useUpdateMemberRole(accountId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: MemberRole }) => {
      const { data, error } = await supabase
        .from("account_members")
        .update({ role })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.accountMembers(accountId) }),
  });
}

export function useRemoveMember(accountId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("account_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.accountMembers(accountId) }),
  });
}
