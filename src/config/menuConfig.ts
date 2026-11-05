import { LabelKey } from "@/locales/en/labels";
import type { ModuleKey } from "@/services/modulesApi";

// Data-only mirror of the sidebar nav tree - lets route guarding reuse the same href -> requiredPermission mapping without importing JSX icons.
export interface MenuItemConfig {
  title: LabelKey;
  href?: string;
  children?: MenuItemConfig[];
  // Omit for "visible to anyone logged in" (e.g. Dashboard, Freelancers - the latter's backend endpoint is public too).
  requiredPermission?: string;
  // Set on items belonging to a switchable module (Settings > Modules) - hidden, and the route blocked, while that module is off. Omit for core areas that can never be switched off.
  module?: ModuleKey;
}

// Unbuilt modules below (Sub Accounts, Bank/Credit/Order Management) are kept commented out for later.
export const menuConfig: MenuItemConfig[] = [
  {
    title: "SIDEBAR_DASHBOARD",
    href: "/",
  },
  {
    title: "SIDEBAR_FREELANCERS",
    href: "/freelancers",
    module: "FREELANCERS",
  },
  {
    title: "SIDEBAR_APK_VERSIONS",
    href: "/apk-versions",
    module: "APK_VERSIONS",
  },
  {
    title: "SIDEBAR_WHOS_ONLINE",
    href: "/presence",
    module: "PRESENCE",
    requiredPermission: "VIEW_PRESENCE",
  },
  {
    // Ungated - anyone can raise a complaint; the "Inbox" section is separately gated inside complaints/page.tsx.
    title: "SIDEBAR_COMPLAINTS",
    href: "/complaints",
    module: "COMPLAINTS",
  },
  {
    title: "SIDEBAR_PROPERTIES",
    href: "/properties",
    module: "PROPERTIES",
    requiredPermission: "MANAGE_PROPERTY",
  },
  {
    title: "SIDEBAR_INVENTORY",
    href: "/inventory",
    module: "INVENTORY",
    requiredPermission: "MANAGE_STOCK",
  },
  {
    title: "SIDEBAR_STOCK_CHECKS",
    href: "/stock-checks",
    module: "STOCK_CHECKS",
    requiredPermission: "MANAGE_STOCK",
  },
  {
    // MANAGE_SECURITY is SUPERADMIN-only - this item naturally only shows for that role.
    title: "SIDEBAR_IP_WHITELIST",
    href: "/ip-whitelist",
    module: "IP_WHITELIST",
    requiredPermission: "MANAGE_SECURITY",
  },
  {
    title: "SIDEBAR_TELEGRAM_ALERTS",
    href: "/telegram-alerts",
    module: "TELEGRAM_ALERTS",
    requiredPermission: "MANAGE_SECURITY",
  },
  {
    // Core - not itself a switchable module, so it can always be reached to turn one back on. SUPERADMIN-only like the other system settings.
    title: "SIDEBAR_MODULES",
    href: "/modules",
    requiredPermission: "MANAGE_SECURITY",
  },
  {
    title: "SIDEBAR_USER_MANAGEMENT",
    children: [
      {
        title: "SIDEBAR_USER_LIST",
        href: "/users",
        requiredPermission: "VIEW_USER",
      },
      {
        title: "SIDEBAR_ROLES",
        href: "/roles",
        requiredPermission: "MANAGE_ROLE",
      },
    ],
  },
  /*
  {
    title: "Sub Account Listing",
    href: "/sub-accounts",
  },
  {
    title: "Bank Management",
    children: [
      {
        title: "Pay In Account",
        href: "/bank/payin",
      },
    ],
  },
  {
    title: "Credit Management",
    children: [
      {
        title: "Personal Credit",
        href: "/credit/personal",
      },
      {
        title: "Credit Transaction",
        href: "/credit/transactions",
      },
      {
        title: "Credit History",
        href: "/credit/history",
      },
    ],
  },
  {
    title: "Order Management",
    children: [
      {
        title: "Pay In Transaction",
        href: "/orders/payin",
      },
      {
        title: "Transaction Summary",
        href: "/orders/summary",
      },
    ],
  },
  */
];
