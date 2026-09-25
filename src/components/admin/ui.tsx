"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ImagePlus, Loader2, Trash2, XCircle } from "lucide-react";
import type { ActionState } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export const input =
  "w-full border border-ink/20 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-navy-600 focus:shadow-[inset_0_-2px_0_var(--color-navy-600)]";
export const label = "mb-1.5 block font-display text-[13px] font-semibold uppercase tracking-[0.08em] text-ink/55";

export function PageTitle({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="mb-10">
      <div className="flex items-center justify-between border-t border-ink pt-3 font-display text-[15px] font-medium">
        <span className="flex items-center gap-2.5 text-nss-red">
          <span className="h-2.5 w-2.5 bg-nss-red" /> Admin
        </span>
        <span className="text-ink/50">NSS LICET</span>
      </div>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[clamp(2.6rem,5vw,4.5rem)] leading-[0.92] tracking-[-0.02em] text-ink">{title}</h1>
          {description && <p className="mt-2 max-w-2xl font-display text-[16px] text-ink/60">{description}</p>}
        </div>
        {children}
      </div>
    </motion.div>
  );
}

export function Card({ title, description, children, actions, className }: { title?: string; description?: string; children: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <section className={cn("border border-ink/15 bg-white p-6", className)}>
      {(title || actions) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="font-serif text-[1.9rem] leading-none text-ink">{title}</h2>}
            {description && <p className="mt-1.5 font-display text-[14px] text-ink/55">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

/** Each new result remounts the toast (keyed on its timestamp), which then hides itself after a few seconds. */
export function Toast({ state }: { state: ActionState }) {
  if (!state) return null;
  return <ToastItem key={`${state.at}-${state.message}`} state={state} />;
}

function ToastItem({ state }: { state: NonNullable<ActionState> }) {
  const [shown, setShown] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShown(false), 3500);
    return () => clearTimeout(t);
  }, []);
  const visible = shown ? state : null;
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20 }}
          className={cn(
            "fixed bottom-6 right-6 z-[200] flex max-w-sm items-center gap-3 border-l-4 px-5 py-4 font-display text-[15px] font-semibold text-white",
            visible.ok ? "border-navy-400 bg-ink" : "border-ink bg-nss-red",
          )}
          role="status"
        >
          {visible.ok ? <CheckCircle2 size={18} className="shrink-0 text-navy-200" /> : <XCircle size={18} className="shrink-0" />}
          {visible.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** <form> bound to a server action returning ActionState; shows a toast and optionally resets on success. */
export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess = false,
  onSuccess,
}: {
  action: (s: ActionState, fd: FormData) => Promise<ActionState>;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  onSuccess?: () => void;
}) {
  const [state, formAction] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) {
      if (resetOnSuccess) ref.current?.reset();
      onSuccess?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
  return (
    <>
      <form ref={ref} action={formAction} className={className}>
        {children}
      </form>
      <Toast state={state} />
    </>
  );
}

export function SubmitButton({ children, className }: { children: ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className={cn("inline-flex items-center justify-center gap-2 bg-ink px-5 py-2.5 font-display text-[15px] font-semibold text-white transition-colors hover:bg-nss-red disabled:opacity-60", className)}
    >
      {pending && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

export function Switch({ checked, onChange, name, disabled }: { checked: boolean; onChange?: (v: boolean) => void; name?: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn("relative h-7 w-12 shrink-0 border transition-colors disabled:opacity-50", checked ? "border-navy-600 bg-navy-600" : "border-ink/25 bg-white")}
    >
      {name && <input type="hidden" name={name} value={checked ? "on" : ""} />}
      <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 32 }} className={cn("absolute top-[3px] h-[18px] w-[18px]", checked ? "right-[3px] bg-white" : "left-[3px] bg-ink/35")} />
    </button>
  );
}

/** Switch that immediately calls a server action. */
export function LiveSwitch({ initial, action }: { initial: boolean; action: (v: boolean) => Promise<unknown> }) {
  const [value, setValue] = useState(initial);
  const [pending, start] = useTransition();
  return (
    <Switch
      checked={value}
      disabled={pending}
      onChange={(v) => {
        setValue(v);
        start(async () => {
          await action(v);
        });
      }}
    />
  );
}

export function ConfirmButton({ onConfirm, children = <Trash2 size={16} />, message = "Delete this item?" }: { onConfirm: () => Promise<unknown>; children?: ReactNode; message?: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm(message)) start(async () => void (await onConfirm()));
      }}
      className="grid h-9 w-9 place-items-center text-ink/40 transition-colors hover:bg-nss-red hover:text-white disabled:opacity-50"
      aria-label="Delete"
    >
      {pending ? <Loader2 size={16} className="animate-spin" /> : children}
    </button>
  );
}

// ---------------------------------------------------------------- uploads

/** Resize to max 2000px and re-encode as WebP before upload, so phone photos stay small. */
async function toWebp(file: File, max = 2000): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    return await new Promise((res) => canvas.toBlob((b) => res(b ?? file), "image/webp", 0.8));
  } catch {
    return file; // e.g. HEIC in browsers that can't decode it
  }
}

export async function uploadImage(file: File, folder: string): Promise<string> {
  const supabase = createClient();
  const blob = await toWebp(file);
  const ext = blob.type === "image/webp" ? "webp" : (file.name.split(".").pop() ?? "jpg");
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, blob, { contentType: blob.type || file.type, upsert: false });
  if (error) throw error;
  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
}

/** Single image picker that uploads to Storage and writes the URL into a hidden input. */
export function ImageField({ name, folder, defaultValue, aspect = "aspect-video" }: { name: string; folder: string; defaultValue?: string | null; aspect?: string }) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <div>
      <input type="hidden" name={name} value={url} />
      <label className={cn("group relative flex cursor-pointer items-center justify-center overflow-hidden border border-dashed border-ink/30 bg-paper transition-colors hover:border-navy-600", aspect)}>
        {url ? (
          <Image src={url} alt="" fill sizes="400px" className="object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-1 font-display text-[15px] text-ink/50">
            <ImagePlus size={24} /> Upload image
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
              setUrl(await uploadImage(file, folder));
            } catch (x) {
              setErr((x as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        />
      </label>
      <div className="mt-2 flex items-center gap-2">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="…or paste an image URL / /images/path" className={cn(input, "py-2 text-xs")} />
        {url && (
          <button type="button" onClick={() => setUrl("")} className="font-display text-[13px] font-semibold text-nss-red">
            Clear
          </button>
        )}
      </div>
      {err && <p className="mt-1 text-xs font-semibold text-nss-red">{err}</p>}
    </div>
  );
}
