import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// ✅ Initialize Firebase Admin only once
if (!getApps().length) {
  try {
    const base64String = process.env.FIREBASE_ADMIN_CREDENTIAL_BASE64;
    
    // Check if the environment variable is set
    if (!base64String) {
      throw new Error("FIREBASE_ADMIN_CREDENTIAL_BASE64 environment variable is not set.");
    }
    
    // Decode the Base64 string to a JSON string
    const serviceAccountJson = Buffer.from(base64String, 'base64').toString('utf8');
    
    // Parse the JSON string into a JavaScript object
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
