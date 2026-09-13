import { useState } from "react";
import { useInviteMember } from "@/hooks/queries/use-account-members";
import type { Database } from "@/integrations/supabase/types";

type Role = Database["public"]["Enums"]["account_member_role"];
export function InviteMemberDialog({
  accountId,
  userId,
  open,
  onClose,
}: {
  accountId: string;
  userId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const invite = useInviteMember(accountId, userId);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("viewer");
  if (!open) return null;
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    await invite.mutateAsync({ invitedEmail: email, role });
    setEmail("");
    onClose();
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-xl border border-line bg-panel p-6 shadow-2xl"
      >
        <h2 className="font-display text-xl font-bold">Invite account member</h2>
        <p className="mt-1 text-xs text-mute">
          Invite someone to this shared account. They will have the selected access level after
          accepting.
        </p>
        <label className="mt-5 block text-xs text-mute">
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-raise px-3 py-2 text-sm text-ink outline-none focus:border-signal"
          />
        </label>
        <label className="mt-4 block text-xs text-mute">
          Role
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as Role)}
            className="mt-1 w-full rounded-lg border border-line bg-raise px-3 py-2 text-sm text-ink"
          >
            <option value="viewer">Viewer — view only</option>
            <option value="editor">Editor — manage transactions</option>
            <option value="owner">Owner — full account access</option>
          </select>
        </label>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-line px-4 py-2 text-xs text-mute"
          >
            Cancel
          </button>
          <button
            disabled={invite.isPending}
            className="fs-clip bg-signal px-4 py-2 text-xs font-medium text-signal-foreground disabled:opacity-50"
          >
            {invite.isPending ? "Inviting…" : "Send invite"}
          </button>
        </div>
      </form>
    </div>
  );
}
