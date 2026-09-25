import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard, AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { getBatches, getCurrentProfile, getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Register" };

export default async function RegisterPage() {
  const [profile, batches, settings] = await Promise.all([getCurrentProfile(), getBatches(), getSettings()]);
  if (profile) redirect("/dashboard");

  return (
    <AuthShell>
      {settings.registration_open ? (
        <RegisterForm batches={batches.filter((b) => b.is_active)} />
      ) : (
        <AuthCard>
          <p className="font-display text-[13px] font-semibold uppercase tracking-[0.08em] text-nss-red">Sign up</p>
          <h2 className="mt-1 font-serif text-[2.6rem] leading-none text-ink">Registrations are closed</h2>
          <p className="mt-3 font-display text-[15px] text-ink/60">The NSS team will reopen volunteer registration soon.</p>
          <Link href="/login" className="mt-6 inline-block font-display font-semibold text-nss-red underline-offset-4 hover:underline">
            Already have an account? Log in
          </Link>
        </AuthCard>
      )}
    </AuthShell>
  );
}
