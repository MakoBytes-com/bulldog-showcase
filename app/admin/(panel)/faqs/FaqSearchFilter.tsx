"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Client-side filter for the FAQs admin list. Reads the static
 * server-rendered DOM and uses data-* attributes to decide which
 * page-detail and family-detail blocks to show/hide as the user
 * types. No re-render of the row data — pure DOM toggling.
 *
 * - Each <details data-faq-page="..."> on a page-section card
 *   carries `data-search-text` (concatenation of every FAQ on that
 *   page + the page path itself, lowercased).
 * - Each <details data-faq-family="..."> on a family-section block
 *   wraps its pages.
 *
 * On input:
 *   - Hide pages whose data-search-text doesn't include the query
 *   - Force-open pages that match (and their containing family)
 *   - Hide families with zero matching pages
 *   - Update the result count + clear button
 * On empty: reset everything to default-collapsed.
 */
export default function FaqSearchFilter() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [count, setCount] = useState<number | null>(null);

  function applyFilter(query: string) {
    const q = query.trim().toLowerCase();
    const pages = document.querySelectorAll<HTMLDetailsElement>(
      "details[data-faq-page]",
    );
    const families = document.querySelectorAll<HTMLDetailsElement>(
      "details[data-faq-family]",
    );

    if (q === "") {
      pages.forEach((p) => {
        p.style.display = "";
        p.open = false;
      });
      families.forEach((f) => {
        f.style.display = "";
        f.open = false;
      });
      setCount(null);
      return;
    }

    // Mark families fresh; we'll set them open if any of their pages match.
    families.forEach((f) => {
      f.dataset.matchCount = "0";
      f.open = false;
    });

    let totalMatchingPages = 0;
    pages.forEach((p) => {
      const hay = (p.dataset.searchText ?? "").toLowerCase();
      if (hay.includes(q)) {
        p.style.display = "";
        p.open = true;
        totalMatchingPages++;
        const family = p.closest<HTMLDetailsElement>("details[data-faq-family]");
        if (family) {
          family.dataset.matchCount = String(
            (parseInt(family.dataset.matchCount ?? "0", 10) || 0) + 1,
          );
        }
      } else {
        p.style.display = "none";
      }
    });

    families.forEach((f) => {
      const n = parseInt(f.dataset.matchCount ?? "0", 10) || 0;
      if (n === 0) {
        f.style.display = "none";
      } else {
        f.style.display = "";
        f.open = true;
      }
    });

    setCount(totalMatchingPages);
  }

  // Keep '/' as a focus shortcut if not already in a text field.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;
      if (e.key === "/" && !isTyping) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="search"
          placeholder="Search FAQs by question, answer, or page path… ( / to focus )"
          onChange={(e) => applyFilter(e.target.value)}
          className="w-full rounded-lg border border-[#1d3554] bg-[#0b1a2e] px-4 py-2.5 text-sm text-white placeholder:text-[#7a8aa0] outline-none focus:border-[#3a94d6]"
        />
      </div>
      {count !== null && (
        <div className="flex items-center gap-3 text-xs text-[#cfd9e5]">
          <span>
            {count === 0
              ? "no matches"
              : `${count} matching ${count === 1 ? "page" : "pages"}`}
          </span>
          <button
            type="button"
            onClick={() => {
              if (inputRef.current) {
                inputRef.current.value = "";
                applyFilter("");
              }
            }}
            className="rounded-md border border-[#1d3554] bg-[#152e4a] px-3 py-1 text-xs font-medium text-[#cfd9e5] hover:border-[#3a94d6] hover:text-white"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
