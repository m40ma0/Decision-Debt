"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ClipboardList,
  History,
  LayoutDashboard,
  LogOut,
  Plus,
  RotateCcw
} from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/decisions", label: "Inbox", icon: ClipboardList },
  { href: "/review", label: "Review", icon: RotateCcw },
  { href: "/history", label: "History", icon: History },
  { href: "/analytics", label: "Analytics", icon: BarChart3 }
];

export function AppShell({
  email,
  children
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen text-ink">
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="min-w-0">
            <p className="text-base font-semibold">Decision Debt</p>
            <p className="truncate text-xs text-ink/55">{email}</p>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Button asChild href="/decisions/new" size="sm">
              <Plus className="h-4 w-4" />
              New
            </Button>
            <form action={signOutAction}>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                aria-label="Log out"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Log out</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
        <nav className="lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]">
          <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex h-10 shrink-0 items-center gap-3 rounded-md px-3 text-sm font-medium transition",
                    active
                      ? "bg-ink text-white"
                      : "text-ink/70 hover:bg-white/70 hover:text-ink"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
