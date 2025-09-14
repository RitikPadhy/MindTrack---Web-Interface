import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// ✅ Initialize Firebase Admin only once
if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIAL)),
  });
}

const auth = getAuth();
const db = getFirestore();

export async function DELETE(req) {
  try {
    const { uid } = await req.json(); // target user to delete
    const token = req.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json({ detail: "Missing access token cookie" }, { status: 401 });
    }

    const currentUser = await auth.verifyIdToken(token);

    // Only admins can delete
    const adminSnap = await db.collection("users")
      .where("uid", "==", currentUser.uid)
      .limit(1)
      .get();

    if (adminSnap.empty) {
      return NextResponse.json({ detail: "User record not found" }, { status: 403 });
    }

    const adminData = adminSnap.docs[0].data();
    if (adminData.role !== "Admin") {
      return NextResponse.json({ detail: "Only Admins can delete users" }, { status: 403 });
    }

    // Delete target user
    try { await auth.deleteUser(uid); } catch {}
    const targetSnap = await db.collection("users").where("uid", "==", uid).get();
    targetSnap.forEach(doc => doc.ref.delete());

    return NextResponse.json({ message: `User ${uid} deleted successfully` }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ detail: err.message }, { status: 400 });
  }
}