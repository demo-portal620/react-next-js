// Flat key -> string label file. See locales/zh/labels.ts for the Chinese
// counterpart (Header.tsx's language toggle switches between them) -
// existing hardcoded strings across the app are not being swept over to
// this wholesale in one pass, migrate a page's strings here as you touch
// that page (see roles/page.tsx for the pattern).
//
// `as const` + the LabelKey export lets zh/labels.ts type itself as
// Record<LabelKey, string> - add a key here without its zh counterpart (or
// vice versa) and `tsc` fails instead of the gap going unnoticed, since a
// Record type errors on both missing and excess keys.
const labels = {
  COMMON_SAVE: "Save",
  COMMON_CANCEL: "Cancel",
  COMMON_DELETE: "Delete",
  COMMON_EDIT: "Edit",
  COMMON_SEARCH: "Search",
  COMMON_LOADING: "Loading...",
  COMMON_CONFIRM_DELETE: "Are you sure you want to delete this?",
  NAVBAR_ACCOUNT_FALLBACK: "Account",
  NAVBAR_MY_ACCOUNT: "My Account",
  NAVBAR_MY_PROFILE: "My Profile",
  NAVBAR_LOGOUT: "Logout",
  SIDEBAR_DASHBOARD: "Dashboard",
  SIDEBAR_FREELANCERS: "Freelancers",
  SIDEBAR_APK_VERSIONS: "APK Versions",
  SIDEBAR_WHOS_ONLINE: "Who's Online",
  SIDEBAR_INVENTORY: "Inventory",
  SIDEBAR_STOCK_CHECKS: "Stock Checks",
  SIDEBAR_USER_MANAGEMENT: "User Management",
  SIDEBAR_USER_LIST: "User List",
  SIDEBAR_ROLES: "Roles",
  SIDEBAR_COMPLAINTS: "Complaints",
  NOTIFICATIONS_TITLE: "Notifications",
  NOTIFICATIONS_MARK_ALL_READ: "Mark all read",
  NOTIFICATIONS_EMPTY: "No notifications yet.",
  NOTIFICATIONS_VIEW_ALL: "View all",
  SIDEBAR_IP_WHITELIST: "IP Whitelist",
} as const;

export type LabelKey = keyof typeof labels;

export default labels;
