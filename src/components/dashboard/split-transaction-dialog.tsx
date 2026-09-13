import { useEffect, useState } from "react";
import { useAccountMembers } from "@/hooks/queries/use-account-members";
import type { TransactionSplitInput } from "@/hooks/queries/use-transactions";

export function SplitTransactionDialog({
  accountId,
  amount,
  open,
  onClose,
  onSave,
}: {
  accountId: string;
  amount: number;
  open: boolean;
  onClose: () => void;
  onSave: (splits: TransactionSplitInput[]) => void;
}) {
  const { data: members } = useAccountMembers(accountId);
  const [selected, setSelected] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => {
    if (open) {
      const ids =
        members?.filter((member) => member.status === "accepted").map((member) => member.id) ?? [];
      setSelected(ids);
      const equal = ids.length ? (amount / ids.length).toFixed(2) : "";
      setValues(Object.fromEntries(ids.map((id) => [id, equal])));
    }
  }, [open, members, amount]);
  if (!open) return null;
  const total = selected.reduce((sum, id) => sum + (Number(values[id]) || 0), 0);
  const valid = selected.length > 0 && Math.abs(total - amount) < 0.01;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-line bg-panel p-6 shadow-2xl">
        <h2 className="font-display text-xl font-bold">Split transaction</h2>
        <p className="mt-1 text-xs text-mute">
          Allocate ₹{amount.toLocaleString("en-IN")} across accepted account members.
        </p>
        <div className="mt-5 space-y-3">
          {members
            ?.filter((member) => member.status === "accepted")
            .map((member) => (
              <label
                key={member.id}
                className="flex items-center gap-3 rounded-lg border border-line bg-raise p-3 text-sm"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(member.id)}
                  onChange={(event) =>
                    setSelected((ids) =>
                      event.target.checked
                        ? [...ids, member.id]
                        : ids.filter((id) => id !== member.id),
                    )
                  }
                />
                <span className="flex-1">{member.invited_email}</span>
                <input
                  disabled={!selected.includes(member.id)}
                  type="number"
                  min="0"
                  step="0.01"
                  value={values[member.id] ?? ""}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [member.id]: event.target.value }))
                  }
                  className="w-28 rounded border border-line bg-panel px-2 py-1 text-right font-mono text-xs"
                />
              </label>
            ))}
        </div>
        <div className={`mt-3 text-xs ${valid ? "text-signal" : "text-warning-signal"}`}>
          Allocated: ₹{total.toLocaleString("en-IN")} / ₹{amount.toLocaleString("en-IN")}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-line px-4 py-2 text-xs text-mute"
          >
            Cancel
          </button>
          <button
            disabled={!valid}
            onClick={() => {
              onSave(
                selected.map((id) => ({
                  account_member_id: id,
                  share_amount: Number(values[id]),
                  share_percent: amount ? (Number(values[id]) / amount) * 100 : null,
                })),
              );
              onClose();
            }}
            className="fs-clip bg-signal px-4 py-2 text-xs font-medium text-signal-foreground disabled:opacity-50"
          >
            Save split
          </button>
        </div>
      </div>
    </div>
  );
}
