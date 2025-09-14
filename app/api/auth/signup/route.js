import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { initializeApp, getApps, cert } from "firebase-admin/app";

// Initialize Firebase Admin only once
if (!getApps().length) {
  try {
    const base64String = process.env.FIREBASE_ADMIN_CREDENTIAL_BASE64;
    const serviceAccountJson = Buffer.from(base64String, 'base64').toString('utf8');
    const serviceAccount = JSON.parse(serviceAccountJson);
    initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error);
  }
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