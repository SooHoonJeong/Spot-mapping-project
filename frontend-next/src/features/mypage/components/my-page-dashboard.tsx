"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Heart,
  MessageCircle,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EVENTS } from "@/features/events/lib/events";
import { COMMUNITY_POSTS } from "@/features/community/lib/community";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

// Pretend these are the items the signed-in user created.
const MY_EVENTS = EVENTS.slice(0, 2);
const MY_POSTS = COMMUNITY_POSTS.slice(0, 2);

type Tab = "events" | "posts";

export function MyPageDashboard() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("events");

  const stats = [
    { label: t("myPage.statEventsHosted"), value: MY_EVENTS.length, icon: CalendarDays },
    {
      label: t("myPage.statTotalAttendees"),
      value: MY_EVENTS.reduce((sum, e) => sum + e.attendees, 0).toLocaleString(),
      icon: Users,
    },
    { label: t("myPage.statCommunityPosts"), value: MY_POSTS.length, icon: MessageCircle },
  ];

  const tabs: { id: Tab; label: string }[] = [
    { id: "events", label: t("myPage.tabEvents") },
    { id: "posts", label: t("myPage.tabPosts") },
  ];

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10">
      {/* Profile summary */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex size-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
            AL
          </span>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Alex Larsen</h2>
            <p className="text-sm text-muted-foreground">
              @alexlarsen · New York, NY
            </p>
          </div>
        </div>
        <Button
          className="gap-2 self-start sm:self-auto"
          nativeButton={false}
          render={<Link href="/my-page/create" />}
        >
          <Plus className="size-4" />
          {t("myPage.createEvent")}
        </Button>
      </div>

      {/* Stats */}
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
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
          {MY_EVENTS.map((event) => (
            <div
              key={event.id}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center"
            >
              <img
                src={event.image || "/placeholder.svg"}
                alt={event.title}
                className="h-32 w-full shrink-0 rounded-xl object-cover sm:h-20 sm:w-28"
                crossOrigin="anonymous"
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-card-foreground">
                  {event.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {event.date} · {event.time} · {event.venue}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {event.attendees.toLocaleString()}
                  {t("myPage.attending")}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-1.5">
                  <Pencil className="size-4" />
                  {t("myPage.edit")}
                </Button>
                <Button
                  variant="ghost"
                  className="gap-1.5 text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                  {t("myPage.delete")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {MY_POSTS.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <p className="text-sm leading-relaxed text-card-foreground">
                {post.content}
              </p>
              <div className="mt-3 flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Heart className="size-4" />
                  {post.likes}
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="size-4" />
                  {post.comments}
                </span>
                <div className="ml-auto flex gap-2">
                  <Button variant="outline" className="gap-1.5">
                    <Pencil className="size-4" />
                    {t("myPage.edit")}
                  </Button>
                  <Button
                    variant="ghost"
                    className="gap-1.5 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                    {t("myPage.delete")}
                  </Button>
                </div>
              </div>
            </div>
          ))}
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
