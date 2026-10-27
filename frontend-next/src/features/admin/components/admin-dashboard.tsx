"use client";

import { useTranslation } from "@/lib/i18n/LanguageProvider";

// 관리자 기능이 정해지면 여기에 채운다.
export function AdminDashboard() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">{t("admin.title")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("admin.description")}</p>
    </div>
  );
}
