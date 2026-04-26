// Cache-bust: 2026-04-25T15:38 — force Turbopack chunk hash to change so
// Vercel's build-cache restore can't reuse the pre-fix compiled output.
import sanitizeHtml from "sanitize-html";
import { marked } from "marked";

marked.setOptions({
  breaks: false,
  gfm: true,
});

// `isomorphic-dompurify` was tried first but transitively pulls in `jsdom`,
// which breaks at runtime on Vercel's Node bundler with ERR_REQUIRE_ESM
// against `@exodus/bytes/encoding-lite.js`. `sanitize-html` is a pure-JS
// allowlist sanitizer with no jsdom dep — same XSS guarantees, ships clean.
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    ...sanitizeHtml.defaults.allowedTags,
    "img",
    "h1",
    "h2",
    "figure",
    "figcaption",
  ],
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    a: ["href", "name", "target", "rel", "title"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    "*": ["id"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https", "data"] },
  disallowedTagsMode: "discard",
};

/**
 * Render Markdown to a sanitized HTML string.
 *
 * `marked` does NOT strip XSS payloads on its own — raw HTML and
 * javascript: URLs in markdown round-trip into the output. Anything
 * that ends up in `dangerouslySetInnerHTML` MUST go through this
 * function, never `marked.parse()` directly.
 */
export function renderMarkdown(md: string | null | undefined): string {
  if (!md) return "";
  const rawHtml = marked.parse(md) as string;
  return sanitizeHtml(rawHtml, SANITIZE_OPTIONS);
}

/** Word count for reading-minutes estimation. */
export function estimateReadingMinutes(md: string | null | undefined): number {
  if (!md) return 0;
  const words = md.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 225));
}
