import { NotificationVariant } from "@/common/Notification";
import { PrimitiveType } from "@/common/PrimitiveType";

export interface Message {
  code: string;
  args?: PrimitiveType[];
}

export const SUCCESS = "success";
export const MSG_SUCCESS = { code: "i0001" };
export const MSG_SESSION_TIMEOUT = "e0003";
export const MSG_SYSTEM_ERROR = { code: "e0004" };
const STATUS_CODE_DEF: Map<string, string> = new Map([
  ["200", MSG_SUCCESS.code],
  ["404", "e0001"],
  ["504", "e0002"],
  ["4", "e0001"],
  ["5", "e0002"],
]);

export const getMessageByStatusCode = (statusCode?: number): string => {
  if (!statusCode) {
    return "e0004";
  }

  const strCode = statusCode ? statusCode + "" : "";
  let res: string | undefined = "e0004";
  if (STATUS_CODE_DEF.has(strCode)) {
    res = STATUS_CODE_DEF.get(strCode);
  } else if (
    strCode.length > 0 &&
    STATUS_CODE_DEF.has(strCode.substring(0, 1))
  ) {
    res = STATUS_CODE_DEF.get(strCode.substring(0, 1));
  }

  return res && res !== undefined ? res : "e0004";
};

export const getMessageVariant = (message: Message): NotificationVariant => {
  if (message?.code) {
    if (message.code === MSG_SUCCESS.code) {
      return "success";
    }

    const type = message.code.substring(0, 1).toUpperCase();
    if (type === "E") {
      return "error";
    } else if (type === "W") {
      return "warning";
    } else if (type === "I") {
      return "info";
    } else if (type === "C") {
      return "processing";
    }
  }

  return "error";
};

export const getMessageTitle = (message: Message): string => {
  if (message?.code) {
    if (message.code === MSG_SUCCESS.code) {
      return "Success";
    }

    const type = message.code.substring(0, 1).toUpperCase();
    if (type === "E") {
      return "Error";
    } else if (type === "W") {
      return "Warning";
    } else if (type === "I") {
      return "Info";
    } else if (type === "C") {
      return "Confirm";
    }
  }

  return "Error";
};
