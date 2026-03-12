import { PilotDTO } from "@/types/types";
import { google } from "googleapis";

function getDriveClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_JSON in .env.local");

  const credentials = JSON.parse(raw);

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  return google.drive({ version: "v3", auth });
}

const PILOTS_TTL_MS = 10 * 60_000; // 10 min (si può alzare a 1h)
const pilotsMem = new Map<string, { exp: number; data: PilotDTO[] }>();
const pilotsInFlight = new Map<string, Promise<PilotDTO[]>>();

export async function getPilotsFromDrive(rootFolderId: string): Promise<PilotDTO[]> {
  const now = Date.now();

  const cached = pilotsMem.get(rootFolderId);
  if (cached && cached.exp > now) return cached.data;

  const running = pilotsInFlight.get(rootFolderId);
  if (running) return running;

  const p: Promise<PilotDTO[]> = (async () => {
    const drive = getDriveClient();

    const foldersRes = await drive.files.list({
      q: `'${rootFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "files(id,name)",
      pageSize: 200,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const folders = foldersRes.data.files ?? [];

    const pilots: PilotDTO[] = await Promise.all(
      folders.map(async (f): Promise<PilotDTO> => {
        const folderId = f.id ?? "";
        const folderName = f.name ?? "Unknown";

        if (!folderId) {
          return { id: "", name: folderName, photoFileId: undefined, photoVersion: undefined };
        }

        const imgRes = await drive.files.list({
          q: `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`,
          fields: "files(id,modifiedTime,md5Checksum)",
          orderBy: "modifiedTime desc",
          pageSize: 1,
          supportsAllDrives: true,
          includeItemsFromAllDrives: true,
        });

        const photo = (imgRes.data.files ?? [])[0];

        const photoFileId = photo?.id ?? undefined;

        const photoVersion: string | undefined =
          photo?.md5Checksum ??
          (photo?.modifiedTime ? String(Date.parse(photo.modifiedTime)) : undefined);

        return {
          id: folderId,
          name: folderName,
          photoFileId,
          photoVersion,
        };
      })
    );

    const cleaned = pilots
      .filter((p) => p.id) 
      .sort((a, b) => a.name.localeCompare(b.name, "it"));

    pilotsMem.set(rootFolderId, { exp: now + PILOTS_TTL_MS, data: cleaned });
    return cleaned;
  })().finally(() => {
    pilotsInFlight.delete(rootFolderId);
  });

  pilotsInFlight.set(rootFolderId, p);
  return p;
}

export async function getRacesFromDrive(folderId: string): Promise<{ id: string; photoUrl: string }[]> {
  const drive = getDriveClient();

  const res = await drive.files.list({
    q: `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`,
    fields: "files(id, name)",
    pageSize: 50,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  const files = res.data.files ?? [];

  return files.map((f) => ({
    id: f.id!,
    photoUrl: `/api/drive/${f.id}`,
  }));
}
