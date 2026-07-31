const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
const AUTH_BASE = `${API_BASE}/auth`;

// Mirrors ap-be's BaseResponse<T> JSON shape (com.admin.common.base.BaseResponse).
// Message.text is the already-resolved human-readable string (see
// com.admin.common.base.exception.Message#getText) - prefer it over the
// bare code, same convention as apiClient.ts's extractMessage.
interface BaseResponse<T> {
  success: boolean;
  data: T;
  messages?: { code: string; text?: string; args?: unknown[] }[];
  statusCode: number;
}

// Mirrors ap-be's com.admin.dto.auth.LoginResponseDto field-for-field.
export interface LoginResponseDto {
  token: string;
}

function firstMessage(body: BaseResponse<unknown> | null, fallback: string): string {
  const first = body?.messages?.[0];
  return first?.text || first?.code || fallback;
}

// Login function - ap-be's AuthController#login now returns
// BaseResponse<LoginResponseDto> like every other endpoint (it used to
// return a bare {"token": "..."} object).
export async function loginUser(username: string, password: string): Promise<LoginResponseDto> {
  const url = `${AUTH_BASE}/login`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  const body: BaseResponse<LoginResponseDto> | null = await res.json().catch(() => null);

  if (!res.ok || !body?.success) {
    throw new Error(firstMessage(body, `Login failed: ${res.status}`));
  }

  return body.data;
}

export interface RegisterPayload {
  username: string;
  password: string;
  email: string;
  firstname?: string;
  lastname?: string;
  phoneNumber?: string;
}

// Register function - ap-be's AuthController#register now returns
// BaseResponse<Void> like every other endpoint (it used to return a bare
// plain-text body, which is why this used to read res.text() instead of
// res.json()).
export async function registerUser(payload: RegisterPayload): Promise<void> {
  const url = `${AUTH_BASE}/register`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body: BaseResponse<void> | null = await res.json().catch(() => null);

  if (!res.ok || !body?.success) {
    throw new Error(firstMessage(body, `Registration failed: ${res.status}`));
  }
}

// ap-be's AuthController#forgotPassword always responds success whether or
// not the email matches an account (anti-enumeration) - a thrown Error here
// means the request itself failed (network/validation), not "email not found".
export async function requestPasswordReset(email: string): Promise<void> {
  const url = `${AUTH_BASE}/forgot-password`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const body: BaseResponse<void> | null = await res.json().catch(() => null);

  if (!res.ok || !body?.success) {
    throw new Error(firstMessage(body, `Request failed: ${res.status}`));
  }
}

export async function confirmPasswordReset(token: string, newPassword: string): Promise<void> {
  const url = `${AUTH_BASE}/reset-password`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, newPassword }),
  });

  const body: BaseResponse<void> | null = await res.json().catch(() => null);

  if (!res.ok || !body?.success) {
    throw new Error(firstMessage(body, `Reset failed: ${res.status}`));
  }
}
