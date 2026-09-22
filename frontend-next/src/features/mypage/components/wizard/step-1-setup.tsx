"use client";

import { useRef, useState } from "react";
import { CalendarClock, ImagePlus, Star, X } from "lucide-react";
import { useEventDraftStore } from "@/stores/useEventDraftStore";
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
  const tags = useEventDraftStore((s) => s.tags);
  const setTags = useEventDraftStore((s) => s.setTags);
  const photos = useEventDraftStore((s) => s.photos);
  const setPhotos = useEventDraftStore((s) => s.setPhotos);
  const setMainPhoto = useEventDraftStore((s) => s.setMainPhoto);

  const [tagInput, setTagInput] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  function commitTagInput() {
    const value = tagInput.trim();
    if (!value) return;
    setTags((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function addPhotos(files: FileList | null) {
    if (!files) return;
    const next = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({
        id: `${f.name}-${f.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
        url: URL.createObjectURL(f),
        name: f.name,
      }));
    setPhotos((prev) => [...prev, ...next]);
  }

  function removePhoto(id: string) {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.id !== id);
    });
  }

  return (
    <div className="grid gap-6">
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

      <div className="flex flex-col gap-1.5">
        <label htmlFor="tags" className={labelClass}>
          {t("mypage.create.tagsLabel")}
        </label>
        <input
          id="tags"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
              e.preventDefault();
              commitTagInput();
            }
          }}
          placeholder={t("mypage.create.tagsPlaceholder")}
          className={fieldClass}
        />
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  aria-label={t("mypage.create.tagRemove", { tag })}
                  className="hover:text-destructive"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

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
              {i === 0 ? (
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
              )}
              <button
                type="button"
                onClick={() => removePhoto(p.id)}
                aria-label={`Remove ${p.name}`}
                className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow transition group-hover:opacity-100"
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
