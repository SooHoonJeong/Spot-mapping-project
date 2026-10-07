import API from "@/api/axios";

export interface PostCategory {
  id: number;
  name: string;
}

export interface Post {
  id: number;
  memberId: number;
  nickname: string;
  categoryId: number;
  categoryName: string;
  title: string;
  // 에디터가 만든 HTML 문자열 그대로 저장되어 있다.
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostListParams {
  categoryId?: number;
  page?: number;
  size?: number;
}

export interface PostListResult {
  content: Post[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

export interface CreatePostRequest {
  categoryId: number;
  title: string;
  content: string;
}

export const communityService = {
  // 스펙 문서에는 없지만 서버에 있는 엔드포인트(GET /api/posts/categories)를 확인해서 사용.
  async getCategories() {
    const response = await API.get("/api/posts/categories");
    return response.data.data as PostCategory[];
  },

  async getPosts(params: PostListParams = {}) {
    const response = await API.get("/api/posts", { params });
    return response.data.data as PostListResult;
  },

  async createPost(payload: CreatePostRequest) {
    const response = await API.post("/api/posts", payload);
    return response.data.data as Post;
  },
};
