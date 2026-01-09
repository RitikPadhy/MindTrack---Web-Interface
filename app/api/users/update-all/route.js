import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

/* ---------------- Firebase Init ---------------- */
if (!getApps().length) {
  const base64 = process.env.FIREBASE_ADMIN_CREDENTIAL_BASE64;
  initializeApp({
    credential: cert(
      JSON.parse(Buffer.from(base64, "base64").toString("utf8"))
    ),
  });
}

const db = getFirestore();

/* ---------------- PATCH: Update full day ---------------- */
export async function PATCH(req) {
  try {
    const { uid, date, filled } = await req.json();

    if (!uid || !date || typeof filled !== "boolean") {
      return NextResponse.json(
        { detail: "Invalid payload" },
        { status: 400 }
      );
    }

    const ref = db.collection("daily_routines").doc(uid);
    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json(
        { detail: "User not found" },
        { status: 404 }
      );
    }

    const data = snap.data();
    const dayRoutine = data?.routines?.[date];

    if (!dayRoutine) {
      return NextResponse.json(
        { detail: "Routine not found for given date" },
        { status: 404 }
      );
    }

    /* Build Firestore update paths */
    const updateData = {};

    for (const [hour, hourData] of Object.entries(dayRoutine)) {
      const slots = hourData?.slots || {};
      for (const slot of Object.keys(slots)) {
        updateData[
          `routines.${date}.${hour}.slots.${slot}.filled`
        ] = filled;
      }
    }

    await ref.update(updateData);

    return NextResponse.json({
      message: `All slots for ${date} updated`,
      filled,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { detail: "Server error" },
      { status: 500 }
    );
  }
}