import { FileCode2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SetupPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10 text-ink">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-mint text-moss">
              <FileCode2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">
                Decision Debt
              </p>
              <h1 className="mt-1 text-2xl font-semibold">Supabase setup needed</h1>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-6 text-ink/70">
          <p>
            Add Supabase credentials to `.env.local`, run the SQL migration, then
            restart the dev server.
          </p>
          <pre className="overflow-x-auto rounded-md bg-ink p-4 text-xs text-white">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key`}
          </pre>
          <p>
            The migration is in `supabase/migrations/001_initial_schema.sql`.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
