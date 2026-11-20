import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import type { NextRequest } from "next/server";

function getAdminConfig() {
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  return { projectId, clientEmail, privateKey };
}

export function isFirebaseAdminConfigured(): boolean {
  const { projectId, clientEmail, privateKey } = getAdminConfig();
  return Boolean(projectId && clientEmail && privateKey);
}

function getAdminApp(): App | null {
  if (!isFirebaseAdminConfigured()) return null;

  if (getApps().length > 0) {
    return getApps()[0];
  }

  const { projectId, clientEmail, privateKey } = getAdminConfig();
  return initializeApp({
    credential: cert({
      projectId: projectId!,
      clientEmail: clientEmail!,
      privateKey: privateKey!,
    }),
  });
}

export function getAdminDb(): Firestore | null {
  const app = getAdminApp();
  if (!app) return null;
  return getFirestore(app);
}

export function getAdminAuth(): Auth | null {
  const app = getAdminApp();
  if (!app) return null;
  return getAuth(app);
}

export interface AdminUser {
  uid: string;
  email: string;
}

export async function verifyAdminRequest(
  request: NextRequest
): Promise<{ user: AdminUser } | { error: string; status: number }> {
  const auth = getAdminAuth();
  if (!auth) {
    return {
      error: "Firebase Admin n'est pas encore configuré sur le serveur.",
      status: 503,
    };
  }

  const header = request.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return { error: "Authentification requise.", status: 401 };
  }

  const token = header.slice(7).trim();
  if (!token) {
    return { error: "Token invalide.", status: 401 };
  }

  try {
    const decoded = await auth.verifyIdToken(token);
    const email = (decoded.email ?? "").toLowerCase();

    const allowedEmails = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const isAllowed =
      decoded.admin === true ||
      (email.length > 0 && allowedEmails.includes(email));

    if (!isAllowed) {
      return { error: "Accès administrateur refusé.", status: 403 };
    }

    return { user: { uid: decoded.uid, email } };
  } catch {
    return { error: "Session expirée ou invalide.", status: 401 };
  }
}
