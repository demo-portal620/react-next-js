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
