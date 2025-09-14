import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// ✅ Initialize Firebase Admin only once
if (!getApps().length) {
  const base64String = process.env.FIREBASE_ADMIN_CREDENTIAL_BASE64;
  const serviceAccountJson = Buffer.from(base64String, 'base64').toString('utf8');
  const serviceAccount = JSON.parse(serviceAccountJson);
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const auth = getAuth();

export async function POST(req) {
  try {
    const { uid } = await req.json();

    // Revoke all refresh tokens for the user (forces logout everywhere)
    await auth.revokeRefreshTokens(uid);

    // Clear cookie
    const res = NextResponse.json({ message: `User ${uid} logged out` }, { status: 200 });
    res.cookies.set("access_token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 0, // Expire immediately
    });

    return res;
  } catch (err) {
    return NextResponse.json({ detail: err.message }, { status: 400 });
  }
}
