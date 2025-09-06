"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth(redirectTo: string = "/login") {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        router.push(redirectTo);
        return;
      }

      // Optional: Verify token validity
      try {
        // Check if token is expired (if it's a JWT)
        const payload = JSON.parse(atob(token.split(".")[1]));
        const currentTime = Date.now() / 1000;

        if (payload.exp < currentTime) {
          // Token expired
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          setIsAuthenticated(false);
          setIsLoading(false);
          router.push(redirectTo);
          return;
        }
      } catch (error) {
        // Invalid token format
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setIsLoading(false);
        router.push(redirectTo);
        return;
      }

      setIsAuthenticated(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router, redirectTo]);

  return { isAuthenticated, isLoading };
}
