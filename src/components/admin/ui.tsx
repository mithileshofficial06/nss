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
  "w-full rounded-xl border border-navy-900/12 bg-white px-3.5 py-2.5 text-sm text-navy-900 outline-none transition placeholder:text-navy-900/35 focus:border-navy-600 focus:ring-4 focus:ring-navy-600/10";
export const label = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-navy-900/55";

export function PageTitle({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">{title}</h1>
        {description && <p className="mt-1 text-navy-900/55">{description}</p>}
      </div>
      {children}
    </motion.div>
  );
}

export function Card({ title, description, children, actions, className }: { title?: string; description?: string; children: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-3xl border border-navy-900/10 bg-white p-6 shadow-[0_12px_40px_-28px_rgba(10,18,53,.5)]", className)}>
      {(title || actions) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="font-display text-xl font-extrabold text-navy-900">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-navy-900/55">{description}</p>}
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
            "fixed bottom-6 right-6 z-[200] flex max-w-sm items-center gap-3 rounded-2xl px-5 py-4 text-sm font-semibold shadow-2xl",
            visible.ok ? "bg-navy-900 text-white" : "bg-nss-red text-white",
          )}
          role="status"
        >
          {visible.ok ? <CheckCircle2 size={18} className="shrink-0 text-accent" /> : <XCircle size={18} className="shrink-0" />}
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
      className={cn("inline-flex items-center justify-center gap-2 rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-nss-red disabled:opacity-60", className)}
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
      className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50", checked ? "bg-emerald-500" : "bg-navy-900/15")}
    >
      {name && <input type="hidden" name={name} value={checked ? "on" : ""} />}
      <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 32 }} className={cn("absolute top-1 h-5 w-5 rounded-full bg-white shadow", checked ? "right-1" : "left-1")} />
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
      className="grid h-9 w-9 place-items-center rounded-lg text-navy-900/40 transition hover:bg-nss-red/10 hover:text-nss-red disabled:opacity-50"
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
      <label className={cn("group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-navy-900/15 bg-paper transition hover:border-navy-600", aspect)}>
        {url ? (
          <Image src={url} alt="" fill sizes="400px" className="object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-1 text-sm text-navy-900/50">
            <ImagePlus size={24} /> Upload image
          </span>
        )}
        {busy && (
          <span className="absolute inset-0 grid place-items-center bg-white/70">
            <Loader2 className="animate-spin text-navy-900" />
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
          <button type="button" onClick={() => setUrl("")} className="text-xs font-bold text-nss-red">
            Clear
          </button>
        )}
      </div>
      {err && <p className="mt-1 text-xs font-semibold text-nss-red">{err}</p>}
    </div>
  );
}
