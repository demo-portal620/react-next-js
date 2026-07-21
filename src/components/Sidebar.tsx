"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, BarChart3, Users, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  collapsed: boolean;
}

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  href?: string;
  children?: MenuItem[];
}

// Trimmed down to what's actually built for now. The rest of the modules
// below (User Management, Sub Accounts, Bank/Credit/Order Management) are
// unused placeholders with no real pages behind them yet - kept commented
// out so they're easy to bring back once they're implemented.
const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    icon: <BarChart3 className="h-4 w-4" />,
    href: "/",
  },
  {
    title: "Freelancers",
    icon: <Users className="h-4 w-4" />,
    href: "/freelancers",
  },
  {
    title: "APK Versions",
    icon: <Smartphone className="h-4 w-4" />,
    href: "/apk-versions",
  },
  /*
  {
    title: "User Management",
    icon: <Users className="h-4 w-4" />,
    children: [
      {
        title: "User List",
        icon: <Building className="h-4 w-4" />,
        href: "/users",
      },
      {
        title: "Companies",
        icon: <Building className="h-4 w-4" />,
        href: "/companies",
      },
      {
        title: "Permissions",
        icon: <CheckSquare className="h-4 w-4" />,
        href: "/permissions",
      },
    ],
  },
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
            {menuItems.map((item) => (
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
                              {item.title}
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
                              <span className="ml-2">{child.title}</span>
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
                      {!collapsed && <span className="ml-2">{item.title}</span>}
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
