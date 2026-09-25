import Image from "next/image";
import type { OfficeBearer } from "@/lib/types";
import { initials } from "@/lib/utils";

/** Portrait (photo or serif monogram over the emblem) with an editorial caption beneath. */
export function PersonCard({ person }: { person: OfficeBearer }) {
  return (
    <div className="group">
      <div className="relative aspect-[4/5] overflow-hidden bg-navy-600">
        {person.photo_url ? (
          <Image src={person.photo_url} alt={person.name} fill sizes="(max-width:640px) 50vw, 20vw" className="object-cover transition duration-1000 ease-out group-hover:scale-105" />
        ) : (
          <>
            <Image src="/brand/nss-logo.png" alt="" width={200} height={200} className="absolute -bottom-10 -right-10 w-40 opacity-15 transition-transform duration-1000 group-hover:rotate-45" />
            <span className="absolute inset-0 grid place-items-center font-serif text-6xl italic text-white transition-transform duration-700 group-hover:scale-110">
              {initials(person.name)}
            </span>
          </>
        )}
      </div>
      <div className="mt-3 border-t border-ink/15 pt-2">
        <p className="font-display text-[13px] font-medium text-ink/50">{person.position}</p>
        <p className="font-serif text-2xl leading-tight text-ink transition-colors group-hover:text-nss-red">{person.name}</p>
        <p className="font-display text-[14px] text-ink/50">{person.department}</p>
      </div>
    </div>
  );
}
