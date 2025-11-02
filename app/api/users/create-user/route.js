import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
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

const auth = getAuth();
const db = getFirestore();

// ----------------- Helper: Generate 4-week Routine -----------------
function generateFourWeekRoutine(createdAt) {
  const routineData = {};
  const startDate = new Date(createdAt);
  const hoursList = Array.from({ length: 17 }, (_, i) => `${(6 + i).toString().padStart(2, "0")}:00`);

  for (let dayOffset = 0; dayOffset < 28; dayOffset++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + dayOffset);
    const dateKey = currentDate.toISOString().split("T")[0];
    routineData[dateKey] = {};

    for (const hour of hoursList) {
      const slots = {};
      for (let i = 0; i < 60; i += 15) {
        const [h, m] = hour.split(":").map(Number);
        const slot = `${String(h).padStart(2, "0")}:${String(i).padStart(2, "0")}`;
        slots[slot] = { filled: false };
      }
      routineData[dateKey][hour] = { slots };
    }
  }

  return routineData;
}

// ----------------- Helper: Create Patient Routine -----------------
async function createPatientRoutine(uid, email, role, createdAt) {
  const routineData = generateFourWeekRoutine(createdAt);
  const tasksArray = Array.from({ length: 17 }, () => ({ tasks: [] }));

  const routineDoc = {
    uid,
    email,
    role,
    createdAt,
    routines: routineData,
    tasks: tasksArray,
  };

  await db.collection("daily_routines").doc(uid).set(routineDoc);
  console.log(`✅ Routine created for patient ${uid}`);
}

// ----------------- Main API: Create User -----------------
export async function POST(req) {
  try {
    const {
      uid,
      email,
      password,
      name,
      gender,
      role,
      diagnosis,
      age,
      startDate,
      weekNo,
      status,
    } = await req.json();

    // ✅ Validation
    if (!uid || !email || !name) {
      return NextResponse.json(
        { detail: "Missing required fields: uid, email, name" },
        { status: 400 }
      );
    }

    // ✅ Default values
    const userRole = role?.trim() || "Patient";
    const userPassword = password?.trim() || "Password123";

    // ✅ Check if UID already exists in Firestore
    const existing = await db.collection("users").doc(uid).get();
    if (existing.exists) {
      return NextResponse.json(
        { detail: `User with UID ${uid} already exists` },
        { status: 400 }
      );
    }

    // ✅ Create Firebase user (use custom UID)
    const userRecord = await auth.createUser({
      uid,
      email,
      password: userPassword,
      displayName: name,
    });

    // ✅ Prepare Firestore user data
    const createdAt = new Date().toISOString();
    const userData = {
      uid,
      email,
      name,
      gender: gender || "",
      role: userRole,
      diagnosis: diagnosis || "",
      age: age || null,
      startDate: startDate || createdAt,
      lastLogin: null,
      weekNo: weekNo || 1,
      status: status || "Active",
      createdAt,
    };

    // ✅ Add to Firestore
    await db.collection("users").doc(uid).set(userData);

    // ✅ Automatically create routine if patient
    if (userRole.toLowerCase() === "patient") {
      await createPatientRoutine(uid, email, userRole, createdAt);
    }

    return NextResponse.json(
      { message: "User created successfully", user: userData },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { detail: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}