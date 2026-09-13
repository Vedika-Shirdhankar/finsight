import { useAccountMembers } from "@/hooks/queries/use-account-members";
import { useMemberContributions } from "@/hooks/queries/use-transaction-splits";
export function MemberContributionList({
  accountId,
  accountTotal,
}: {
  accountId: string;
  accountTotal: number;
}) {
  const { data: members } = useAccountMembers(accountId);
  const { data: contributions, isLoading } = useMemberContributions(accountId);
  if (isLoading) return <div className="mt-4 text-xs text-mute">Loading members…</div>;
  if (!members?.length)
    return <div className="mt-4 text-xs text-mute">No members invited yet.</div>;
  return (
    <div className="mt-4 border-t border-line pt-3">
      <div className="mb-2 text-[10px] font-mono uppercase tracking-[.14em] text-mute">
        Members & contributions
      </div>
      <div className="space-y-2">
        {members.map((member) => {
          const total =
            contributions?.find((item) => item.memberId === member.id)?.totalContributed ?? 0;
          const share = accountTotal > 0 ? (total / accountTotal) * 100 : 0;
          return (
            <div key={member.id} className="flex items-center justify-between text-xs">
              <div>
                <span className="text-ink">{member.invited_email}</span>
                <span className="ml-2 rounded bg-raise px-1.5 py-0.5 font-mono text-[9px] uppercase text-mute">
                  {member.role}
                </span>
              </div>
              <span className="font-mono text-mute">
                ₹{total.toLocaleString("en-IN")} · {share.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
