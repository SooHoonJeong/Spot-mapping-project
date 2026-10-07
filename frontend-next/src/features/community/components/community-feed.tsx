"use client";

import { useState } from "react";
import Link from "next/link";
import { Tag, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatStartAt, htmlToPlainText } from "@/features/events/lib/format";
import { useInfinitePosts, usePostCategories } from "../lib/usePosts";
import type { Post } from "../services/communityService";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// 본문 HTML에 사진이 들어 있으면 첫 장을 카드 썸네일로 쓴다. 게시글 응답에는 별도 이미지 필드가 없다.
function firstImageUrl(html: string): string | null {
  const match = /<img\b[^>]*\ssrc="(https?:\/\/[^"]+)"/i.exec(html);
  return match ? match[1] : null;
}

function PostCard({ post }: { post: Post }) {
  const thumbnail = firstImageUrl(post.content);

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-col sm:flex-row">
        {thumbnail ? (
          <div className="w-full shrink-0 bg-card p-3 sm:w-40 md:w-48">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl">
              <img src={thumbnail} alt={post.title} className="size-full object-cover" />
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
              {initials(post.nickname)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-card-foreground">
                {post.nickname}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {formatStartAt(post.createdAt)}
              </p>
            </div>
          </div>

          <h2 className="mt-4 text-base font-semibold text-card-foreground">{post.title}</h2>

          <p className="mt-3 line-clamp-3 text-pretty text-sm leading-relaxed text-card-foreground">
            {htmlToPlainText(post.content)}
          </p>

          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            <Tag className="size-3 text-primary" />
            {post.categoryName}
          </span>
        </div>
      </div>
    </article>
  );
}

export function CommunityFeed() {
  const { t } = useTranslation();
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const { categories } = usePostCategories();
  const { posts, hasNext, loading, error, loadMore } = useInfinitePosts(categoryId);

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

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {[{ id: undefined, name: t("community.categoryAll") }, ...categories].map((category) => {
            const active = category.id === categoryId;
            return (
              <button
                key={category.id ?? "all"}
                type="button"
                onClick={() => setCategoryId(category.id)}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <p className="rounded-2xl border border-dashed border-destructive/40 p-6 text-center text-sm text-destructive">
          {t("community.errorState")}
        </p>
      )}

      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {loading && posts.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">{t("community.loading")}</p>
      )}
      {!loading && !error && posts.length === 0 && (
        <p className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          {t("community.emptyState")}
        </p>
      )}

      {hasNext && (
        <div className="flex justify-center">
          <Button type="button" variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? t("community.loading") : t("community.loadMore")}
          </Button>
        </div>
      )}
    </section>
  );
}
