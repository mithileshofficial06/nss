import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { getCurrentProfile, getSettings } from "@/lib/data";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [profile, settings] = await Promise.all([getCurrentProfile(), getSettings()]);
  return (
    <>
      {settings.announcement && (
        <div className="relative z-[60] bg-nss-red px-4 py-2 text-center text-sm font-semibold text-white">{settings.announcement}</div>
      )}
      <Navbar user={profile ? { name: profile.full_name, role: profile.role } : null} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
