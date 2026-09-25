"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  fetchShowcasedHomestay,
  publicHomestayPhotoUrl,
  HomestaySummary,
} from "@/services/propertiesApi";
import { cn } from "@/lib/utils";
import { ArrowLeft, BedDouble, Home, MapPin } from "lucide-react";

const statusStyle: Record<string, string> = {
  VACANT: "bg-green-100 text-green-700",
  OCCUPIED: "bg-gray-100 text-gray-600",
  MAINTENANCE: "bg-amber-100 text-amber-700",
};

export default function HomestayDetailPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const [homestay, setHomestay] = useState<HomestaySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchShowcasedHomestay(params.id)
      .then(setHomestay)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-5 flex items-center gap-2">
          <Home className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-semibold text-gray-800">{t("HOMESTAY_BRAND")}</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <Link href="/homestay" className="inline-flex items-center gap-1 text-sm text-blue-700 hover:underline">
          <ArrowLeft className="h-4 w-4" />
          {t("HOMESTAY_DETAIL_BACK")}
        </Link>

        {loading && <p className="mt-8 text-sm text-gray-500">{t("COMMON_LOADING")}</p>}
        {(error || (!loading && !homestay)) && (
          <p className="mt-8 text-sm text-red-600">{t("HOMESTAY_DETAIL_NOT_FOUND")}</p>
        )}

        {homestay && (
          <div className="mt-6 space-y-6">
            {homestay.photoIds.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {homestay.photoIds.map((photoId, i) => (
                  // eslint-disable-next-line @next/next/no-img-element -- public backend-streamed image, not a static asset
                  <img
                    key={photoId}
                    src={publicHomestayPhotoUrl(homestay.id, photoId)}
                    alt={`${homestay.name} photo ${i + 1}`}
                    className={cn(
                      "h-48 w-full rounded-lg object-cover",
                      i === 0 && "col-span-2 h-64 sm:col-span-2"
                    )}
                  />
                ))}
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center rounded-lg bg-gray-200 text-gray-400">
                <Home className="h-12 w-12" />
              </div>
            )}

            <div>
              <h1 className="text-3xl font-bold text-gray-900">{homestay.name}</h1>
              <p className="mt-1 flex items-center gap-1 text-gray-600">
                <MapPin className="h-4 w-4 shrink-0" />
                {homestay.address}
              </p>
              <span className="mt-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                {homestay.type}
              </span>
            </div>

            {homestay.description && (
              <p className="whitespace-pre-line text-gray-700">{homestay.description}</p>
            )}

            {homestay.units.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-semibold text-gray-900">{t("HOMESTAY_DETAIL_UNITS_TITLE")}</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {homestay.units.map((u) => (
                    <div key={u.unitNumber} className="flex items-center justify-between rounded-lg border bg-white p-3">
                      <div>
                        <p className="font-medium text-gray-900">{t("HOMESTAY_DETAIL_UNIT_LABEL", { number: u.unitNumber })}</p>
                        <p className="flex items-center gap-1 text-sm text-gray-500">
                          <BedDouble className="h-3.5 w-3.5" />
                          {u.bedrooms} {t("HOMESTAY_DETAIL_BEDROOMS")}
                          {u.baseRent != null && <span>&middot; ${u.baseRent.toFixed(0)}/mo</span>}
                        </p>
                      </div>
                      <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", statusStyle[u.status] || statusStyle.OCCUPIED)}>
                        {u.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
