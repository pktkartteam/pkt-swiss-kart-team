export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import { google, type drive_v3 } from "googleapis";
import type { Readable } from "node:stream";

let _driveClient: drive_v3.Drive | null = null;

function getDriveClient(): drive_v3.Drive {
  if (_driveClient) return _driveClient;

  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_JSON");
  const credentials = JSON.parse(raw) as {
    client_email: string;
    private_key: string;
  };

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  _driveClient = google.drive({ version: "v3", auth });
  return _driveClient;
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

type CachedImage = { exp: number; buf: Buffer; contentType: string };
type ImageResult = { buf: Buffer; contentType: string };

const MEM_TTL_MS = 60_000;
const mem = new Map<string, CachedImage>();
const inFlight = new Map<string, Promise<ImageResult>>();

function cacheKey(fileId: string, vParam: string | null): string {
  return vParam ? `${fileId}::v=${vParam}` : fileId;
}

async function getImage(fileId: string, vParam: string | null): Promise<ImageResult> {
  const now = Date.now();
  const key = cacheKey(fileId, vParam);

  const cached = mem.get(key);
  if (cached && cached.exp > now) return { buf: cached.buf, contentType: cached.contentType };

  const running = inFlight.get(key);
  if (running) return running;

  const p: Promise<ImageResult> = (async () => {
    const drive = getDriveClient();

    const fileRes = await drive.files.get(
      { fileId, alt: "media", supportsAllDrives: true },
      { responseType: "stream" }
    );

    const headers = (fileRes as unknown as { headers?: Record<string, string | string[] | undefined> }).headers;
    const ctRaw = headers?.["content-type"];
    const contentType = Array.isArray(ctRaw) ? ctRaw[0] : (ctRaw ?? "image/jpeg");

    const buf = await streamToBuffer(fileRes.data as unknown as Readable);

    mem.set(key, { exp: now + MEM_TTL_MS, buf, contentType });
    return { buf, contentType };
  })().finally(() => {
    inFlight.delete(key);
  });

  inFlight.set(key, p);
  return p;
}

type DriveErrorPayload = { error?: { message?: string } };

export async function GET(req: NextRequest, ctx: { params: Promise<{ fileId: string }> }) {
  try {
    const { fileId } = await ctx.params;
    const cleanId = decodeURIComponent(fileId).trim();

    const url = new URL(req.url);
    const vParam = url.searchParams.get("v"); 
    const hasV = typeof vParam === "string" && vParam.length > 0;

    const { buf, contentType } = await getImage(cleanId, vParam);

    const body = new Uint8Array(buf);

    const cacheControl = hasV
      ? "public, max-age=31536000, immutable, s-maxage=31536000"
      : "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800";

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(buf.length),
        "Cache-Control": cacheControl,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e: unknown) {
    const apiMsg = (() => {
      const maybe = e as { response?: { data?: DriveErrorPayload } };
      return maybe.response?.data?.error?.message;
    })();

    console.error("API /api/drive error:", e);

    const msg =
      typeof apiMsg === "string"
        ? apiMsg
        : e instanceof Error
          ? e.message
          : "Unknown error";

    return NextResponse.json({ error: msg }, { status: 500 });
  }
}