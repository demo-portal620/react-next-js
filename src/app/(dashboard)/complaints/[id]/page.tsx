"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
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
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { hasPermission } = useAuth();
  const canManage = hasPermission("MANAGE_COMPLAINTS");

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
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load complaint"))
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
      setActionError(err instanceof Error ? err.message : "Failed to post reply");
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
      setActionError(err instanceof Error ? err.message : "Failed to resolve complaint");
    } finally {
      setResolving(false);
    }
  }

  if (loading) {
    return <div className="p-6 max-w-3xl mx-auto text-muted-foreground">Loading...</div>;
  }

  if (error || !complaint) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Complaint not found"}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => router.push("/complaints")}>
          <ArrowLeft className="h-4 w-4" />
          Back to Complaints
        </Button>
      </div>
    );
  }

  const canResolve = complaint.status === "OPEN" && canManage;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <Button variant="ghost" size="sm" onClick={() => router.push("/complaints")}>
        <ArrowLeft className="h-4 w-4" />
        Back to Complaints
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-xl">{complaint.subject}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{complaint.category}</p>
          </div>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
              statusStyle[complaint.status] ?? statusStyle.OPEN
            )}
          >
            {complaint.status}
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
        <h2 className="text-sm font-medium text-muted-foreground">Replies</h2>
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No replies yet.</p>
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
          placeholder="Write a reply..."
          rows={3}
        />
        <div className="flex items-center justify-between">
          <Button onClick={handleReply} disabled={posting || !reply.trim()}>
            {posting ? "Posting..." : "Post Reply"}
          </Button>
          {canResolve && (
            <Button variant="outline" onClick={handleResolve} disabled={resolving}>
              <CheckCircle2 className="h-4 w-4" />
              {resolving ? "Resolving..." : "Resolve"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
