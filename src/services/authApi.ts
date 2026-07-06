const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
const AUTH_BASE = `${API_BASE}/auth`;

// Login function
export async function loginUser(username: string, password: string) {
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

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || `Login failed: ${res.status}`);
  }

  return await res.json();
}

export interface RegisterPayload {
  username: string;
  password: string;
  email: string;
  firstname?: string;
  lastname?: string;
  phoneNumber?: string;
}

// Register function - backend returns a plain text body on success
// (not JSON), so this reads text and only tries to parse JSON for errors.
export async function registerUser(payload: RegisterPayload) {
  const url = `${AUTH_BASE}/register`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();

  if (!res.ok) {
    let message = text;
    try {
      const json = JSON.parse(text);
      message = json.message || json.error || text;
    } catch {
      // not JSON, keep raw text
    }
    throw new Error(message || `Registration failed: ${res.status}`);
  }

  return text;
}
