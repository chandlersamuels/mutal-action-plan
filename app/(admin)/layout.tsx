import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { Sidebar } from "@/components/admin/sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/onboarding");
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen app-bg">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
