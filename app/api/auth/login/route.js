import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`;

    const { data } = await axios.post(url, {
      email,
      password,
      returnSecureToken: true,
    });

    // Set secure HttpOnly cookie
    const res = NextResponse.json(data, { status: 200 });
    res.cookies.set("access_token", data.idToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: Number(data.expiresIn), // Firebase expiresIn is in seconds
    });

    return res;
  } catch (err) {
    return NextResponse.json(
      { detail: err.response?.data || err.message },
      { status: 400 }
    );
  }
}
