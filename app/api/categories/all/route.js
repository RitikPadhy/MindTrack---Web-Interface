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
        { message: "No users found", categories: [] },
        { status: 200 }
      );
    }

    const allCategoriesSet = new Set();
    const categoryUserCount = {}; // Track how many users use each category

    // Process each user
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const uid = userData.uid || userDoc.id;

      // Fetch the user's daily routines document
      const routineDoc = await db.collection("daily_routines").doc(uid).get();

      if (routineDoc.exists) {
        const routineData = routineDoc.data();
        const tasks = routineData.tasks || [];

        const userCategories = new Set();

        // Extract categories from tasks array
        for (const task of tasks) {
          if (task.items && Array.isArray(task.items)) {
            for (const item of task.items) {
              if (item.category) {
                allCategoriesSet.add(item.category);
                userCategories.add(item.category);
              }
            }
          }
        }

        // Count users per category
        for (const category of userCategories) {
          categoryUserCount[category] = (categoryUserCount[category] || 0) + 1;
        }
      }
    }

    // Create detailed category list with usage stats
    const categoriesWithStats = Array.from(allCategoriesSet)
      .map(category => ({
        category: category,
        userCount: categoryUserCount[category] || 0,
      }))
      .sort((a, b) => b.userCount - a.userCount); // Sort by most used

    return NextResponse.json(
      {
        message: "Successfully fetched all activity categories",
        totalCategories: allCategoriesSet.size,
        totalUsers: usersSnapshot.size,
        categories: Array.from(allCategoriesSet).sort(),
        categoriesWithStats: categoriesWithStats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching all categories:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch categories",
        error: error.message || "Internal server error"
      },
      { status: 500 }
    );
  }
}
