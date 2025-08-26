"use client";

import { useEffect, useState } from "react";
import { fetchUsers } from "@/services/userApi";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  username: string;
  email: string;
  phoneNumber: string;
  isArchieve: boolean;
};

export default function UserListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetchUsers(page, pageSize, "")
      .then((data) => {
        setUsers(data.users);
        setTotalCount(data.totalCount);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [page]);

  const toggleArchive = (id: number) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, isArchived: !user.isArchieve } : user
      )
    );
  };

  const deleteUser = (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers((prev) => prev.filter((user) => user.id !== id));
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">User List</h1>
        <button
          onClick={() => router.push("/freelancers/new")}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add New
        </button>
      </div>

      <table className="w-full border text-sm">
        <thead className="bg-gray-500">
          <tr>
            <th className="border px-2 py-1">Username</th>
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">Phone</th>
            <th className="border px-2 py-1">Archived</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="border px-2 py-1">{user.username}</td>
              <td className="border px-2 py-1">{user.email}</td>
              <td className="border px-2 py-1">{user.phoneNumber}</td>
              <td className="border px-2 py-1">
                {user.isArchieve ? "Yes" : "No"}
              </td>
              <td className="border px-2 py-1 space-x-2">
                <button
                  onClick={() => router.push(`/freelancers/${user.id}`)}
                  className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteUser(user.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                >
                  Delete
                </button>

                <button
                  onClick={() => toggleArchive(user.id)}
                  className={`px-2 py-1 rounded text-xs ${
                    user.isArchieve ? "bg-yellow-500" : "bg-gray-500"
                  } text-white`}
                >
                  {user.isArchieve ? "Unarchive" : "Archive"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="bg-gray-500 px-3 py-1 rounded disabled:opacity-50"
        >
          Previous
        </button>

        <span>
          Page {page} of {Math.ceil(totalCount / pageSize)}
        </span>

        <button
          onClick={() =>
            setPage((prev) =>
              prev < Math.ceil(totalCount / pageSize) ? prev + 1 : prev
            )
          }
          disabled={page >= Math.ceil(totalCount / pageSize)}
          className="bg-gray-500 px-3 py-1 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <div>
        <p>Total Count: {totalCount} </p>
      </div>
    </div>
  );
}
