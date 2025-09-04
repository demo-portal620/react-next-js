"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  fetchUserById,
  fetchSelectOptions,
  createUser,
  updateUser,
} from "@/services/userApi";

export default function UserFormPage() {
  const router = useRouter();
  const params = useParams();
  const idParam = params?.id as string;

  const isEditMode = idParam !== "new";

  const [user, setUser] = useState({
    name: "",
    email: "",
    skillsetIds: [] as number[],
    hobbyIds: [] as number[],
  });

  const [selectOptions, setSelectOptions] = useState({
    availableSkillsets: [] as { value: number; text: string }[],
    availableHobbies: [] as { value: number; text: string }[],
  });

  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   async function loadData() {
  //     try {
  //       const options = await fetchSelectOptions();
  //       setSelectOptions(options);

  //       if (isEditMode) {
  //         const userData = await fetchUserById(Number(idParam));
  //         setUser({
  //           name: userData.name,
  //           email: userData.email,
  //           skillsetIds: userData.skillsetIds,
  //           hobbyIds: userData.hobbyIds,
  //         });
  //       }
  //     } catch (err) {
  //       console.error(err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }

  //   loadData();
  // }, [idParam, isEditMode]);

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleMultiSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selectedValues = Array.from(e.target.selectedOptions, (o) =>
      Number(o.value)
    );
    setUser((prev) => ({
      ...prev,
      [e.target.name]: selectedValues,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isEditMode) {
      await updateUser(Number(idParam), user);
    } else {
      await createUser(user);
    }
    router.push("/freelancers");
  }

  if (loading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Name</label>
        <input
          name="name"
          value={user.name}
          onChange={handleInputChange}
          className="form-control"
        />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input
          name="email"
          value={user.email}
          onChange={handleInputChange}
          className="form-control"
        />
      </div>

      <div className="form-group">
        <label>Skillsets</label>
        <select
          multiple
          name="skillsetIds"
          value={user.skillsetIds.map(String)}
          onChange={handleMultiSelectChange}
          className="form-control"
        >
          {selectOptions.availableSkillsets.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.text}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Hobbies</label>
        <select
          multiple
          name="hobbyIds"
          value={user.hobbyIds.map(String)}
          onChange={handleMultiSelectChange}
          className="form-control"
        >
          {selectOptions.availableHobbies.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.text}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="btn btn-primary">
        {isEditMode ? "Update" : "Create"}
      </button>
    </form>
  );
}
