"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness, Clapperboard, Home, Menu, Settings, SlidersHorizontal } from "lucide-react";

const navItems = [
  { href: "/", label: "工作台", icon: Home },
  { href: "/jobs", label: "任务队列", icon: BriefcaseBusiness },
  { href: "/settings", label: "服务商", icon: SlidersHorizontal },
  { href: "/settings", label: "设置", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-top">
          <Link className="brand" href="/">
            <span className="brand-mark">
              <Clapperboard size={17} />
            </span>
            <span>RemixKit</span>
          </Link>
          <button className="icon-button" type="button" aria-label="Collapse sidebar">
            <Menu size={16} />
          </button>
        </div>
        <nav className="nav" aria-label="Primary">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href) && item.label !== "设置";
            return (
              <Link key={`${item.href}-${item.label}`} href={item.href} aria-current={active ? "page" : undefined}>
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
