import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!hasSupabaseEnv()) redirect("/setup");
  const { user } = await getSessionUser();
  redirect(user ? "/dashboard" : "/login");
}
