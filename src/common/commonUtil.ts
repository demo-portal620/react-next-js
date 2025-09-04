// import { format } from "date-fns";
// import i18n, { TFunction } from "i18next";
// import {
//   DATE_FORMAT,
//   DATE_TIME_FORMAT,
//   DEFAULT_LANGUAGE,
//   ISO_DATE_FORMAT,
//   ISO_DATE_TIME_FORMAT,
//   MONTH_FORMAT,
//   DEFAULT_PAGE,
//   DEFAULT_PAGESIZE,
//   SESSIONSTORAGE_KEY_CODECATEGORYMAP,
//   SESSIONSTORAGE_KEY_CODECATEGORYS,
//   SESSIONSTORAGE_KEY_COLUMN,
//   SESSIONSTORAGE_KEY_LANGUAGE_CODE,
// } from "./constants";
// import { CategoryBeanList } from "./CategoryBeanList";
// import { OptionBeanList } from "./OptionBeanList";
// import { PrimitiveType } from "./PrimitiveType";
// import { enUS } from "date-fns/locale";
// import { PageInfo, RowDefine } from "./PageInfo";
// import { UseFormSetValue } from "react-hook-form";

// // // Add this type definition at the top with other imports
// // type DebouncedFunction<T extends (...args: any[]) => any> = (
// //   ...args: Parameters<T>
// // ) => void;

// /**
//  * Check the object is empty
//  * @param data the data
//  * @returns true: is empty, false: not empty
//  */
// export const isEmpty = (data?: any): boolean => {
//   if (data && data !== null && data != undefined) {
//     if (typeof data === "object") {
//       if (
//         Object.keys(data).length > 0 ||
//         Object.getOwnPropertyNames(data).length > 0
//       ) {
//         return false;
//       }
//     } else if (typeof data === "string") {
//       if (data.length > 0) {
//         return false;
//       }
//     } else {
//       return false;
//     }
//   }

//   return true;
// };

// /**
//  * Internationalization.
//  * ex:
//  *   en.js: "e0103": "{0} is required. Please input.(e0103)"
//  *   params: msg=e0103,variables="xx"
//  *   return: xx is required. Please input.(e0103)
//  *
//  * @param msg message code
//  * @param variables the parameters of message
//  * @returns message content
//  */
// export const changePageInfo = (page?: PageInfo): PageInfo => {
//   if (page && !isEmpty(page)) {
//     console.log(page);
//     return {
//       ...page,
//       // pageNum: (page.pageNum ? page.pageNum : DEFAULT_PAGE) + 1,
//       pageNum: page.pageNum ? page.pageNum : DEFAULT_PAGE,
//       pageSize: page.pageSize ?? DEFAULT_PAGESIZE,
//     };
//   } else {
//     return {
//       pageNum: DEFAULT_PAGE,
//       pageSize: DEFAULT_PAGESIZE,
//     };
//   }
// };

// export const $t = (msg: string, variables: PrimitiveType[] = []): string => {
//   if (!msg) return "";

//   try {
//     // First try 'labels' namespace
//     let translation = i18n.t(msg, { ns: "labels" });

//     // If not found in labels, try messages namespace
//     if (translation === msg) {
//       translation = i18n.t(msg, { ns: "messages" });
//     }

//     // If we have variables to interpolate
//     if (variables && variables.length > 0) {
//       let res = translation;
//       for (let i = 0; i < variables.length; i++) {
//         const variable = variables[i];
//         // Try to translate the variable if it's a string, otherwise use it directly
//         const variableTranslation =
//           typeof variable === "string"
//             ? i18n.t(variable, { ns: "labels" }) || variable
//             : String(variable);
//         res = res.replace(`{${i}}`, variableTranslation);
//       }
//       return res;
//     }

//     return translation || msg; // Fallback to key if translation not found
//   } catch (error) {
//     console.error(`Translation error for key: ${msg}`, error);
//     return msg; // Fallback to key if there's an error
//   }
// };

// // Add this helper function to debug translations
// export const debugTranslation = (key: string) => {
//   console.group(`Translation Debug for key: ${key}`);
//   console.log("Labels namespace:", i18n.t(key, { ns: "labels" }));
//   console.log("Messages namespace:", i18n.t(key, { ns: "messages" }));
//   console.log("Available resources:", i18n.options.resources);
//   console.groupEnd();
// };

// export const $t2 = (
//   t: TFunction,
//   msg: string,
//   variables: PrimitiveType[] = []
// ): string => {
//   if (variables && variables.length > 0) {
//     let res = t(msg);
//     for (let i = 0; i < variables.length; i++) {
//       res = res.replace("{" + i + "}", t(variables[i] + ""));
//     }

