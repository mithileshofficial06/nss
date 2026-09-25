import type { Metadata } from "next";
import { ContentEditor } from "./content-editor";
import { PageTitle } from "@/components/admin/ui";
import { getContent } from "@/lib/data";

export const metadata: Metadata = { title: "Site content" };

export default async function AdminContentPage() {
  const content = await getContent();
  return (
    <>
      <PageTitle title="Site content" description="Every heading, paragraph and photo on the public pages. Save a section and it goes live immediately." />
      <ContentEditor initial={content} />
    </>
  );
}
