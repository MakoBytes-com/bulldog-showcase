import Link from "next/link";
import { FacebookIcon, InstagramIcon } from "./icons/Social";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { SITE, SOCIAL, HQ, PHONES, ADT_DEALER_NUMBERS } from "@/lib/site";

const FOOTER_LINKS = [
  { label: "Home", href: "/" },
  { label: "Solutions", href: "/solutions" },
  { label: "Automation", href: "/automation" },
  { label: "About Us", href: "/about-us" },
  { label: "Meet The Team", href: "/about-us/meet-the-team" },
  { label: "FAQ", href: "/about-us/faq" },
  { label: "Locations", href: "/locations" },
  { label: "News", href: "/news" },
  { label: "Careers", href: "/careers" },
  { label: "Contact Us", href: "/contact" },
  { label: "Schedule A Service", href: "/schedule" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const dealerLine = ADT_DEALER_NUMBERS.map((d) => `${d.number} (${d.state})`).join(", ");

  return (
    <footer className="mt-auto bg-brand-950 text-white/85">
      <Container className="py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div className="min-w-0">
          <div className="inline-block bg-white rounded-md px-4 py-3">
            <Logo size="md" />
          </div>
          <p className="mt-5 text-sm text-white/75">
            Family-owned ADT Authorized Dealer. Since {SITE.foundedYear}, we&rsquo;ve proudly
            helped protect {SITE.homesProtected} homes and families across Texas and Florida.
          </p>
          <div className="mt-5 flex gap-3">
            <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-white">
              <FacebookIcon className="h-5 w-5" />
            </a>
            <a href={SOCIAL.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-white">
              <InstagramIcon className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-display uppercase tracking-[0.2em] text-sm mb-4 text-white">
            Quick Links
          </h3>
          <ul className="space-y-2 text-sm">
            {FOOTER_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display uppercase tracking-[0.2em] text-sm mb-4 text-white">
            Corporate HQ
          </h3>
          <address className="not-italic text-sm space-y-1 text-white/75">
            <div className="font-semibold text-white">{HQ.label}</div>
            <div>{HQ.street}</div>
            {HQ.street2 && <div>{HQ.street2}</div>}
            <div>
              {HQ.city}, {HQ.state} {HQ.zip}
            </div>
            <div className="pt-3 space-y-1">
              <div>
                <a href={PHONES.main.href} className="hover:text-white">
                  Call: {PHONES.main.number}
                </a>
              </div>
              <div>
                <a href={PHONES.text.href} className="hover:text-white">
                  Text: {PHONES.text.number}
                </a>
              </div>
              <div>
                <a href={`mailto:${SITE.email}`} className="hover:text-white break-all">
                  {SITE.email}
                </a>
              </div>
            </div>
          </address>
        </div>

        <div>
          <h3 className="font-display uppercase tracking-[0.2em] text-sm mb-4 text-white">
            Stay Protected
          </h3>
          <p className="text-sm text-white/75 mb-4">
            Ready to help keep what matters most safe? Book a free virtual consultation.
          </p>
          <Link
            href="/schedule"
            className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-5 py-2.5 rounded-sm uppercase tracking-wider text-xs transition-colors"
          >
            Book a Virtual Consult
          </Link>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="py-6 text-xs text-white/55 space-y-3 leading-relaxed">
          <p>
            *ADT Command Interactive Services, which help you manage your home environment
            and family lifestyle, requires the purchase and/or activation of an ADT alarm
            system with monitored burglary service and a compatible computer, cell phone
            or PDA with Internet and email access. These ADT Command Interactive Solutions
            Services do not cover the operation or maintenance of any household equipment
            or systems that are connected to the ADT Command Interactive Solutions Services
            equipment. All ADT Command Interactive Solutions Services are not available
            with the various levels of ADT Command Interactive Solutions Services.
            All ADT Command Interactive Solutions Services may not be available in all
            geographic areas. Standard message and data rates may apply to text alerts.
            You may be required to pay additional charges to purchase equipment required
            to utilize the ADT Pulse Interactive Solutions Services features you desire.
            Two-way encryption only available with compatible SIX devices.
          </p>
          <p>
            ADT Authorized Dealer Numbers — {dealerLine}. Texas License Number — {SITE.texasLicense}.
          </p>
        </Container>
      </div>

      <div className="border-t border-white/10">
        <Container className="py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/55">
          <p>Copyright {currentYear} {SITE.legalName}. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms-conditions" className="hover:text-white">Terms &amp; Conditions</Link>
            <span aria-hidden="true" className="text-white/30">·</span>
            <span>
              Designed by{" "}
              <a href="https://makologics.com" target="_blank" rel="noopener" className="font-semibold text-white/75 hover:text-white">
                Mako Logics
              </a>
            </span>
          </div>
        </Container>
      </div>
    </footer>
  );
}
