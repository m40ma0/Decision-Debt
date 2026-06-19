import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles, Telescope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  moonshotArchitecture,
  moonshotOneLiner,
  moonshotSections,
  moonshotTitle
} from "@/lib/moonshot";

export const metadata = {
  title: moonshotTitle,
  description: moonshotOneLiner
};

export default function MoonshotPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(143,188,143,0.18),_transparent_28%),linear-gradient(180deg,#f8f4ed_0%,#f3efe7_100%)] text-ink">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-moss">
              Moonshot Paper
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
              {moonshotTitle}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-ink/70 sm:text-lg">
              {moonshotOneLiner}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild href="/dashboard">
              <Sparkles className="h-4 w-4" />
              Open Prototype
            </Button>
            <Button asChild href="/api/paper" variant="outline" download="moonshot-paper.md">
              <BookOpen className="h-4 w-4" />
              Download Paper
            </Button>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
          <Card className="border-berry/15 bg-white/80 shadow-soft backdrop-blur">
            <CardContent className="space-y-6 p-6">
              {moonshotSections.map((section) => (
                <section key={section.title} className="space-y-2">
                  <h2 className="text-lg font-semibold">{section.title}</h2>
                  <p className="text-sm leading-6 text-ink/65">{section.body}</p>
                </section>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-ink/10 bg-ink text-white shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-white/10">
                    <Telescope className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">
                      Prototype lens
                    </p>
                    <p className="mt-1 text-xl font-semibold">
                      Decision debt becomes foresight.
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-white/72">
                  This is not a clone of project management. It is an attempt to
                  build a new layer for organizational cognition: a place where
                  uncertainty is structured, scored, and made visible before it
                  compounds.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-3 p-6">
                <h2 className="text-lg font-semibold">Architecture</h2>
                {moonshotArchitecture.map((item) => (
                  <div key={item} className="flex gap-3 text-sm leading-6 text-ink/65">
                    <span className="mt-2 h-2 w-2 rounded-full bg-moss" />
                    <p>{item}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-moss/20 bg-mint/30">
              <CardContent className="space-y-3 p-6">
                <h2 className="text-lg font-semibold">Why judges will get it fast</h2>
                <p className="text-sm leading-6 text-ink/65">
                  One startup launch scenario, one extracted notes workflow, one
                  explainable debt score, one cost-of-delay dashboard, and one
                  learning loop. In under a minute, the future is legible.
                </p>
                <Button asChild href="/dashboard" variant="secondary">
                  <ArrowRight className="h-4 w-4" />
                  See the demo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

