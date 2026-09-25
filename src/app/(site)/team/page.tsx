import type { Metadata } from "next";
import { PageHeader } from "@/components/site/page-header";
import { TeamBrowser } from "@/components/site/team-browser";
import { getContent, getBatches, getOfficeBearers } from "@/lib/data";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage() {
  const copy = (await getContent()).pages.team;
  const [people, batches] = await Promise.all([getOfficeBearers(), getBatches()]);
  return (
    <>
      <PageHeader eyebrow="Office bearers" title={copy.title}>
        {copy.intro}
      </PageHeader>
      <section className="mx-auto max-w-[1440px] px-5 pb-24 pt-4 sm:px-8">
        <TeamBrowser people={people} batches={batches} />
      </section>
    </>
  );
}
