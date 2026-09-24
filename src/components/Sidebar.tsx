"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, BarChart3, Users, Smartphone, Shield, Radio, Package, ClipboardCheck, MessageSquareWarning, ShieldAlert, Send, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LabelKey } from "@/locales/en/labels";
import { menuConfig } from "@/config/menuConfig";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  collapsed: boolean;
}

interface MenuItem {
  // Label key, not display text - resolved via t() at render time so the sidebar re-renders in the active language.
  title: LabelKey;
  icon: React.ReactNode;
  href?: string;
  children?: MenuItem[];
  requiredPermission?: string;
}

// Icons layered onto menuConfig's data-only tree - href/requiredPermission live there so route guarding shares one source of truth.
const ICON_MAP: Partial<Record<LabelKey, React.ReactNode>> = {
  SIDEBAR_DASHBOARD: <BarChart3 className="h-4 w-4" />,
  SIDEBAR_FREELANCERS: <Users className="h-4 w-4" />,
  SIDEBAR_APK_VERSIONS: <Smartphone className="h-4 w-4" />,
  SIDEBAR_WHOS_ONLINE: <Radio className="h-4 w-4" />,
  SIDEBAR_COMPLAINTS: <MessageSquareWarning className="h-4 w-4" />,
  SIDEBAR_PROPERTIES: <Building2 className="h-4 w-4" />,
  SIDEBAR_INVENTORY: <Package className="h-4 w-4" />,
  SIDEBAR_STOCK_CHECKS: <ClipboardCheck className="h-4 w-4" />,
  SIDEBAR_IP_WHITELIST: <ShieldAlert className="h-4 w-4" />,
  SIDEBAR_TELEGRAM_ALERTS: <Send className="h-4 w-4" />,
  SIDEBAR_USER_MANAGEMENT: <Users className="h-4 w-4" />,
  SIDEBAR_USER_LIST: <Users className="h-4 w-4" />,
  SIDEBAR_ROLES: <Shield className="h-4 w-4" />,
};

function withIcons(items: typeof menuConfig): MenuItem[] {
  return items.map((item) => ({
    ...item,
    icon: ICON_MAP[item.title],
    children: item.children ? withIcons(item.children) : undefined,
  }));
}

const menuItems: MenuItem[] = withIcons(menuConfig);

export default function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { hasPermission } = useAuth();
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (title: string) => {
    setOpenItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href?: string) => {
    return href === pathname;
  };

  // A group with children shows only if at least one child survives filtering - no empty dropdowns.
  const visibleMenuItems = menuItems.reduce<MenuItem[]>((acc, item) => {
    if (item.children) {
      const visibleChildren = item.children.filter(
        (child) => !child.requiredPermission || hasPermission(child.requiredPermission)
      );
      if (visibleChildren.length > 0) {
        acc.push({ ...item, children: visibleChildren });
      }
    } else if (!item.requiredPermission || hasPermission(item.requiredPermission)) {
      acc.push(item);
    }
    return acc;
  }, []);

  return (
    <aside
      className={cn(
        "main-sidebar fixed top-14 left-0 z-30 flex h-[calc(100vh-3.5rem)] flex-col bg-gray-900 text-white transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand Logo */}
      <div className="brand-link flex flex-shrink-0 items-center p-4 border-b border-gray-700">
        <div className="brand-image w-8 h-8 bg-white rounded-full mr-3 flex-shrink-0" />
        {!collapsed && (
          <span className="brand-text font-light">
            <strong>Admin</strong> Portal
          </span>
        )}
      </div>

      {/* Sidebar - scrolls independently so the brand header stays pinned once the menu grows taller than the viewport */}
      <div className="sidebar flex-1 overflow-y-auto overflow-x-hidden">
        {/* Sidebar Menu */}
        <nav className="mt-4 px-2">
          <ul className="nav nav-pills nav-sidebar flex-column space-y-1">
            {visibleMenuItems.map((item) => (
              <li key={item.title} className="nav-item">
                {item.children ? (
                  <Collapsible
                    open={openItems.includes(item.title)}
                    onOpenChange={() => toggleItem(item.title)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start text-gray-300 hover:bg-gray-800 hover:text-white",
                          openItems.includes(item.title) &&
                            "bg-gray-800 text-white"
                        )}
                      >
                        {item.icon}
                        {!collapsed && (
                          <>
                            <span className="ml-2 flex-1 text-left">
                              {t(item.title)}
                            </span>
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 transition-transform",
                                openItems.includes(item.title) && "rotate-180"
                              )}
                            />
                          </>
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    {!collapsed && (
                      <CollapsibleContent className="ml-4 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link key={child.title} href={child.href || "#"}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "w-full justify-start text-gray-400 hover:bg-gray-800 hover:text-white",
                                isActive(child.href) &&
                                  "bg-blue-600 text-white hover:bg-blue-700"
                              )}
                            >
                              {child.icon}
                              <span className="ml-2">{t(child.title)}</span>
                            </Button>
                          </Link>
                        ))}
                      </CollapsibleContent>
                    )}
                  </Collapsible>
                ) : (
                  <Link href={item.href || "#"}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-gray-300 hover:bg-gray-800 hover:text-white",
                        isActive(item.href) &&
                          "bg-blue-600 text-white hover:bg-blue-700"
                      )}
                    >
                      {item.icon}
                      {!collapsed && <span className="ml-2">{t(item.title)}</span>}
                    </Button>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
