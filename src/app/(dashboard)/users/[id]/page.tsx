"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchUserById, User } from "@/services/userApi";

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const idParam = params?.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchUserById(idParam)
      .then(setUser)
      .catch((err) => setError(err.message || "Failed to load user"))
      .finally(() => setLoading(false));
  }, [idParam]);

  if (loading) return <div className="p-4">Loading...</div>;

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => router.push("/users")}
          className="bg-gray-500 text-white px-3 py-1 rounded"
        >
          Back to list
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg">
      <h1 className="text-xl font-bold mb-4">User Detail</h1>

      <div className="space-y-3">
        <div>
          <div className="text-sm text-gray-500">Username</div>
          <div>{user?.username}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Name</div>
          <div>{[user?.firstname, user?.lastname].filter(Boolean).join(" ") || "-"}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Email</div>
          <div>{user?.email}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Phone</div>
          <div>{user?.phoneNumber || "-"}</div>
        </div>
      </div>

      <button
        onClick={() => router.push("/users")}
        className="mt-6 bg-gray-500 text-white px-3 py-1 rounded"
      >
        Back to list
      </button>
    </div>
  );
}
