"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowUpRight,
  ArrowDownLeft,
  Settings,
  FileSpreadsheet,
  ShieldCheck,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Export Module",
      href: "/export",
      icon: ArrowUpRight,
    },
    {
      name: "Import Module",
      href: "/import",
      icon: ArrowDownLeft,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 glass-panel border-r shrink-0 hidden md:flex flex-col h-[calc(100vh-2rem)] sticky top-0 m-4 rounded-2xl shadow-lg transition-all duration-300">
      {/* Brand Header */}
      <div className="p-6 border-b border-border/50 flex items-center gap-3">
        <div className="w-9 h-9 bg-primary/10 text-primary flex items-center justify-center rounded-xl">
          <FileSpreadsheet size={20} />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight text-foreground">
            CargoDoc
          </h1>
          <span className="text-[10px] text-muted-foreground font-mono">
            v1.0.0
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Privacy Guard Indicator */}
      <div className="p-4 m-4 bg-primary/3 border border-primary/10 rounded-xl flex items-start gap-2.5">
        <ShieldCheck size={16} className="text-primary shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-semibold text-foreground">
            Privacy Guard Active
          </h4>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-normal">
            No data is stored. Processing runs locally in browser memory.
          </p>
        </div>
      </div>
    </aside>
  );
}
