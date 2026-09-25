"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SectionTitle } from "./section-title";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

// The ten objectives of the National Service Scheme
const objectives: { title: string; text: string; image?: string }[] = [
  { title: "Know the community", text: "Understand the community in which they work.", image: "/images/events/road-safety-rally-2026.webp" },
  { title: "Know yourself", text: "Understand themselves in relation to their community.", image: "/images/orientation/orientation-3.webp" },
  { title: "Solve together", text: "Identify the needs and problems of the community and involve them in problem-solving.", image: "/images/events/cleanup-drive-2024.webp" },
  { title: "Civic responsibility", text: "Develop among themselves a sense of social and civic responsibility.", image: "/images/events/blood-donation-2026.webp" },
  { title: "Practical solutions", text: "Use their knowledge to find practical solutions to individual and community problems." },
  { title: "Group living", text: "Develop the competence required for group living and sharing of responsibilities." },
  { title: "Mobilise people", text: "Gain skills in mobilising community participation." },
  { title: "Lead democratically", text: "Acquire leadership qualities and a democratic attitude." },
  { title: "Rise in a crisis", text: "Develop the capacity to meet emergencies and natural disasters." },
  { title: "One nation", text: "Practise national integration and social harmony." },
];

export function Objectives() {
  const [lead, ...rest] = objectives;
  return (
    <section id="objectives" className="bg-white px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-[1440px]">
        <SectionTitle index="03" title="Objectives" caption="What every volunteer gains" />

        <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-serif text-[clamp(3rem,7vw,6.5rem)] leading-[0.9] tracking-[-0.03em] text-ink">
            <MaskLine>Ten objectives,</MaskLine>
            <MaskLine delay={0.1}>
              <em className="text-navy-600">one volunteer.</em>
            </MaskLine>
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease }}
            className="max-w-sm font-display text-[17px] font-medium leading-snug text-ink/70"
          >
            The National Service Scheme sets out what every volunteer should gain from serving — from knowing the community to practising national
            integration.
          </motion.p>
        </div>

        <LeadStory index={1} {...lead} />

        <ol className="mt-4 grid border-t border-ink sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((o, i) => (
            <Article key={o.title} index={i + 2} position={i} {...o} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function MaskLine({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.span initial="hidden" whileInView="show" viewport={{ once: true }} className="block overflow-hidden pb-[0.08em]">
      <motion.span className="block" variants={{ hidden: { y: "105%" }, show: { y: "0%", transition: { duration: 1, delay, ease } } }}>
        {children}
      </motion.span>
    </motion.span>
  );
}

/** Objective 01 as the lead story: black-and-white photograph with the headline set over it. */
function LeadStory({ index, title, text, image }: { index: number; title: string; text: string; image?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  return (
    <motion.article
      ref={ref}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="group relative mt-12 aspect-[4/5] overflow-hidden bg-ink text-white sm:aspect-[21/9]"
    >
      <motion.div
        variants={{ hidden: { clipPath: "inset(0% 0% 100% 0%)" }, show: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 1.3, ease } } }}
        className="absolute inset-0"
      >
        <motion.div style={{ y }} className="absolute -inset-y-[12%] inset-x-0">
          {image && (
            <Image src={image} alt="" fill sizes="100vw" className="object-cover grayscale transition-[filter] duration-1000 ease-out group-hover:grayscale-0" />
          )}
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-ink/75 via-ink/30 to-transparent" />
      </motion.div>
      <motion.div
        variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, delay: 0.6, ease } } }}
        className="absolute inset-x-0 top-0 max-w-2xl p-6 sm:p-10"
      >
        <p className="font-display text-[14px] font-medium uppercase tracking-[0.12em] text-white/70">Objective {String(index).padStart(2, "0")}</p>
        <h3 className="mt-3 font-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.02em]">{title}</h3>
        <p className="mt-4 max-w-md font-display text-[18px] font-medium leading-snug text-white/85">{text}</p>
      </motion.div>
    </motion.article>
  );
}

/** One column of the ruled article grid. */
function Article({ index, position, title, text, image }: { index: number; position: number; title: string; text: string; image?: string }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.8, delay: (position % 3) * 0.1, ease }}
      className={cn(
        "group flex flex-col gap-4 border-b border-ink/15 py-7 sm:px-6",
        // vertical column rules, as in a newspaper grid
        position % 3 !== 0 && "lg:border-l",
        position % 2 !== 0 && "sm:max-lg:border-l",
        "sm:first:pl-0 lg:[&:nth-child(3n+1)]:pl-0 sm:max-lg:[&:nth-child(2n+1)]:pl-0",
      )}
    >
      <div className="flex items-baseline justify-between font-display text-[14px] font-medium text-ink/45">
        <span>No. {String(index).padStart(2, "0")}</span>
        <span className="h-px w-6 origin-right bg-nss-red transition-transform duration-500 group-hover:scale-x-[2.5]" />
      </div>
      <h3 className="font-serif text-[clamp(1.8rem,2.4vw,2.4rem)] leading-[1] tracking-[-0.015em] text-ink transition-colors group-hover:text-nss-red">{title}</h3>
      <p className="max-w-sm font-display text-[16px] leading-snug text-ink/65">{text}</p>
      {image && (
        <div className="relative mt-auto aspect-[4/3] overflow-hidden bg-paper">
          <Image src={image} alt="" fill sizes="(max-width:1024px) 50vw, 30vw" className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105" />
        </div>
      )}
    </motion.li>
  );
}
