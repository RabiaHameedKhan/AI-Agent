import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AdminPanel from "./AdminPanel";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/signin");
  }
  if (session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-[#FDFAF5] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 rounded-2xl border border-[#C9A84C]/50 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-[#C9A84C]">Admin Panel</p>
          <h1 className="mt-2 text-4xl text-[#4A1942] [font-family:var(--font-cormorant)]">
            Salon Operations Center
          </h1>
          <p className="mt-2 text-[#2C2C2C]/75">{session.user.email}</p>
        </header>

        <AdminPanel />
      </div>
    </main>
  );
}
