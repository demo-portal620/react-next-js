import { menuConfig, MenuItemConfig } from "@/config/menuConfig";

interface FlatRoute {
  href: string;
  requiredPermission?: string;
}

function flatten(items: MenuItemConfig[]): FlatRoute[] {
  const routes: FlatRoute[] = [];
  for (const item of items) {
    if (item.href) {
      routes.push({ href: item.href, requiredPermission: item.requiredPermission });
    }
    if (item.children) {
      routes.push(...flatten(item.children));
    }
  }
  return routes;
}

const flatRoutes = flatten(menuConfig);

// Longest-prefix match so nested/dynamic routes (e.g. /users/[id],
// /stock-checks/[id]) inherit their list page's permission without needing
// their own menuConfig entry. "/" only matches the exact dashboard route -
// otherwise it would prefix-match every path in the app.
export function getRequiredPermissionForPath(pathname: string): string | undefined {
  let best: FlatRoute | undefined;
  for (const route of flatRoutes) {
    if (route.href === "/") {
      if (pathname === "/") best = route;
      continue;
    }
    if (pathname === route.href || pathname.startsWith(route.href + "/")) {
      if (!best || route.href.length > best.href.length) {
        best = route;
      }
    }
  }
  return best?.requiredPermission;
}
