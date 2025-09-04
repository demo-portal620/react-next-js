import { Locale } from "date-fns";
import { enUS, zhCN } from "date-fns/locale";

export const BASE_URL = "/ttactif-api";
export const COMMON_URL = BASE_URL + "/common";

export const DEFAULT_LANGUAGE = "en";
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGESIZE = 10;

export const DATE_FORMAT: { [key: string]: string } = {
  en: "dd-MMM-yyyy",
  zh: "yyyy-MM-dd",
};

export const MONTH_FORMAT: { [key: string]: string } = {
  en: "MMM-yyyy",
  zh: "yyyy-MM",
};

export const PRODUCTION_MONTH_FORMAT = "yyyyMM";
export const EN_MONTH_FORMAT = "MMM-yyyy";

export const DATE_TIME_FORMAT: { [key: string]: string } = {
  en: "dd-MMM-yyyy HH:mm:ss",
  zh: "yyyy-MM-dd HH:mm:ss",
};

export const ISO_DATE_FORMAT = "yyyy-MM-dd";
export const ISO_DATE_TIME_FORMAT = "yyyy-MM-dd HH:mm:ss";

export const TABLE_COLUMN_ACTIONS = "actions";
export const TABLE_ROWSPERPAGEOPTIONS = [10, 25, 50, 100];
export const TABLE_ROWSPERPAGEOPTIONS_EDIT = [10];

export const Locale_Lang: { [key: string]: Locale } = { en: enUS, zh: zhCN };

export const REQUIRED_CSS = { backgroundColor: "#FFFF80", borderRadius: "8px" };
export const READONLY_CSS = { backgroundColor: "#F1F1F1", borderRadius: "8px" };
export const ERROR_CSS = {
  borderColor: "#FF4D49",
  borderWidth: "1px",
  borderStyle: "solid",
};

export const HTML_GRID_SPACING_SMALL = 3;
export const HTML_GRID_SPACING = 6;
export const HTML_GRID_SPACING_LARGE = 9;

export const HTML_BUTTON_SIZE = "medium";
export const HTML_SELECT_SIZE = "small";
export const HTML_ICONBUTTON_SIZE = "small";
export const HTML_CUSTOMCHIP_SIZE = "small";
export const HTML_LIST_SIZE = "small";

export const HEIGHT_HEADER_FOOTER = "90px";
export const HEIGHT_BUTTON = "48px";
export const HEIGHT_PAGINATION = "52px";
export const HEIGHT_TABLE_HEADER = "85px";
export const HEIGHT_TABLE_HEADER2 = "125px";
export const HEIGHT_CARD_PADDING = "12px";

export const SESSIONSTORAGE_KEY_TOKEN = "accessToken";
export const SESSIONSTORAGE_KEY_USER = "userData";
export const SESSIONSTORAGE_KEY_LANGUAGE_CODE = "language";
export const SESSIONSTORAGE_KEY_ACCESSRESOURCELIST = "resources";
export const SESSIONSTORAGE_KEY_SCREENAUTH = "sk_screenAuth";
export const SESSIONSTORAGE_KEY_URLAUTH = "sk_urlAuth";
export const SESSIONSTORAGE_KEY_CODECATEGORYMAP = "sk_codeCategoryMap";
export const SESSIONSTORAGE_KEY_CODECATEGORYS = "sk_codeCategorys";
export const SESSIONSTORAGE_KEY_BUSINESSPATTERN = "sk_businessPattern";
export const SESSIONSTORAGE_KEY_FILTER = "acc_filter_";
export const SESSIONSTORAGE_KEY_COLUMN = "acc_col_";

export const DO_ERROR_AND_WARNING_CHECK = "do_error_and_warning_check";

export const REG_ALPHA_NUMBER = new RegExp("^[A-Za-z0-9_-]+$");
export const REG_NUMBER_POSITIVE = new RegExp("^[0-9]+$");
export const REG_DECIMAL = new RegExp("^(-?)[0-9]+(\\.[0-9]+)?$");
export const REG_DECIMAL_POSITIVE = new RegExp("^[0-9]+(.[0-9]+)?$");
export const REG_DECIMAL_ZERO = new RegExp("^[0]+(.[0]+)?$");
export const REG_PHONE = new RegExp("^1[34578][0-9]{9}$");
export const REG_MAIL = new RegExp(
  "^([a-z0-9A-Z]+[-_|\\.]?)+[a-z0-9A-Z]@([a-z0-9A-Z]+(-[a-z0-9A-Z]+)?\\.)+[a-zA-Z]{2,}$"
);
export const REG_ORDER_NO = new RegExp("^[A-Za-z0-9_&-]+$");

export const REPORT_TYPE_PFI = "PFI";
export const REPORT_TYPE_SC = "SC";

export const SALESCONFIRMATION_COVER = "SALESCONFIRMATIONCOVER";
export const SALESCONFIRMATION_ATTACHED = "SALESCONFIRMATIONATTACHED";
export const SALESCONFIRMATION = "SALESCONFIRMATION";
export const PFI_COVER = "PFICOVER";

export const CONTENT_TYPE_PDF = 1;
export const CONTENT_TYPE_WORD = 2;
export const CONTENT_TYPE_EXCEL = 3;
