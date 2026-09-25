import type { Metadata } from "next";
import { saveBatch, saveSettings, setBatchActive } from "../../actions";
import { SettingsForm } from "./settings-form";
import { ActionForm, Card, LiveSwitch, PageTitle, SubmitButton, input, label } from "@/components/admin/ui";
import { getBatches, getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const [settings, batches] = await Promise.all([getSettings(), getBatches()]);
  return (
    <>
      <PageTitle title="Settings & visibility" description="Control what students and the public can see." />
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card title="Dashboard & site visibility">
          <SettingsForm settings={settings} action={saveSettings} />
        </Card>
        <Card title="Batches" description="Batches appear in registration, the leaderboard and team pages.">
          <ul className="divide-y divide-ink/10">
            {batches.map((b) => (
              <li key={b.id} className="flex items-center justify-between py-3">
                <span>
                  <span className="font-poster text-lg text-ink">{b.label}</span>
                  <span className="ml-2 text-xs text-ink/50">
                    {b.start_year}–{b.end_year}
                  </span>
                </span>
                <span className="flex items-center gap-2 text-xs text-ink/50">
                  Open for sign-up <LiveSwitch initial={b.is_active} action={setBatchActive.bind(null, b.id)} />
                </span>
              </li>
            ))}
          </ul>
          <ActionForm action={saveBatch} resetOnSuccess className="mt-4 flex items-end gap-2">
            <label className="flex-1">
              <span className={label}>New batch start year</span>
              <input name="start_year" type="number" min={2015} max={2100} placeholder={String(new Date().getFullYear() + 1)} className={input} required />
            </label>
            <SubmitButton>Add batch</SubmitButton>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
