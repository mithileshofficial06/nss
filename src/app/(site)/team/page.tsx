import type { Metadata } from "next";
import { PageHeader } from "@/components/site/page-header";
import { TeamBrowser } from "@/components/site/team-browser";
import { getBatches, getOfficeBearers } from "@/lib/data";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage() {
  const [people, batches] = await Promise.all([getOfficeBearers(), getBatches()]);
  return (
    <>
      <PageHeader eyebrow="Office bearers" title="The team that keeps NSS moving.">
        Office bearers and media team by tenure and batch.
      </PageHeader>
      <section className="mx-auto max-w-7xl px-6 py-16">
        <TeamBrowser people={people} batches={batches} />
      </section>
    </>
  );
}
