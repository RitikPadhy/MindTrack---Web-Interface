import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// ✅ Initialize Firebase Admin only once
if (!getApps().length) {
  try {
    const base64String = process.env.FIREBASE_ADMIN_CREDENTIAL_BASE64;
    if (!base64String) {
      throw new Error("Missing FIREBASE_ADMIN_CREDENTIAL_BASE64");
    }

    const serviceAccountJson = Buffer.from(
      base64String,
      "base64"
    ).toString("utf8");

    const serviceAccount = JSON.parse(serviceAccountJson);

    initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error);
  }
}

const db = getFirestore();

export async function PATCH(req) {
  try {
    const { uid, tasks } = await req.json();

    // ✅ Validate request body
    if (!uid || !tasks || typeof tasks !== "object") {
      return NextResponse.json(
        { detail: "Missing or invalid fields: uid, tasks (object expected)" },
        { status: 400 }
      );
    }

    const docRef = db.collection("daily_routines").doc(uid);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { detail: `No routine found for user ${uid}` },
        { status: 404 }
      );
    }

    const routineData = docSnap.data();

    // Ensure we always work with a 17-slot array
    const currentTasks =
      Array.isArray(routineData.tasks) && routineData.tasks.length === 17
        ? routineData.tasks
        : Array.from({ length: 17 }, () => ({ titles: [] }));

    // ✅ REPLACE titles per slot (NOT merge)
    for (const [index, newTask] of Object.entries(tasks)) {
      const idx = Number(index);

      if (Number.isNaN(idx) || idx < 0 || idx >= 17) continue;

      const cleanedTitles = Array.isArray(newTask?.titles)
        ? newTask.titles
            .filter((t) => typeof t === "string")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      // 🔁 Replace entire slot
      currentTasks[idx] = {
        titles: cleanedTitles,
      };
    }

    // ✅ Persist update
    await docRef.update({
      tasks: currentTasks,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        message: "Tasks updated successfully",
        updatedSlots: Object.keys(tasks),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating tasks:", error);
    return NextResponse.json(
      { detail: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}