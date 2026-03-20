import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin only once
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

const db = getFirestore();

export async function GET() {
  try {
    // Fetch all users from the users collection
    const usersSnapshot = await db.collection("users").get();

    if (usersSnapshot.empty) {
      return NextResponse.json(
        { message: "No users found", data: [] },
        { status: 200 }
      );
    }

    const userCategoriesData = [];

    // Process each user
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const uid = userData.uid || userDoc.id;

      // Fetch the user's daily routines document
      const routineDoc = await db.collection("daily_routines").doc(uid).get();

      const categoriesSet = new Set();

      if (routineDoc.exists) {
        const routineData = routineDoc.data();
        const tasks = routineData.tasks || [];

        // Extract categories from tasks array
        for (const task of tasks) {
          if (task.items && Array.isArray(task.items)) {
            for (const item of task.items) {
              if (item.category) {
                categoriesSet.add(item.category);
              }
            }
          }
        }
      }

      // Add user data with their categories
      userCategoriesData.push({
        uid: uid,
        name: userData.name || "Unknown",
        email: userData.email || "",
        role: userData.role || "",
        categories: Array.from(categoriesSet).sort(),
        totalCategories: categoriesSet.size,
      });
    }

    return NextResponse.json(
      {
        message: "Successfully fetched activity categories for all users",
        totalUsers: userCategoriesData.length,
        data: userCategoriesData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching activity categories:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch activity categories",
        error: error.message || "Internal server error"
      },
      { status: 500 }
    );
  }
}
