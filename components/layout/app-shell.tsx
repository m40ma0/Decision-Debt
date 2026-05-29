"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  ClipboardList,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  RotateCcw,
  X
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
  const [menuOpen, setMenuOpen] = useState(false);

  const renderNavLinks = () =>
    navItems.map((item) => {
      const active =
        pathname === item.href ||
        (item.href !== "/dashboard" && pathname.startsWith(item.href));
      const Icon = item.icon;
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setMenuOpen(false)}
          className={cn(
            "inline-flex h-10 shrink-0 items-center gap-3 rounded-md px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss/30",
            active
              ? "bg-ink text-white"
              : "text-ink/70 hover:bg-white/70 hover:text-ink"
          )}
        >
          <Icon className="h-4 w-4" />
          {item.label}
        </Link>
      );
    });

  return (
    <div className="min-h-screen text-ink">
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="min-w-0">
            <p className="text-base font-semibold">Decision Debt</p>
            <p className="truncate text-xs text-ink/55">{email}</p>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-4 w-4" />
              Menu
            </Button>
            <Button asChild href="/decisions/new" size="sm" className="hidden lg:inline-flex">
              <Plus className="h-4 w-4" />
              New Decision
            </Button>
            <form action={signOutAction} className="hidden lg:block">
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

      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/30"
            aria-label="Close menu overlay"
            onClick={() => setMenuOpen(false)}
          />
          <div
            id="mobile-navigation"
            className="absolute right-0 top-0 flex h-full w-[min(22rem,calc(100%-2rem))] flex-col border-l border-ink/10 bg-paper p-4 shadow-soft"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="font-semibold">Menu</p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Close navigation"
                onClick={() => setMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="mt-5 flex flex-col gap-2" aria-label="Primary">
              <Link
                href="/decisions/new"
                onClick={() => setMenuOpen(false)}
                className="inline-flex h-10 shrink-0 items-center gap-3 rounded-md bg-ink px-3 text-sm font-medium text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss/30"
              >
                <Plus className="h-4 w-4" />
                New Decision
              </Link>
              {renderNavLinks()}
            </nav>
            <form action={signOutAction} className="mt-auto border-t border-ink/10 pt-4">
              <Button
                type="submit"
                variant="ghost"
                className="w-full justify-start"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </Button>
            </form>
          </div>
        </div>
      ) : null}

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
        <nav
          className="hidden lg:sticky lg:top-20 lg:block lg:h-[calc(100vh-6rem)]"
          aria-label="Primary"
        >
          <div className="flex flex-col gap-2">{renderNavLinks()}</div>
        </nav>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
