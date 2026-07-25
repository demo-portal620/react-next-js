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

// Single source of truth for "is the user logged in, and what can they do" -
// replaces three previously separate/inconsistent implementations
// (useAuth.ts, useRequiredAuth.ts, and ad hoc localStorage reads scattered
// in Header.tsx/login/page.tsx). Modeled on an earlier scaffold's
// AuthContext/reducer pattern (heycloud/fe), adapted to this app's token
// shape and BaseResponse<T> API.

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
      // accessLogApi.ts reads this same "user" localStorage key to attribute
      // anonymous pageview tracking to a username - keep writing it here so
      // that keeps working without that file needing to know about
      // AuthContext.
      localStorage.setItem("user", JSON.stringify(user));
      dispatch({ type: "AUTHENTICATED", user });
    } catch {
      // Token existed but is invalid/expired, or /users/me failed -
      // apiClient's 401 interceptor already clears the token and redirects
      // when that's the cause; this just makes sure local state agrees.
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
