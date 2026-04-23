import Link from "next/link";
import { FacebookIcon, InstagramIcon } from "./icons/Social";
import { Container } from "./Container";
import { PHONES, SOCIAL } from "@/lib/site";
import { Phone } from "lucide-react";

export function TopBar() {
  return (
    <div className="bg-brand-900 text-white text-xs sm:text-sm">
      <Container className="flex flex-col sm:flex-row items-center justify-between gap-2 py-2.5">
        <div className="flex items-center gap-4 font-semibold">
          <a href={PHONES.main.href} className="inline-flex items-center gap-1.5 hover:text-brand-200 transition-colors">
            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            {PHONES.main.number}
          </a>
          <span className="hidden sm:inline text-white/30" aria-hidden="true">·</span>
          <a href={PHONES.text.href} className="hidden sm:inline hover:text-brand-200 transition-colors">
            Text {PHONES.text.number}
          </a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <span className="font-semibold tracking-[0.2em] uppercase text-white/75">
            #1 ADT Authorized Dealer in Texas
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline font-semibold tracking-wider uppercase text-white/75">Follow:</span>
          <Link href={SOCIAL.facebook} aria-label="Facebook" target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
            <FacebookIcon className="h-4 w-4" />
          </Link>
          <Link href={SOCIAL.linkedin} aria-label="LinkedIn" target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
            <InstagramIcon className="h-4 w-4" />
          </Link>
        </div>
      </Container>
    </div>
  );
}
