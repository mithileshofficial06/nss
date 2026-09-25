import type { Metadata } from "next";
import { TeamManager } from "./team-manager";
import { PageTitle } from "@/components/admin/ui";
import { getBatches, getOfficeBearers } from "@/lib/data";

export const metadata: Metadata = { title: "Office bearers" };

export default async function AdminTeamPage() {
  const [people, batches] = await Promise.all([getOfficeBearers(), getBatches()]);
  return (
    <>
      <PageTitle title="Office bearers" description="OB list and media team per tenure and batch, with photos." />
      <TeamManager people={people} batches={batches} />
    </>
  );
}
