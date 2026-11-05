import { menuConfig, MenuItemConfig } from "@/config/menuConfig";
import type { ModuleKey } from "@/services/modulesApi";

interface FlatRoute {
  href: string;
  requiredPermission?: string;
  module?: ModuleKey;
}

function flatten(items: MenuItemConfig[]): FlatRoute[] {
  const routes: FlatRoute[] = [];
  for (const item of items) {
    if (item.href) {
      routes.push({ href: item.href, requiredPermission: item.requiredPermission, module: item.module });
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
function findRoute(pathname: string): FlatRoute | undefined {
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
  return best;
}

export function getRequiredPermissionForPath(pathname: string): string | undefined {
  return findRoute(pathname)?.requiredPermission;
}

// Which switchable module (if any) owns this path - same longest-prefix rules, so /properties/[id] belongs to Properties.
export function getModuleForPath(pathname: string): ModuleKey | undefined {
  return findRoute(pathname)?.module;
}
