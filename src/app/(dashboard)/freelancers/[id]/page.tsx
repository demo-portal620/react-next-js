"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  fetchFreelancerById,
  fetchSelectOptions,
  createFreelancer,
  updateFreelancer,
  Option,
} from "@/services/freelancerApi";

export default function FreelancerFormPage() {
  const router = useRouter();
  const params = useParams();
  const idParam = params?.id as string;
  const isEditMode = idParam !== "new";

  const [form, setForm] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    skillsetIds: [] as string[],
    hobbyIds: [] as string[],
  });

  const [availableSkillsets, setAvailableSkillsets] = useState<Option[]>([]);
  const [availableHobbies, setAvailableHobbies] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const options = await fetchSelectOptions();
        setAvailableSkillsets(options.skillsets);
        setAvailableHobbies(options.hobbies);

        if (isEditMode) {
          const freelancer = await fetchFreelancerById(idParam);
          setForm({
            username: freelancer.username,
            email: freelancer.email,
            phoneNumber: freelancer.phoneNumber || "",
            skillsetIds: freelancer.skillsetIds || [],
            hobbyIds: freelancer.hobbyIds || [],
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load form data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [idParam, isEditMode]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleMultiSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selectedValues = Array.from(e.target.selectedOptions, (o) => o.value);
    setForm((prev) => ({ ...prev, [e.target.name]: selectedValues }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (isEditMode) {
        await updateFreelancer(idParam, form);
      } else {
        await createFreelancer(form);
      }
      router.push("/freelancers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save freelancer");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 max-w-lg">
      <h1 className="text-xl font-bold mb-4">
        {isEditMode ? "Edit Freelancer" : "Register Freelancer"}
      </h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            name="username"
            value={form.username}
            onChange={handleInputChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleInputChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Skillsets</label>
          <select
            multiple
            name="skillsetIds"
            value={form.skillsetIds}
            onChange={handleMultiSelectChange}
            className="w-full border rounded px-3 py-2"
          >
            {availableSkillsets.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Hobbies</label>
          <select
            multiple
            name="hobbyIds"
            value={form.hobbyIds}
            onChange={handleMultiSelectChange}
            className="w-full border rounded px-3 py-2"
          >
            {availableHobbies.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {saving ? "Saving..." : isEditMode ? "Update" : "Create"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/freelancers")}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
