"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clapperboard, Home, Layers3, Settings, SlidersHorizontal } from "lucide-react";

const navItems = [
  { href: "/", label: "Workbench", icon: Home },
  { href: "/", label: "Jobs", icon: Layers3 },
  { href: "/settings", label: "Providers", icon: SlidersHorizontal },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/">
          <span className="brand-mark">
            <Clapperboard size={19} />
          </span>
          <span>
            RemixKit
            <small>Creative Ops</small>
          </span>
        </Link>
        <nav className="nav" aria-label="Primary">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const active = index === 0 ? pathname === "/" : pathname === item.href && item.label !== "Settings";
            return (
              <Link key={`${item.href}-${item.label}`} href={item.href} aria-current={active ? "page" : undefined}>
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-status">
          <span>Local demo</span>
          <strong>Bring your own keys</strong>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
