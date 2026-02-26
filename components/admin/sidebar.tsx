"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Briefcase,
  Settings,
  LogOut,
  Zap,
  Sun,
  Moon,
  Menu,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/deals", label: "Deals", icon: Briefcase },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-sidebar-primary/[0.18] text-sidebar-primary ring-1 ring-inset ring-sidebar-primary/25"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 space-y-0.5 border-t border-sidebar-border">
        <button
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          {resolvedTheme === "dark" ? (
            <Sun className="h-4 w-4 shrink-0" />
          ) : (
            <Moon className="h-4 w-4 shrink-0" />
          )}
          {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
        </button>
        <button
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={() => signOut({ redirectUrl: "/sign-in" })}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </div>
    </>
  );
}

const Logo = () => (
  <div className="flex items-center gap-2.5">
    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sidebar-primary">
      <Zap className="h-4 w-4 text-white" />
    </div>
    <span className="text-sm font-semibold tracking-wide text-sidebar-foreground">
      MAP
    </span>
  </div>
);

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex h-screen w-60 flex-col bg-sidebar">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-sidebar-border">
          <Logo />
        </div>
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden flex items-center justify-between h-14 px-4 bg-sidebar border-b border-sidebar-border shrink-0">
        <Logo />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-64 p-0 bg-sidebar border-sidebar-border flex flex-col gap-0"
          >
            <div className="flex items-center px-5 py-5 border-b border-sidebar-border">
              <Logo />
            </div>
            <NavContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </header>
    </>
  );
}
