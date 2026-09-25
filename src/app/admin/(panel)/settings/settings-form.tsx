"use client";

import { useState } from "react";
import type { ActionState } from "../../actions";
import { ActionForm, SubmitButton, Switch, input, label } from "@/components/admin/ui";
import type { SiteSettings } from "@/lib/types";

const rows = [
  { key: "blur_activities", title: "Blur activities", hint: "Hide the list of events each student took part in." },
  { key: "blur_attendance", title: "Blur attendance", hint: "Hide attendance percentage on dashboards." },
  { key: "blur_points", title: "Blur points & involvement", hint: "Hide total points, rank and the points history." },
  { key: "leaderboard_public", title: "Public leaderboard", hint: "Show batch standings on the public site." },
  { key: "registration_open", title: "Registration open", hint: "Allow new students to create accounts." },
] as const;

export function SettingsForm({ settings, action }: { settings: SiteSettings; action: (s: ActionState, fd: FormData) => Promise<ActionState> }) {
  const [values, setValues] = useState(settings);
  return (
    <ActionForm action={action} className="space-y-1">
      {rows.map((r) => (
        <div key={r.key} className="flex items-center justify-between gap-4 border-b border-navy-900/5 py-3.5">
          <div>
            <p className="font-bold text-navy-900">{r.title}</p>
            <p className="text-xs text-navy-900/50">{r.hint}</p>
          </div>
          <Switch name={r.key} checked={values[r.key]} onChange={(v) => setValues((s) => ({ ...s, [r.key]: v }))} />
        </div>
      ))}
      <label className="block pt-4">
        <span className={label}>Announcement banner</span>
        <input name="announcement" defaultValue={settings.announcement ?? ""} placeholder="e.g. Blood donation camp this Friday — register now!" className={input} />
        <span className="mt-1 block text-xs text-navy-900/45">Shown at the top of every public page. Leave empty to hide.</span>
      </label>
      <div className="pt-4">
        <SubmitButton>Save settings</SubmitButton>
      </div>
    </ActionForm>
  );
}
