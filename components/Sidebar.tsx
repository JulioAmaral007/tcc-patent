'use client'

import { FileText, History, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function Sidebar({ activeTab = "main", onTabChange }: SidebarProps) {
  const menuItems = [
    { id: "main", icon: FileText, label: "Principal" },
    { id: "history", icon: History, label: "Histórico" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-16 flex flex-col items-center py-6 bg-sidebar border-r border-sidebar-border z-50">
      <div className="flex flex-col items-center gap-6 flex-1 mt-2">

        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange?.(item.id)}
            className={cn(
              "p-3 rounded-xl transition-all duration-200 group relative",
              activeTab === item.id
                ? "bg-sidebar-accent text-primary glow-primary"
                : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent"
            )}
            title={item.label}
          >
            <item.icon className="w-5 h-5" />
            <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-popover text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {item.label}
            </span>
          </button>
        ))}
      </div>
      
      <button
        className="p-3 rounded-xl text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent transition-all duration-200"
        title="Configurações"
      >
        <Settings className="w-5 h-5" />
      </button>
    </aside>
  );
}
