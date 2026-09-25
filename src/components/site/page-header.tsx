import type { ReactNode } from "react";
import { SectionLabel } from "@/components/site/landing/section-label";
import { SplitWords } from "@/components/ui/motion";

/** Editorial page head for inner pages: ruled label row, oversized serif title, short standfirst. */
export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <section className="bg-white px-5 pb-12 pt-24 sm:px-8 sm:pt-28">
      <div className="mx-auto max-w-[1440px]">
        <SectionLabel aside="NSS LICET" label={eyebrow} />
        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <h1 className="max-w-5xl font-serif text-[clamp(3rem,7.5vw,7rem)] leading-[0.9] tracking-[-0.03em] text-ink">
            <SplitWords text={title} />
          </h1>
          {children && <div className="max-w-sm font-display text-[17px] font-medium leading-snug text-ink/65">{children}</div>}
        </div>
      </div>
    </section>
  );
}
