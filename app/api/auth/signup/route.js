import { NextResponse } from "next/server";
import admin from "firebase-admin";
import serviceAccount from "@/serviceAccountKey.json";

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export async function POST(req) {
  try {
    const { uid, email, password, role } = await req.json();

    // Limit total users
    const usersSnapshot = await db.collection("users").get();
    if (usersSnapshot.size >= 33) {
      return NextResponse.json({ detail: "User limit reached (max 33 users allowed)" }, { status: 400 });
    }

    // Check UID/email existence
    try { await admin.auth().getUser(uid); return NextResponse.json({ detail: "UID already exists" }, { status: 400 }); } catch {}
    try { await admin.auth().getUserByEmail(email); return NextResponse.json({ detail: "Email already exists" }, { status: 400 }); } catch {}

    // Create user in Firebase Auth
    const user = await admin.auth().createUser({ uid, email, password });

    // Add user to Firestore
    const docRef = await db.collection("users").add({ uid, email, role, createdAt: admin.firestore.FieldValue.serverTimestamp() });

    return NextResponse.json({ uid: user.uid, email, role, doc_id: docRef.id });

  } catch (err) {
    return NextResponse.json({ detail: err.message }, { status: 400 });
  }
}