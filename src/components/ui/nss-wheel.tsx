import { cn } from "@/lib/utils";

/** Stylised Konark wheel from the NSS emblem — 8 bars, double rim, rivets. */
// Rounded so server and browser render identical coordinates (their trig results differ in the last digits)
const pt = (r: number, deg: number, f: typeof Math.cos) => Math.round((100 + r * f((deg * Math.PI) / 180)) * 1000) / 1000;

export function NssWheel({ className, spin = false, strokeWidth = 3 }: { className?: string; spin?: boolean; strokeWidth?: number }) {
  const spokes = Array.from({ length: 8 }, (_, i) => i * 45);
  const rivets = Array.from({ length: 24 }, (_, i) => i * 15);
  return (
    <svg viewBox="0 0 200 200" fill="none" aria-hidden className={cn(spin && "animate-spin-slow", className)}>
      <circle cx="100" cy="100" r="94" stroke="currentColor" strokeWidth={strokeWidth} />
      <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth={strokeWidth * 0.6} />
      {rivets.map((a) => (
        <circle key={a} cx={pt(87, a, Math.cos)} cy={pt(87, a, Math.sin)} r="2.2" fill="currentColor" />
      ))}
      {spokes.map((a) => (
        <g key={a} transform={`rotate(${a} 100 100)`}>
          <path d="M100 82 L96 26 Q100 20 104 26 Z" fill="currentColor" />
          <line x1="100" y1="100" x2="100" y2="22" stroke="currentColor" strokeWidth={strokeWidth * 0.5} />
        </g>
      ))}
      {spokes.map((a) => (
        <circle key={`s${a}`} cx={pt(52, a + 22.5, Math.cos)} cy={pt(52, a + 22.5, Math.sin)} r="3" fill="currentColor" opacity=".6" />
      ))}
      <circle cx="100" cy="100" r="18" stroke="currentColor" strokeWidth={strokeWidth} />
      <circle cx="100" cy="100" r="7" fill="currentColor" />
    </svg>
  );
}
