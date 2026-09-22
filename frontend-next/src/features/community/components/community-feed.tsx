"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Share2, Tag, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMMUNITY_POSTS, type CommunityPost } from "../lib/community";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function PostCard({
  post,
  liked,
  onToggleLike,
}: {
  post: CommunityPost;
  liked: boolean;
  onToggleLike: (id: string) => void;
}) {
  const { t } = useTranslation();
  const media = post.media?.[0];

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-col sm:flex-row">
        {media ? (
          <div className="w-full shrink-0 bg-card p-3 sm:w-40 md:w-48">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl">
              {media.type === "video" ? (
                <video
                  src={media.url}
                  muted
                  playsInline
                  className="size-full object-cover"
                  aria-label={media.name}
                />
              ) : (
                <img src={media.url} alt={media.name} className="size-full object-cover" />
              )}
              {post.media && post.media.length > 1 && (
                <span className="absolute bottom-2 right-2 rounded-full bg-foreground/75 px-2 py-1 text-xs text-background">
                  +{post.media.length - 1}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="hidden w-40 shrink-0 items-center justify-center bg-secondary text-secondary-foreground sm:flex md:w-48">
            <ImageIcon className="size-6 opacity-40" />
          </div>
        )}
        <div className="min-w-0 flex-1 p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
              {initials(post.author)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-card-foreground">
                {post.author}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                @{post.handle} · {post.timeAgo}
              </p>
            </div>
          </div>

          {post.title && (
            <h2 className="mt-4 text-base font-semibold text-card-foreground">
              {post.title}
            </h2>
          )}

          <p className="mt-3 text-pretty text-sm leading-relaxed text-card-foreground">
            {post.content}
          </p>

          {post.tag && (
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              <Tag className="size-3 text-primary" />
              {post.tag}
            </span>
          )}

          <div className="mt-4 flex items-center gap-6 border-t border-border pt-3 text-sm text-muted-foreground">
            <button
              type="button"
              onClick={() => onToggleLike(post.id)}
              className="flex items-center gap-1.5 hover:text-primary"
              aria-label={t("community.likeAria", { author: post.author })}
              aria-pressed={liked}
            >
              <Heart
                className={
                  liked ? "size-4 fill-primary text-primary" : "size-4"
                }
              />
              {post.likes + (liked ? 1 : 0)}
            </button>
            <span className="flex items-center gap-1.5">
              <MessageCircle className="size-4" />
              {post.comments}
            </span>
            <button
              type="button"
              className="ml-auto flex items-center gap-1.5 hover:text-primary"
            >
              <Share2 className="size-4" />
              {t("community.share")}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function CommunityFeed() {
  const { t } = useTranslation();
  const [posts] = useState<CommunityPost[]>(COMMUNITY_POSTS);
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const toggleLike = (id: string) =>
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <section className="mx-auto grid w-full max-w-3xl gap-4 px-4 py-8">
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div>
          <p className="font-semibold">{t("community.shareCardTitle")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("community.shareCardDescription")}
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/community/write" />}
          className="shrink-0"
        >
          {t("community.write")}
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            liked={!!liked[post.id]}
            onToggleLike={toggleLike}
          />
        ))}
      </div>
    </section>
  );
}
