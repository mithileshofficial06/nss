import { cn } from "@/lib/utils";

/** Stylised Konark wheel from the NSS emblem — 8 bars, double rim, rivets. */
export function NssWheel({ className, spin = false, strokeWidth = 3 }: { className?: string; spin?: boolean; strokeWidth?: number }) {
  const spokes = Array.from({ length: 8 }, (_, i) => i * 45);
  const rivets = Array.from({ length: 24 }, (_, i) => i * 15);
  return (
    <svg viewBox="0 0 200 200" fill="none" aria-hidden className={cn(spin && "animate-spin-slow", className)}>
      <circle cx="100" cy="100" r="94" stroke="currentColor" strokeWidth={strokeWidth} />
      <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth={strokeWidth * 0.6} />
      {rivets.map((a) => (
        <circle key={a} cx={100 + 87 * Math.cos((a * Math.PI) / 180)} cy={100 + 87 * Math.sin((a * Math.PI) / 180)} r="2.2" fill="currentColor" />
      ))}
      {spokes.map((a) => (
        <g key={a} transform={`rotate(${a} 100 100)`}>
          <path d="M100 82 L96 26 Q100 20 104 26 Z" fill="currentColor" />
          <line x1="100" y1="100" x2="100" y2="22" stroke="currentColor" strokeWidth={strokeWidth * 0.5} />
        </g>
      ))}
      {spokes.map((a) => (
        <circle key={`s${a}`} cx={100 + 52 * Math.cos(((a + 22.5) * Math.PI) / 180)} cy={100 + 52 * Math.sin(((a + 22.5) * Math.PI) / 180)} r="3" fill="currentColor" opacity=".6" />
      ))}
      <circle cx="100" cy="100" r="18" stroke="currentColor" strokeWidth={strokeWidth} />
      <circle cx="100" cy="100" r="7" fill="currentColor" />
    </svg>
  );
}
