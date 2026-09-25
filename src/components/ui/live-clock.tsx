"use client";

import { useSyncExternalStore } from "react";

const fmt = (opts: Intl.DateTimeFormatOptions) => {
  const f = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", ...opts });
  return () => f.format(new Date());
};
const readTime = fmt({ hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
const readDate = fmt({ weekday: "short", day: "numeric", month: "short", year: "numeric" });

// One shared ticker for every clock on the page. Snapshots only change inside tick(), so
// getSnapshot returns the same string between ticks as useSyncExternalStore requires.
let snapshot = { time: "--:--:--", date: "" };
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function tick() {
  snapshot = { time: readTime(), date: readDate() };
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!timer) {
    tick();
    timer = setInterval(tick, 1000);
  }
  return () => {
    listeners.delete(cb);
    if (!listeners.size && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

/** Ticking Chennai time, e.g. "14:09:32 (IST)". Renders a stable placeholder on the server. */
export function LiveTime({ className }: { className?: string }) {
  const t = useSyncExternalStore(subscribe, () => snapshot.time, () => "--:--:--");
  return (
    <span className={className} suppressHydrationWarning>
      {t} (IST)
    </span>
  );
}

/** Today's date in Chennai, e.g. "Fri, 25 Sept 2026". */
export function LiveDate({ className }: { className?: string }) {
  const d = useSyncExternalStore(subscribe, () => snapshot.date, () => "");
  return (
    <span className={className} suppressHydrationWarning>
      {d}
    </span>
  );
}
