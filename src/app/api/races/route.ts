export const runtime = "nodejs";

import { getRacesFromDrive } from "@/lib/drive";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    const folderId = process.env.DRIVE_RACES_FOLDER_ID;
    if (!folderId) {
      return NextResponse.json({ error: "Missing DRIVE_RACES_FOLDER_ID" }, { status: 500 });
    }

    const races = await getRacesFromDrive(folderId);

    return NextResponse.json(races, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error("API /api/races error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}