import { resolveErrorGroupAction } from "./actions";

export function ResolveButton({
  fingerprint,
  unresolved,
}: {
  fingerprint: string;
  unresolved: number;
}) {
  return (
    <form action={resolveErrorGroupAction} className="inline-block">
      <input type="hidden" name="fingerprint" value={fingerprint} />
      <button
        type="submit"
        className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
        title={`Mark all ${unresolved} unresolved occurrence${unresolved === 1 ? "" : "s"} as resolved`}
      >
        Resolve {unresolved > 1 ? `(${unresolved})` : ""}
      </button>
    </form>
  );
}
