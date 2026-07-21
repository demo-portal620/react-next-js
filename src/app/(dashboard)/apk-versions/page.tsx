"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ApkVersion,
  fetchApkVersions,
  uploadApkVersion,
  setApkVersionActive,
  deleteApkVersion,
  apkDownloadUrl,
  formatApkSize,
} from "@/services/apkApi";
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
import { AlertCircle, Download, Trash2, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_APP_CODE = "AP_ANDROID";

export default function ApkVersionsPage() {
  const [versions, setVersions] = useState<ApkVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  // Upload form state
  const [file, setFile] = useState<File | null>(null);
  const [appCode, setAppCode] = useState(DEFAULT_APP_CODE);
  const [versionName, setVersionName] = useState("");
  const [versionCode, setVersionCode] = useState("");
  const [releaseNotes, setReleaseNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetchApkVersions(DEFAULT_APP_CODE, 1, 50)
      .then((data) => {
        setVersions(data.versions);
        setTotalCount(data.total);
      })
      .catch((err) => setError(err.message || "Failed to load APK versions"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setUploadError("");

    if (!file) {
      setUploadError("Choose an .apk file first.");
      return;
    }
    const parsedVersionCode = Number(versionCode);
    if (!versionName.trim() || !Number.isInteger(parsedVersionCode) || parsedVersionCode <= 0) {
      setUploadError("Version name and a positive integer version code are required.");
      return;
    }

    setUploading(true);
    try {
      await uploadApkVersion({
        file,
        appCode: appCode.trim() || DEFAULT_APP_CODE,
        versionName: versionName.trim(),
        versionCode: parsedVersionCode,
        releaseNotes: releaseNotes.trim(),
      });
      setFile(null);
      setVersionName("");
      setVersionCode("");
      setReleaseNotes("");
      (document.getElementById("apk-file-input") as HTMLInputElement | null)?.value &&
        ((document.getElementById("apk-file-input") as HTMLInputElement).value = "");
      load();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleToggleActive(version: ApkVersion) {
    try {
      await setApkVersionActive(version.id, !version.active);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this APK version? This cannot be undone.")) return;
    try {
      await deleteApkVersion(id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">APK Versions</h1>
        <p className="text-sm text-muted-foreground">
          Upload builds of the Android app and manage which one devices are told about
          when they call the check-update endpoint.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload a build</CardTitle>
          <CardDescription>
            The highest version code marked Active is what devices are offered.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="apk-file-input">APK file</Label>
              <input
                id="apk-file-input"
                type="file"
                accept=".apk"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="app-code">App code</Label>
              <Input
                id="app-code"
                value={appCode}
                onChange={(e) => setAppCode(e.target.value)}
                placeholder="AP_ANDROID"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="version-name">Version name</Label>
              <Input
                id="version-name"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                placeholder="1.2.0"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="version-code">Version code</Label>
              <Input
                id="version-code"
                type="number"
                min={1}
                value={versionCode}
                onChange={(e) => setVersionCode(e.target.value)}
                placeholder="3"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="release-notes">Release notes</Label>
              <textarea
                id="release-notes"
                value={releaseNotes}
                onChange={(e) => setReleaseNotes(e.target.value)}
                rows={3}
                placeholder="What changed in this build?"
                className="border-input flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              />
            </div>

            {uploadError && (
              <Alert variant="destructive" className="sm:col-span-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}

            <div className="sm:col-span-2">
              <Button type="submit" disabled={uploading}>
                <UploadCloud className="h-4 w-4" />
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="py-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">App</th>
                <th className="px-4 py-3 font-medium">Version</th>
                <th className="px-4 py-3 font-medium">File</th>
                <th className="px-4 py-3 font-medium">Size</th>
                <th className="px-4 py-3 font-medium">Uploaded</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium w-24"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : versions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No builds uploaded yet.
                  </td>
                </tr>
              ) : (
                versions.map((v) => (
                  <tr key={v.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{v.appCode}</td>
                    <td className="px-4 py-3">
                      {v.versionName}{" "}
                      <span className="text-muted-foreground">(code {v.versionCode})</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{v.fileName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatApkSize(v.fileSize)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {v.createdDate ? new Date(v.createdDate).toLocaleString() : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(v)}
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                          v.active
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {v.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <a href={apkDownloadUrl(v.id)}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(v.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-sm text-muted-foreground">{totalCount} build(s) total</p>
    </div>
  );
}