//     return res;
//   } else {
//     return t(msg);
//   }
// };

// export const $t_ph = (key: string, length?: number): string => {
//   if (length) {
//     return $t(key) + $t("COMMON_MAX_LETTERS", [length]);
//   } else {
//     return $t(key);
//   }
// };

// /**
//  * Save data into session.
//  *
//  * @param key the key
//  * @param value the value
//  */
// export const saveToSession = (key: string, value: string): void => {
//   if (typeof window !== "undefined") {
//     window.localStorage.setItem(key, value);
//   } else {
//     localStorage.setItem(key, value);
//   }
// };

// /**
//  * 移除 localStorage 中以指定前缀开头的项
//  *
//  * @param prefix
//  *
//  */
// export const removeLocalStorageItemsWithPrefix = (prefix: string): void => {
//   // 使用 Object.keys 将 localStorage 的键转换为数组
//   const keys = Object.keys(localStorage);

//   // 过滤并移除以指定前缀开头的项
//   keys.forEach((key) => {
//     if (key.startsWith(prefix)) {
//       localStorage.removeItem(key);
//     }
//   });
// };

// export const setDefaultFilter = (pageName: string, filter: any): void => {
//   const filterStr = getFromSession(pageName);
//   if (!filterStr || filterStr.length === 0) {
//     saveToSession(pageName, JSON.stringify({ ft: filter }));
//   }
// };

// /**
//  * Get data from session.
//  *
//  * @param key the key
//  * @returns the data
//  */
// export const getFromSession = (key: string): string | null => {
//   if (typeof window !== "undefined") {
//     return window.localStorage.getItem(key);
//   } else {
//     return localStorage.getItem(key);
//   }
// };

// /**
//  * Add src into dest.
//  *
//  * @param src the array of src
//  * @param dest the array of dest
//  * @returns the array of dest
//  */
// export const addAll = (src: any[], dest: any[]): any[] => {
//   if (src && src.length > 0) {
//     src.map((data) => {
//       dest.push(data);
//     });
//   }

//   return dest;
// };

// /**
//  * Clone array with no deep.
//  *
//  * @param datas the array of data
//  * @returns new array of data
//  */
// export const cloneArrNoDeep = (datas: any[]): any[] => {
//   return addAll(datas, []);
// };

// /**
//  * Remove data from session.
//  *
//  * @param key the key
//  */
// export const removeFromSession = (key: string): void => {
//   if (typeof window !== "undefined") {
//     window.localStorage.removeItem(key);
//   } else {
//     localStorage.removeItem(key);
//   }
// };

// /**
//  * Remove data from session.
//  *
//  * @param key the key
//  */
// export const clearSession = (): void => {
//   let storage;
//   if (typeof window !== "undefined") {
//     storage = window.localStorage;
//   } else {
//     storage = localStorage;
//   }

//   for (let i = 0; i < storage.length; i++) {
//     const key = storage.key(i);

//     if (key && !key.startsWith(SESSIONSTORAGE_KEY_COLUMN)) {
//       storage.removeItem(key);
//       i--;
//     }
//   }
// };

// /**
//  * Get Category array by category type.
//  *
//  * @param categoryType the category type. eg: ACTIVE_FLAG
//  * @returns the array of cagetory. eg: [{label: "Active", value: 1}, {label: "Inactive", value: 0}]
//  */
// export const getCategoryList = (categoryType: string): CategoryBeanList[] => {
//   const codeCategorys = getFromSession(SESSIONSTORAGE_KEY_CODECATEGORYS);
//   if (codeCategorys) {
//     const obj = JSON.parse(codeCategorys);

//     if (obj) {
//       let lang = getFromSession(SESSIONSTORAGE_KEY_LANGUAGE_CODE);
//       if (!lang) {
//         lang = DEFAULT_LANGUAGE;
//       }

//       if (obj[lang] && obj[lang][categoryType]) {
//         return obj[lang][categoryType];
//       }
//     }
//   }

//   return [];
// };

// /**
//  * Add propterty 'key' to datas.
//  *
//  * @param key the unique item in datas
//  * @param datas the array of date
//  */
// export const setKeyForList = (key: string, datas?: RowDefine[]): void => {
//   if (datas && datas.length > 0) {
//     datas.forEach((data: any) => {
//       data.key = data[key];
//     });
//   }
// };

