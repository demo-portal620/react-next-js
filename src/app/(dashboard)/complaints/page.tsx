"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Complaint,
  createComplaint,
  fetchMyComplaints,
  fetchComplaintInbox,
} from "@/services/complaintApi";
import { useAuth } from "@/context/AuthContext";
import DataTable, { DataTableColumn } from "@/components/DataTable/DataTable";
import AppDialog from "@/components/custom-ui/app-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_VALUES = ["PAY", "SAFETY", "EQUIPMENT", "MANAGEMENT", "OTHER"] as const;

const statusStyle: Record<string, string> = {
  OPEN: "bg-amber-100 text-amber-700",
  RESOLVED: "bg-primary/10 text-primary",
};

export default function ComplaintsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { hasPermission } = useAuth();

  const categoryLabels: Record<string, string> = {
    PAY: t("COMPLAINTS_CATEGORY_PAY"),
    SAFETY: t("COMPLAINTS_CATEGORY_SAFETY"),
    EQUIPMENT: t("COMPLAINTS_CATEGORY_EQUIPMENT"),
    MANAGEMENT: t("COMPLAINTS_CATEGORY_MANAGEMENT"),
    OTHER: t("COMPLAINTS_CATEGORY_OTHER"),
  };
  const statusLabels: Record<string, string> = {
    OPEN: t("COMPLAINTS_STATUS_OPEN"),
    RESOLVED: t("COMPLAINTS_STATUS_RESOLVED"),
  };
  const canManage = hasPermission("MANAGE_COMPLAINTS");

  const [myComplaints, setMyComplaints] = useState<Complaint[]>([]);
  const [myLoading, setMyLoading] = useState(true);

  const [inboxComplaints, setInboxComplaints] = useState<Complaint[]>([]);
  const [inboxLoading, setInboxLoading] = useState(true);
  const [inboxPage, setInboxPage] = useState(1);
  const [inboxPageSize] = useState(10);
  const [inboxTotal, setInboxTotal] = useState(0);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const loadMine = useCallback(() => {
    setMyLoading(true);
    fetchMyComplaints()
      .then(setMyComplaints)
      .catch(() => {})
      .finally(() => setMyLoading(false));
  }, []);

  const loadInbox = useCallback(() => {
    if (!canManage) return;
    setInboxLoading(true);
    fetchComplaintInbox(inboxPage, inboxPageSize, "")
      .then((data) => {
        setInboxComplaints(data.complaints);
        setInboxTotal(data.total);
      })
      .catch(() => {})
      .finally(() => setInboxLoading(false));
  }, [canManage, inboxPage, inboxPageSize]);

  useEffect(() => {
    loadMine();
  }, [loadMine]);

  useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  function openCreateDialog() {
    setFormError("");
    setCategory("");
    setSubject("");
    setMessage("");
    setShowCreateDialog(true);
  }

  async function handleCreate() {
    setFormError("");
    if (!category) {
      setFormError(t("COMPLAINTS_ERROR_CATEGORY_REQUIRED"));
      return;
    }
    if (!subject.trim() || !message.trim()) {
      setFormError(t("COMPLAINTS_ERROR_FIELDS_REQUIRED"));
      return;
    }
    setSaving(true);
    try {
      await createComplaint({ category, subject: subject.trim(), message: message.trim() });
      setShowCreateDialog(false);
      loadMine();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("COMPLAINTS_ERROR_SUBMIT_FAILED"));
    } finally {
      setSaving(false);
    }
  }

  const columns: DataTableColumn<Complaint>[] = [
    {
      key: "subject",
      header: t("COMPLAINTS_COL_SUBJECT"),
      className: "px-4 py-3 font-medium",
      render: (c) => c.subject,
    },
    {
      key: "category",
      header: t("COMPLAINTS_COL_CATEGORY"),
      render: (c) => (
        <span className="text-muted-foreground text-sm">{categoryLabels[c.category] ?? c.category}</span>
      ),
    },
    {
      key: "status",
      header: t("COMPLAINTS_COL_STATUS"),
      render: (c) => (
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            statusStyle[c.status] ?? statusStyle.OPEN
          )}
        >
          {statusLabels[c.status] ?? c.status}
        </span>
      ),
    },
    {
      key: "createdDate",
      header: t("COMPLAINTS_COL_CREATED"),
      className: "px-4 py-3 text-muted-foreground",
      render: (c) => (c.createdDate ? new Date(c.createdDate).toLocaleString() : "-"),
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("COMPLAINTS_TITLE")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("COMPLAINTS_SUBTITLE")}
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          {t("COMPLAINTS_RAISE")}
        </Button>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-medium">{t("COMPLAINTS_MINE_TITLE")}</h2>
        <DataTable
          columns={columns}
          rows={myComplaints}
          getRowKey={(c) => c.id}
          loading={myLoading}
          emptyMessage={t("COMPLAINTS_EMPTY_MINE")}
          itemLabel="complaint"
          page={1}
          pageSize={myComplaints.length || 1}
          total={myComplaints.length}
          onPageChange={() => {}}
          actions={(c) => (
            <Button variant="ghost" size="sm" onClick={() => router.push(`/complaints/${c.id}`)}>
              {t("COMMON_VIEW")}
            </Button>
          )}
        />
      </div>

      {canManage && (
        <div className="space-y-2">
          <h2 className="text-lg font-medium">{t("COMPLAINTS_INBOX_TITLE")}</h2>
          <DataTable
            columns={columns}
            rows={inboxComplaints}
            getRowKey={(c) => c.id}
            loading={inboxLoading}
            emptyMessage={t("COMPLAINTS_EMPTY_INBOX")}
            itemLabel="complaint"
            page={inboxPage}
            pageSize={inboxPageSize}
            total={inboxTotal}
            onPageChange={setInboxPage}
            actions={(c) => (
              <Button variant="ghost" size="sm" onClick={() => router.push(`/complaints/${c.id}`)}>
                {t("COMMON_VIEW")}
              </Button>
            )}
          />
        </div>
      )}

      <AppDialog
        title={t("COMPLAINTS_DIALOG_TITLE")}
        show={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSave={handleCreate}
        saveLabel={saving ? t("COMPLAINTS_SUBMIT_LOADING") : t("COMPLAINTS_SUBMIT")}
        width="480px"
      >
        <div className="space-y-3">
          {formError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-1.5">
            <Label>{t("COMPLAINTS_CATEGORY_LABEL")}</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder={t("COMPLAINTS_CATEGORY_PLACEHOLDER")} />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_VALUES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {categoryLabels[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="complaint-subject">{t("COMPLAINTS_SUBJECT_LABEL")}</Label>
            <Input
              id="complaint-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t("COMPLAINTS_SUBJECT_PLACEHOLDER")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="complaint-message">{t("COMPLAINTS_MESSAGE_LABEL")}</Label>
            <Textarea
              id="complaint-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder={t("COMPLAINTS_MESSAGE_PLACEHOLDER")}
            />
          </div>
        </div>
      </AppDialog>
    </div>
  );
}
