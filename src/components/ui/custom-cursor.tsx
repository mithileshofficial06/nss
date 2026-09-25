"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const QUERY = "(pointer: fine) and (prefers-reduced-motion: no-preference)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/**
 * Dot + trailing ring cursor. The ring grows over links/buttons and shows a label
 * for elements with data-cursor="View" (etc). Disabled on touch devices.
 */
export function CustomCursor() {
  const enabled = useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
  const [hovering, setHovering] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [pressed, setPressed] = useState(false);
  const [hidden, setHidden] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 350, damping: 30, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 350, damping: 30, mass: 0.6 });
  const lastTarget = useRef<Element | null>(null);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("has-custom-cursor");

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as Element | null;
      if (t === lastTarget.current) return;
      lastTarget.current = t;
      const labelled = t?.closest("[data-cursor]");
      const interactive = t?.closest("a, button, [role=button], input, select, textarea, label");
      setLabel(labelled?.getAttribute("data-cursor") ?? null);
      setHovering(Boolean(labelled || interactive));
    };
    const down = () => setPressed(true);
    const up = () => setPressed(false);
    const leave = () => setHidden(true);
    const enter = () => setHidden(false);

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.addEventListener("pointerleave", leave);
    document.addEventListener("pointerenter", enter);
    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.removeEventListener("pointerleave", leave);
      document.removeEventListener("pointerenter", enter);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const size = label ? 84 : hovering ? 52 : 34;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[9999]" style={{ opacity: hidden ? 0 : 1 }}>
      <motion.div
        className="absolute left-0 top-0 flex items-center justify-center rounded-full border mix-blend-difference"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: size,
          height: size,
          scale: pressed ? 0.8 : 1,
          borderColor: hovering ? "rgba(255,255,255,0)" : "rgba(255,255,255,0.9)",
          backgroundColor: hovering ? "rgba(255,255,255,1)" : "rgba(255,255,255,0)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      >
        {label && <span className="text-[11px] font-bold uppercase tracking-widest text-black">{label}</span>}
      </motion.div>
      <motion.div
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-nss-red"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        animate={{ opacity: hovering ? 0 : 1 }}
      />
    </div>
  );
}
