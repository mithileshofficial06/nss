import Image from "next/image";
import type { OfficeBearer } from "@/lib/types";
import { cn, initials } from "@/lib/utils";

/**
 * Portrait with an editorial caption. Photos sit in black and white and warm to colour on hover;
 * until a photo is uploaded, a serif monogram over the emblem stands in.
 */
export function PersonCard({ person, batch, size = "md" }: { person: OfficeBearer; batch?: string; size?: "md" | "sm" }) {
  return (
    <div className="group">
      <div className="relative aspect-[4/5] overflow-hidden bg-navy-600">
        {person.photo_url ? (
          <Image
            src={person.photo_url}
            alt={person.name}
            fill
            sizes="(max-width:640px) 50vw, 20vw"
            className="object-cover grayscale transition duration-1000 ease-out group-hover:scale-105 group-hover:grayscale-0"
          />
        ) : (
          <>
            <Image src="/brand/nss-logo.png" alt="" width={200} height={200} className="absolute -bottom-10 -right-10 w-40 opacity-15 transition-transform duration-1000 group-hover:rotate-45" />
            <span
              className={cn(
                "absolute inset-0 grid place-items-center font-serif italic text-white transition-transform duration-700 group-hover:scale-110",
                size === "sm" ? "text-4xl" : "text-6xl",
              )}
            >
              {initials(person.name)}
            </span>
          </>
        )}
        <span className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-nss-red transition-transform duration-500 group-hover:scale-x-100" />
      </div>
      <div className="mt-3 border-t border-ink/15 pt-2">
        <p className="flex justify-between font-display text-[13px] font-medium text-ink/50">
          <span>{person.position}</span>
          {batch && <span>{batch}</span>}
        </p>
        <p className={cn("font-serif leading-tight text-ink transition-colors group-hover:text-nss-red", size === "sm" ? "text-xl" : "text-2xl")}>{person.name}</p>
        <p className="font-display text-[14px] text-ink/50">{person.department}</p>
      </div>
    </div>
  );
}
