"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Freelancer,
  fetchFreelancers,
  deleteFreelancer,
  toggleArchiveFreelancer,
} from "@/services/freelancerApi";

export default function FreelancerListPage() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetchFreelancers(page, pageSize, search)
      .then((data) => {
        setFreelancers(data.freelancers);
        setTotalCount(data.total);
      })
      .catch((err) => setError(err.message || "Failed to load freelancers"))
      .finally(() => setLoading(false));
  }, [page, pageSize, search]);

  useEffect(() => {
    load();
  }, [load]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this freelancer?")) return;
    try {
      await deleteFreelancer(id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  async function handleToggleArchive(id: string) {
    try {
      await toggleArchiveFreelancer(id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update archive status");
    }
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Freelancer Directory</h1>
        <button
          onClick={() => router.push("/freelancers/new")}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add New
        </button>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by username or email..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="border rounded px-3 py-1 flex-1"
        />
        <button type="submit" className="bg-gray-700 text-white px-4 py-1 rounded">
          Search
        </button>
      </form>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
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
              {freelancers.map((f) => (
                <tr key={f.id}>
                  <td className="border px-2 py-1">{f.username}</td>
                  <td className="border px-2 py-1">{f.email}</td>
                  <td className="border px-2 py-1">{f.phoneNumber}</td>
                  <td className="border px-2 py-1">{f.archived ? "Yes" : "No"}</td>
                  <td className="border px-2 py-1 space-x-2">
                    <button
                      onClick={() => router.push(`/freelancers/${f.id}`)}
                      className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(f.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleToggleArchive(f.id)}
                      className={`px-2 py-1 rounded text-xs text-white ${
                        f.archived ? "bg-yellow-500" : "bg-gray-500"
                      }`}
                    >
                      {f.archived ? "Unarchive" : "Archive"}
                    </button>
                  </td>
                </tr>
              ))}
              {freelancers.length === 0 && (
                <tr>
                  <td colSpan={5} className="border px-2 py-4 text-center">
                    No freelancers found.
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
