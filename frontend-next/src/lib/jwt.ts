// JWT 페이로드를 서명 검증 없이 읽는다. 화면 분기(관리자 링크 표시 등) 용도로만 쓸 것 — 서명은
// 서버만 검증할 수 있으므로 여기서 읽은 값은 권한 근거가 될 수 없고, 실제 접근 제어는 백엔드 몫이다.
export function decodeJwtPayload(token: string | null): Record<string, unknown> | null {
  if (!token) return null;
  const part = token.split(".")[1];
  if (!part) return null;
  try {
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
    const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
    const payload: unknown = JSON.parse(new TextDecoder().decode(bytes));
    return payload && typeof payload === "object" ? (payload as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

// 토큰의 `role` claim이 ADMIN인지. 값은 "ADMIN"이고, Spring 관례의 "ROLE_ADMIN"도 같은 값으로 본다.
export function isAdminToken(token: string | null): boolean {
  const role = decodeJwtPayload(token)?.role;
  const roles = Array.isArray(role) ? role : [role];
  return roles.some(
    (value) => typeof value === "string" && value.toUpperCase().replace(/^ROLE_/, "") === "ADMIN",
  );
}
