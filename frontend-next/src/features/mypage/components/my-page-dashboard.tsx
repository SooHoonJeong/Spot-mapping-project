"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, MessageCircle, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMyProfile } from "../lib/useMyProfile";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

type Tab = "events" | "posts";

function roleLabel(role: string, t: (path: string) => string): string {
  const key = `myPage.role.${role}`;
  const label = t(key);
  return label === key ? role : label;
}

export function MyPageDashboard() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("events");
  const { profile, loading, ready, error } = useMyProfile();

  const tabs: { id: Tab; label: string }[] = [
    { id: "events", label: t("myPage.tabEvents") },
    { id: "posts", label: t("myPage.tabPosts") },
  ];

  if (loading) {
    return (
      <section className="mx-auto flex w-full max-w-5xl items-center justify-center px-4 py-24">
        <span className="text-sm text-muted-foreground">{t("myPage.loading")}</span>
      </section>
    );
  }

  // Not logged in — the useMyProfile hook is already redirecting to /login.
  if (!ready) return null;

  if (error || !profile) {
    return (
      <section className="mx-auto w-full max-w-5xl px-4 py-24 text-center">
        <p className="text-sm text-destructive">{t("myPage.loadError")}</p>
      </section>
    );
  }

  // TODO: mock — "내 이벤트 개수/목록"과 "내 게시글 개수/목록"은 별도 API로 붙일 예정. 지금은
  // 항상 빈 상태로 표시.
  const eventCount = 0;
  const postCount = 0;

  const stats = [
    { label: t("myPage.statEventsHosted"), value: eventCount, icon: CalendarDays },
    { label: t("myPage.statCommunityPosts"), value: postCount, icon: MessageCircle },
  ];

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8">
      {/* Profile summary */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-lg font-bold text-primary-foreground">
            {profile.profileImageUrl ? (
              <img
                src={profile.profileImageUrl}
                alt={profile.nickname}
                className="h-full w-full object-cover"
              />
            ) : (
              profile.nickname.charAt(0).toUpperCase()
            )}
          </span>
          <div>
            <h2 className="text-xl font-bold tracking-tight">{profile.nickname}</h2>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {roleLabel(profile.role, t)} ·{" "}
              {t("myPage.memberSince", { year: profile.createdAt.slice(0, 4) })}
            </p>
          </div>
        </div>
        <Button
          className="gap-2 self-start sm:self-auto"
          nativeButton={false}
          render={<Link href="/my-page/edit" />}
        >
          <Pencil className="size-4" />
          {t("myPage.editProfile")}
        </Button>
      </div>

      {/* Stats */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <stat.icon className="size-5 text-primary" />
            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-1 border-b border-border">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.id}
            type="button"
            onClick={() => setTab(tabItem.id)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              tab === tabItem.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "events" ? (
        <div className="mt-6 flex flex-col gap-4">
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {t("myPage.noEvents")}
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {t("myPage.noPosts")}
          </p>
          <Link
            href="/community"
            className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
          >
            {t("myPage.shareAnotherPost")}
          </Link>
        </div>
      )}
    </section>
  );
}
