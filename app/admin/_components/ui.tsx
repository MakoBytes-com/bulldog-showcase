/**
 * Shared admin UI primitives. Dark Mako theme, generous sizing,
 * readable type. Used across every /admin page to keep things
 * visually consistent without pulling in a UI library.
 */

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-[#cfd9e5]">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-[#1d3554] bg-[#112740] ${className}`}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="px-6 py-12 text-center">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-[#cfd9e5]">
        {description}
      </p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </Card>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="mb-5 block">
      <span className="mb-1.5 block text-sm font-medium text-[#cfd9e5]">
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-[#7a8aa0]">{hint}</span> : null}
      {error ? <span className="mt-1 block text-xs text-red-300">{error}</span> : null}
    </label>
  );
}

const inputClass =
  "block w-full rounded-md border border-[#1d3554] bg-[#0b1a2e] px-4 py-3 text-base text-white outline-none placeholder:text-[#7a8aa0] focus:border-[#006fb9] disabled:opacity-60";

export function Input(props: ComponentProps<"input">) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function Textarea(props: ComponentProps<"textarea">) {
  return (
    <textarea
      {...props}
      className={`${inputClass} min-h-[140px] font-mono text-sm leading-6 ${props.className ?? ""}`}
    />
  );
}

export function Select(props: ComponentProps<"select">) {
  return (
    <select
      {...props}
      className={`${inputClass} appearance-none pr-10 ${props.className ?? ""}`}
    />
  );
}

export function Checkbox({
  label,
  ...props
}: ComponentProps<"input"> & { label: string }) {
  return (
    <label className="mb-4 flex cursor-pointer items-center gap-3 text-sm text-[#cfd9e5]">
      <input
        type="checkbox"
        {...props}
        className="h-5 w-5 rounded border-[#1d3554] bg-[#0b1a2e] text-[#006fb9] focus:ring-[#006fb9]"
      />
      <span>{label}</span>
    </label>
  );
}

const btnBase =
  "inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60";

export function PrimaryButton(props: ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={`${btnBase} bg-[#006fb9] text-white hover:bg-[#3a94d6] ${props.className ?? ""}`}
    />
  );
}

export function SecondaryButton(props: ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={`${btnBase} border border-[#1d3554] bg-[#112740] text-[#cfd9e5] hover:border-[#3a94d6] hover:text-white ${props.className ?? ""}`}
    />
  );
}

export function DangerButton(props: ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={`${btnBase} border border-red-500/40 bg-red-500/10 text-red-200 hover:bg-red-500/20 ${props.className ?? ""}`}
    />
  );
}

export function PrimaryLink({
  children,
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      className={`${btnBase} bg-[#006fb9] text-white hover:bg-[#3a94d6] ${props.className ?? ""}`}
    >
      {children}
    </Link>
  );
}

export function SecondaryLink({
  children,
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      className={`${btnBase} border border-[#1d3554] bg-[#112740] text-[#cfd9e5] hover:border-[#3a94d6] hover:text-white ${props.className ?? ""}`}
    >
      {children}
    </Link>
  );
}

export function Pill({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "success" | "warn" | "danger" | "info";
}) {
  const tones = {
    default: "border-[#1d3554] bg-[#0e2b5c] text-[#cfd9e5]",
    success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
    warn: "border-amber-500/40 bg-amber-500/10 text-amber-200",
    danger: "border-red-500/40 bg-red-500/10 text-red-200",
    info: "border-[#3a94d6]/40 bg-[#006fb9]/15 text-[#cfd9e5]",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Alert({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: "info" | "success" | "warn" | "danger";
}) {
  const tones = {
    info: "border-[#3a94d6]/40 bg-[#006fb9]/10 text-[#cfd9e5]",
    success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
    warn: "border-amber-500/40 bg-amber-500/10 text-amber-200",
    danger: "border-red-500/40 bg-red-500/10 text-red-200",
  };
  return (
    <div className={`mb-4 rounded-md border px-4 py-3 text-sm ${tones[tone]}`}>
      {children}
    </div>
  );
}
