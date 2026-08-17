import { LabelKey } from "@/locales/en/labels";

// Data-only mirror of the sidebar nav tree (Sidebar.tsx merges icons back in
// via ICON_MAP). Kept separate from Sidebar so route guarding
// (lib/routePermissions.ts) can consume the same href -> requiredPermission
// mapping without importing a "use client" component full of JSX icons.
export interface MenuItemConfig {
  title: LabelKey;
  href?: string;
  children?: MenuItemConfig[];
  // Mirrors th-pgs's Thymeleaf sec:authorize="hasAuthority('X')" - omit for
  // "visible to anyone logged in" (e.g. Dashboard, Freelancers - the
  // latter's backend endpoint is public too, so gating just the nav link
  // would be inconsistent with what's actually callable).
  requiredPermission?: string;
}

// Trimmed down to what's actually built for now. The rest of the modules
// below (Sub Accounts, Bank/Credit/Order Management) are unused placeholders
// with no real pages behind them yet - kept commented out so they're easy to
// bring back once they're implemented.
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
    // Ungated - anyone can raise a complaint, same as Dashboard/Freelancers
    // above. Whether the "Inbox" section within the page itself shows up
    // is a further, separate MANAGE_COMPLAINTS check inside complaints/page.tsx.
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
    // MANAGE_SECURITY is SUPERADMIN-only (see V21 migration) - this item
    // naturally only shows for that role, no extra check needed here.
    title: "SIDEBAR_IP_WHITELIST",
    href: "/ip-whitelist",
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
