import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
};

const HEIGHT_CLASS: Record<NonNullable<Props["size"]>, string> = {
  xs: "h-7",
  sm: "h-9",
  md: "h-11",
  lg: "h-14",
};

/** Official Bulldog Security Service logomark (ADT Authorized Dealer). 305×71 source.
 * Designed for light backgrounds — on dark surfaces, wrap in a white card. */
export function Logo({ className, size = "md" }: Props) {
  return (
    <Image
      src="/images/bulldog-logo.png"
      alt="Bulldog Security Service — ADT Authorized Dealer"
      width={305}
      height={71}
      priority
      className={cn("w-auto", HEIGHT_CLASS[size], className)}
    />
  );
}
