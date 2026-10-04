// 이벤트 설명은 리치텍스트 에디터가 만든 HTML 그대로 저장되므로, 목록 카드처럼 짧은 미리보기에는
// 태그를 걷어낸 일반 텍스트로 보여준다. React가 텍스트로 렌더링하니 결과는 XSS 걱정이 없다.
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<\/?(br|div|p|li|h[1-6])\b[^>]*>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

// "2026-10-06T11:10:00" → "2026-10-06 11:10"
export function formatStartAt(startAt: string): string {
  const match = /^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2}))?/.exec(startAt);
  if (!match) return startAt;
  return match[2] ? `${match[1]} ${match[2]}` : match[1];
}
