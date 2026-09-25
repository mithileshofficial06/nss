import type { Metadata } from "next";
import { PageHeader } from "@/components/site/page-header";
import { GalleryGrid } from "@/components/site/gallery-grid";
import { getContent, getGallery } from "@/lib/data";

export const metadata: Metadata = { title: "Gallery" };

export default async function GalleryPage() {
  const copy = (await getContent()).pages.gallery;
  const items = await getGallery();
  return (
    <>
      <PageHeader eyebrow="Gallery" title={copy.title}>
        {copy.intro}
      </PageHeader>
      <section className="mx-auto max-w-[1440px] px-5 pb-24 pt-4 sm:px-8">
        <GalleryGrid items={items} />
      </section>
    </>
  );
}
