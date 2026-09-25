import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginCard } from "@/components/auth/login-card";
import { getCurrentProfile } from "@/lib/data";

export const metadata: Metadata = { title: "Login" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const profile = await getCurrentProfile();
  if (profile) redirect(profile.role === "admin" ? "/admin" : "/dashboard");

  const notice =
    sp.registered === "1"
      ? "Account created! Confirm your email if asked, then sign in."
      : sp.confirmed === "1"
        ? "Email confirmed — you can sign in now."
        : undefined;

  return (
    <AuthShell>
      <LoginCard mode="student" next={typeof sp.next === "string" ? sp.next : undefined} notice={notice} />
    </AuthShell>
  );
}
