"use client";

import { useEffect, useRef, useState } from "react";

interface PhotoGalleryProps {
  photoIds: string[];
  fetchBlobUrl: (photoId: string) => Promise<string>;
}

// Thumbnails for auth-gated photos (maintenance/stock-check evidence) -
// can't just be <img src="/api/.../photos/{id}"> since that endpoint
// requires a Bearer token, so each photo is fetched as a Blob and shown via
// an object URL. Urls are cached per photo id and revoked on unmount to
// avoid leaking them.
export default function PhotoGallery({ photoIds, fetchBlobUrl }: PhotoGalleryProps) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const urlsRef = useRef<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    photoIds.forEach(async (id) => {
      if (urlsRef.current[id]) return;
      try {
        const url = await fetchBlobUrl(id);
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        urlsRef.current[id] = url;
        setUrls((prev) => ({ ...prev, [id]: url }));
      } catch {
        // Skip - a single failed thumbnail shouldn't block the rest.
      }
    });
    return () => {
      cancelled = true;
    };
  }, [photoIds, fetchBlobUrl]);

  // Separate from the per-id effect above so it only runs once, on unmount -
  // revokes everything this instance ever created, not just the current photoIds.
  useEffect(() => {
    return () => {
      Object.values(urlsRef.current).forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  if (photoIds.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {photoIds.map((id) => {
        const url = urls[id];
        if (!url) return null;
        return (
          <a key={id} href={url} target="_blank" rel="noopener noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element -- backend-streamed/blob preview, not a static asset */}
            <img src={url} alt="" className="h-20 w-20 rounded-md object-cover border" />
          </a>
        );
      })}
    </div>
  );
}
