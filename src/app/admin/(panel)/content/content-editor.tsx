"use client";

import Image from "next/image";
import { useState, useTransition, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import { resetContent, saveContent, type ActionState } from "../../actions";
import { Card, Toast, input, label, uploadImage } from "@/components/admin/ui";
import type { ContentKey, Objective, Photo, SiteContent } from "@/lib/content";
import { cn } from "@/lib/utils";

const TABS: { key: ContentKey; label: string; hint: string }[] = [
  { key: "hero", label: "Hero", hint: "Top of the home page: scheme strip, motto, college lines, the about column and its photos." },
  { key: "about", label: "Who we are", hint: "Section 01: the scrolling statement, vision, mission list, portrait and the red motto block." },
  { key: "slides", label: "Photo stories", hint: "Section 02 carousel. The word is set huge and faint behind the photos." },
  { key: "objectives", label: "Objectives", hint: "Section 03. The first objective becomes the large lead story, so give it a photo." },
  { key: "pages", label: "Page headers", hint: "Title and intro at the top of the Events, Gallery, Leaderboard and Team pages." },
  { key: "footer", label: "Footer", hint: "Shown at the bottom of every public page." },
];

export function ContentEditor({ initial }: { initial: SiteContent }) {
  const [tab, setTab] = useState<ContentKey>("hero");
  const [content, setContent] = useState(initial);
  const [toast, setToast] = useState<ActionState>(null);
  const [pending, start] = useTransition();
  const meta = TABS.find((t) => t.key === tab)!;

  function set<K extends ContentKey>(key: K, value: SiteContent[K]) {
    setContent((c) => ({ ...c, [key]: value }));
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-x-6 gap-y-2 border-b border-ink/15 font-display text-[16px] font-semibold">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn("-mb-px border-b-2 pb-2 transition-colors", tab === t.key ? "border-nss-red text-nss-red" : "border-transparent text-ink/55 hover:text-ink")}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card
        title={meta.label}
        description={meta.hint}
        actions={
          <div className="flex items-center gap-4">
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (!confirm(`Restore the original ${meta.label} content? Your edits to this section will be lost.`)) return;
                start(async () => {
                  const res = await resetContent(tab);
                  setToast(res);
                  if (res?.ok) window.location.reload();
                });
              }}
              className="font-display text-[14px] font-medium text-ink/55 transition-colors hover:text-nss-red"
            >
              Restore original
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => start(async () => setToast(await saveContent(tab, content[tab])))}
              className="inline-flex items-center gap-2 bg-ink px-5 py-2.5 font-display text-[15px] font-semibold text-white transition-colors hover:bg-nss-red disabled:opacity-60"
            >
              {pending && <Loader2 size={16} className="animate-spin" />} Save {meta.label.toLowerCase()}
            </button>
          </div>
        }
      >
        <p className="mb-6 border-l-[3px] border-navy-600 bg-navy-100 px-4 py-2.5 text-[13px] text-navy-800">
          Wrap words in *asterisks* to set them as the accent (italic, NSS blue or red), e.g. <code>Not me, *but you*</code>.
        </p>

        {tab === "hero" && <HeroForm value={content.hero} onChange={(v) => set("hero", v)} />}
        {tab === "about" && <AboutForm value={content.about} onChange={(v) => set("about", v)} />}
        {tab === "slides" && (
          <List
            items={content.slides}
            onChange={(v) => set("slides", v)}
            blank={{ src: "", title: "", meta: "", word: "" }}
            noun="slide"
            render={(s, up) => (
              <div className="grid gap-4 md:grid-cols-[12rem_1fr]">
                <ImagePick value={s.src} onChange={(src) => up({ ...s, src })} folder="slides" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Text label="Title" value={s.title} onChange={(title) => up({ ...s, title })} />
                  <Text label="Category · year" value={s.meta} onChange={(meta) => up({ ...s, meta })} placeholder="Health · 2026" />
                  <Text label="Backdrop word" value={s.word} onChange={(word) => up({ ...s, word })} placeholder="Blood" />
                </div>
              </div>
            )}
          />
        )}
        {tab === "objectives" && <ObjectivesForm value={content.objectives} onChange={(v) => set("objectives", v)} />}
        {tab === "pages" && (
          <div className="space-y-8">
            {(Object.keys(content.pages) as (keyof SiteContent["pages"])[]).map((k) => (
              <Group key={k} title={`${k[0].toUpperCase()}${k.slice(1)} page`}>
                <Text label="Title" value={content.pages[k].title} onChange={(title) => set("pages", { ...content.pages, [k]: { ...content.pages[k], title } })} />
                <Area label="Intro" value={content.pages[k].intro} onChange={(intro) => set("pages", { ...content.pages, [k]: { ...content.pages[k], intro } })} />
              </Group>
            ))}
          </div>
        )}
        {tab === "footer" && (
          <div className="space-y-4">
            <Area label="About line" value={content.footer.blurb} onChange={(blurb) => set("footer", { ...content.footer, blurb })} />
            <Area label="Address (one line per row)" value={content.footer.address} onChange={(address) => set("footer", { ...content.footer, address })} rows={3} />
            <Text label="Contact email" value={content.footer.email} onChange={(email) => set("footer", { ...content.footer, email })} placeholder="nss@licet.ac.in" />
          </div>
        )}
      </Card>
      <Toast state={toast} />
    </>
  );
}

