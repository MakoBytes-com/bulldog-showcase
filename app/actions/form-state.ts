/**
 * The form-state shape, in a PLAIN module on purpose.
 *
 * This used to live in submit-form.ts, which starts with "use server" — and
 * every export of a "use server" file reaches the client as a CALLABLE
 * server-function reference, even a const object. That proxy sat harmless in
 * useActionState for months until CaptchaField passed the state into
 * useState(resetOn): React treats a function argument as a lazy initializer
 * and CALLS it during the first render, which is exactly the "Server
 * Functions cannot be called during initial render" crash that 500'd every
 * page carrying a form. Constants never belong in a "use server" file.
 */

export type FormType = "consult" | "contact" | "schedule" | "careers";

export type FormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const INITIAL_STATE: FormState = { status: "idle", message: "" };
