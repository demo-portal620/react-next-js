"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useRequireAuth() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const isAuthenticated = () => {
    return !!localStorage.getItem("authToken");
  };

  return { isAuthenticated: isAuthenticated() };
}
