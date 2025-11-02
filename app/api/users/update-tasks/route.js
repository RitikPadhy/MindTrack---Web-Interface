import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// ✅ Initialize Firebase Admin only once
if (!getApps().length) {
  try {
    const base64String = process.env.FIREBASE_ADMIN_CREDENTIAL_BASE64;
    const serviceAccountJson = Buffer.from(base64String, "base64").toString("utf8");
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

    // ✅ Validate
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
    const currentTasks = routineData.tasks || Array.from({ length: 17 }, () => ({ titles: [] }));

    // ✅ Merge titles for each task slot (0–16)
    for (const [index, newTask] of Object.entries(tasks)) {
      const idx = parseInt(index, 10);
      if (idx >= 0 && idx < 17 && newTask?.titles?.length) {
        // Ensure it's an array of strings
        const newTitles = newTask.titles.filter(t => typeof t === "string" && t.trim() !== "");
        if (newTitles.length > 0) {
          const existingTitles = currentTasks[idx]?.titles || [];
          // Merge & remove duplicates
          const mergedTitles = Array.from(new Set([...existingTitles, ...newTitles]));
          currentTasks[idx] = { titles: mergedTitles };
        }
      }
    }

    // ✅ Update in Firestore
    await docRef.update({
      tasks: currentTasks,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json(
      { message: "Tasks updated successfully", updatedSlots: Object.keys(tasks) },
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