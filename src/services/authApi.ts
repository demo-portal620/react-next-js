const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
const AUTH_BASE = `${API_BASE}/auth`;

// Mirrors ap-be's BaseResponse<T> JSON shape - Message.text is the already-resolved human-readable string.
interface BaseResponse<T> {
  success: boolean;
  data: T;
  messages?: { code: string; text?: string; args?: unknown[] }[];
  statusCode: number;
}

// Mirrors ap-be's LoginResponseDto - token is null when requiresTotp is true, pending a verify-totp call.
export interface LoginResponseDto {
  token: string | null;
  requiresTotp: boolean;
  pendingToken: string | null;
}

function firstMessage(body: BaseResponse<unknown> | null, fallback: string): string {
  const first = body?.messages?.[0];
  return first?.text || first?.code || fallback;
}

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

// Second login step when loginUser() returns requiresTotp: true.
export async function verifyLoginTotp(pendingToken: string, code: string): Promise<LoginResponseDto> {
  const url = `${AUTH_BASE}/login/verify-totp`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pendingToken, code }),
  });

  const body: BaseResponse<LoginResponseDto> | null = await res.json().catch(() => null);

  if (!res.ok || !body?.success) {
    throw new Error(firstMessage(body, `Verification failed: ${res.status}`));
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

// Always responds success regardless of match (anti-enumeration) - a thrown Error means the request itself failed.
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

export async function verifyEmail(token: string): Promise<void> {
  const url = `${AUTH_BASE}/verify-email`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });

  const body: BaseResponse<void> | null = await res.json().catch(() => null);

  if (!res.ok || !body?.success) {
    throw new Error(firstMessage(body, `Verification failed: ${res.status}`));
  }
}

// Always responds success regardless of match (anti-enumeration).
export async function resendVerification(email: string): Promise<void> {
  const url = `${AUTH_BASE}/resend-verification`;

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
