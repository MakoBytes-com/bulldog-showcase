/**
 * Plain module on purpose — a "use server" file must export only async
 * functions. A const exported from one reaches the client as a callable
 * server-function reference; that exact shape 500'd this site's other forms
 * on 2026-09-14. See app/actions/form-state.ts.
 */

export type QuoteFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const INITIAL_QUOTE_STATE: QuoteFormState = {
  status: "idle",
  message: "",
};
