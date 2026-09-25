import Image from "next/image";
import { cn } from "@/lib/utils";

/** NSS emblem + LICET crest lockup used in the navbar and footer. */
export function BrandLockup({ tone = "dark", compact = false, className }: { tone?: "dark" | "light"; compact?: boolean; className?: string }) {
  const onDark = tone === "light";
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <span className="flex items-center -space-x-2">
        <Image src="/brand/nss-logo.png" alt="NSS emblem" width={44} height={44} priority className="relative z-10 h-10 w-10 rounded-full shadow-sm ring-2 ring-white sm:h-11 sm:w-11" />
        <Image src="/brand/licet-logo.png" alt="LICET crest" width={44} height={44} priority className="h-10 w-10 rounded-full bg-white shadow-sm ring-2 ring-white sm:h-11 sm:w-11" />
      </span>
      {!compact && (
        <span className={cn("leading-tight", onDark ? "text-white" : "text-navy-900")}>
          <span className="block font-display text-[15px] font-bold tracking-tight">National Service Scheme</span>
          <span className={cn("block text-[11px] font-medium tracking-wide", onDark ? "text-white/60" : "text-navy-900/55")}>LICET Unit · Chennai</span>
        </span>
      )}
    </span>
  );
}
