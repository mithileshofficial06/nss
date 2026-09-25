"use client";

import { useSyncExternalStore } from "react";

const subscribe = (cb: () => void) => {
  const id = setInterval(cb, 1000);
  return () => clearInterval(id);
};

const fmt = (opts: Intl.DateTimeFormatOptions) => () => new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", ...opts }).format(new Date());
const time = fmt({ hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
const date = fmt({ weekday: "short", day: "numeric", month: "short", year: "numeric" });

/** Ticking Chennai time, e.g. "14:09:32 (IST)". Renders a stable placeholder on the server. */
export function LiveTime({ className }: { className?: string }) {
  const t = useSyncExternalStore(subscribe, time, () => "--:--:--");
  return (
    <span className={className} suppressHydrationWarning>
      {t} (IST)
    </span>
  );
}

/** Today's date in Chennai, e.g. "Fri, 25 Sept 2026". */
export function LiveDate({ className }: { className?: string }) {
  const d = useSyncExternalStore(subscribe, date, () => "");
  return (
    <span className={className} suppressHydrationWarning>
      {d}
    </span>
  );
}