// export const convertCategoryBeanList = (
//   list: CategoryBeanList[]
// ): OptionBeanList[] => {
//   const result: OptionBeanList[] = [];
//   list.forEach((item) => {
//     result.push({
//       label: item.label,
//       value: item.value + "",
//     });
//   });

//   return result;
// };

// /**
//  * Get category label array.
//  *
//  * @param categorys the array of category. eg:[{label: "Active", value: 1}, {label: "Inactive", value: 0}]
//  * @param values the array of category code. eg: [1,0]
//  * @returns the array of category name. eg: ['Active', 'Inactive']
//  */
// export const getCategoryStrArr = (
//   categorys: OptionBeanList[] | CategoryBeanList[],
//   values?: string[] | number[]
// ): string[] => {
//   if (categorys && categorys.length > 0 && values && values.length > 0) {
//     const arr = [];
//     for (let i = 0; i < values.length; i++) {
//       for (let j = 0; j < categorys.length; j++) {
//         if (values[i] === categorys[j].value) {
//           arr.push(categorys[j].label);
//           break;
//         }
//       }
//     }

//     return arr;
//   }

//   return [];
// };

// /**
//  * Get all category
//  *
//  * @returns category map. eg: {ACTIVE_FLAG.0: "Inactive", ACTIVE_FLAG.1: "Active", ...}
//  */
// export const getCategoryMap = () => {
//   const codeCategorys = getFromSession(SESSIONSTORAGE_KEY_CODECATEGORYMAP);
//   if (codeCategorys) {
//     const obj = JSON.parse(codeCategorys);

//     if (obj) {
//       let lang = getFromSession(SESSIONSTORAGE_KEY_LANGUAGE_CODE);
//       if (!lang) {
//         lang = DEFAULT_LANGUAGE;
//       }

//       if (obj[lang]) {
//         return obj[lang];
//       }
//     }
//   }

//   return {};
// };

// /**
//  * Get category name by value
//  *
//  * @param categorys the map of category
//  * @param categoryType the category type
//  * @param value the category value
//  * @returns the category name
//  */
// export const getCategoryStr = (
//   categorys: any,
//   categoryType: string,
//   value: number
// ): string => {
//   let res = "";
//   if (categorys && categoryType) {
//     res = categorys[categoryType + "." + value];
//   }

//   return res ? res : "";
// };

// /**
//  * check int value is equals.
//  *
//  * @param value1 the value one
//  * @param value2 the value two
//  * @returns true: is equal, false: not equal
//  */
// export const compareInt = (
//   value1?: string | number | undefined,
//   value2?: string | number | undefined
// ): boolean => {
//   if (value1 && value2) {
//     let v1 = value1;
//     if (typeof value1 === "string") {
//       v1 = parseInt(value1);
//     }

//     let v2 = value2;
//     if (typeof value2 === "string") {
//       v2 = parseInt(value2);
//     }
//     if (v1 === v2) {
//       return true;
//     }
//   } else if (!value1 && !value2) {
//     return true;
//   }

//   return false;
// };

// /**
//  * check int value is equals.
//  *
//  * @param value1 the value one
//  * @param value2 the value two
//  * @returns true: is equal, false: not equal
//  */
// export const compareFloat = (
//   value1?: string | number | undefined,
//   value2?: string | number | undefined
// ): boolean => {
//   if (value1 && value2) {
//     let v1 = value1;
//     if (typeof value1 === "string") {
//       v1 = parseFloat(value1);
//     }

//     let v2 = value2;
//     if (typeof value2 === "string") {
//       v2 = parseFloat(value2);
//     }
//     if (v1 === v2) {
//       return true;
//     }
//   } else if (!value1 && !value2) {
//     return true;
//   }

//   return false;
// };

// /**
//  * Get the instant value of date.
//  *
//  * @param date the date
//  * @returns the instant(Accurate to days)
//  */
// export const getDateTime = (date?: Date | null | undefined): number | null => {
//   if (!date || date === null || date === undefined) {
//     return null;
//   }
//   const DAY_SECONDS = 24 * 60 * 60 * 1000;

//   const value =
//     parseInt((date.getTime() / DAY_SECONDS).toFixed(0)) * DAY_SECONDS;

//   return value - 8 * 60 * 60 * 1000;
// };

// export const formatMonth = (lang: string, date?: Date | number | string) => {
//   if (date) {
//     const options = { locale: enUS };
//     if (typeof date === "string") {
//       if (date.indexOf("-") > 0 && date.indexOf(":") > 0) {
//         return format(new Date(date), MONTH_FORMAT[lang], options);
//       }
//       if (date.indexOf("-") > 0 && date.indexOf(":") <= 0) {
//         date = date + " 00:00:00";

