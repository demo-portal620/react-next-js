"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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

const CATEGORY_OPTIONS = [
  { value: "PAY", label: "Pay" },
  { value: "SAFETY", label: "Safety" },
  { value: "EQUIPMENT", label: "Equipment" },
  { value: "MANAGEMENT", label: "Management" },
  { value: "OTHER", label: "Other" },
];

const statusStyle: Record<string, string> = {
  OPEN: "bg-amber-100 text-amber-700",
  RESOLVED: "bg-primary/10 text-primary",
};

export default function ComplaintsPage() {
  const router = useRouter();
  const { hasPermission } = useAuth();
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
      setFormError("Choose a category.");
      return;
    }
    if (!subject.trim() || !message.trim()) {
      setFormError("Subject and message are required.");
      return;
    }
    setSaving(true);
    try {
      await createComplaint({ category, subject: subject.trim(), message: message.trim() });
      setShowCreateDialog(false);
      loadMine();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to submit complaint");
    } finally {
      setSaving(false);
    }
  }

  const columns: DataTableColumn<Complaint>[] = [
    {
      key: "subject",
      header: "Subject",
      className: "px-4 py-3 font-medium",
      render: (c) => c.subject,
    },
    {
      key: "category",
      header: "Category",
      render: (c) => <span className="text-muted-foreground text-sm">{c.category}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (c) => (
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            statusStyle[c.status] ?? statusStyle.OPEN
          )}
        >
          {c.status}
        </span>
      ),
    },
    {
      key: "createdDate",
      header: "Created",
      className: "px-4 py-3 text-muted-foreground",
      render: (c) => (c.createdDate ? new Date(c.createdDate).toLocaleString() : "-"),
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Complaints</h1>
          <p className="text-sm text-muted-foreground">
            Raise a question or complaint - it routes to your admin automatically.
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          Raise a Complaint
        </Button>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-medium">My Complaints</h2>
        <DataTable
          columns={columns}
          rows={myComplaints}
          getRowKey={(c) => c.id}
          loading={myLoading}
          emptyMessage="You haven't raised any complaints."
          itemLabel="complaint"
          page={1}
          pageSize={myComplaints.length || 1}
          total={myComplaints.length}
          onPageChange={() => {}}
          actions={(c) => (
            <Button variant="ghost" size="sm" onClick={() => router.push(`/complaints/${c.id}`)}>
              View
            </Button>
          )}
        />
      </div>

      {canManage && (
        <div className="space-y-2">
          <h2 className="text-lg font-medium">Inbox</h2>
          <DataTable
            columns={columns}
            rows={inboxComplaints}
            getRowKey={(c) => c.id}
            loading={inboxLoading}
            emptyMessage="No complaints routed to you."
            itemLabel="complaint"
            page={inboxPage}
            pageSize={inboxPageSize}
            total={inboxTotal}
            onPageChange={setInboxPage}
            actions={(c) => (
              <Button variant="ghost" size="sm" onClick={() => router.push(`/complaints/${c.id}`)}>
                View
              </Button>
            )}
          />
        </div>
      )}

      <AppDialog
        title="Raise a complaint"
        show={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSave={handleCreate}
        saveLabel={saving ? "Submitting..." : "Submit"}
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
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="complaint-subject">Subject</Label>
            <Input
              id="complaint-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Broken forklift on floor 2"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="complaint-message">Message</Label>
            <Textarea
              id="complaint-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Describe the issue..."
            />
          </div>
        </div>
      </AppDialog>
    </div>
  );
}
