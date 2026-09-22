"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

export function CommunityWriteBackLink() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-6">
      <Link
        href="/community"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {t("community.writePage.backToCommunity")}
      </Link>
    </div>
  );
}
