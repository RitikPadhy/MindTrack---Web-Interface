import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIAL)),
  });
}

const auth = getAuth();

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const token = req.cookies.access_token;
  if (!token) return res.status(401).json({ detail: "Missing access token cookie" });

  try {
    const user = await auth.verifyIdToken(token);
    res.status(200).json({ uid: user.uid, email: user.email });
  } catch (err) {
    res.status(401).json({ detail: "Invalid or expired token" });
  }
}