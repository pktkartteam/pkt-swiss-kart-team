export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getPilotsFromDrive } from "@/lib/drive";

export async function GET() {
  try {
    const rootFolderId = process.env.DRIVE_PILOTS_FOLDER_ID;
    if (!rootFolderId) {
      return NextResponse.json({ error: "Missing DRIVE_PILOTS_FOLDER_ID" }, { status: 500 });
    }

    const pilots = await getPilotsFromDrive(rootFolderId);

    return NextResponse.json(pilots, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error("API /api/pilots error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
