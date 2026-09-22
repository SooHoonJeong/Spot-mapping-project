import API from "../../../api/axios";

// Matches backend's SignupRequest record exactly (spot-backend, com.getinspot.backend.domain.member.dto).
// Note this is NOT the form's local state shape (SignupForm.tsx) — that also carries a
// UI-only `passwordConfirm` field which must never be sent to the backend.
export interface SignupRequestPayload {
  email: string;
  verificationToken: string;
  password: string;
  gender: string;
  username: string;
  nickname: string;
  birthDate: string; // ISO "yyyy-MM-dd", backend deserializes this into LocalDate
  phoneNumber: string; // "010-1234-5678", must match backend's hyphenated regex
  agreedToTerms: boolean;
  agreedToMarketing: boolean;
}

// Matches backend's GET/PATCH /api/members/me response `data` shape.
export interface MyProfileResponse {
  email: string;
  username: string;
  nickname: string;
  gender: string;
  birthDate: string;
  phoneNumber: string;
  role: string;
  agreedToMarketing: boolean;
  profileImageUrl: string | null;
  createdAt: string;
}

export interface UpdateProfileRequest {
  nickname: string;
  phoneNumber: string;
  agreedToMarketing: boolean;
}

export const authService = {
  async getProfile(): Promise<MyProfileResponse> {
    const response = await API.get("/api/members/me");
    // response.data is the ApiResponse<T> envelope { success, message, data }; unwrap to
    // the actual MyProfileResponse so callers get real fields (nickname, profileImageUrl, ...).
    return response.data.data;
  },

  async updateProfile(payload: UpdateProfileRequest): Promise<MyProfileResponse> {
    const response = await API.patch("/api/members/me", payload);
    return response.data.data;
  },

  async signup(userData: SignupRequestPayload) {
    const response = await API.post("/api/auth/signup", userData);
    return response.data;
  },

  async sendVerificationEmail(email: string) {
    const response = await API.post("/api/auth/email/send", { email });
    return response.data;
  },

  async checkVerificationEmail(email: string, code: string) {
    const response = await API.post("/api/auth/email/verify", { email, code });
    return response.data;
  },

  async login(email: string, password: string) {
    const response = await API.post("/api/auth/login", { email, password });
    return response.data;
  },
};
