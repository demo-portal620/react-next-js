export const authUtils = {
  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("authToken");
  },

  setToken: (token: string): void => {
    localStorage.setItem("authToken", token);
  },

  removeToken: (): void => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },

  isAuthenticated: (): boolean => {
    const token = authUtils.getToken();
    if (!token) return false;

    try {
      // Check JWT expiration if applicable
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return !!token; // Simple token existence check
    }
  },

  redirectToLogin: (): void => {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },
};
