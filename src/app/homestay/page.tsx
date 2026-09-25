"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  fetchShowcasedHomestays,
  publicHomestayPhotoUrl,
  HomestaySummary,
} from "@/services/propertiesApi";
import { Card, CardContent } from "@/components/ui/card";
import { Home, MapPin } from "lucide-react";

function rentRangeLabel(units: HomestaySummary["units"]): string | null {
  const rents = units.map((u) => u.baseRent).filter((r): r is number => r != null);
  if (rents.length === 0) return null;
  const min = Math.min(...rents);
  return `From $${min.toFixed(0)}/mo`;
}

function bedroomRangeLabel(units: HomestaySummary["units"]): string | null {
  if (units.length === 0) return null;
  const beds = units.map((u) => u.bedrooms);
  const min = Math.min(...beds);
  const max = Math.max(...beds);
  return min === max ? `${min} bed` : `${min}-${max} bed`;
}

export default function HomestayListPage() {
  const { t } = useTranslation();
  const [homestays, setHomestays] = useState<HomestaySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchShowcasedHomestays()
      .then(setHomestays)
      .catch((err) => setError(err instanceof Error ? err.message : t("HOMESTAY_LIST_ERROR")))
      .finally(() => setLoading(false));
  }, [t]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-5 flex items-center gap-2">
          <Home className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-semibold text-gray-800">{t("HOMESTAY_BRAND")}</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900">{t("HOMESTAY_LIST_TITLE")}</h1>
        <p className="mt-2 text-gray-600">{t("HOMESTAY_LIST_SUBTITLE")}</p>

        {loading && <p className="mt-8 text-sm text-gray-500">{t("COMMON_LOADING")}</p>}
        {error && <p className="mt-8 text-sm text-red-600">{error}</p>}

        {!loading && !error && homestays.length === 0 && (
          <p className="mt-8 text-sm text-gray-500">{t("HOMESTAY_LIST_EMPTY")}</p>
        )}

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {homestays.map((h) => (
            <Link key={h.id} href={`/homestay/${h.id}`}>
              <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                <div className="aspect-video w-full bg-gray-200">
                  {h.photoIds.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element -- public backend-streamed image, not a static asset
                    <img
                      src={publicHomestayPhotoUrl(h.id, h.photoIds[0])}
                      alt={h.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      <Home className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h2 className="font-semibold text-gray-900">{h.name}</h2>
                  <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {h.address}
                  </p>
                  {h.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">{h.description}</p>
                  )}
                  <div className="mt-3 flex items-center gap-2 text-xs font-medium text-blue-700">
                    {bedroomRangeLabel(h.units) && <span>{bedroomRangeLabel(h.units)}</span>}
                    {rentRangeLabel(h.units) && <span>&middot; {rentRangeLabel(h.units)}</span>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
