"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
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
import DataTable, { DataTableColumn } from "@/components/DataTable/DataTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Download, QrCode, Trash2, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import AppDialog from "@/components/custom-ui/app-dialog";
import { QRCodeSVG } from "qrcode.react";

const DEFAULT_APP_CODE = "AP_ANDROID";

export default function ApkVersionsPage() {
  const { t } = useTranslation();
  const [versions, setVersions] = useState<ApkVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  // Which row's QR modal is open, if any - the download endpoint is public
  // (see SecurityConfig), so the QR just needs to encode its absolute URL,
  // no token/session to carry across from PC to phone.
  const [qrVersion, setQrVersion] = useState<ApkVersion | null>(null);

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
    fetchApkVersions(DEFAULT_APP_CODE, page, pageSize)
      .then((data) => {
        setVersions(data.versions);
        setTotalCount(data.total);
      })
      .catch((err) => setError(err.message || t("APK_LOAD_ERROR")))
      .finally(() => setLoading(false));
  }, [page, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setUploadError("");

    if (!file) {
      setUploadError(t("APK_FILE_REQUIRED"));
      return;
    }
    const parsedVersionCode = Number(versionCode);
    if (!versionName.trim() || !Number.isInteger(parsedVersionCode) || parsedVersionCode <= 0) {
      setUploadError(t("APK_FIELDS_REQUIRED"));
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
      if (page === 1) {
        load();
      } else {
        setPage(1);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : t("APK_UPLOAD_FAILED"));
    } finally {
      setUploading(false);
    }
  }

  async function handleToggleActive(version: ApkVersion) {
    try {
      await setApkVersionActive(version.id, !version.active);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : t("APK_STATUS_UPDATE_FAILED"));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t("APK_DELETE_CONFIRM"))) return;
    try {
      await deleteApkVersion(id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : t("APK_DELETE_FAILED"));
    }
  }

  const columns: DataTableColumn<ApkVersion>[] = [
    { key: "appCode", header: t("APK_COL_APP"), className: "px-4 py-3 font-medium" },
    {
      key: "version",
      header: t("APK_COL_VERSION"),
      csvValue: (v) => `${v.versionName} ${t("APK_VERSION_CODE_SUFFIX", { code: v.versionCode })}`,
      render: (v) => (
        <>
          {v.versionName} <span className="text-muted-foreground">{t("APK_VERSION_CODE_SUFFIX", { code: v.versionCode })}</span>
        </>
      ),
    },
    { key: "fileName", header: t("APK_COL_FILE"), className: "px-4 py-3 text-muted-foreground" },
    {
      key: "fileSize",
      header: t("APK_COL_SIZE"),
      className: "px-4 py-3 text-muted-foreground",
      csvValue: (v) => formatApkSize(v.fileSize),
      render: (v) => formatApkSize(v.fileSize),
    },
    {
      key: "createdDate",
      header: t("APK_COL_UPLOADED"),
      className: "px-4 py-3 text-muted-foreground",
      render: (v) => (v.createdDate ? new Date(v.createdDate).toLocaleString() : "-"),
    },
    {
      key: "downloadCount",
      header: t("APK_COL_DOWNLOADS"),
      className: "px-4 py-3 text-muted-foreground",
    },
    {
      key: "active",
      header: t("APK_COL_STATUS"),
      csvValue: (v) => (v.active ? t("APK_STATUS_ACTIVE") : t("APK_STATUS_INACTIVE")),
      render: (v) => (
        <button
          onClick={() => handleToggleActive(v)}
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            v.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}
        >
          {v.active ? t("APK_STATUS_ACTIVE") : t("APK_STATUS_INACTIVE")}
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("SIDEBAR_APK_VERSIONS")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("APK_SUBTITLE")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("APK_UPLOAD_TITLE")}</CardTitle>
          <CardDescription>
            {t("APK_UPLOAD_DESC")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="apk-file-input">{t("APK_FILE_LABEL")}</Label>
              <input
                id="apk-file-input"
                type="file"
                accept=".apk"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="app-code">{t("APK_APP_CODE_LABEL")}</Label>
              <Input
                id="app-code"
                value={appCode}
                onChange={(e) => setAppCode(e.target.value)}
                placeholder="AP_ANDROID"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="version-name">{t("APK_VERSION_NAME_LABEL")}</Label>
              <Input
                id="version-name"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                placeholder="1.2.0"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="version-code">{t("APK_VERSION_CODE_LABEL")}</Label>
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
              <Label htmlFor="release-notes">{t("APK_RELEASE_NOTES_LABEL")}</Label>
              <textarea
                id="release-notes"
                value={releaseNotes}
                onChange={(e) => setReleaseNotes(e.target.value)}
                rows={3}
                placeholder={t("APK_RELEASE_NOTES_PLACEHOLDER")}
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
                {uploading ? t("APK_UPLOADING") : t("APK_UPLOAD")}
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

      <DataTable
        columns={columns}
        rows={versions}
        getRowKey={(v) => v.id}
        loading={loading}
        emptyMessage={t("APK_EMPTY")}
        itemLabel="build"
        page={page}
        pageSize={pageSize}
        total={totalCount}
        onPageChange={setPage}
        actions={(v) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title={t("APK_QR_BUTTON_TITLE")}
              onClick={() => setQrVersion(v)}
            >
              <QrCode className="h-4 w-4" />
            </Button>
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
        )}
      />

      <AppDialog
        title={qrVersion ? t("APK_QR_DIALOG_TITLE", { appCode: qrVersion.appCode, versionName: qrVersion.versionName }) : ""}
        show={qrVersion !== null}
        onClose={() => setQrVersion(null)}
        showFooter={false}
        width="360px"
      >
        {qrVersion && (
          <div className="flex flex-col items-center gap-3 py-2">
            <p className="text-sm text-muted-foreground text-center">
              {t("APK_QR_HINT")}
            </p>
            <div className="rounded-lg border bg-white p-4">
              <QRCodeSVG value={apkDownloadUrl(qrVersion.id)} size={220} />
            </div>
            <p className="break-all text-xs text-muted-foreground text-center">
              {apkDownloadUrl(qrVersion.id)}
            </p>
          </div>
        )}
      </AppDialog>
    </div>
  );
}
