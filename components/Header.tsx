"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { NAV } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <Container className="flex items-center justify-between gap-6 py-4">
        <Link href="/" aria-label="Bulldog Security Service home" className="flex-shrink-0">
          <Logo size="sm" />
        </Link>

        <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
          {NAV.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </nav>

        <Link
          href="/schedule"
          className="hidden lg:inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-sm uppercase tracking-wider text-xs transition-colors"
        >
          Book a Virtual Consult
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>

        <button
          type="button"
          className="lg:hidden p-2 text-ink"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </Container>

      {mobileOpen && (
        <div className="lg:hidden border-t border-zinc-200 bg-white">
          <Container className="py-4">
            <nav aria-label="Mobile" className="flex flex-col gap-1">
              {NAV.map((item) => (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-2 text-ink font-medium hover:text-brand-600"
                  >
                    {item.label}
                  </Link>
                  {"children" in item && item.children && (
                    <div className="pl-4 flex flex-col">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="py-1.5 text-sm text-muted hover:text-brand-600"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
            <Link
              href="/schedule"
              onClick={() => setMobileOpen(false)}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-3 rounded-sm uppercase tracking-wider text-xs transition-colors"
            >
              Book a Virtual Consult
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </Container>
        </div>
      )}
    </header>
  );
}

type NavChild = { label: string; href: string };
type NavEntry = { label: string; href: string; children?: readonly NavChild[] };

function NavItem({ item }: { item: NavEntry }) {
  const hasChildren = "children" in item && item.children && item.children.length > 0;
  return (
    <div className="relative group">
      <Link
        href={item.href}
        className={cn(
          "inline-flex items-center gap-1 px-3 py-2 rounded-md text-sm font-semibold",
          "text-ink hover:bg-brand-50 hover:text-brand-700 transition-colors",
        )}
      >
        {item.label}
        {hasChildren && <ChevronDown className="h-3.5 w-3.5" />}
      </Link>
      {hasChildren && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all min-w-[220px]">
          <div className="bg-white rounded-md shadow-lg border border-zinc-200 py-2">
            {item.children!.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className="block px-4 py-2 text-sm text-ink hover:bg-brand-50 hover:text-brand-700"
              >
                {child.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
