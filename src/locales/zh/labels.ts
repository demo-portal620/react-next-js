// Chinese translations, mirroring locales/en/labels.ts key-for-key. Same
// incremental migration convention applies - add a key here whenever you
// add its English counterpart, don't try to translate the whole app in one pass.
//
// Typed as Record<LabelKey, string> (LabelKey comes from the English file)
// so a key added to one file without the other fails `tsc --noEmit`
// instead of silently leaving a language half-translated.
import { LabelKey } from "@/locales/en/labels";

const labels: Record<LabelKey, string> = {
  COMMON_SAVE: "保存",
  COMMON_CANCEL: "取消",
  COMMON_DELETE: "删除",
  COMMON_EDIT: "编辑",
  COMMON_SEARCH: "搜索",
  COMMON_LOADING: "加载中...",
  COMMON_CONFIRM_DELETE: "确定要删除此项吗?",
  NAVBAR_ACCOUNT_FALLBACK: "账户",
  NAVBAR_MY_ACCOUNT: "我的账户",
  NAVBAR_MY_PROFILE: "个人资料",
  NAVBAR_LOGOUT: "退出登录",
  SIDEBAR_DASHBOARD: "仪表盘",
  SIDEBAR_FREELANCERS: "自由职业者",
  SIDEBAR_APK_VERSIONS: "APK 版本",
  SIDEBAR_WHOS_ONLINE: "在线用户",
  SIDEBAR_INVENTORY: "库存",
  SIDEBAR_STOCK_CHECKS: "盘点任务",
  SIDEBAR_USER_MANAGEMENT: "用户管理",
  SIDEBAR_USER_LIST: "用户列表",
  SIDEBAR_ROLES: "角色",
};

export default labels;
