"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchUsers, User } from "@/services/userApi";

export default function UserListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchUsers(page, pageSize, "")
      .then((data) => {
        setUsers(data.users);
        setTotalCount(data.total);
      })
      .catch((err) => setError(err.message || "Failed to load users"))
      .finally(() => setLoading(false));
  }, [page, pageSize]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">User List</h1>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <table className="w-full border text-sm">
            <thead className="bg-gray-500">
              <tr>
                <th className="border px-2 py-1">Username</th>
                <th className="border px-2 py-1">Name</th>
                <th className="border px-2 py-1">Email</th>
                <th className="border px-2 py-1">Phone</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="border px-2 py-1">{user.username}</td>
                  <td className="border px-2 py-1">
                    {[user.firstname, user.lastname].filter(Boolean).join(" ")}
                  </td>
                  <td className="border px-2 py-1">{user.email}</td>
                  <td className="border px-2 py-1">{user.phoneNumber}</td>
                  <td className="border px-2 py-1">
                    <button
                      onClick={() => router.push(`/users/${user.id}`)}
                      className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="border px-2 py-4 text-center">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="bg-gray-500 text-white px-3 py-1 rounded disabled:opacity-50"
            >
              Previous
            </button>

            <span>
              Page {page} of {Math.max(Math.ceil(totalCount / pageSize), 1)}
            </span>

            <button
              onClick={() =>
                setPage((prev) =>
                  prev < Math.ceil(totalCount / pageSize) ? prev + 1 : prev
                )
              }
              disabled={page >= Math.ceil(totalCount / pageSize)}
              className="bg-gray-500 text-white px-3 py-1 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div>
            <p>Total Count: {totalCount}</p>
          </div>
        </>
      )}
    </div>
  );
}
