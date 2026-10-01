"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { Check, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEventDraftStore } from "@/stores/useEventDraftStore";
import { eventsService } from "@/features/events/services/eventsService";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { EventTypeSelect } from "./wizard/event-type-select";
import { Step1Setup } from "./wizard/step-1-setup";
import { Step2Details } from "./wizard/step-2-details";
import { Step3Map } from "./wizard/step-3-map";
import { Step4Preview } from "./wizard/step-4-preview";

type Phase = "type" | 1 | 2 | 3 | 4 | "submitted";

// ONLINE events have no map step — there's nothing to locate.
const OFFLINE_STEP_KEYS = ["setup", "details", "map", "preview"] as const;
const ONLINE_STEP_KEYS = ["setup", "details", "preview"] as const;

export function CreateEventWizard() {
  const { t } = useTranslation();
  const router = useRouter();

  const title = useEventDraftStore((s) => s.title);
  const description = useEventDraftStore((s) => s.description);
  const tags = useEventDraftStore((s) => s.tags);
  const startAt = useEventDraftStore((s) => s.startAt);
  const format = useEventDraftStore((s) => s.format);
  const onlineRegion = useEventDraftStore((s) => s.onlineRegion);
  const location = useEventDraftStore((s) => s.location);
  const detailAddress = useEventDraftStore((s) => s.detailAddress);
  const layers = useEventDraftStore((s) => s.layers);
  const groups = useEventDraftStore((s) => s.groups);
  const photos = useEventDraftStore((s) => s.photos);
  const price = useEventDraftStore((s) => s.price);
  const maxAttendees = useEventDraftStore((s) => s.maxAttendees);

  const stepKeys = format === "ONLINE" ? ONLINE_STEP_KEYS : OFFLINE_STEP_KEYS;

  const [phase, setPhase] = useState<Phase>("type");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelDialogVisible, setCancelDialogVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdEventId, setCreatedEventId] = useState<number | null>(null);

  function openCancelDialog() {
    setCancelDialogOpen(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setCancelDialogVisible(true)));
  }

  function closeCancelDialog() {
    setCancelDialogVisible(false);
    window.setTimeout(() => setCancelDialogOpen(false), 200);
  }

  function handleConfirmCancel() {
    useEventDraftStore.getState().reset();
    router.push("/my-page");
  }

  function handleSaveDraft() {
    alert(t("mypage.create.saveDraftAlert"));
    router.push("/my-page");
  }

  // execCommand 스타일이 아니라 순수 변환 함수: BoundaryLayer 하나를 GeoJSON Feature로 바꾼다.
  // "area"는 3점 이상일 때 닫힌 Polygon(첫 점을 마지막에 한 번 더 추가), "line"은 2점 이상일 때
  // 열린 LineString. 좌표 순서는 GeoJSON 표준대로 [lng, lat].
  function layerToFeature(layer: (typeof layers)[number]) {
    const ring = layer.points.map((p) => [p.lng, p.lat]);
    const isArea = layer.shape === "area";
    return {
      type: "Feature" as const,
      geometry: {
        type: isArea ? "Polygon" : "LineString",
        coordinates: isArea ? [[...ring, ring[0]]] : ring,
      },
      properties: {
        name: layer.name,
        color: layer.color,
        shape: layer.shape,
        ...(layer.groupId !== null ? { groupTempId: String(layer.groupId) } : {}),
      },
    };
  }

  // ONLINE 등록은 location/areaGroups/areas/price/maxAttendees를 받지 않는 별도 스펙이지만,
  // photoKeys는 포맷과 무관하게 공통으로 보낸다.
  async function handleSubmit() {
    const startAtValue = startAt.length === 16 ? `${startAt}:00` : startAt;
    const photoKeys = photos
      .filter((p): p is typeof p & { photoKey: string } => p.status === "done" && !!p.photoKey)
      .map((p) => p.photoKey);

    let payload;
    if (format === "ONLINE") {
      payload = {
        title,
        description,
        tags,
        region: onlineRegion,
        startAt: startAtValue,
        format: "ONLINE" as const,
        photoKeys,
      };
    } else {
      if (!location) return;
      const validLayers = layers.filter((l) => l.points.length >= (l.shape === "area" ? 3 : 2));
      payload = {
        title,
        description,
        tags,
        region: location.region,
        startAt: startAtValue,
        format: "OFFLINE" as const,
        location: {
          address: location.address,
          building: location.building,
          detailAddress,
          lat: location.lat,
          lng: location.lng,
        },
        areaGroups: groups.map((g) => ({ tempId: String(g.id), name: g.name, color: g.color })),
        areas: {
          type: "FeatureCollection" as const,
          features: validLayers.map(layerToFeature),
        },
        photoKeys,
        price,
        maxAttendees,
      };
    }

    setSubmitError(null);
    setSubmitting(true);
    try {
      const created = await eventsService.createEvent(payload);
      setCreatedEventId(created.id);
      setPhase("submitted");
    } catch {
      setSubmitError(t("mypage.create.submitError"));
    } finally {
      setSubmitting(false);
    }
  }

  const photosUploading = photos.some((p) => p.status === "uploading");

  const stepKeyValidity: Record<(typeof stepKeys)[number], boolean> = {
    setup:
      title.trim().length > 0 &&
      startAt.length > 0 &&
      (format === "ONLINE" ? onlineRegion.trim().length > 0 : true),
    details: description.replace(/<[^>]*>/g, "").trim().length > 0,
    map: location !== null,
    preview: true,
  };
  const stepValidity: Record<number, boolean> = {};
  stepKeys.forEach((key, index) => {
    stepValidity[index + 1] = stepKeyValidity[key];
  });

  if (phase === "submitted") {
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
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {createdEventId != null && (
            <Button
              variant="outline"
              onClick={() => router.push(`/events/${createdEventId}`)}
            >
              {t("mypage.create.viewEvent")}
            </Button>
          )}
          <Button onClick={() => router.push("/my-page")}>
            {t("mypage.create.backToMyPage")}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              useEventDraftStore.getState().reset();
              setPhase("type");
            }}
          >
            {t("mypage.create.createAnother")}
          </Button>
        </div>
      </section>
    );
  }

  if (phase === "type") {
    return <EventTypeSelect onSelect={() => setPhase(1)} />;
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {t("mypage.create.heading")}
      </h1>
      <p className="mt-1 text-muted-foreground">{t("mypage.create.subheading")}</p>

      {/* Stepper */}
      <ol className="mt-6 flex items-center gap-2">
        {stepKeys.map((key, index) => {
          const stepNumber = index + 1;
          const isCurrent = phase === stepNumber;
          const isDone = typeof phase === "number" && phase > stepNumber;
          return (
            <li key={key} className="flex flex-1 items-center gap-2">
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold ${
                    isDone
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCurrent
                        ? "border-primary text-primary"
                        : "border-border text-muted-foreground"
                  }`}
                >
                  {isDone ? <Check className="size-4" /> : stepNumber}
                </span>
                <span
                  className={`whitespace-nowrap text-xs font-medium ${
                    isCurrent ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {t(`mypage.create.steps.${key}`)}
                </span>
              </div>
              {stepNumber < stepKeys.length && (
                <div className={`h-0.5 flex-1 ${isDone ? "bg-primary" : "bg-border"}`} />
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
        {stepKeys[phase - 1] === "setup" && <Step1Setup />}
        {stepKeys[phase - 1] === "details" && <Step2Details />}
        {stepKeys[phase - 1] === "map" && <Step3Map />}
        {stepKeys[phase - 1] === "preview" && <Step4Preview />}
      </div>

      {submitError && (
        <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {submitError}
        </p>
      )}

      <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={openCancelDialog}>
            {t("mypage.create.cancel")}
          </Button>
          <Button type="button" variant="outline" onClick={handleSaveDraft} className="gap-1.5">
            <Save className="size-4" />
            {t("mypage.create.saveDraft")}
          </Button>
        </div>
        <div className="flex gap-3">
          {phase > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setPhase((phase - 1) as Phase)}
              className="gap-1.5"
            >
              <ChevronLeft className="size-4" />
              {t("mypage.create.stepBack")}
            </Button>
          )}
          {phase < stepKeys.length ? (
            <Button
              type="button"
              onClick={() => setPhase((phase + 1) as Phase)}
              disabled={!stepValidity[phase]}
              className="gap-1.5"
            >
              {t("mypage.create.stepNext")}
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={photosUploading || submitting}
              className="gap-1.5"
            >
              <Check className="size-4" />
              {submitting ? t("mypage.create.submitting") : t("myPage.createEvent")}
            </Button>
          )}
        </div>
      </div>

      {cancelDialogOpen && (
        <Dialog.Root
          open
          onOpenChange={(open) => {
            if (!open) closeCancelDialog();
          }}
        >
          <Dialog.Portal>
            <Dialog.Backdrop
              className={`fixed inset-0 z-[1100] bg-black/50 transition-opacity duration-200 ${cancelDialogVisible ? "opacity-100" : "opacity-0"}`}
            />
            <Dialog.Popup
              className={`fixed left-1/2 top-1/2 z-[1100] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-lg transition-all duration-200 ease-out ${cancelDialogVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
            >
              <Dialog.Title className="text-lg font-bold tracking-tight">
                {t("mypage.create.cancelConfirmTitle")}
              </Dialog.Title>
              <Dialog.Description className="mt-1.5 text-sm text-muted-foreground">
                {t("mypage.create.cancelConfirmDescription")}
              </Dialog.Description>
              <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={closeCancelDialog}>
                  {t("mypage.create.cancelConfirmContinue")}
                </Button>
                <Button type="button" variant="destructive" onClick={handleConfirmCancel}>
                  {t("mypage.create.cancelConfirmDiscard")}
                </Button>
              </div>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </div>
  );
}
