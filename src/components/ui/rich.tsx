import { Fragment } from "react";

/** Renders editable copy, turning *marked words* into accent <em> spans (see lib/content.ts). */
export function Rich({ text, accent }: { text: string; accent?: string }) {
  const parts = text.split(/\*([^*]+)\*/);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 ? (
          <em key={i} className={accent}>
            {part}
          </em>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/** Plain text with the accent markers removed, for aria labels and alt text. */
export const plain = (text: string) => text.replace(/\*/g, "");
