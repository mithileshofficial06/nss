"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { SectionTitle } from "./section-title";
import { Rich } from "@/components/ui/rich";
import type { SiteContent } from "@/lib/content";

type About = SiteContent["about"];

const ease = [0.22, 1, 0.36, 1] as const;

export function MissionVision({ content }: { content: About }) {
  return (
    <section id="mission" className="bg-white px-5 pb-24 pt-24 sm:px-8 sm:pt-32">
      <div className="mx-auto max-w-[1440px]">
        <SectionTitle index="01" title="Who we are" caption="About NSS LICET" />

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
          <Portrait photo={content.portrait} />

          <div className="flex flex-col">
            <ScrollStatement text={content.statement} />

            <div className="mt-16 grid gap-12 border-t border-ink/15 pt-8 sm:grid-cols-2 sm:gap-8">
              <Reveal>
                <p className="font-display text-[15px] font-medium text-ink/50">Vision</p>
                <p className="mt-3 font-serif text-[clamp(1.6rem,2.3vw,2.2rem)] leading-[1.12] text-ink">
                  <Rich text={content.vision} accent="text-navy-600" />
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="font-display text-[15px] font-medium text-ink/50">Mission</p>
                <ol className="mt-3">
                  {content.missions.map((m, i) => (
                    <motion.li
                      key={m}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.15 + i * 0.08, ease }}
                      className="group flex items-baseline gap-3 font-display text-[clamp(1.5rem,2.2vw,2.1rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink transition-colors hover:text-nss-red"
                    >
                      <span className="text-[13px] font-medium text-ink/35 group-hover:text-nss-red">0{i + 1}</span>
                      {m}
                    </motion.li>
                  ))}
                </ol>
              </Reveal>
            </div>
          </div>
        </div>

        <MottoCover text={content.mottoText} image={content.mottoImage} />
      </div>
    </section>
  );
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8, delay, ease }}>
      {children}
    </motion.div>
  );
}

/** Tall photograph that wipes in and drifts slower than the page while the text scrolls past. */
function Portrait({ photo }: { photo: About["portrait"] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  return (
    // The wrapper observes visibility; the photo itself starts fully clipped, so it can't be the observed element
    <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} className="lg:sticky lg:top-20 lg:self-start">
      <motion.div
        ref={ref}
        variants={{ hidden: { clipPath: "inset(0% 0% 100% 0%)" }, show: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 1.3, ease } } }}
        className="relative aspect-[4/5] overflow-hidden bg-paper"
      >
        <motion.div style={{ y }} className="absolute -inset-y-[10%] inset-x-0">
          <Image src={photo.src} alt={photo.caption} fill sizes="(max-width:1024px) 100vw, 45vw" className="object-cover" />
        </motion.div>
      </motion.div>
      <p className="mt-2 flex justify-between font-display text-[14px] text-ink/55">
        <span>{photo.caption}</span>
        <span>{photo.date}</span>
      </p>
    </motion.div>
  );
}

/** Splits copy into words, flagging those inside *asterisks* (which may span several words) as accents. */
function accentWords(text: string) {
  const out: { word: string; accent: boolean }[] = [];
  let open = false;
  for (const raw of text.split(" ")) {
    const starts = raw.startsWith("*");
    const ends = raw.replace(/^\*/, "").includes("*");
    out.push({ word: raw.replace(/\*/g, ""), accent: open || starts });
    open = (open || starts) && !ends;
  }
  return out;
}

/** Large condensed statement; each word inks in as the paragraph scrolls through the viewport. */
function ScrollStatement({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 50%"] });
  const words = accentWords(text);
  return (
    <p ref={ref} className="font-display text-[clamp(2rem,3.9vw,3.6rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-ink">
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} accent={w.accent}>
          {w.word}
        </Word>
      ))}
    </p>
  );
}

function Word({ children, progress, range, accent }: { children: string; progress: MotionValue<number>; range: [number, number]; accent: boolean }) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  return (
    <motion.span style={{ opacity }} className={accent ? "font-serif font-normal italic text-nss-red" : undefined}>
      {children}{" "}
    </motion.span>
  );
}

/** Red "cover" block for the motto, like a magazine front page. */
function MottoCover({ text, image }: { text: string; image: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);
  const imgY = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1, ease }}
      className="relative mt-24 overflow-hidden bg-nss-red text-white"
    >
      <motion.div style={{ y: imgY }} className="absolute bottom-0 right-[6%] hidden h-[115%] w-[34%] mix-blend-luminosity md:block">
        {image && <Image src={image} alt="" fill sizes="34vw" className="object-cover object-top opacity-90" />}
      </motion.div>
      <div className="relative flex min-h-[420px] flex-col justify-between p-6 sm:p-10">
        <div className="flex justify-between font-display text-[15px] font-medium">
          <span>The motto</span>
          <span className="text-white/70">NSS · Est. 1969</span>
        </div>
        <motion.p style={{ x }} className="whitespace-nowrap font-serif text-[clamp(4rem,11vw,10rem)] leading-[0.85] tracking-[-0.03em]">
          Not me, <em>but you.</em>
        </motion.p>
        <p className="max-w-md font-display text-[17px] font-medium leading-snug text-white/90">
          {text}
        </p>
      </div>
    </motion.div>
  );
}
