"use client";

import { useCallback, useEffect, useState } from "react";
import { communityService, type Post, type PostCategory } from "../services/communityService";

// 카테고리 목록. 실패하면 error만 켜고 빈 목록을 돌려준다.
export function usePostCategories() {
  const [categories, setCategories] = useState<PostCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    communityService
      .getCategories()
      .then((data) => {
        if (!cancelled) setCategories(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, loading, error };
}

// "더 보기" 방식 게시글 목록. 카테고리가 바뀌면 처음부터 다시 불러온다.
export function useInfinitePosts(categoryId: number | undefined, size = 21) {
  const [posts, setPosts] = useState<Post[]>([]);
  // 페이지를 "어느 카테고리의 몇 페이지인지"로 같이 들고 있어서, 카테고리가 바뀌는 순간 곧바로 0페이지로
  // 취급된다(별도 effect로 되돌리면 옛 페이지 번호로 요청이 한 번 더 나간다).
  const [pageState, setPageState] = useState({ categoryId, page: 0 });
  const page = pageState.categoryId === categoryId ? pageState.page : 0;
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setPosts([]);
  }, [categoryId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    communityService
      .getPosts({ categoryId, page, size })
      .then((result) => {
        if (cancelled) return;
        setPosts((prev) => (page === 0 ? result.content : [...prev, ...result.content]));
        setHasNext(result.hasNext);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [categoryId, page, size]);

  const loadMore = useCallback(
    () => setPageState({ categoryId, page: page + 1 }),
    [categoryId, page],
  );

  return { posts, hasNext, loading, error, loadMore };
}
