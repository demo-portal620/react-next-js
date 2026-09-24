"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  fetchPropertyById,
  updateProperty,
  deleteProperty,
  fetchUnits,
  createUnit,
  updateUnit,
  deleteUnit,
  Property,
  Unit,
} from "@/services/propertiesApi";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import DataTable, { DataTableColumn } from "@/components/DataTable/DataTable";
import AppDialog from "@/components/custom-ui/app-dialog";
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";

const emptyPropertyForm = { name: "", address: "", type: "RESIDENTIAL" as "RESIDENTIAL" | "COMMERCIAL" };
const emptyUnitForm = {
  unitNumber: "",
  floor: "",
  bedrooms: "0",
  baseRent: "",
  status: "VACANT" as "VACANT" | "OCCUPIED" | "MAINTENANCE",
};

export default function PropertyDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const propertyId = params?.id as string;
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const canManage = hasPermission("MANAGE_PROPERTY");

  const [property, setProperty] = useState<Property | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showEditProperty, setShowEditProperty] = useState(false);
  const [propertyForm, setPropertyForm] = useState(emptyPropertyForm);
  const [savingProperty, setSavingProperty] = useState(false);
  const [propertyFormError, setPropertyFormError] = useState("");

  const [showUnitDialog, setShowUnitDialog] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [unitForm, setUnitForm] = useState(emptyUnitForm);
  const [savingUnit, setSavingUnit] = useState(false);
  const [unitFormError, setUnitFormError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    Promise.all([fetchPropertyById(propertyId), fetchUnits(propertyId)])
      .then(([propertyData, unitsData]) => {
        setProperty(propertyData);
        setUnits(unitsData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : t("PROPERTY_DETAIL_NOT_FOUND")))
      .finally(() => setLoading(false));
  }, [propertyId]);

  useEffect(() => {
    load();
  }, [load]);

  function startEditProperty() {
    if (!property) return;
    setPropertyForm({ name: property.name, address: property.address, type: property.type });
    setPropertyFormError("");
    setShowEditProperty(true);
  }

  async function handleSaveProperty() {
    setPropertyFormError("");
    if (!propertyForm.name.trim() || !propertyForm.address.trim()) {
      setPropertyFormError(t("PROPERTY_NEW_ERROR_REQUIRED"));
      return;
    }
    setSavingProperty(true);
    try {
      await updateProperty(propertyId, {
        name: propertyForm.name.trim(),
        address: propertyForm.address.trim(),
        type: propertyForm.type,
      });
      setShowEditProperty(false);
      load();
    } catch (err) {
      setPropertyFormError(err instanceof Error ? err.message : t("PROPERTY_DETAIL_SAVE_ERROR"));
    } finally {
      setSavingProperty(false);
    }
  }

  async function handleDeleteProperty() {
    if (!confirm(t("PROPERTY_DETAIL_DELETE_CONFIRM"))) return;
    try {
      await deleteProperty(propertyId);
      router.push("/properties");
    } catch (err) {
      toast({
        variant: "destructive",
        description: err instanceof Error ? err.message : t("PROPERTY_DETAIL_DELETE_ERROR"),
      });
    }
  }

  function startAddUnit() {
    setEditingUnit(null);
    setUnitForm(emptyUnitForm);
    setUnitFormError("");
    setShowUnitDialog(true);
  }

  function startEditUnit(unit: Unit) {
    setEditingUnit(unit);
    setUnitForm({
      unitNumber: unit.unitNumber,
      floor: unit.floor || "",
      bedrooms: String(unit.bedrooms),
      baseRent: unit.baseRent != null ? String(unit.baseRent) : "",
      status: unit.status,
    });
    setUnitFormError("");
    setShowUnitDialog(true);
  }

  async function handleSaveUnit() {
    setUnitFormError("");
    if (!unitForm.unitNumber.trim()) {
      setUnitFormError(t("PROPERTY_UNIT_ERROR_REQUIRED"));
      return;
    }
    setSavingUnit(true);
    const payload = {
      unitNumber: unitForm.unitNumber.trim(),
      floor: unitForm.floor.trim() || undefined,
      bedrooms: Number(unitForm.bedrooms) || 0,
      baseRent: unitForm.baseRent ? Number(unitForm.baseRent) : undefined,
      status: unitForm.status,
    };
    try {
      if (editingUnit) {
        await updateUnit(propertyId, editingUnit.id, payload);
      } else {
        await createUnit(propertyId, payload);
      }
      setShowUnitDialog(false);
      load();
    } catch (err) {
      setUnitFormError(err instanceof Error ? err.message : t("PROPERTY_UNIT_ERROR_GENERIC"));
    } finally {
      setSavingUnit(false);
    }
  }

  async function handleDeleteUnit(unit: Unit) {
    if (!confirm(t("PROPERTY_UNITS_DELETE_CONFIRM"))) return;
    try {
      await deleteUnit(propertyId, unit.id);
      load();
    } catch (err) {
      toast({
        variant: "destructive",
        description: err instanceof Error ? err.message : t("PROPERTY_UNITS_DELETE_ERROR"),
      });
    }
  }

  const unitColumns: DataTableColumn<Unit>[] = [
    { key: "unitNumber", header: t("PROPERTY_UNITS_COL_NUMBER"), className: "px-4 py-3 font-medium" },
    {
      key: "floor",
      header: t("PROPERTY_UNITS_COL_FLOOR"),
      className: "px-4 py-3 text-muted-foreground",
      render: (u) => u.floor || "-",
    },
    { key: "bedrooms", header: t("PROPERTY_UNITS_COL_BEDROOMS") },
    {
      key: "baseRent",
      header: t("PROPERTY_UNITS_COL_RENT"),
      className: "px-4 py-3 text-muted-foreground",
      render: (u) => (u.baseRent != null ? `$${u.baseRent.toFixed(2)}` : "-"),
    },
    {
      key: "status",
      header: t("PROPERTY_UNITS_COL_STATUS"),
      render: (u) => (
        <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
          {u.status}
        </span>
      ),
    },
  ];

  if (loading) {
    return <div className="p-6 max-w-4xl mx-auto text-sm text-muted-foreground">{t("COMMON_LOADING")}</div>;
  }

  if (error || !property) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/properties")}>
          <ArrowLeft className="h-4 w-4" />
          {t("PROPERTY_DETAIL_BACK")}
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || t("PROPERTY_DETAIL_NOT_FOUND")}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <Button variant="ghost" size="sm" onClick={() => router.push("/properties")}>
        <ArrowLeft className="h-4 w-4" />
        {t("PROPERTY_DETAIL_BACK")}
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>{property.name}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{property.address}</p>
            <span className="mt-2 inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
              {property.type}
            </span>
          </div>
          {canManage && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={startEditProperty}>
                <Pencil className="h-4 w-4" />
                {t("PROPERTY_DETAIL_EDIT")}
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDeleteProperty}>
                <Trash2 className="h-4 w-4" />
                {t("PROPERTY_DETAIL_DELETE")}
              </Button>
            </div>
          )}
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">{t("PROPERTY_UNITS_TITLE")}</CardTitle>
          {canManage && (
            <Button size="sm" onClick={startAddUnit}>
              <Plus className="h-4 w-4" />
              {t("PROPERTY_UNITS_ADD")}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <DataTable
            columns={unitColumns}
            rows={units}
            getRowKey={(u) => u.id}
            loading={false}
            emptyMessage={t("PROPERTY_UNITS_EMPTY")}
            itemLabel="unit"
            exportFileName="units"
            page={1}
            pageSize={units.length || 1}
            total={units.length}
            onPageChange={() => {}}
            actions={
              canManage
                ? (u) => (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => startEditUnit(u)}
                        title={t("COMMON_EDIT")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDeleteUnit(u)}
                        title={t("COMMON_DELETE")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                : undefined
            }
          />
        </CardContent>
      </Card>

      <AppDialog
        title={t("PROPERTY_DETAIL_EDIT")}
        show={showEditProperty}
        onClose={() => setShowEditProperty(false)}
        onSave={handleSaveProperty}
        saveLabel={savingProperty ? t("PROPERTY_UNIT_SAVING") : t("COMMON_SAVE")}
      >
        <div className="space-y-3">
          {propertyFormError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{propertyFormError}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="edit-prop-name">{t("PROPERTY_NEW_NAME")}</Label>
            <Input
              id="edit-prop-name"
              value={propertyForm.name}
              onChange={(e) => setPropertyForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-prop-address">{t("PROPERTY_NEW_ADDRESS")}</Label>
            <Input
              id="edit-prop-address"
              value={propertyForm.address}
              onChange={(e) => setPropertyForm((f) => ({ ...f, address: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("PROPERTY_NEW_TYPE")}</Label>
            <Select
              value={propertyForm.type}
              onValueChange={(value) =>
                setPropertyForm((f) => ({ ...f, type: value as "RESIDENTIAL" | "COMMERCIAL" }))
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
        </div>
      </AppDialog>

      <AppDialog
        title={editingUnit ? t("PROPERTY_UNIT_DIALOG_EDIT_TITLE") : t("PROPERTY_UNIT_DIALOG_ADD_TITLE")}
        show={showUnitDialog}
        onClose={() => setShowUnitDialog(false)}
        onSave={handleSaveUnit}
        saveLabel={savingUnit ? t("PROPERTY_UNIT_SAVING") : t("COMMON_SAVE")}
      >
        <div className="space-y-3">
          {unitFormError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{unitFormError}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="unit-number">{t("PROPERTY_UNIT_FIELD_NUMBER")}</Label>
            <Input
              id="unit-number"
              value={unitForm.unitNumber}
              onChange={(e) => setUnitForm((f) => ({ ...f, unitNumber: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="unit-floor">{t("PROPERTY_UNIT_FIELD_FLOOR")}</Label>
              <Input
                id="unit-floor"
                value={unitForm.floor}
                onChange={(e) => setUnitForm((f) => ({ ...f, floor: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="unit-bedrooms">{t("PROPERTY_UNIT_FIELD_BEDROOMS")}</Label>
              <Input
                id="unit-bedrooms"
                type="number"
                value={unitForm.bedrooms}
                onChange={(e) => setUnitForm((f) => ({ ...f, bedrooms: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="unit-rent">{t("PROPERTY_UNIT_FIELD_RENT")}</Label>
            <Input
              id="unit-rent"
              type="number"
              step="0.01"
              value={unitForm.baseRent}
              onChange={(e) => setUnitForm((f) => ({ ...f, baseRent: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("PROPERTY_UNIT_FIELD_STATUS")}</Label>
            <Select
              value={unitForm.status}
              onValueChange={(value) =>
                setUnitForm((f) => ({ ...f, status: value as "VACANT" | "OCCUPIED" | "MAINTENANCE" }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VACANT">VACANT</SelectItem>
                <SelectItem value="OCCUPIED">OCCUPIED</SelectItem>
                <SelectItem value="MAINTENANCE">MAINTENANCE</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </AppDialog>
    </div>
  );
}
