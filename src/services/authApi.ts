//const AUTH_BASE = "http://ap-demo.ap-southeast-1.elasticbeanstalk.com/auth";
const AUTH_BASE = "https://spring-boot-mybatis.onrender.com/auth";

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
