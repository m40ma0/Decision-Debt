import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireUser();
  return (
    <AppShell email={profile?.email ?? user.email ?? "Signed in"}>
      {children}
    </AppShell>
  );
}
