import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
  /** For use on dark backgrounds — swaps in a white variant when we ship one. For now the same logo renders fine over dark. */
  onDark?: boolean;
};

const HEIGHT_CLASS: Record<NonNullable<Props["size"]>, string> = {
  xs: "h-7",
  sm: "h-9",
  md: "h-11",
  lg: "h-14",
};

/** Official Bulldog Security Service logomark. 305×71 source. */
export function Logo({ className, size = "md", onDark = false }: Props) {
  return (
    <Image
      src="/images/bulldog-logo.png"
      alt="Bulldog Security Service"
      width={305}
      height={71}
      priority
      className={cn(
        "w-auto",
        HEIGHT_CLASS[size],
        onDark ? "brightness-0 invert" : "",
        className,
      )}
    />
  );
}
