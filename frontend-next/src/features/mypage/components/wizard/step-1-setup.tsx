"use client";

import { useRef } from "react";
import {
  AlertCircle,
  CalendarClock,
  Globe2,
  ImagePlus,
  Loader2,
  MapPin,
  Star,
  X,
} from "lucide-react";
import { TagInput } from "@/components/tag-input";
import { useEventDraftStore } from "@/stores/useEventDraftStore";
import { photosService } from "@/features/events/services/photosService";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

const fieldClass =
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-primary/40 transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70";
const labelClass = "flex items-center gap-1.5 text-sm font-medium text-foreground";

export function Step1Setup() {
  const { t } = useTranslation();
  const title = useEventDraftStore((s) => s.title);
  const setTitle = useEventDraftStore((s) => s.setTitle);
  const startAt = useEventDraftStore((s) => s.startAt);
  const setStartAt = useEventDraftStore((s) => s.setStartAt);
  const format = useEventDraftStore((s) => s.format);
  const setFormat = useEventDraftStore((s) => s.setFormat);
  const onlineRegion = useEventDraftStore((s) => s.onlineRegion);
  const setOnlineRegion = useEventDraftStore((s) => s.setOnlineRegion);
  const tags = useEventDraftStore((s) => s.tags);
  const setTags = useEventDraftStore((s) => s.setTags);
  const price = useEventDraftStore((s) => s.price);
  const setPrice = useEventDraftStore((s) => s.setPrice);
  const maxAttendees = useEventDraftStore((s) => s.maxAttendees);
  const setMaxAttendees = useEventDraftStore((s) => s.setMaxAttendees);
  const photos = useEventDraftStore((s) => s.photos);
  const setPhotos = useEventDraftStore((s) => s.setPhotos);
  const updatePhoto = useEventDraftStore((s) => s.updatePhoto);
  const setMainPhoto = useEventDraftStore((s) => s.setMainPhoto);

  const fileInput = useRef<HTMLInputElement>(null);

  function uploadPhoto(id: string, file: File) {
    photosService
      .uploadPhoto(file)
      .then(({ photoKey, previewUrl }) => {
        const prevUrl = useEventDraftStore.getState().photos.find((p) => p.id === id)?.url;
        updatePhoto(id, { url: previewUrl, photoKey, status: "done" });
        if (prevUrl?.startsWith("blob:")) URL.revokeObjectURL(prevUrl);
      })
      .catch(() => updatePhoto(id, { status: "error" }));
  }

  function addPhotos(files: FileList | null) {
    if (!files) return;
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const next = imageFiles.map((f) => ({
      id: `${f.name}-${f.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
      url: URL.createObjectURL(f),
      name: f.name,
      status: "uploading" as const,
    }));
    setPhotos((prev) => [...prev, ...next]);
    next.forEach((photo, i) => uploadPhoto(photo.id, imageFiles[i]));
  }

  function removePhoto(id: string) {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target?.url.startsWith("blob:")) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.id !== id);
    });
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>{t("mypage.create.formatLabel")}</label>
        <div className="inline-flex w-fit rounded-lg border border-border bg-secondary/40 p-1">
          <button
            type="button"
            onClick={() => setFormat("OFFLINE")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              format === "OFFLINE"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MapPin className="size-4" />
            {t("mypage.create.formatOffline")}
          </button>
          <button
            type="button"
            onClick={() => setFormat("ONLINE")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              format === "ONLINE"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe2 className="size-4" />
            {t("mypage.create.formatOnline")}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className={labelClass}>
          {t("mypage.create.titleLabel")}
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("mypage.create.titlePlaceholder")}
          className={fieldClass}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="startAt" className={labelClass}>
          <CalendarClock className="size-4 text-muted-foreground" />
          {t("mypage.create.startAtLabel")}
        </label>
        <input
          id="startAt"
          type="datetime-local"
          value={startAt}
          onChange={(e) => setStartAt(e.target.value)}
          className={fieldClass}
          required
        />
      </div>

      {format === "ONLINE" && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="onlineRegion" className={labelClass}>
            <Globe2 className="size-4 text-muted-foreground" />
            {t("mypage.create.onlineRegionLabel")}
          </label>
          <input
            id="onlineRegion"
            value={onlineRegion}
            onChange={(e) => setOnlineRegion(e.target.value)}
            placeholder={t("mypage.create.onlineRegionPlaceholder")}
            className={fieldClass}
            required
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="tags" className={labelClass}>
          {t("mypage.create.tagsLabel")}
        </label>
        <TagInput
          id="tags"
          tags={tags}
          onChange={setTags}
          placeholder={t("mypage.create.tagsPlaceholder")}
        />
      </div>

      {format === "OFFLINE" && (
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="price" className={labelClass}>
            {t("mypage.create.priceLabel")}
          </label>
          <input
            id="price"
            type="number"
            min={0}
            inputMode="numeric"
            value={price ?? ""}
            onChange={(e) => setPrice(e.target.value === "" ? null : Number(e.target.value))}
            placeholder={t("mypage.create.pricePlaceholder")}
            className={fieldClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="maxAttendees" className={labelClass}>
            {t("mypage.create.maxAttendeesLabel")}
          </label>
          <input
            id="maxAttendees"
            type="number"
            min={0}
            inputMode="numeric"
            value={maxAttendees ?? ""}
            onChange={(e) =>
              setMaxAttendees(e.target.value === "" ? null : Number(e.target.value))
            }
            placeholder={t("mypage.create.maxAttendeesPlaceholder")}
            className={fieldClass}
          />
        </div>
      </div>
      )}

      <div className="flex flex-col gap-2">
        <label className={labelClass}>{t("mypage.create.photosLabel")}</label>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            addPhotos(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="flex flex-wrap gap-3">
          {photos.map((p, i) => (
            <div
              key={p.id}
              className="group relative size-28 overflow-hidden rounded-xl border border-border bg-muted"
            >
              <img src={p.url || "/placeholder.svg"} alt={p.name} className="size-full object-cover" />
              {p.status === "uploading" && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                  <Loader2 className="size-5 animate-spin text-primary" />
                </div>
              )}
              {p.status === "error" && (
                <div
                  title={t("mypage.create.photoUploadFailed")}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-destructive/15"
                >
                  <AlertCircle className="size-5 text-destructive" />
                  <span className="text-[10px] font-medium text-destructive">
                    {t("mypage.create.photoUploadFailed")}
                  </span>
                </div>
              )}
              {p.status === "done" &&
                (i === 0 ? (
                  <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    <Star className="size-2.5 fill-current" />
                    {t("mypage.create.coverBadge")}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMainPhoto(p.id)}
                    className="absolute left-1.5 top-1.5 rounded-md bg-background/90 px-1.5 py-0.5 text-[10px] font-medium text-foreground opacity-0 shadow transition group-hover:opacity-100"
                  >
                    {t("mypage.create.setAsCover")}
                  </button>
                ))}
              <button
                type="button"
                onClick={() => removePhoto(p.id)}
                aria-label={`Remove ${p.name}`}
                className={`absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow transition group-hover:opacity-100 ${
                  p.status === "done" ? "opacity-0" : "opacity-100"
                }`}
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="flex size-28 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border text-muted-foreground transition hover:border-primary hover:text-primary"
          >
            <ImagePlus className="size-6" />
            <span className="text-xs font-medium">{t("mypage.create.addPhoto")}</span>
          </button>
        </div>
        <p className="text-xs text-muted-foreground">{t("mypage.create.photosHint")}</p>
      </div>
    </div>
  );
}
