import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  const base64 = process.env.FIREBASE_ADMIN_CREDENTIAL_BASE64;
  initializeApp({
    credential: cert(
      JSON.parse(Buffer.from(base64, "base64").toString("utf8"))
    ),
  });
}

const db = getFirestore();

const ALLOWED_CATEGORIES = [
  "Care of Self",
  "Care of others/Home",
  "Work or Education",
  "Leisure",
  "Rest or Sleep",
  "Social participation",
];

export async function PATCH(req) {
  try {
    const { uid, tasks } = await req.json();

    if (!uid || typeof tasks !== "object") {
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
    const currentTasks =
      Array.isArray(data.tasks) && data.tasks.length === 17
        ? data.tasks
        : Array.from({ length: 17 }, () => ({ items: [] }));

    for (const [index, items] of Object.entries(tasks)) {
      const idx = Number(index);
      if (idx < 0 || idx >= 17 || !Array.isArray(items)) continue;

      const cleaned = items
        .slice(0, 2)
        .filter(
          (i) =>
            i.title &&
            i.category &&
            ALLOWED_CATEGORIES.includes(i.category)
        )
        .map((i) => ({
          title: i.title.trim(),
          category: i.category,
        }));

      currentTasks[idx] = { items: cleaned };
    }

    await ref.update({
      tasks: currentTasks,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: "Updated" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { detail: "Server error" },
      { status: 500 }
    );
  }
}