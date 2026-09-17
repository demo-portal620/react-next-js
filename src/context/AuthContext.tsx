"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  ReactNode,
} from "react";
import { authUtils } from "@/utils/auth";
import { fetchCurrentUser, User } from "@/services/userApi";

// Single source of truth for "is the user logged in, and what can they do".
type Status = "loading" | "authenticated" | "unauthenticated";

interface State {
  status: Status;
  currentUser: User | null;
}

type Action =
  | { type: "AUTHENTICATED"; user: User | null }
  | { type: "UNAUTHENTICATED" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "AUTHENTICATED":
      return { status: "authenticated", currentUser: action.user };
    case "UNAUTHENTICATED":
      return { status: "unauthenticated", currentUser: null };
  }
}

interface AuthContextValue {
  isLoading: boolean;
  isAuthenticated: boolean;
  currentUser: User | null;
  /** Flattened, deduplicated permission names across all of the user's roles. */
  permissions: string[];
  hasPermission: (name: string) => boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  /** Re-fetches /users/me and updates currentUser - e.g. after a profile photo upload, so Header picks up the change immediately. */
  refreshCurrentUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    status: "loading",
    currentUser: null,
  });

  const loadCurrentUser = useCallback(async () => {
    try {
      const user = await fetchCurrentUser();
      // accessLogApi.ts reads this same "user" key to attribute anonymous pageview tracking to a username.
      localStorage.setItem("user", JSON.stringify(user));
      dispatch({ type: "AUTHENTICATED", user });
    } catch {
      // Token was invalid/expired, or /users/me failed - apiClient's 401 interceptor handles the redirect.
      dispatch({ type: "UNAUTHENTICATED" });
    }
  }, []);

  useEffect(() => {
    if (authUtils.isAuthenticated()) {
      loadCurrentUser();
    } else {
      authUtils.removeToken();
      dispatch({ type: "UNAUTHENTICATED" });
    }
  }, [loadCurrentUser]);

  // Re-syncs this tab's state when another tab logs in/out - the `storage` event only fires in other tabs, not the one that changed it.
  useEffect(() => {
    function handleStorageChange(e: StorageEvent) {
      if (e.key !== "authToken") return;
      if (authUtils.isAuthenticated()) {
        loadCurrentUser();
      } else {
        dispatch({ type: "UNAUTHENTICATED" });
      }
    }
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [loadCurrentUser]);

  const login = useCallback(
    async (token: string) => {
      authUtils.setToken(token);
      await loadCurrentUser();
    },
    [loadCurrentUser]
  );

  const logout = useCallback(() => {
    authUtils.removeToken();
    dispatch({ type: "UNAUTHENTICATED" });
    authUtils.redirectToLogin();
  }, []);

  const permissions = useMemo(() => {
    const names = new Set<string>();
    for (const role of state.currentUser?.roles ?? []) {
      for (const permission of role.permissions ?? []) {
        names.add(permission.name);
      }
    }
    return Array.from(names);
  }, [state.currentUser]);

  const hasPermission = useCallback(
    (name: string) => permissions.includes(name),
    [permissions]
  );

  const value: AuthContextValue = {
    isLoading: state.status === "loading",
    isAuthenticated: state.status === "authenticated",
    currentUser: state.currentUser,
    permissions,
    hasPermission,
    login,
    logout,
    refreshCurrentUser: loadCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
