"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="wrapper">
        <Header onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <Sidebar collapsed={sidebarCollapsed} />

        <div
          className={cn(
            "content-wrapper transition-all duration-300",
            sidebarCollapsed ? "ml-16" : "ml-64"
          )}
        >
          {children}
        </div>

        <Footer collapsed={sidebarCollapsed} />
      </div>
    </div>
  );
}
