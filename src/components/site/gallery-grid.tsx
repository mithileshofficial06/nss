"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryItem } from "@/lib/types";

/** Masonry grid with a keyboard-navigable lightbox. */
export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback((d: number) => setOpen((o) => (o === null ? o : (o + d + items.length) % items.length)), [items.length]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, step]);

  if (!items.length) return <p className="py-20 text-center font-serif text-3xl text-ink/40">No photos yet.</p>;

  return (
    <>
      <div className="columns-2 gap-4 md:columns-3 lg:columns-4 [&>*]:mb-4">
        {items.map((g, i) => (
          <motion.button
            key={g.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: (i % 4) * 0.06 }}
            onClick={() => setOpen(i)}
            data-cursor="Open"
            className="group relative block w-full break-inside-avoid overflow-hidden bg-paper"
          >
            <Image
              src={g.image_url}
              alt={g.caption ?? "NSS LICET photo"}
              width={600}
              height={i % 3 === 0 ? 800 : 450}
              sizes="(max-width:768px) 50vw, 25vw"
              className="h-auto w-full object-cover transition duration-700 group-hover:scale-105"
            />
            {g.caption && (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-3 text-left font-display text-[14px] font-medium text-white opacity-0 transition group-hover:opacity-100">
                {g.caption}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/95 p-4 backdrop-blur"
            onClick={close}
            role="dialog"
            aria-modal
          >
            <motion.div
              key={open}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="relative h-[80vh] w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={items[open].image_url} alt={items[open].caption ?? ""} fill sizes="100vw" className="object-contain" quality={85} />
            </motion.div>
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 font-display text-[15px] font-medium text-white/80">
              {items[open].caption} · {open + 1}/{items.length}
            </p>
            <button aria-label="Close" onClick={close} className="absolute right-5 top-5 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
              <X />
            </button>
            <button aria-label="Previous" onClick={(e) => (e.stopPropagation(), step(-1))} className="absolute left-4 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
              <ChevronLeft />
            </button>
            <button aria-label="Next" onClick={(e) => (e.stopPropagation(), step(1))} className="absolute right-4 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
              <ChevronRight />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
