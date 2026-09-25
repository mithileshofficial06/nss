"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const STRIPES = 6;
// Must match the timings of .intro-stripe in globals.css
const REVEAL_AT = 900;
const DONE_AT = 2000;

const IntroContext = createContext(true);

/** True once the opening curtain has lifted far enough for page content to start animating. */
export function useIntroReady() {
  return useContext(IntroContext);
}

/**
 * Opening curtain: a blank screen cut into tall stripes that slide upward one after another,
 * NSS blue in front and red trailing behind. Plays once per full page load; the layout persists
 * across client navigations, so moving between pages doesn't replay it. The motion itself is
 * CSS so it runs from first paint even before hydration.
 */
export function IntroProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t1 = setTimeout(() => setReady(true), reduced ? 0 : REVEAL_AT);
    const t2 = setTimeout(() => setMounted(false), reduced ? 50 : DONE_AT);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <IntroContext.Provider value={ready}>
      {mounted && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] flex">
          {Array.from({ length: STRIPES }, (_, i) => (
            <div key={i} className="relative h-full flex-1" style={{ "--i": i } as React.CSSProperties}>
              <span className="intro-stripe intro-stripe-back absolute inset-0 -mx-px bg-nss-red" />
              <span className="intro-stripe absolute inset-0 -mx-px bg-navy-600" />
            </div>
          ))}
        </div>
      )}
      {children}
    </IntroContext.Provider>
  );
}
