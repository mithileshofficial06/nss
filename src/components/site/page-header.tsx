import type { ReactNode } from "react";
import { NssWheel } from "@/components/ui/nss-wheel";
import { SplitWords } from "@/components/ui/motion";

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <section className="grain relative overflow-hidden bg-navy-950 px-6 pb-20 pt-40 text-white">
      <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-nss-red/25 blur-[130px]" />
      <NssWheel spin className="pointer-events-none absolute -right-24 -top-10 h-[26rem] w-[26rem] text-white/[0.05]" />
      <div className="relative mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl font-display text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl">
          <SplitWords text={title} />
        </h1>
        {children && <div className="mt-6 max-w-2xl text-white/65">{children}</div>}
      </div>
    </section>
  );
}
