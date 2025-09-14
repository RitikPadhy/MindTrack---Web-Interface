import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// ✅ Initialize Firebase Admin only once
if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIAL)),
  });
}

const auth = getAuth();

export async function GET(req) {
  const token = req.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ detail: "Missing access token cookie" }, { status: 401 });
  }

  try {
    const user = await auth.verifyIdToken(token);
    return NextResponse.json({ uid: user.uid, email: user.email }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ detail: "Invalid or expired token" }, { status: 401 });
  }
}