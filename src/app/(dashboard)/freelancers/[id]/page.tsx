"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  fetchFreelancerById,
  fetchSelectOptions,
  createFreelancer,
  updateFreelancer,
  Option,
} from "@/services/freelancerApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

function TogglePill({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        selected
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background text-muted-foreground border-input hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {label}
    </button>
  );
}

export default function FreelancerFormPage() {
  const { t } = useTranslation();
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
        setError(err instanceof Error ? err.message : t("FREELANCER_FORM_LOAD_ERROR"));
      } finally {
        setLoading(false);
      }
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idParam, isEditMode]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function toggleSkillset(id: string) {
    setForm((prev) => ({
      ...prev,
      skillsetIds: prev.skillsetIds.includes(id)
        ? prev.skillsetIds.filter((s) => s !== id)
        : [...prev.skillsetIds, id],
    }));
  }

  function toggleHobby(id: string) {
    setForm((prev) => ({
      ...prev,
      hobbyIds: prev.hobbyIds.includes(id)
        ? prev.hobbyIds.filter((h) => h !== id)
        : [...prev.hobbyIds, id],
    }));
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
      setError(err instanceof Error ? err.message : t("FREELANCER_FORM_SAVE_ERROR"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/freelancers")}
        className="-ml-2"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("FREELANCER_FORM_BACK")}
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? t("FREELANCER_FORM_EDIT_TITLE") : t("FREELANCER_FORM_CREATE_TITLE")}</CardTitle>
          <CardDescription>
            {isEditMode
              ? t("FREELANCER_FORM_EDIT_DESC")
              : t("FREELANCER_FORM_CREATE_DESC")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">{t("COMMON_LOADING")}</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">{t("FREELANCER_FORM_USERNAME")}</Label>
                <Input
                  id="username"
                  name="username"
                  value={form.username}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("FREELANCER_FORM_EMAIL")}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">{t("FREELANCER_FORM_PHONE")}</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("FREELANCER_FORM_SKILLSETS")}</Label>
                <div className="flex flex-wrap gap-2">
                  {availableSkillsets.length === 0 && (
                    <p className="text-sm text-muted-foreground">{t("FREELANCER_FORM_NO_SKILLSETS")}</p>
                  )}
                  {availableSkillsets.map((opt) => (
                    <TogglePill
                      key={opt.id}
                      label={opt.name}
                      selected={form.skillsetIds.includes(opt.id)}
                      onClick={() => toggleSkillset(opt.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("FREELANCER_FORM_HOBBIES")}</Label>
                <div className="flex flex-wrap gap-2">
                  {availableHobbies.length === 0 && (
                    <p className="text-sm text-muted-foreground">{t("FREELANCER_FORM_NO_HOBBIES")}</p>
                  )}
                  {availableHobbies.map((opt) => (
                    <TogglePill
                      key={opt.id}
                      label={opt.name}
                      selected={form.hobbyIds.includes(opt.id)}
                      onClick={() => toggleHobby(opt.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saving}>
                  {saving ? t("FREELANCER_FORM_SAVING") : isEditMode ? t("FREELANCER_FORM_UPDATE") : t("FREELANCER_FORM_CREATE")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/freelancers")}
                >
                  {t("COMMON_CANCEL")}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
