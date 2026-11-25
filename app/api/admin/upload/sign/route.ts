import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/firebaseAdmin";

function cleanEnv(value: string | undefined): string {
  if (!value) return "";
  const s = value.trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    return s.slice(1, -1).trim();
  }
  return s;
}

const ALLOWED_FOLDERS = new Set([
  "tankech/services",
  "tankech/projects",
  "tankech/chantiers",
]);

export async function POST(request: NextRequest) {
  const authResult = await verifyAdminRequest(request);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  const cloudName = cleanEnv(process.env.CLOUDINARY_CLOUD_NAME);
  const apiKey = cleanEnv(process.env.CLOUDINARY_API_KEY);
  const apiSecret = cleanEnv(process.env.CLOUDINARY_API_SECRET);

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({
      configured: false,
      error:
        "Cloudinary n'est pas encore configuré (ajoutez CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET dans .env.local / Vercel).",
    });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      folder?: string;
    };
    const requestedFolder = String(body.folder ?? "tankech/projects").trim();
    const folder = ALLOWED_FOLDERS.has(requestedFolder)
      ? requestedFolder
      : "tankech/projects";

    const timestamp = Math.floor(Date.now() / 1000);
    // Cloudinary signed upload string (alphabetical parameter order)
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = crypto
      .createHash("sha1")
      .update(`${paramsToSign}${apiSecret}`)
      .digest("hex");

    return NextResponse.json({
      configured: true,
      cloudName,
      apiKey,
      folder,
      timestamp,
      signature,
    });
  } catch (err) {
    console.error("[POST /api/admin/upload/sign]", err);
    return NextResponse.json(
      { error: "Impossible de préparer l'envoi d'image." },
      { status: 500 }
    );
  }
}
