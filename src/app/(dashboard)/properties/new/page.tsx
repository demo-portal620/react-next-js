"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { createProperty } from "@/services/propertiesApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NewPropertyPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    address: "",
    type: "RESIDENTIAL" as "RESIDENTIAL" | "COMMERCIAL",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.address.trim()) {
      setError(t("PROPERTY_NEW_ERROR_REQUIRED"));
      return;
    }
    setSaving(true);
    try {
      const created = await createProperty({
        name: form.name.trim(),
        address: form.address.trim(),
        type: form.type,
      });
      router.push(`/properties/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("PROPERTY_NEW_ERROR_GENERIC"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <Button variant="ghost" size="sm" onClick={() => router.push("/properties")}>
        <ArrowLeft className="h-4 w-4" />
        {t("PROPERTY_NEW_BACK")}
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{t("PROPERTY_NEW_TITLE")}</CardTitle>
          <CardDescription>{t("PROPERTY_NEW_DESC")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="prop-name">{t("PROPERTY_NEW_NAME")}</Label>
              <Input
                id="prop-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prop-address">{t("PROPERTY_NEW_ADDRESS")}</Label>
              <Input
                id="prop-address"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>{t("PROPERTY_NEW_TYPE")}</Label>
              <Select
                value={form.type}
                onValueChange={(value) =>
                  setForm((f) => ({ ...f, type: value as "RESIDENTIAL" | "COMMERCIAL" }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RESIDENTIAL">RESIDENTIAL</SelectItem>
                  <SelectItem value="COMMERCIAL">COMMERCIAL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? t("PROPERTY_NEW_SUBMIT_LOADING") : t("PROPERTY_NEW_SUBMIT")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
