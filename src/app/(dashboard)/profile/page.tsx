"use client";

import { useEffect, useRef, useState } from "react";
import { User as UserIcon, AlertCircle, Camera } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchCurrentUser, uploadProfilePicture, profilePictureUrl, User } from "@/services/userApi";
import { useAuth } from "@/context/AuthContext";

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="font-medium">{value || "-"}</div>
    </div>
  );
}

export default function ProfilePage() {
  const { refreshCurrentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .catch((err) => setError(err.message || "Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  // Revoke the object URL once it's no longer needed, rather than leaking
  // it for the lifetime of the page.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }

    setError("");
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    try {
      const updated = await uploadProfilePicture(file);
      setUser(updated);
      await refreshCurrentUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setUploading(false);
      setPreviewUrl(null);
    }
  }

  const avatarSrc = previewUrl || (user ? profilePictureUrl(user.id, user.profilePictureKey) : null);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Profile</h1>
        <p className="text-sm text-muted-foreground">
          Your account details.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelected}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="group relative h-12 w-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden disabled:opacity-60"
              title="Change photo"
            >
              {avatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element -- backend-streamed/blob preview, not a static asset
                <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-6 w-6 text-primary" />
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-4 w-4 text-white" />
              </span>
            </button>
            <div>
              <CardTitle>{user?.username || (loading ? "Loading..." : "Unknown user")}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : user ? (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Username" value={user.username} />
              <Field label="Email" value={user.email} />
              <Field label="First Name" value={user.firstname} />
              <Field label="Last Name" value={user.lastname} />
              <Field label="Phone Number" value={user.phoneNumber} />
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
