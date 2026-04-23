type Props = {
  text: string;
};

/** Consent checkbox + legal disclosure text used across all Bulldog forms. */
export function ConsentBlock({ text }: Props) {
  return (
    <label className="flex items-start gap-3 text-xs text-white/85">
      <input
        type="checkbox"
        name="consent"
        required
        className="mt-0.5 h-4 w-4 rounded border-white/40 bg-white/10 text-brand-500 focus:ring-brand-400"
      />
      <span className="leading-snug">{text}</span>
    </label>
  );
}

/** Light-mode variant of the consent block for on-white form placements. */
export function ConsentBlockLight({ text }: Props) {
  return (
    <label className="flex items-start gap-3 text-xs text-muted">
      <input
        type="checkbox"
        name="consent"
        required
        className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-brand-600 focus:ring-brand-500"
      />
      <span className="leading-snug">{text}</span>
    </label>
  );
}
