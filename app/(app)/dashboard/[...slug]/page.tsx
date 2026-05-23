import { redirect } from "next/navigation";

const dashboardRedirects: Record<string, string> = {
  inbox: "/decisions",
  decisions: "/decisions",
  new: "/decisions/new",
  review: "/review",
  history: "/history",
  analytics: "/analytics"
};

export default function DashboardAliasPage({
  params
}: {
  params: { slug: string[] };
}) {
  const target = dashboardRedirects[params.slug[0] ?? ""];
  redirect(target ?? "/dashboard");
}
