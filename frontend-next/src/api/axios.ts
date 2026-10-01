import axios from "axios";
import { useAuthStore } from "../stores/useAuthStore";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

const API = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

API.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Several requests can come back 401 around the same time (e.g. a page firing a few requests
// at once right after the access token expires) — share one in-flight reissue call instead of
// firing a separate POST /api/auth/reissue per failed request, and replay each original
// request once the new token is in.
let refreshPromise: Promise<string> | null = null;

function reissueAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        `${baseURL}/api/auth/reissue`,
        {},
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        },
      )
      .then((response) => {
        const accessToken: string = response.data.data.accessToken;
        useAuthStore.getState().setAccessToken(accessToken);
        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt a reissue when we believe there's a session to refresh — a 401 with no
    // access token set just means the request was never authenticated, not an expired one.
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      useAuthStore.getState().accessToken
    ) {
      originalRequest._retry = true;

      try {
        const accessToken = await reissueAccessToken();
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return API(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default API;
