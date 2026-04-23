/** Invisible field — bots fill it, humans never see it. */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden">
      <label>
        Leave this field empty
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}
