import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// ✅ Initialize Firebase Admin only once
if (!getApps().length) {
  try {
    const base64String = process.env.FIREBASE_ADMIN_CREDENTIAL_BASE64;

    // Log the value to the console during the build process
    console.log("Base64 string from environment:", typeof base64String, base64String ? "Exists" : "Does not exist");

    if (!base64String) {
      throw new Error("Environment variable is not set.");
    }
    
    const serviceAccountJson = Buffer.from(base64String, 'base64').toString('utf8');
    const serviceAccount = JSON.parse(serviceAccountJson);

    initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error);
    throw new Error("Failed to initialize Firebase Admin SDK. Check your environment variables.");
  }
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
