import { apiGet, apiClient, BaseResponse } from "@/services/apiClient";

// Keys match the app_module rows seeded in ap-be's V35 migration - and
// ModuleGateFilter's route table, which is what actually enforces them.
export const MODULE_KEYS = [
  "FREELANCERS",
  "APK_VERSIONS",
  "PRESENCE",
  "COMPLAINTS",
  "PROPERTIES",
  "HOMESTAY",
  "INVENTORY",
  "STOCK_CHECKS",
  "IP_WHITELIST",
  "TELEGRAM_ALERTS",
] as const;

export type ModuleKey = (typeof MODULE_KEYS)[number];

// Mirrors ap-be's com.admin.entity.system.AppModule.
export interface AppModule {
  moduleKey: ModuleKey;
  enabled: boolean;
  updatedBy?: string;
  updatedDate?: string;
}

export async function fetchModules(): Promise<AppModule[]> {
  return apiGet<AppModule[]>("/api/modules");
}

export async function setModuleEnabled(moduleKey: ModuleKey, enabled: boolean): Promise<AppModule> {
  const res = await apiClient.put<BaseResponse<AppModule>>(`/api/modules/${moduleKey}`, null, {
    params: { enabled },
  });
  return res.data.data;
}
