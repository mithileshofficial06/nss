import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/sidebar";
import { requireAdmin } from "@/lib/data";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · NSS Admin" } };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();
  return (
    <div className="min-h-screen bg-paper">
      <AdminSidebar name={admin.full_name} />
      <div className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">{children}</div>
      </div>
    </div>
  );
}
