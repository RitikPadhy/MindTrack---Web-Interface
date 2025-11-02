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

export async function GET() {
  try {
    // ✅ Query all users with role = "Patient"
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("role", "==", "Patient").get();

    if (snapshot.empty) {
      return NextResponse.json(
        { message: "No patient userIds found", userIds: [] },
        { status: 200 }
      );
    }

    // ✅ Extract only userIds safely
    const userIds = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return typeof data.uid === "string" ? data.uid.trim() : null;
      })
      .filter((uid) => uid);

    return NextResponse.json({ total: userIds.length, userIds }, { status: 200 });
  } catch (error) {
    console.error("Error fetching patient userIds:", error);
    return NextResponse.json(
      { detail: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}