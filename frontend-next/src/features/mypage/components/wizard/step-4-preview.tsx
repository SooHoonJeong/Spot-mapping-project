"use client";

import { Eye } from "lucide-react";
import { useEventDraftStore } from "@/stores/useEventDraftStore";
import { EventDetailView } from "@/features/events/components/event-detail-view";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

export function Step4Preview() {
  const { t } = useTranslation();
  const title = useEventDraftStore((s) => s.title);
  const description = useEventDraftStore((s) => s.description);
  const tags = useEventDraftStore((s) => s.tags);
  const startAt = useEventDraftStore((s) => s.startAt);
  const location = useEventDraftStore((s) => s.location);
  const detailAddress = useEventDraftStore((s) => s.detailAddress);
  const photos = useEventDraftStore((s) => s.photos);
  const layers = useEventDraftStore((s) => s.layers);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
        <Eye className="size-4 shrink-0 text-primary" />
        {t("mypage.create.previewHint")}
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <EventDetailView
          event={{
            title: title || t("mypage.create.previewUntitled"),
            descriptionHtml: description,
            tags,
            startAt,
            region: location?.region ?? "",
            address: location?.address ?? "",
            building: location?.building ?? "",
            detailAddress,
            lat: location?.lat ?? 0,
            lng: location?.lng ?? 0,
            photos: photos.map((p) => p.url),
            layers,
          }}
        />
      </div>
    </div>
  );
}
