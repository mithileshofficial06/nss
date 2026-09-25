import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginCard } from "@/components/auth/login-card";
import { getCurrentProfile } from "@/lib/data";

export const metadata: Metadata = { title: "Admin login" };

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  const sp = await searchParams;
  const profile = await getCurrentProfile();
  if (profile?.role === "admin") redirect("/admin");

  // Any profile reaching this point is a student (admins were redirected above)
  const notice = sp.error === "not-admin" || profile ?"You're signed in as a student. Use an admin account to continue." : undefined;

  return (
    <AuthShell variant="admin">
      <LoginCard mode="admin" next={typeof sp.next === "string" ? sp.next : "/admin"} notice={notice} />
    </AuthShell>
  );
}
