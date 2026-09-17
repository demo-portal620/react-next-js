import { LabelKey } from "@/locales/en/labels";

// Data-only mirror of the sidebar nav tree - lets route guarding reuse the same href -> requiredPermission mapping without importing JSX icons.
export interface MenuItemConfig {
  title: LabelKey;
  href?: string;
  children?: MenuItemConfig[];
  // Omit for "visible to anyone logged in" (e.g. Dashboard, Freelancers - the latter's backend endpoint is public too).
  requiredPermission?: string;
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
  },
  {
    title: "SIDEBAR_APK_VERSIONS",
    href: "/apk-versions",
  },
  {
    title: "SIDEBAR_WHOS_ONLINE",
    href: "/presence",
    requiredPermission: "VIEW_PRESENCE",
  },
  {
    // Ungated - anyone can raise a complaint; the "Inbox" section is separately gated inside complaints/page.tsx.
    title: "SIDEBAR_COMPLAINTS",
    href: "/complaints",
  },
  {
    title: "SIDEBAR_INVENTORY",
    href: "/inventory",
    requiredPermission: "MANAGE_STOCK",
  },
  {
    title: "SIDEBAR_STOCK_CHECKS",
    href: "/stock-checks",
    requiredPermission: "MANAGE_STOCK",
  },
  {
    // MANAGE_SECURITY is SUPERADMIN-only - this item naturally only shows for that role.
    title: "SIDEBAR_IP_WHITELIST",
    href: "/ip-whitelist",
    requiredPermission: "MANAGE_SECURITY",
  },
  {
    title: "SIDEBAR_TELEGRAM_ALERTS",
    href: "/telegram-alerts",
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
