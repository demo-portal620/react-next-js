"use client";

import { Menu, Clock, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchCurrentUser } from "@/services/userApi";

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState("");
  const [language, setLanguage] = useState("en");
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      };
      setCurrentTime(now.toLocaleDateString("en-US", options));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchCurrentUser()
      .then((user) => {
        const name = [user.firstname, user.lastname].filter(Boolean).join(" ");
        setDisplayName(name || user.username);
      })
      .catch(() => setDisplayName(""));
  }, []);

  function handleLogout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    router.push("/login");
  }

  return (
    <header className="main-header fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <nav className="navbar flex items-center justify-between px-4 h-14">
        {/* Left navbar links */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="p-2"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Right navbar links */}
        <div className="flex items-center space-x-4">
          {/* Server Time */}
          <div className="hidden sm:flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-1" />
            {currentTime}
          </div>

          {/* Language Selector */}
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">EN</SelectItem>
              <SelectItem value="th">TH</SelectItem>
              <SelectItem value="zh">ZH</SelectItem>
            </SelectContent>
          </Select>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center">
                <span className="uppercase font-bold mr-2">
                  {displayName || "Account"}
                </span>
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
}
