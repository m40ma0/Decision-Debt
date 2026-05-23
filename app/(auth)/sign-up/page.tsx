import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { getSessionUser } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function SignUpPage() {
  if (!hasSupabaseEnv()) redirect("/setup");
  const { user } = await getSessionUser();
  if (user) redirect("/dashboard");
  return <AuthForm mode="signup" />;
}
