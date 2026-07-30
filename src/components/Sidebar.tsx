"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, BarChart3, Users, Smartphone, Shield, Radio, Package, ClipboardCheck, MessageSquareWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LabelKey } from "@/locales/en/labels";
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
  // Label key, not display text - resolved via t() at render time so the
  // sidebar re-renders in the active language rather than being fixed at
  // module-load time. Also doubles as this item's React/toggle-state
  // identity below, same as when it held literal English text.
  title: LabelKey;
  icon: React.ReactNode;
  href?: string;
  children?: MenuItem[];
  // Mirrors th-pgs's Thymeleaf sec:authorize="hasAuthority('X')" on a nav
  // item - omit for "visible to anyone logged in" (e.g. Dashboard,
  // Freelancers - the latter's backend endpoint is public too, so gating
  // just the nav link would be inconsistent with what's actually callable).
  requiredPermission?: string;
}

// Trimmed down to what's actually built for now. The rest of the modules
// below (Sub Accounts, Bank/Credit/Order Management) are unused placeholders
// with no real pages behind them yet - kept commented out so they're easy to
// bring back once they're implemented.
const menuItems: MenuItem[] = [
  {
    title: "SIDEBAR_DASHBOARD",
    icon: <BarChart3 className="h-4 w-4" />,
    href: "/",
  },
  {
    title: "SIDEBAR_FREELANCERS",
    icon: <Users className="h-4 w-4" />,
    href: "/freelancers",
  },
  {
    title: "SIDEBAR_APK_VERSIONS",
    icon: <Smartphone className="h-4 w-4" />,
    href: "/apk-versions",
  },
  {
    title: "SIDEBAR_WHOS_ONLINE",
    icon: <Radio className="h-4 w-4" />,
    href: "/presence",
    requiredPermission: "VIEW_PRESENCE",
  },
  {
    // Ungated - anyone can raise a complaint, same as Dashboard/Freelancers
    // above. Whether the "Inbox" section within the page itself shows up
    // is a further, separate MANAGE_COMPLAINTS check inside complaints/page.tsx.
    title: "SIDEBAR_COMPLAINTS",
    icon: <MessageSquareWarning className="h-4 w-4" />,
    href: "/complaints",
  },
  {
    title: "SIDEBAR_INVENTORY",
    icon: <Package className="h-4 w-4" />,
    href: "/inventory",
    requiredPermission: "MANAGE_STOCK",
  },
  {
    title: "SIDEBAR_STOCK_CHECKS",
    icon: <ClipboardCheck className="h-4 w-4" />,
    href: "/stock-checks",
    requiredPermission: "MANAGE_STOCK",
  },
  {
    title: "SIDEBAR_USER_MANAGEMENT",
    icon: <Users className="h-4 w-4" />,
    children: [
      {
        title: "SIDEBAR_USER_LIST",
        icon: <Users className="h-4 w-4" />,
        href: "/users",
        requiredPermission: "VIEW_USER",
      },
      {
        title: "SIDEBAR_ROLES",
        icon: <Shield className="h-4 w-4" />,
        href: "/roles",
        requiredPermission: "MANAGE_ROLE",
      },
    ],
  },
  /*
  {
    title: "Sub Account Listing",
    icon: <CreditCard className="h-4 w-4" />,
    href: "/sub-accounts",
  },
  {
    title: "Bank Management",
    icon: <University className="h-4 w-4" />,
    children: [
      {
        title: "Pay In Account",
        icon: <CreditCard className="h-4 w-4" />,
        href: "/bank/payin",
      },
    ],
  },
  {
    title: "Credit Management",
    icon: <Coins className="h-4 w-4" />,
    children: [
      {
        title: "Personal Credit",
        icon: <Coins className="h-4 w-4" />,
        href: "/credit/personal",
      },
      {
        title: "Credit Transaction",
        icon: <Coins className="h-4 w-4" />,
        href: "/credit/transactions",
      },
      {
        title: "Credit History",
        icon: <Coins className="h-4 w-4" />,
        href: "/credit/history",
      },
    ],
  },
  {
    title: "Order Management",
    icon: <DollarSign className="h-4 w-4" />,
    children: [
      {
        title: "Pay In Transaction",
        icon: <Coins className="h-4 w-4" />,
        href: "/orders/payin",
      },
      {
        title: "Transaction Summary",
        icon: <FileText className="h-4 w-4" />,
        href: "/orders/summary",
      },
    ],
  },
  */
];

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

  // Same idea as th-pgs's sec:authorize on a nav <li> - a plain item needs
  // its own permission (if any); a group with children is shown only if at
  // least one child survives filtering (no point showing an empty "User
  // Management" dropdown to someone with neither VIEW_USER nor MANAGE_ROLE).
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
        "main-sidebar fixed top-14 left-0 z-30 h-[calc(100vh-3.5rem)] bg-gray-900 text-white transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand Logo */}
      <div className="brand-link flex items-center p-4 border-b border-gray-700">
        <div className="brand-image w-8 h-8 bg-white rounded-full mr-3 flex-shrink-0" />
        {!collapsed && (
          <span className="brand-text font-light">
            <strong>Admin</strong> Portal
          </span>
        )}
      </div>

      {/* Sidebar */}
      <div className="sidebar">
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
