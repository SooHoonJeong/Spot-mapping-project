import { NextRequest, NextResponse } from "next/server";

// Nominatim's usage policy requires a real User-Agent/Referer identifying the calling
// application and disallows heavy client-side (browser) usage of the public endpoint —
// direct browser fetches to it are also unreliable since it doesn't consistently send
// CORS headers under load. Proxying through our own server side avoids both problems.
const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ error: "Missing q" }, { status: 400 });
  }

  const url = new URL(NOMINATIM_SEARCH_URL);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("namedetails", "1");
  url.searchParams.set("limit", "6");
  url.searchParams.set("q", q);

  const res = await fetch(url, {
    headers: { "User-Agent": "Spot-event-app/1.0" },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Upstream error" }, { status: 502 });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
