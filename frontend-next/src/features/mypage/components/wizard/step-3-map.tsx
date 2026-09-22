"use client";

import { Building2, Locate, MapPin, Search } from "lucide-react";
import { useEventDraftStore } from "@/stores/useEventDraftStore";
import { LocationSearch } from "../location-search";
import { BoundaryEditor } from "../boundary-editor";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

const fieldClass =
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-primary/40 transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70";
const labelClass = "flex items-center gap-1.5 text-sm font-medium text-foreground";

export function Step3Map() {
  const { t } = useTranslation();
  const location = useEventDraftStore((s) => s.location);
  const setLocation = useEventDraftStore((s) => s.setLocation);
  const detailAddress = useEventDraftStore((s) => s.detailAddress);
  const setDetailAddress = useEventDraftStore((s) => s.setDetailAddress);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
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

        <div className="flex flex-col gap-1.5 sm:col-span-2">
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

      <div className="flex flex-col gap-2">
        <span className={labelClass}>
          <MapPin className="size-4 text-muted-foreground" />
          {t("mypage.create.mapLabel")}
        </span>
        {location ? (
          <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
            <BoundaryEditor center={{ lat: location.lat, lng: location.lng }} />
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {t("mypage.create.mapNeedsLocation")}
          </p>
        )}
      </div>
    </div>
  );
}
