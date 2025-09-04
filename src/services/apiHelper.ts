// import { getFromSession, saveToSession } from "@/common/commonUtil";
// import {
//   getMessageByStatusCode,
//   MSG_SESSION_TIMEOUT,
// } from "@/common/Message";
// import {
//   CommonResponse,
//   CommonResponseInit,
//   ResponseStatus,
// } from "@/common/commonResponse";
// import {
//   DEFAULT_LANGUAGE,
//   SESSIONSTORAGE_KEY_LANGUAGE_CODE,
//   SESSIONSTORAGE_KEY_TOKEN,
// } from "@/common/constants";
// import { MessageCodeConst } from "@/common/MessageCodeConst";
// import axios, { AxiosError } from "axios";
// import { apContextType } from "@/context/ApContext";

// const services = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
//   // Add these to help with debugging
//   withCredentials: false,
//   validateStatus: (status) => {
//     return true; // Always return promise (don't reject on error status)
//   },
// });

// services.defaults.headers.post["Content-Type"] = "application/json";
// services.defaults.headers["X-Requested-With"] = "XMLHttpRequest";
// services.defaults.headers["Cache-Control"] = "no-cache";
// services.defaults.headers["pragma"] = "no-cache";
// services.defaults.timeout = 0;

// services.interceptors.request.use(
//   (config: any) => {
//     console.log("Full Request URL:", config.baseURL + config.url);
//     console.log("Request Config:", {
//       method: config.method,
//       headers: config.headers,
//       data: config.data,
//     });
//     const token = getFromSession(SESSIONSTORAGE_KEY_TOKEN);

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//       config.headers.token = token;
//     }

//     if (config.data instanceof FormData) {
//       config.headers.post = {};
//       config.headers.post["Content-Type"] = "multipart/form-data";
//     }

//     return config;
//   },
//   (error: any) => {
//     return Promise.reject(error);
//   }
// );

// services.interceptors.response.use(
//   (response: any) => {
//     console.log("Response Success:", {
//       status: response.status,
//       data: response.data,
//       headers: response.headers,
//     });
//     if (response?.headers?.token) {
//       saveToSession(SESSIONSTORAGE_KEY_TOKEN, response.headers.token);
//     }
//     return response.data;
//   },
//   async (error: AxiosError) => {
//     console.log("Response Error:", {
//       url: error.config?.url,
//       baseURL: error.config?.baseURL,
//       method: error.config?.method,
//       status: error.response?.status,
//       data: error.response?.data,
//     });
//     const responseData: CommonResponse = {
//       status: ResponseStatus.FAIL,
//       success: false,
//       message:
//         error.code === "ERR_NETWORK"
//           ? [{ code: MessageCodeConst.E0006 }]
//           : error.code === "ECONNABORTED"
//           ? [{ code: MessageCodeConst.E0002 }]
//           : error.response
//           ? [{ code: getMessageByStatusCode(error.response.status) }]
//           : [{ code: MessageCodeConst.E0004 }],
//     };
//     return Promise.reject(responseData);
//   }
// );

// const ajax = async <T extends BaseResponse = BaseResponse>(
//   url: string,
//   data: any = {},
//   type: RequestType = "post",
//   config: {
//     headers: Record<string, string>;
//     responseType?: "json" | "blob" | "text" | "arraybuffer";
//   } = { headers: {} }
// ): Promise<T> => {
//   const headers = {
//     token: getFromSession(SESSIONSTORAGE_KEY_TOKEN) || "",
//     languageCode:
//       getFromSession(SESSIONSTORAGE_KEY_LANGUAGE_CODE) || DEFAULT_LANGUAGE,
//   };

//   return new Promise<T>((resolve, reject) => {
//     let promise;
//     if (type === "get") {
//       promise = services.get(url, config);
//     } else if (type === "post") {
//       config.headers = { ...headers, ...config.headers };
//       promise = services.post(url, data, config);
//     } else if (type === "delete") {
//       promise = services.delete(url, data);
//     } else if (type === "put") {
//       promise = services.put(url, data);
//     }

//     console.log("promise", promise);

//     if (promise) {
//       promise
//         .then((res: any) => {
//           resolve(res || {});
//         })
//         .catch((error: any) => reject(error));
//     }
//   });
// };

// type RequestType = "post" | "get";

// export interface RequestParam {
//   url: string;
//   params?: object;
//   type?: RequestType;
//   headers?: object;
//   responseType?: "json" | "blob" | "text" | "arraybuffer";
//   apContext: apContextType;
// }

// let lastAlertMessage: string | null = null;
// let lastAlertTimestamp: number = 0;
// const ALERT_COOLDOWN = 1000;

// export const apiClient = async (
//   params: RequestParam
// ): Promise<BaseResponse> => {
//   try {
//     if (params.apContext?.showMask) {
//       params.apContext.showMask();
//     }

//     const response = await ajax(params.url, params.params, params.type, {
//       headers: (params.headers as Record<string, string>) || {},
//       responseType: params.responseType,
//     });

//     const messages = response?.message;
//     if (messages && Array.isArray(messages) && messages.length > 0) {
//       const currentMessage = messages[0].code;
//       const currentTime = Date.now();

//       if (
//         currentMessage !== lastAlertMessage ||
//         currentTime - lastAlertTimestamp > ALERT_COOLDOWN
//       ) {
//         if (params.apContext?.alertMessage) {
//           params.apContext.alertMessage(messages);
//         }
//         lastAlertMessage = currentMessage;
//         lastAlertTimestamp = currentTime;
//       }

//       messages.forEach((item) => {
//         if (item.code === "SESSION_TIMEOUT") {
//           if (params.apContext?.hideMask) {
//             params.apContext.hideMask();
//           }
//           window.location.href = "/login";
//         }
//       });
//     }

//     return response;
//   } catch (error: any) {
//     const errorMessage = error.message?.[0]?.code;
//     const currentTime = Date.now();

//     if (
//       errorMessage !== lastAlertMessage ||
//       currentTime - lastAlertTimestamp > ALERT_COOLDOWN
//     ) {
//       if (params.apContext?.alertMessage && error.message) {
//         params.apContext.alertMessage(error.message, "Error", "error");
//         lastAlertMessage = errorMessage;
//         lastAlertTimestamp = currentTime;
//       }
//     }
//     throw error;
//   } finally {
//     if (params.apContext?.hideMask) {
//       params.apContext.hideMask();
//     }
//   }
// };
