"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  ArrowUpRight,
  Users,
  MessageSquareWarning,
  Package,
  UserCog,
  Radio,
  Smartphone,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useModules } from "@/context/ModulesContext";
import { usePresence } from "@/hooks/usePresence";
import { fetchFreelancers } from "@/services/freelancerApi";
import { fetchComplaintInbox } from "@/services/complaintApi";
import { fetchProducts } from "@/services/stockApi";
import { fetchUsers } from "@/services/userApi";
import { fetchApkVersions } from "@/services/apkApi";

const APK_APP_CODE = "AP_ANDROID";

interface StatTile {
  key: string;
  title: string;
  value: string;
  icon: typeof Users;
  bgColor: string;
  iconBg: string;
  link: string;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { hasPermission } = useAuth();
  const { loaded: modulesLoaded, isEnabled } = useModules();

  // A tile is shown (and its data fetched) only if its module is switched on as well as permitted. Waiting for modulesLoaded first avoids firing a request at a module that turns out to be off.
  const showFreelancers = modulesLoaded && isEnabled("FREELANCERS");
  const showApk = modulesLoaded && isEnabled("APK_VERSIONS");
  const canManageComplaints = modulesLoaded && isEnabled("COMPLAINTS") && hasPermission("MANAGE_COMPLAINTS");
  const canManageStock = modulesLoaded && isEnabled("INVENTORY") && hasPermission("MANAGE_STOCK");
  const canViewUsers = hasPermission("VIEW_USER");
  const canViewPresence = modulesLoaded && isEnabled("PRESENCE") && hasPermission("VIEW_PRESENCE");
  const { users: onlineUsers } = usePresence("Dashboard", modulesLoaded && isEnabled("PRESENCE"));

  const [freelancerTotal, setFreelancerTotal] = useState<number | null>(null);
  const [openComplaints, setOpenComplaints] = useState<number | null>(null);
  const [inventoryTotal, setInventoryTotal] = useState<number | null>(null);
  const [userTotal, setUserTotal] = useState<number | null>(null);
  const [apkVersionTotal, setApkVersionTotal] = useState<number | null>(null);

  useEffect(() => {
    // Every list endpoint already returns a paginated total, so pageSize=1
    // is enough to read the count without pulling real rows.
    if (showFreelancers) {
      fetchFreelancers(1, 1, "").then((res) => setFreelancerTotal(res.total));
    }
    if (showApk) {
      fetchApkVersions(APK_APP_CODE, 1, 1).then((res) => setApkVersionTotal(res.total));
    }
  }, [showFreelancers, showApk]);

  useEffect(() => {
    if (canManageComplaints) {
      fetchComplaintInbox(1, 1, "").then((res) => setOpenComplaints(res.total));
    }
  }, [canManageComplaints]);

  useEffect(() => {
    if (canManageStock) {
      fetchProducts(1, 1, "").then((res) => setInventoryTotal(res.total));
    }
  }, [canManageStock]);

  useEffect(() => {
    if (canViewUsers) {
      fetchUsers(1, 1, "").then((res) => setUserTotal(res.total));
    }
  }, [canViewUsers]);

  const stats: StatTile[] = [
    ...(showFreelancers
      ? [
          {
            key: "freelancers",
            title: t("DASHBOARD_STAT_FREELANCERS"),
            value: freelancerTotal === null ? "—" : String(freelancerTotal),
            icon: Users,
            bgColor: "bg-blue-500",
            iconBg: "bg-blue-600",
            link: "/freelancers",
          },
        ]
      : []),
    ...(canManageComplaints
      ? [
          {
            key: "complaints",
            title: t("DASHBOARD_STAT_COMPLAINTS"),
            value: openComplaints === null ? "—" : String(openComplaints),
            icon: MessageSquareWarning,
            bgColor: "bg-red-500",
            iconBg: "bg-red-600",
            link: "/complaints",
          },
        ]
      : []),
    ...(canManageStock
      ? [
          {
            key: "inventory",
            title: t("DASHBOARD_STAT_INVENTORY"),
            value: inventoryTotal === null ? "—" : String(inventoryTotal),
            icon: Package,
            bgColor: "bg-green-500",
            iconBg: "bg-green-600",
            link: "/inventory",
          },
        ]
      : []),
    ...(canViewUsers
      ? [
          {
            key: "users",
            title: t("DASHBOARD_STAT_USERS"),
            value: userTotal === null ? "—" : String(userTotal),
            icon: UserCog,
            bgColor: "bg-purple-500",
            iconBg: "bg-purple-600",
            link: "/users",
          },
        ]
      : []),
    ...(canViewPresence
      ? [
          {
            key: "presence",
            title: t("DASHBOARD_STAT_PRESENCE"),
            value: String(onlineUsers.length),
            icon: Radio,
            bgColor: "bg-teal-500",
            iconBg: "bg-teal-600",
            link: "/presence",
          },
        ]
      : []),
    ...(showApk
      ? [
          {
            key: "apk",
            title: t("DASHBOARD_STAT_APK"),
            value: apkVersionTotal === null ? "—" : String(apkVersionTotal),
            icon: Smartphone,
            bgColor: "bg-yellow-500",
            iconBg: "bg-yellow-600",
            link: "/apk-versions",
          },
        ]
      : []),
  ];

  return (
    <div className="content-wrapper p-6">
      {/* Content Header */}
      <div className="content-header mb-6">
        <div className="container-fluid">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{t("DASHBOARD_TITLE")}</h1>
          </div>
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <span className="text-gray-700">{t("DASHBOARD_BREADCRUMB_HOME")}</span>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-500">{t("DASHBOARD_TITLE")}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <section className="content">
        <div className="container-fluid">
          {/* Small boxes (Stat box) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={stat.key}
                  className={`small-box ${stat.bgColor} rounded-lg text-white relative overflow-hidden`}
                >
                  <div className="p-4">
                    <div className="inner">
                      <h3 className="text-3xl font-bold mb-2">{stat.value}</h3>
                      <p className="text-sm opacity-90">{stat.title}</p>
                    </div>
                    <div
                      className={`icon absolute top-4 right-4 ${stat.iconBg} rounded-full p-3`}
                    >
                      <IconComponent className="h-6 w-6" />
                    </div>
                  </div>
                  <Link
                    href={stat.link}
                    className="small-box-footer bg-black bg-opacity-20 px-4 py-2 flex items-center justify-between text-sm hover:bg-opacity-30 transition-all"
                  >
                    {t("DASHBOARD_MORE_INFO")} <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