// ---------------------------------------------------------------- section forms

function HeroForm({ value: h, onChange }: { value: SiteContent["hero"]; onChange: (v: SiteContent["hero"]) => void }) {
  const f = <K extends keyof SiteContent["hero"]>(k: K) => (v: SiteContent["hero"][K]) => onChange({ ...h, [k]: v });
  return (
    <div className="space-y-8">
      <Group title="Top strip">
        <div className="grid gap-3 sm:grid-cols-2">
          <Text label="Left" value={h.schemeLeft} onChange={f("schemeLeft")} hint="On phones only the part after the last · shows." />
          <Text label="Right" value={h.schemeRight} onChange={f("schemeRight")} />
        </div>
      </Group>
      <Group title="Under the wordmark">
        <div className="grid gap-3 sm:grid-cols-2">
          <Text label="Hindi name" value={h.hindi} onChange={f("hindi")} hint="Leave empty to hide." />
          <Text label="Motto" value={h.motto} onChange={f("motto")} />
        </div>
        <Text label="College name" value={h.college} onChange={f("college")} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Text label="Address line" value={h.address} onChange={f("address")} />
          <Text label="Small line below" value={h.subline} onChange={f("subline")} />
        </div>
      </Group>
      <Group title="About column">
        <Text label="Kicker" value={h.aboutKicker} onChange={f("aboutKicker")} />
        <Area label="Headline" value={h.aboutHeadline} onChange={f("aboutHeadline")} rows={2} />
        <Area label="Paragraph" value={h.aboutBody} onChange={f("aboutBody")} rows={4} />
      </Group>
      <Group title="Centre photos (cross-fade every few seconds)">
        <PhotoList items={h.leadPhotos} onChange={f("leadPhotos")} folder="hero" />
      </Group>
    </div>
  );
}

function AboutForm({ value: a, onChange }: { value: SiteContent["about"]; onChange: (v: SiteContent["about"]) => void }) {
  const f = <K extends keyof SiteContent["about"]>(k: K) => (v: SiteContent["about"][K]) => onChange({ ...a, [k]: v });
  return (
    <div className="space-y-8">
      <Group title="Statement and vision">
        <Area label="Statement (inks in word by word as you scroll)" value={a.statement} onChange={f("statement")} rows={3} />
        <Area label="Vision" value={a.vision} onChange={f("vision")} rows={2} />
      </Group>
      <Group title="Mission list">
        <List
          items={a.missions}
          onChange={f("missions")}
          blank=""
          noun="mission"
          render={(m, up, i) => <Text label={`Mission ${i + 1}`} value={m} onChange={up} />}
        />
      </Group>
      <Group title="Portrait photo">
        <div className="grid gap-4 md:grid-cols-[12rem_1fr]">
          <ImagePick value={a.portrait.src} onChange={(src) => f("portrait")({ ...a.portrait, src })} folder="about" />
          <div className="grid content-start gap-3 sm:grid-cols-2">
            <Text label="Caption" value={a.portrait.caption} onChange={(caption) => f("portrait")({ ...a.portrait, caption })} />
            <Text label="Date" value={a.portrait.date} onChange={(date) => f("portrait")({ ...a.portrait, date })} />
          </div>
        </div>
      </Group>
      <Group title="Red motto block">
        <div className="grid gap-4 md:grid-cols-[12rem_1fr]">
          <ImagePick value={a.mottoImage} onChange={f("mottoImage")} folder="about" />
          <Area label="Text" value={a.mottoText} onChange={f("mottoText")} rows={3} />
        </div>
      </Group>
    </div>
  );
}

function ObjectivesForm({ value: o, onChange }: { value: SiteContent["objectives"]; onChange: (v: SiteContent["objectives"]) => void }) {
  return (
    <div className="space-y-8">
      <Group title="Heading">
        <Text label="Heading" value={o.heading} onChange={(heading) => onChange({ ...o, heading })} />
        <Area label="Intro" value={o.intro} onChange={(intro) => onChange({ ...o, intro })} rows={2} />
      </Group>
      <Group title="Objectives">
        <List<Objective>
          items={o.items}
          onChange={(items) => onChange({ ...o, items })}
          blank={{ title: "", text: "" }}
          noun="objective"
          render={(it, up, i) => (
            <div className="grid gap-4 md:grid-cols-[12rem_1fr]">
              <ImagePick value={it.image ?? ""} onChange={(image) => up({ ...it, image: image || undefined })} folder="objectives" optional />
              <div className="grid content-start gap-3">
                <Text label={`No. ${String(i + 1).padStart(2, "0")} title`} value={it.title} onChange={(title) => up({ ...it, title })} />
                <Area label="Text" value={it.text} onChange={(text) => up({ ...it, text })} rows={2} />
              </div>
            </div>
          )}
        />
      </Group>
    </div>
  );
}

