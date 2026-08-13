"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  Check,
  ImagePlus,
  Locate,
  MapPin,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationSearch } from "./location-search";
import type { SelectedLocation } from "../lib/location";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

function MapLoadingFallback() {
  const { t } = useTranslation();
  return (
    <div className="flex h-full min-h-[360px] w-full items-center justify-center bg-muted">
      <span className="text-sm text-muted-foreground">{t("mapExplorer.loadingMap")}</span>
    </div>
  );
}

const LocationMap = dynamic(() => import("./location-map"), {
  ssr: false,
  loading: MapLoadingFallback,
});

const fieldClass =
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-primary/40 transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70";
const labelClass =
  "flex items-center gap-1.5 text-sm font-medium text-foreground";

type Photo = { id: string; url: string; name: string };

export function CreateEventForm() {
  const { t } = useTranslation();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");
  const [location, setLocation] = useState<SelectedLocation | null>(null);
  // User-entered detail address (unit/floor/etc). Kept separate from `location`, which holds
  // the lat/lng and geocoded address/building — those stay in state for the future backend
  // submission but are intentionally not rendered anywhere in this form.
  const [detailAddress, setDetailAddress] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  // Revoke object URLs on unmount to avoid memory leaks.
  useEffect(() => {
    return () => {
      photos.forEach((p) => URL.revokeObjectURL(p.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const canSubmit =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    startAt.length > 0 &&
    location !== null;

  // TODO: mock submission — no event/community domain exists on the backend yet (only
  // `member`), so this just simulates success locally. Wire up to a real POST once the
  // backend adds an events endpoint.
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !location) return;
    const payload = {
      title,
      description,
      region: location.address,
      building: location.building,
      detailAddress,
      lat: location.lat,
      lng: location.lng,
      startAt,
      photoCount: photos.length,
    };
    console.log("[mock] New event payload:", payload);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <section className="mx-auto w-full max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-7" />
        </div>
        <h2 className="mt-5 text-2xl font-bold tracking-tight">
          {t("mypage.create.successTitle")}
        </h2>
        <p className="mt-2 text-pretty text-muted-foreground">
          {t("mypage.create.successDescription", { title })}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => router.push("/my-page")}>
            {t("mypage.create.backToMyPage")}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSubmitted(false);
              setTitle("");
              setDescription("");
              setStartAt("");
              setLocation(null);
              setDetailAddress("");
              setPhotos([]);
            }}
          >
            {t("mypage.create.createAnother")}
          </Button>
        </div>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-5xl px-4 py-10">
      <Link
        href="/my-page"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {t("mypage.create.backToMyPage")}
      </Link>

      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {t("mypage.create.heading")}
      </h1>
      <p className="mt-1 text-muted-foreground">
        {t("mypage.create.subheading")}
      </p>

      {/* Details + map, side by side */}
      <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-2">
        {/* Event details */}
        <fieldset className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <legend className="px-2 text-sm font-semibold uppercase tracking-wide text-primary">
            {t("mypage.create.detailsLegend")}
          </legend>

          <div className="grid gap-5">
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
              <label className={labelClass}>
                <Search className="size-4 text-muted-foreground" />
                {t("mypage.create.locationLabel")}
              </label>
              <LocationSearch value={location} onChange={setLocation} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>
                <MapPin className="size-4 text-muted-foreground" />
                {t("mypage.create.regionLabel")}
              </label>
              <input
                value={location?.address ?? ""}
                readOnly
                placeholder={t("mypage.create.regionPlaceholder")}
                className={`${fieldClass} bg-muted/50`}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>
                <Building2 className="size-4 text-muted-foreground" />
                {t("mypage.create.buildingLabel")}
              </label>
              <input
                value={location?.building ?? ""}
                readOnly
                placeholder="—"
                className={`${fieldClass} bg-muted/50`}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="detailAddress" className={labelClass}>
                <Locate className="size-4 text-muted-foreground" />
                {t("mypage.create.detailAddressLabel")}
              </label>
              <input
                id="detailAddress"
                value={detailAddress}
                onChange={(e) => setDetailAddress(e.target.value)}
                maxLength={20}
                placeholder={t("mypage.create.detailAddressPlaceholder")}
                className={fieldClass}
              />
            </div>
          </div>
        </fieldset>

        {/* Map */}
        <div className="min-h-[360px] overflow-hidden rounded-2xl border border-border shadow-sm lg:min-h-0">
          <LocationMap value={location} onChange={setLocation} />
        </div>
      </div>

      {/* Event page content */}
      <fieldset className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <legend className="px-2 text-sm font-semibold uppercase tracking-wide text-primary">
          {t("mypage.create.contentLegend")}
        </legend>

        <div className="grid gap-6">
          {/* Photos */}
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
                  <img
                    src={p.url || "/placeholder.svg"}
                    alt={p.name}
                    className="size-full object-cover"
                  />
                  {i === 0 && (
                    <span className="absolute left-1.5 top-1.5 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                      {t("mypage.create.coverBadge")}
                    </span>
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
            <p className="text-xs text-muted-foreground">
              {t("mypage.create.photosHint")}
            </p>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className={labelClass}>
              {t("mypage.create.descriptionLabel")}
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("mypage.create.descriptionPlaceholder")}
              rows={8}
              className="w-full rounded-lg border border-input bg-background p-3 text-sm leading-relaxed outline-none ring-primary/40 transition focus:ring-2"
              required
            />
          </div>
        </div>
      </fieldset>

      {/* Actions */}
      <div className="sticky bottom-0 mt-6 flex items-center justify-end gap-3 rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/my-page")}
        >
          {t("mypage.create.cancel")}
        </Button>
        <Button type="submit" disabled={!canSubmit} className="gap-1.5">
          <Check className="size-4" />
          {t("myPage.createEvent")}
        </Button>
      </div>
    </form>
  );
}
