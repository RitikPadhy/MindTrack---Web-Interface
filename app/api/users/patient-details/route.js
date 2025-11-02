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
    // ✅ Fetch all users with role = "Patient"
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("role", "==", "Patient").get();

    if (snapshot.empty) {
      return NextResponse.json(
        { message: "No patients found", patients: [] },
        { status: 200 }
      );
    }

    // ✅ Extract only required fields
    const patients = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        uid: data.uid || "",
        name: data.name || "",
        diagnosis: data.diagnosis || "",
        age: data.age || null,
        startDate: data.startDate || "",
        lastLogin: data.lastLogin || "",
        weekNo: data.weekNo || "",
        status: data.status || "",
      };
    });

    return NextResponse.json({ total: patients.length, patients }, { status: 200 });
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { detail: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}