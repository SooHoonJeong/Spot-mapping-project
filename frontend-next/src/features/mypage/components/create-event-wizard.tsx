"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { Check, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEventDraftStore } from "@/stores/useEventDraftStore";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { EventTypeSelect } from "./wizard/event-type-select";
import { Step1Setup } from "./wizard/step-1-setup";
import { Step2Details } from "./wizard/step-2-details";
import { Step3Map } from "./wizard/step-3-map";
import { Step4Preview } from "./wizard/step-4-preview";

type Phase = "type" | 1 | 2 | 3 | 4 | "submitted";

const STEP_KEYS = ["setup", "details", "map", "preview"] as const;

export function CreateEventWizard() {
  const { t } = useTranslation();
  const router = useRouter();

  const title = useEventDraftStore((s) => s.title);
  const description = useEventDraftStore((s) => s.description);
  const tags = useEventDraftStore((s) => s.tags);
  const startAt = useEventDraftStore((s) => s.startAt);
  const location = useEventDraftStore((s) => s.location);
  const detailAddress = useEventDraftStore((s) => s.detailAddress);
  const layers = useEventDraftStore((s) => s.layers);
  const groups = useEventDraftStore((s) => s.groups);

  const [phase, setPhase] = useState<Phase>("type");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelDialogVisible, setCancelDialogVisible] = useState(false);

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

  // TODO: mock submission — 이벤트 생성 API 엔드포인트가 아직 없고, photos는 실제 업로드 URL이
  // 필요한데(현재는 로컬 blob: URL뿐) 업로드 API 스펙도 없어서 빈 배열로 채워둠. 두 스펙이
  // 확정되면 실제 POST 요청으로 교체해야 함.
  function handleSubmit() {
    if (!location) return;
    const validLayers = layers.filter((l) => l.points.length >= (l.shape === "area" ? 3 : 2));
    const payload = {
      title,
      description,
      tags,
      region: location.region,
      startAt: startAt.length === 16 ? `${startAt}:00` : startAt,
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
      photos: [] as string[],
    };
    console.log("[mock] New event payload:", payload);
    setPhase("submitted");
  }

  const stepValidity: Record<number, boolean> = {
    1: title.trim().length > 0 && startAt.length > 0,
    2: description.replace(/<[^>]*>/g, "").trim().length > 0,
    3: location !== null,
    4: true,
  };

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
        <div className="mt-6 flex justify-center gap-3">
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
        {STEP_KEYS.map((key, index) => {
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
              {stepNumber < STEP_KEYS.length && (
                <div className={`h-0.5 flex-1 ${isDone ? "bg-primary" : "bg-border"}`} />
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
        {phase === 1 && <Step1Setup />}
        {phase === 2 && <Step2Details />}
        {phase === 3 && <Step3Map />}
        {phase === 4 && <Step4Preview />}
      </div>

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
          {phase < 4 ? (
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
            <Button type="button" onClick={handleSubmit} className="gap-1.5">
              <Check className="size-4" />
              {t("myPage.createEvent")}
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