// ---------------------------------------------------------------- field kit

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="border-t border-ink pt-2 font-display text-[14px] font-semibold uppercase tracking-[0.08em] text-ink">{title}</h3>
      {children}
    </section>
  );
}

function Text({ label: l, value, onChange, placeholder, hint }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string }) {
  return (
    <label className="block">
      <span className={label}>{l}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={input} />
      {hint && <span className="mt-1 block text-xs text-ink/45">{hint}</span>}
    </label>
  );
}

function Area({ label: l, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <label className="block">
      <span className={label}>{l}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className={input} />
    </label>
  );
}

/** Controlled image field: upload to Storage (resized to WebP) or paste a URL / /images path. */
function ImagePick({ value, onChange, folder, optional }: { value: string; onChange: (v: string) => void; folder: string; optional?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <div>
      <label className="group relative flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden border border-dashed border-ink/30 bg-paper transition-colors hover:border-navy-600">
        {value ? (
          <Image src={value} alt="" fill sizes="200px" className="object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-1 font-display text-[14px] text-ink/50">
            <ImagePlus size={22} /> {optional ? "Photo (optional)" : "Upload photo"}
          </span>
        )}
        {busy && (
          <span className="absolute inset-0 grid place-items-center bg-white/70">
            <Loader2 className="animate-spin text-ink" />
          </span>
        )}
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBusy(true);
            setErr(null);
            try {
              onChange(await uploadImage(file, folder));
            } catch (x) {
              setErr((x as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        />
      </label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="…or paste a URL / /images/path" className={cn(input, "mt-2 py-1.5 text-xs")} />
      {optional && value && (
        <button type="button" onClick={() => onChange("")} className="mt-1 font-display text-[13px] font-semibold text-nss-red">
          Remove photo
        </button>
      )}
      {err && <p className="mt-1 text-xs font-semibold text-nss-red">{err}</p>}
    </div>
  );
}

function PhotoList({ items, onChange, folder }: { items: Photo[]; onChange: (v: Photo[]) => void; folder: string }) {
  return (
    <List
      items={items}
      onChange={onChange}
      blank={{ src: "", caption: "" }}
      noun="photo"
      render={(p, up) => (
        <div className="grid gap-4 md:grid-cols-[12rem_1fr]">
          <ImagePick value={p.src} onChange={(src) => up({ ...p, src })} folder={folder} />
          <Text label="Caption" value={p.caption} onChange={(caption) => up({ ...p, caption })} />
        </div>
      )}
    />
  );
}

/** Ordered list with add / remove / move up / move down. */
function List<T>({ items, onChange, render, blank, noun }: { items: T[]; onChange: (v: T[]) => void; render: (item: T, update: (v: T) => void, i: number) => ReactNode; blank: T; noun: string }) {
  const move = (i: number, d: number) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="flex gap-3 border border-ink/15 p-4">
          <div className="min-w-0 flex-1">{render(it, (v) => onChange(items.map((x, k) => (k === i ? v : x))), i)}</div>
          <div className="flex shrink-0 flex-col gap-1 text-ink/45">
            <IconBtn label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
              <ArrowUp size={16} />
            </IconBtn>
            <IconBtn label="Move down" disabled={i === items.length - 1} onClick={() => move(i, 1)}>
              <ArrowDown size={16} />
            </IconBtn>
            <IconBtn label={`Remove ${noun}`} onClick={() => confirm(`Remove this ${noun}?`) && onChange(items.filter((_, k) => k !== i))} danger>
              <Trash2 size={16} />
            </IconBtn>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, structuredClone(blank)])}
        className="inline-flex items-center gap-2 border border-ink/20 px-4 py-2 font-display text-[15px] font-semibold text-ink transition-colors hover:border-ink"
      >
        <Plus size={16} /> Add {noun}
      </button>
    </div>
  );
}

function IconBtn({ children, label: l, onClick, disabled, danger }: { children: ReactNode; label: string; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      aria-label={l}
      title={l}
      disabled={disabled}
      onClick={onClick}
      className={cn("grid h-8 w-8 place-items-center transition-colors disabled:opacity-25", danger ? "hover:bg-nss-red hover:text-white" : "hover:bg-paper hover:text-ink")}
    >
      {children}
    </button>
  );
}

