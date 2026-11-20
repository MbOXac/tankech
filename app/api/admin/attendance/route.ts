import { NextRequest, NextResponse } from "next/server";
import { FieldValue, type Timestamp } from "firebase-admin/firestore";
import { getAdminDb, verifyAdminRequest } from "@/lib/firebaseAdmin";
import {
  ATTENDANCE_MULTIPLIER,
  type AttendanceRecord,
  type AttendanceStatus,
} from "@/lib/types";

const ALLOWED_STATUSES: AttendanceStatus[] = [
  "present",
  "demi_journee",
  "absent",
  "conge",
];

function toIso(value: unknown): string {
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as Timestamp).toDate().toISOString();
  }
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

export async function GET(request: NextRequest) {
  const authResult = await verifyAdminRequest(request);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: "Firestore n'est pas configuré." },
      { status: 503 }
    );
  }

  const date = request.nextUrl.searchParams.get("date");
  const month = request.nextUrl.searchParams.get("month"); // YYYY-MM

  try {
    let query: FirebaseFirestore.Query = db.collection("attendance");

    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      query = query.where("date", "==", date);
    } else if (month && /^\d{4}-\d{2}$/.test(month)) {
      query = query
        .where("date", ">=", `${month}-01`)
        .where("date", "<=", `${month}-31`);
    } else {
      query = query.limit(500);
    }

    const snap = await query.get();
    const records: AttendanceRecord[] = snap.docs.map((doc) => {
      const d = doc.data();
      const rawStatus = String(d.status ?? "present") as AttendanceStatus;
      return {
        id: doc.id,
        date: String(d.date ?? ""),
        workerId: String(d.workerId ?? ""),
        workerName: String(d.workerName ?? ""),
        chantierId: String(d.chantierId ?? ""),
        chantierName: String(d.chantierName ?? ""),
        status: ALLOWED_STATUSES.includes(rawStatus) ? rawStatus : "present",
        dailyRate: Math.max(0, Number(d.dailyRate) || 0),
        amount: Math.max(0, Number(d.amount) || 0),
        notes: String(d.notes ?? ""),
        updatedAt: toIso(d.updatedAt),
      };
    });

    return NextResponse.json({ records });
  } catch (err) {
    console.error("[GET /api/admin/attendance]", err);
    return NextResponse.json(
      { error: "Impossible de charger le pointage." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await verifyAdminRequest(request);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: "Firestore n'est pas configuré." },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as {
      date?: string;
      workerId?: string;
      workerName?: string;
      chantierId?: string;
      chantierName?: string;
      status?: AttendanceStatus;
      dailyRate?: number;
      notes?: string;
    };

    const date = String(body.date ?? "").trim();
    const workerId = String(body.workerId ?? "").trim();
    const status = body.status;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !workerId) {
      return NextResponse.json(
        { error: "Date (YYYY-MM-DD) et ouvrier requis." },
        { status: 400 }
      );
    }

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Statut de pointage invalide." },
        { status: 400 }
      );
    }

    const dailyRate = Math.max(0, Number(body.dailyRate) || 0);
    const amount = Math.round(dailyRate * ATTENDANCE_MULTIPLIER[status] * 100) / 100;
    const docId = `${date}_${workerId}`;

    await db
      .collection("attendance")
      .doc(docId)
      .set(
        {
          date,
          workerId,
          workerName: String(body.workerName ?? "").trim().slice(0, 120),
          chantierId: String(body.chantierId ?? "").trim().slice(0, 128),
          chantierName: String(body.chantierName ?? "").trim().slice(0, 150),
          status,
          dailyRate,
          amount,
          notes: String(body.notes ?? "").trim().slice(0, 500),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    return NextResponse.json({ ok: true, id: docId, amount });
  } catch (err) {
    console.error("[POST /api/admin/attendance]", err);
    return NextResponse.json(
      { error: "Impossible d'enregistrer le pointage." },
      { status: 500 }
    );
  }
}
