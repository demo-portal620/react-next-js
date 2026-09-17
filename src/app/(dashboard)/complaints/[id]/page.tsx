"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Complaint,
  ComplaintComment,
  fetchComplaintDetail,
  addComplaintComment,
  resolveComplaint,
} from "@/services/complaintApi";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const statusStyle: Record<string, string> = {
  OPEN: "bg-amber-100 text-amber-700",
  RESOLVED: "bg-primary/10 text-primary",
};

export default function ComplaintDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { hasPermission } = useAuth();
  const canManage = hasPermission("MANAGE_COMPLAINTS");

  const statusLabels: Record<string, string> = {
    OPEN: t("COMPLAINTS_STATUS_OPEN"),
    RESOLVED: t("COMPLAINTS_STATUS_RESOLVED"),
  };
  const categoryLabels: Record<string, string> = {
    PAY: t("COMPLAINTS_CATEGORY_PAY"),
    SAFETY: t("COMPLAINTS_CATEGORY_SAFETY"),
    EQUIPMENT: t("COMPLAINTS_CATEGORY_EQUIPMENT"),
    MANAGEMENT: t("COMPLAINTS_CATEGORY_MANAGEMENT"),
    OTHER: t("COMPLAINTS_CATEGORY_OTHER"),
  };

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [comments, setComments] = useState<ComplaintComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reply, setReply] = useState("");
  const [posting, setPosting] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [actionError, setActionError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetchComplaintDetail(id)
      .then((data) => {
        setComplaint(data.complaint);
        setComments(data.comments);
      })
      .catch((err) => setError(err instanceof Error ? err.message : t("COMPLAINT_DETAIL_LOAD_ERROR")))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleReply() {
    if (!reply.trim()) return;
    setPosting(true);
    setActionError("");
    try {
      await addComplaintComment(id, reply.trim());
      setReply("");
      load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t("COMPLAINT_DETAIL_REPLY_ERROR"));
    } finally {
      setPosting(false);
    }
  }

  async function handleResolve() {
    setResolving(true);
    setActionError("");
    try {
      await resolveComplaint(id);
      load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t("COMPLAINT_DETAIL_RESOLVE_ERROR"));
    } finally {
      setResolving(false);
    }
  }

  if (loading) {
    return <div className="p-6 max-w-3xl mx-auto text-muted-foreground">{t("COMMON_LOADING")}</div>;
  }

  if (error || !complaint) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || t("COMPLAINT_DETAIL_NOT_FOUND")}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => router.push("/complaints")}>
          <ArrowLeft className="h-4 w-4" />
          {t("COMPLAINT_DETAIL_BACK")}
        </Button>
      </div>
    );
  }

  const canResolve = complaint.status === "OPEN" && canManage;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <Button variant="ghost" size="sm" onClick={() => router.push("/complaints")}>
        <ArrowLeft className="h-4 w-4" />
        {t("COMPLAINT_DETAIL_BACK")}
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-xl">{complaint.subject}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{categoryLabels[complaint.category] ?? complaint.category}</p>
          </div>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
              statusStyle[complaint.status] ?? statusStyle.OPEN
            )}
          >
            {statusLabels[complaint.status] ?? complaint.status}
          </span>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">{complaint.message}</p>
        </CardContent>
      </Card>

      {actionError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">{t("COMPLAINT_DETAIL_REPLIES")}</h2>
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("COMPLAINT_DETAIL_NO_REPLIES")}</p>
        ) : (
          comments.map((c) => (
            <Card key={c.id} className="bg-muted/30">
              <CardContent className="py-3">
                <p className="text-sm whitespace-pre-wrap">{c.message}</p>
                {c.createdDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(c.createdDate).toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="space-y-2">
        <Textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder={t("COMPLAINT_DETAIL_REPLY_PLACEHOLDER")}
          rows={3}
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button onClick={handleReply} disabled={posting || !reply.trim()}>
            {posting ? t("COMPLAINT_DETAIL_POSTING") : t("COMPLAINT_DETAIL_POST_REPLY")}
          </Button>
          {canResolve && (
            <Button variant="outline" onClick={handleResolve} disabled={resolving}>
              <CheckCircle2 className="h-4 w-4" />
              {resolving ? t("COMPLAINT_DETAIL_RESOLVING") : t("COMPLAINT_DETAIL_RESOLVE")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
