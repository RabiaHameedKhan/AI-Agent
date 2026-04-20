import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function PostLoginPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/signin");
  }

  if (session.user.role === "admin") {
    redirect("/admin");
  }

  redirect("/dashboard");
}
