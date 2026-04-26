"use client";

import type { SalesLead } from "@/lib/db/schema";

const PRINT_CSS = `
@media print {
  @page {
    size: 9in 6in;
    margin: 0;
  }
  html, body {
    background: white !important;
  }
  body * {
    visibility: hidden;
  }
  .postcard-sheet, .postcard-sheet * {
    visibility: visible;
  }
  .postcard-sheet {
    position: absolute;
    inset: 0;
  }
  .postcard {
    page-break-after: always;
    break-after: page;
    margin: 0;
    box-shadow: none !important;
    border: none !important;
    border-radius: 0 !important;
  }
  .no-print {
    display: none !important;
  }
}
.postcard {
  width: 9in;
  height: 6in;
  background: white;
  color: #0b1a2e;
  position: relative;
  overflow: hidden;
}
`;

type HQ = {
  name: string;
  street: string;
  street2: string | null;
  city: string;
  state: string;
  zip: string;
  phone: string;
};

type Props = {
  batchCode: string;
  leads: SalesLead[];
  qrDataUrl: string;
  trackingUrl: string;
  hq: HQ;
};

export function PostcardSheet({
  batchCode,
  leads,
  qrDataUrl,
  trackingUrl,
  hq,
}: Props) {
  return (
    <>
      {/*
        Print-only layout — the @page rule sets a 9"x6" landscape
        jumbo postcard size with no extra margin (USPS allows
        commercial postcards up to 6.125"x11.5"). Each lead produces
        two pages: the marketing front and the address back, so the
        printer can run them duplex.
      */}
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      <div className="no-print mb-4 flex items-center justify-between rounded-xl border border-[#1d3554] bg-[#0e2b5c]/40 px-5 py-3 text-sm">
        <div className="text-[#cfd9e5]">
          <span className="font-mono text-white">{batchCode}</span> —{" "}
          {leads.length} {leads.length === 1 ? "postcard" : "postcards"} ready
          to print. Each lead produces two pages (marketing front + address
          back). Use Chrome&rsquo;s &ldquo;Print to PDF&rdquo; for a digital
          copy or send straight to a 6&times;9 commercial printer.
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg bg-[#006fb9] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3a94d6]"
        >
          Print {leads.length * 2} pages
        </button>
      </div>

      {leads.length === 0 ? (
        <div className="no-print rounded-xl border border-[#1d3554] bg-[#0b1a2e] p-8 text-center">
          <p className="text-sm text-[#cfd9e5]">
            No leads attached to this batch. (The export event log
            doesn&rsquo;t list any leads with this batch code &mdash;
            possibly the batch was created on a stale schema migration.)
          </p>
        </div>
      ) : (
        <div className="postcard-sheet space-y-6">
          {leads.map((lead) => (
            <div key={lead.id} className="space-y-4 print:space-y-0">
              <PostcardFront
                qrDataUrl={qrDataUrl}
                trackingUrl={trackingUrl}
                phone={hq.phone}
                batchCode={batchCode}
              />
              <PostcardBack lead={lead} hq={hq} batchCode={batchCode} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function PostcardFront({
  qrDataUrl,
  trackingUrl,
  phone,
  batchCode,
}: {
  qrDataUrl: string;
  trackingUrl: string;
  phone: string;
  batchCode: string;
}) {
  return (
    <div className="postcard rounded-md border border-[#1d3554] shadow-2xl">
      <div className="flex h-full flex-col px-[0.5in] py-[0.5in]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="font-display text-2xl font-bold text-[#006fb9]">
              BULLDOG
            </div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">
              Security Service
            </div>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-zinc-500">
            #1 ADT Authorized Dealer in Texas
          </div>
        </div>

        <div className="mt-6 flex flex-1 items-center gap-8">
          <div className="flex-1">
            <div className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">
              Welcome to the neighborhood
            </div>
            <h2
              className="mt-2 font-display font-bold leading-[1.05] text-[#0b1a2e]"
              style={{ fontSize: "44px" }}
            >
              Protect what matters most.
            </h2>
            <p
              className="mt-3 text-zinc-700"
              style={{ fontSize: "14px", lineHeight: "1.5" }}
            >
              ADT-monitored security from Houston&rsquo;s most-trusted
              dealer. Already with another provider?{" "}
              <strong>We&rsquo;ll match your contract rate</strong> and
              upgrade your equipment.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Pill label="A+" sub="BBB rating" />
              <Pill label="4.4★" sub="Google" />
              <Pill label="20+" sub="Years local" />
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="rounded-md border border-zinc-300 bg-white p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt="Scan for free quote"
                style={{ width: "1.4in", height: "1.4in", display: "block" }}
              />
            </div>
            <div className="mt-2 text-[10px] uppercase tracking-widest text-zinc-500">
              Scan for free quote
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-zinc-200 pt-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">
              Call now
            </div>
            <div
              className="font-display text-[#006fb9]"
              style={{ fontSize: "26px", fontWeight: 700 }}
            >
              {phone}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">
              Or visit
            </div>
            <div className="font-mono text-[12px] text-[#0b1a2e]">
              {trackingUrl.replace(/^https?:\/\//, "")}
            </div>
            <div className="mt-0.5 font-mono text-[9px] text-zinc-400">
              ref {batchCode}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostcardBack({
  lead,
  hq,
  batchCode,
}: {
  lead: SalesLead;
  hq: HQ;
  batchCode: string;
}) {
  const cityStateZip = [lead.city, lead.state, lead.zip]
    .filter(Boolean)
    .join(", ")
    .replace(/,\s*([A-Z]{2})/, " $1");

  return (
    <div className="postcard rounded-md border border-[#1d3554] shadow-2xl">
      <div className="grid h-full grid-cols-2 gap-[0.4in] px-[0.5in] py-[0.5in]">
        {/* Left half — message side / return address */}
        <div className="flex flex-col">
          <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            From
          </div>
          <div className="mt-1 leading-tight" style={{ fontSize: "11px" }}>
            <div className="font-bold text-[#0b1a2e]">{hq.name}</div>
            <div className="text-zinc-700">{hq.street}</div>
            {hq.street2 ? (
              <div className="text-zinc-700">{hq.street2}</div>
            ) : null}
            <div className="text-zinc-700">
              {hq.city}, {hq.state} {hq.zip}
            </div>
          </div>

          <div className="mt-6">
            <div
              className="font-display font-bold leading-tight text-[#0b1a2e]"
              style={{ fontSize: "20px" }}
            >
              Hi from your neighbors at Bulldog.
            </div>
            <p
              className="mt-2 text-zinc-700"
              style={{ fontSize: "12px", lineHeight: "1.5" }}
            >
              We saw the welcome sign go up and wanted to introduce
              ourselves. We&rsquo;re Bulldog Security Service &mdash;
              ADT&rsquo;s top-ranked dealer in Texas, family-owned, and
              based right here in {hq.city}. If you ever want a
              no-obligation walk-through of your home&rsquo;s security
              setup, scan the QR on the front or call the number below.
            </p>
            <p
              className="mt-2 text-zinc-700"
              style={{ fontSize: "12px", lineHeight: "1.5" }}
            >
              And if you&rsquo;re already with another provider &mdash;{" "}
              <strong>we&rsquo;ll match your contract rate.</strong>
            </p>
          </div>

          <div className="mt-auto pt-2 text-[9px] text-zinc-400">
            TX License {"B15560"} &middot; ref {batchCode}
          </div>
        </div>

        {/* Right half — address block + indicia */}
        <div className="relative flex flex-col">
          <div className="absolute right-0 top-0 h-[0.85in] w-[0.85in] border border-zinc-300 p-1 text-center">
            <div className="text-[7px] uppercase tracking-widest text-zinc-500">
              Presort
            </div>
            <div className="text-[7px] uppercase tracking-widest text-zinc-500">
              Std
            </div>
            <div className="text-[7px] uppercase tracking-widest text-zinc-500">
              US Postage
            </div>
            <div className="text-[7px] uppercase tracking-widest text-zinc-500">
              Paid
            </div>
            <div className="mt-0.5 text-[7px] font-bold text-zinc-700">
              Houston, TX
            </div>
            <div className="text-[7px] font-bold text-zinc-700">
              Permit ###
            </div>
          </div>

          <div className="mt-[1.3in] flex-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              To
            </div>
            <div
              className="mt-2 leading-snug text-[#0b1a2e]"
              style={{ fontSize: "14px" }}
            >
              <div className="font-bold">{lead.name}</div>
              <div>{lead.address ?? ""}</div>
              <div>{cityStateZip}</div>
            </div>
          </div>

          <div className="border-t border-zinc-200 pt-2 text-right text-[8px] text-zinc-400">
            Bulldog Security Service &middot; A+ BBB &middot; (832) 585-0725
          </div>
        </div>
      </div>
    </div>
  );
}

function Pill({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-center">
      <div className="font-display text-[18px] font-bold text-[#006fb9]">
        {label}
      </div>
      <div className="text-[8px] uppercase tracking-widest text-zinc-500">
        {sub}
      </div>
    </div>
  );
}
