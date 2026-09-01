"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { NotificationProvider } from "@/context/NotificationContext";

// Matches Tailwind's `md` breakpoint - a full-width (16rem) sidebar leaves
// next to nothing for content below this.
const MOBILE_BREAKPOINT = 768;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // One-directional on purpose: forces collapsed when the viewport shrinks
  // below the breakpoint, but doesn't force it back open when growing past
  // it again, so a user's own manual toggle at desktop width isn't fought
  // by an unrelated resize event.
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < MOBILE_BREAKPOINT) {
        setSidebarCollapsed(true);
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-100">
        <div className="wrapper">
          <Header onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

          <Sidebar collapsed={sidebarCollapsed} />

          <div
            className={cn(
              // pb-16 clears the fixed footer's height - without it, any
              // page whose content reaches near the bottom of the viewport
              // (e.g. a table's pagination controls) renders underneath the
              // footer instead of above it, since `fixed` content takes no
              // space in normal flow.
              "content-wrapper pt-14 pb-16 transition-all duration-300",
              sidebarCollapsed ? "ml-16" : "ml-64"
            )}
          >
            {children}
          </div>

          <Footer collapsed={sidebarCollapsed} />
        </div>
      </div>
    </NotificationProvider>
  );
}
