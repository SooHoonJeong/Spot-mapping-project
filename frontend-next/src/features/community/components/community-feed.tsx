"use client";

import { useState } from "react";
import { Heart, MessageCircle, Send, Share2, Tag } from "lucide-react";
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
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
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
          className="flex items-center gap-1.5 transition-colors hover:text-primary"
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
        <span className="ml-auto flex items-center gap-1.5">
          <Share2 className="size-4" />
          {t("community.share")}
        </span>
      </div>
    </article>
  );
}

export function CommunityFeed() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<CommunityPost[]>(COMMUNITY_POSTS);
  const [draft, setDraft] = useState("");
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const toggleLike = (id: string) =>
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));

  const submit = () => {
    const content = draft.trim();
    if (!content) return;
    const newPost: CommunityPost = {
      id: `local-${Date.now()}`,
      author: t("community.youAuthor"),
      handle: "you",
      timeAgo: t("community.justNow"),
      content,
      likes: 0,
      comments: 0,
    };
    setPosts((prev) => [newPost, ...prev]);
    setDraft("");
  };

  return (
    <section className="mx-auto grid w-full max-w-3xl gap-5 px-4 py-10">
      {/* Composer */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <label htmlFor="composer" className="text-sm font-semibold">
          {t("community.composerLabel")}
        </label>
        <textarea
          id="composer"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              (e.metaKey || e.ctrlKey) &&
              !e.nativeEvent.isComposing &&
              e.keyCode !== 229
            ) {
              e.preventDefault();
              submit();
            }
          }}
          rows={3}
          placeholder={t("community.composerPlaceholder")}
          className="mt-3 w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {t("community.composerTip")}
          </span>
          <Button onClick={submit} disabled={!draft.trim()} className="gap-2">
            <Send className="size-4" />
            {t("community.post")}
          </Button>
        </div>
      </div>

      {/* Feed */}
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
