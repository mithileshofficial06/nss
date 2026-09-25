import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
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
        <div className="spin-border rounded-[2rem] p-10 text-center">
          <h1 className="font-display text-3xl font-extrabold">Registrations are closed</h1>
          <p className="mt-2 text-white/60">The NSS team will reopen volunteer registration soon.</p>
          <Link href="/login" className="mt-6 inline-block font-bold text-saffron hover:underline">
            Already have an account? Sign in
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
