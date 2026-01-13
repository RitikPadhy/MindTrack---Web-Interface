import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import bcrypt from "bcryptjs";

/* ---------------------------------------------------
   Firebase Admin Initialization (Singleton)
--------------------------------------------------- */
if (!getApps().length) {
  try {
    const base64String = process.env.FIREBASE_ADMIN_CREDENTIAL_BASE64;
    if (!base64String) throw new Error("Missing FIREBASE_ADMIN_CREDENTIAL_BASE64");

    const serviceAccountJson = Buffer.from(base64String, "base64").toString("utf8");
    const serviceAccount = JSON.parse(serviceAccountJson);

    initializeApp({ credential: cert(serviceAccount) });
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Admin SDK:", error);
  }
}

const auth = getAuth();
const db = getFirestore();

/* ---------------------------------------------------
   Helper: Generate 4-Week Routine
--------------------------------------------------- */
function generateFourWeekRoutine(createdAt) {
  const routineData = {};
  const startDate = new Date(createdAt);

  const hoursList = Array.from({ length: 17 }, (_, i) => `${String(6 + i).padStart(2, "0")}:00`);

  for (let dayOffset = 0; dayOffset < 28; dayOffset++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + dayOffset);

    const dateKey = currentDate.toISOString().split("T")[0];
    routineData[dateKey] = {};

    for (const hour of hoursList) {
      const slots = {};

      for (let i = 0; i < 60; i += 15) {
        const [h] = hour.split(":");
        const slot = `${h}:${String(i).padStart(2, "0")}`;
        slots[slot] = { filled: false, task: null };
      }

      routineData[dateKey][hour] = { slots };
    }
  }

  return routineData;
}

/* ---------------------------------------------------
   Helper: Assign task to first available slot
--------------------------------------------------- */
function assignTaskToHourSlots(hourSlots, task) {
  for (const slot in hourSlots) {
    if (!hourSlots[slot].filled) {
      hourSlots[slot].filled = true;
      hourSlots[slot].task = task;
      return slot;
    }
  }
  throw new Error("No free slots available in this hour");
}

/* ---------------------------------------------------
   Helper: Create Patient Routine
--------------------------------------------------- */
async function createPatientRoutine(uid, role, createdAt) {
  const routineData = generateFourWeekRoutine(createdAt);

  const routineDoc = {
    uid,
    role,
    createdAt,
    routines: routineData,
  };

  await db.collection("daily_routines").doc(uid).set(routineDoc);
  console.log(`✅ Routine created for patient ${uid}`);
}

/* ---------------------------------------------------
   API: Create User (NO EMAIL)
--------------------------------------------------- */
export async function POST(req) {
  try {
    const { uid, name, gender, role, diagnosis, age, startDate, weekNo, status } = await req.json();

    if (!uid || !name) {
      return NextResponse.json({ detail: "Missing required fields: uid, name" }, { status: 400 });
    }

    const userRole = role?.trim() || "Patient";
    const createdAt = new Date().toISOString();

    const existing = await db.collection("users").doc(uid).get();
    if (existing.exists) {
      return NextResponse.json({ detail: `User with UID ${uid} already exists` }, { status: 400 });
    }

    // Create Firebase Auth user
    await auth.createUser({ uid, displayName: name });

    const passwordHash = await bcrypt.hash("Password123", 10);

    const userData = {
      uid,
      name,
      gender: gender || "",
      role: userRole,
      diagnosis: diagnosis || "",
      age: age ?? null,
      startDate: startDate || createdAt,
      lastLogin: null,
      weekNo: weekNo ?? 1,
      status: status || "Active",
      createdAt,
      passwordHash,
    };

    await db.collection("users").doc(uid).set(userData);

    // Auto-create routine for patients
    if (userRole.toLowerCase() === "patient") {
      await createPatientRoutine(uid, userRole, createdAt);
    }

    return NextResponse.json({ message: "User created successfully", user: userData }, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating user:", error);
    return NextResponse.json({ detail: error.message || "Internal server error" }, { status: 500 });
  }
}