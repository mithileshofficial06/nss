import Image from "next/image";
import type { OfficeBearer } from "@/lib/types";
import { initials } from "@/lib/utils";

export function PersonCard({ person }: { person: OfficeBearer }) {
  return (
    <div className="group relative aspect-[3/4] overflow-hidden rounded-3xl bg-navy-900">
      {person.photo_url ? (
        <Image src={person.photo_url} alt={person.name} fill sizes="(max-width:640px) 50vw, 20vw" className="object-cover transition duration-700 group-hover:scale-105" />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_20%,var(--color-navy-600),var(--color-navy-950))]">
          <span className="font-display text-6xl font-extrabold text-white/90 transition duration-500 group-hover:scale-110">{initials(person.name)}</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">{person.position}</p>
        <p className="mt-1 font-display text-lg font-bold leading-tight">{person.name}</p>
        <p className="text-xs text-white/60">{person.department}</p>
      </div>
    </div>
  );
}
