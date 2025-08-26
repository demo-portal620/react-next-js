import { Message, MSG_SYSTEM_ERROR } from "@/common/Message";

export enum ResponseStatus {
  WAIT = "1",
  LOADING = "2",
  SUCCESS = "3",
  FAIL = "4",
}

export interface CommonResponse {
  status: ResponseStatus;
  success: boolean;
  message?: Array<{ code: string }>;
  data?: any;
}

export const CommonResponseInit = {
  status: ResponseStatus.WAIT,
  success: false,
  message: [],
  data: null,
};

export const setResponseValue = (state: CommonResponse): void => {
  state.status = ResponseStatus.WAIT;
  state.success = false;
  state.message = [];
  state.data = [];
};

export const copyResponseValue = (
  state: CommonResponse,
  response: CommonResponse
): void => {
  if (response) {
    state.status = response.status;
    state.success = response.success;
    state.message = response.message;
    state.data = response.data;
  }
};

export const setResponseValueError = (state: CommonResponse): void => {
  state.status = ResponseStatus.FAIL;
  state.success = false;
  state.message = [MSG_SYSTEM_ERROR];
};

export const isRequestCompleted = (status: string): boolean => {
  if (status === ResponseStatus.SUCCESS || status === ResponseStatus.FAIL) {
    return true;
  }

  return false;
};
