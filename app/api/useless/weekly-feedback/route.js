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

/* ---------------- PATCH: Update Weekly Feedback ---------------- */
export async function PATCH(req) {
  try {
    const { uid, week_number, energy_levels, satisfaction, happiness, proud_of_achievements, how_busy, feedback_text } = await req.json();

    if (
      !uid ||
      !week_number ||
      week_number < 1 ||
      week_number > 4 ||
      energy_levels === undefined ||
      satisfaction === undefined ||
      happiness === undefined ||
      proud_of_achievements === undefined ||
      how_busy === undefined
    ) {
      return NextResponse.json(
        { detail: "Invalid payload" },
        { status: 400 }
      );
    }

    // ✅ Fetch the user's weekly feedback doc
    const ref = db.collection("weekly_feedback").doc(uid);
    const snap = await ref.get();

    // If doc doesn't exist, create it
    if (!snap.exists) {
      await ref.set({
        uid,
        weeks: {
          "1": {},
          "2": {},
          "3": {},
          "4": {},
        },
        createdAt: new Date().toISOString(),
      });
    }

    // Build update object
    const updateData= {};
    updateData[`weeks.${week_number}`] = {
      energy_levels: Number(energy_levels),
      satisfaction: Number(satisfaction),
      happiness: Number(happiness),
      proud_of_achievements: Number(proud_of_achievements),
      how_busy: Number(how_busy),
      feedback_text: feedback_text || "",
    };

    await ref.update(updateData);

    return NextResponse.json({
      message: `Week ${week_number} feedback updated successfully for user ${uid}`,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { detail: "Server error" },
      { status: 500 }
    );
  }
}