//         return format(new Date(date), MONTH_FORMAT[lang], options);
//       } else {
//         return format(parseInt(date), MONTH_FORMAT[lang], options);
//       }
//     } else if (typeof date === "number") {
//       if (date === -1) {
//         return "";
//       } else {
//         return format(new Date(date), MONTH_FORMAT[lang], options);
//       }
//     } else {
//       return format(date, MONTH_FORMAT[lang], options);
//     }
//   }

//   return "";
// };

// export const formatMonthNullLine = (
//   lang: string,
//   date?: Date | number | string
// ) => {
//   if (date) {
//     const options = { locale: enUS };
//     if (typeof date === "string") {
//       date =
//         date.substring(0, 4) +
//         "-" +
//         date.substring(4, 6) +
//         "-" +
//         "01" +
//         " :00:00:00";
//       return format(new Date(date), MONTH_FORMAT[lang], options);
//     } else {
//       return "";
//     }
//   }
//   return "";
// };

// export const formatDate = (lang: string, date?: Date | number | string) => {
//   if (date) {
//     const options = { locale: enUS };
//     if (typeof date === "string") {
//       if (date.indexOf("-") > 0 && date.indexOf(":") > 0) {
//         return format(new Date(date), DATE_FORMAT[lang], options);
//       }
//       if (date.indexOf("-") > 0 && date.indexOf(":") <= 0) {
//         date = date + " 00:00:00";

//         return format(new Date(date), DATE_FORMAT[lang], options);
//       } else {
//         return format(parseInt(date), DATE_FORMAT[lang], options);
//       }
//     } else if (typeof date === "number") {
//       if (date === -1) {
//         return "";
//       } else {
//         return format(new Date(date), DATE_FORMAT[lang], options);
//       }
//     } else {
//       return format(date, DATE_FORMAT[lang], options);
//     }
//   }

//   return "";
// };

// export const formatDateTime = (lang: string, date?: Date | number | string) => {
//   if (date) {
//     const options = { locale: enUS };
//     if (typeof date === "string") {
//       if (date.indexOf("-") > 0) {
//         return format(new Date(date), DATE_TIME_FORMAT[lang], options);
//       } else {
//         return format(parseInt(date), DATE_TIME_FORMAT[lang], options);
//       }
//     } else if (typeof date === "number") {
//       if (date === -1) {
//         return "";
//       } else {
//         return format(new Date(date), DATE_TIME_FORMAT[lang], options);
//       }
//     } else {
//       return format(date, DATE_TIME_FORMAT[lang], options);
//     }
//   }

//   return "";
// };

// export const convertDate = (date?: Date | number | string): string => {
//   let res = "";
//   if (date && date !== -1) {
//     if (typeof date === "string") {
//       if (date.indexOf("-") > 0) {
//         res = date;
//       } else {
//         res = format(new Date(parseInt(date)), ISO_DATE_FORMAT);
//       }
//     } else {
//       res = format(new Date(date), ISO_DATE_FORMAT);
//     }
//   }

//   return res;
// };

// export const convertDateTime = (date?: Date | number | string): string => {
//   let res = "";
//   if (date && date !== -1) {
//     if (typeof date === "string") {
//       res = date;
//     } else {
//       res = format(new Date(date), ISO_DATE_TIME_FORMAT);
//     }
//   }

//   return res;
// };

// export const setFormValue = (setValue: UseFormSetValue<any>, items: any) => {
//   Object.entries(items).forEach(([k, v]) => {
//     setValue(k, v);
//   });
// };

// /**
//  * Creates a debounced version of a function with a cancel capability
//  * @param func The function to debounce
//  * @param wait The number of milliseconds to delay
//  * @returns A tuple containing the debounced function and a cancel function
//  */
// // export const createDebounce = <T extends (...args: any[]) => any>(
// //   func: T,
// //   wait: number
// // ): [DebouncedFunction<T>, () => void] => {
// //   let timeout: NodeJS.Timeout | null = null;

// //   const debounced: DebouncedFunction<T> = (...args: Parameters<T>) => {
// //     if (timeout) {
// //       clearTimeout(timeout);
// //     }

// //     timeout = setTimeout(() => {
// //       func(...args);
// //     }, wait);
// //   };

// //   const cancel = () => {
// //     if (timeout) {
// //       clearTimeout(timeout);
// //       timeout = null;
// //     }
// //   };

// //   return [debounced, cancel];
// // };
