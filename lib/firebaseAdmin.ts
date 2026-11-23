import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import type { NextRequest } from "next/server";

function stripWrappingQuotes(value: string | undefined): string {
  if (!value) return "";
  let s = value.trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

function normalizePrivateKey(value: string | undefined): string {
  let key = stripWrappingQuotes(value);
  // Handle literal \n or double-escaped \\n pasted into Vercel env UI
  key = key.replace(/\\\\n/g, "\n").replace(/\\n/g, "\n").replace(/\r\n/g, "\n");
  return key;
}

function getAdminConfig() {
  const projectId = stripWrappingQuotes(
    process.env.FIREBASE_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
  const clientEmail = stripWrappingQuotes(process.env.FIREBASE_CLIENT_EMAIL);
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  return { projectId, clientEmail, privateKey };
}

export function isFirebaseAdminConfigured(): boolean {
  const { projectId, clientEmail, privateKey } = getAdminConfig();
  return Boolean(projectId && clientEmail && privateKey);
}

let lastInitError: string | null = null;

function getAdminApp(): App | null {
  if (!isFirebaseAdminConfigured()) {
    lastInitError = null;
    return null;
  }

  if (getApps().length > 0) {
    return getApps()[0];
  }

  const { projectId, clientEmail, privateKey } = getAdminConfig();
  try {
    const app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    lastInitError = null;
    return app;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[firebaseAdmin] Failed to initialize Firebase Admin:", msg);
    lastInitError =
      "Erreur d'initialisation Firebase Admin (vérifiez FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL et FIREBASE_PROJECT_ID dans Vercel).";
    return null;
  }
}

export function getAdminDb(): Firestore | null {
  const app = getAdminApp();
  if (!app) return null;
  const databaseId = stripWrappingQuotes(process.env.FIREBASE_DATABASE_ID);
  return databaseId ? getFirestore(app, databaseId) : getFirestore(app);
}

export function formatFirestoreError(err: unknown, fallback: string): string {
  const e = err as { code?: number | string; message?: string };
  const msg = String(e?.message ?? "");
  if (
    e?.code === 5 ||
    msg.includes("NOT_FOUND") ||
    msg.includes("does not exist")
  ) {
    return "Base de données Firestore introuvable : ouvrez Firebase Console → Firestore Database → Créer une base de données (mode Production, ID '(default)').";
  }
  if (
    e?.code === 7 ||
    msg.includes("PERMISSION_DENIED") ||
    msg.includes("Cloud Firestore API")
  ) {
    return "Accès Firestore refusé ou API Cloud Firestore non activée dans Firebase Console.";
  }
  return fallback;
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
      error:
        lastInitError ||
        "Firebase Admin n'est pas encore configuré sur le serveur (vérifiez les variables d'environnement Vercel puis redéployez).",
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
    const decoded = await auth.verifyIdToken(token, true);
    const email = (decoded.email ?? "").toLowerCase();

    const allowedEmails = stripWrappingQuotes(process.env.ADMIN_EMAILS)
      .split(",")
      .map((e) => stripWrappingQuotes(e).toLowerCase())
      .filter(Boolean);

    const isAllowed =
      decoded.admin === true ||
      (email.length > 0 && allowedEmails.includes(email));

    if (!isAllowed) {
      return {
        error: `Accès administrateur refusé pour ${email || "cet utilisateur"} (vérifiez ADMIN_EMAILS dans Vercel).`,
        status: 403,
      };
    }

    return { user: { uid: decoded.uid, email } };
  } catch (err) {
    console.error("[verifyAdminRequest] Token verification failed:", err);
    return { error: "Session expirée ou invalide.", status: 401 };
  }
}
