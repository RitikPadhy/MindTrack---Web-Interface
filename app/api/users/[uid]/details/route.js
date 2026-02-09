import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

/* ---------------------------------------------------
   Firebase Admin Initialization (Singleton)
--------------------------------------------------- */
if (!getApps().length) {
    try {
        const base64String = process.env.FIREBASE_ADMIN_CREDENTIAL_BASE64;
        if (base64String) {
            const serviceAccount = JSON.parse(
                Buffer.from(base64String, "base64").toString("utf8")
            );
            initializeApp({
                credential: cert(serviceAccount),
            });
        }
    } catch (error) {
        console.error("❌ Failed to initialize Firebase Admin SDK:", error);
    }
}

const db = getFirestore();

export async function GET(req, { params }) {
    try {
        const { uid } = await params;

        if (!uid) {
            return NextResponse.json(
                { detail: "Missing uid" },
                { status: 400 }
            );
        }

        // 1. Fetch User Doc for startDate
        const userDocRef = db.collection("users").doc(uid);
        const userSnap = await userDocRef.get();

        if (!userSnap.exists) {
            return NextResponse.json(
                { detail: "User not found" },
                { status: 404 }
            );
        }
        const userData = userSnap.data();
        const startDateStr = userData.startDate || userData.createdAt;

        // 2. Fetch Routine Doc
        const routineDocRef = db.collection("daily_routines").doc(uid);
        const routineSnap = await routineDocRef.get();

        if (!routineSnap.exists) {
            // Return empty structure if no routine found
            return NextResponse.json({
                categoryDist: [],
                weekData: []
            });
        }

        const routineData = routineSnap.data();
        const tasksConfig = routineData.tasks || []; // Array of 17 items (hours)
        const routines = routineData.routines || {}; // keyed by YYYY-MM-DD

        // -------------------------------------------------------
        // Calculate Stats
        // -------------------------------------------------------

        // Map hour index (0..16) -> Category Name
        // tasksConfig[i] = { items: [ { title, category } ] }
        const hourToCategory = {};
        for (let i = 0; i < 17; i++) {
            const hourStr = String(6 + i).padStart(2, "0") + ":00"; // "06:00", "07:00"...
            const taskItem = tasksConfig[i]?.items?.[0];
            if (taskItem?.category) {
                hourToCategory[hourStr] = taskItem.category;
            }
        }

        // Categories
        const categories = [
            "Care of Self",
            "Care of Others / Home",
            "Work or Education",
            "Leisure",
            "Rest or Sleep",
            "Social Participation"
        ];

        // Initialize counters
        // key: category, value: total minutes
        const categoryMinutes = {};
        categories.forEach(c => categoryMinutes[c] = 0);

        // Week Data
        // We want 4 weeks starting from startDate
        const startDate = new Date(startDateStr);
        const weeks = [];

        // Helper to format duration
        const formatDuration = (mins) => {
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            return `${h}h ${String(m).padStart(2, '0')}m`;
        };

        // Iterate 4 weeks
        for (let w = 0; w < 4; w++) {
            const weekStart = new Date(startDate);
            weekStart.setDate(startDate.getDate() + (w * 7));

            // Per-week stats
            let daysUsed = 0;
            let checkIns = 0; // total filled slots
            // Activities tracked? maybe unique tasks filled? Let's just count total filled slots for now as 'Activities'
            // or sum of filled hours.
            // Let's us 'Activities Tracked' as number of hours that had at least one slot filled.
            let activitiesTracked = 0;

            const weekCategoryMinutes = {};
            categories.forEach(c => weekCategoryMinutes[c] = 0);

            // Iterate 7 days of this week
            for (let d = 0; d < 7; d++) {
                const currentDay = new Date(weekStart);
                currentDay.setDate(weekStart.getDate() + d);
                const dateKey = currentDay.toISOString().split("T")[0];

                const dayRoutine = routines[dateKey];
                if (dayRoutine) {
                    let dayHasActivity = false;

                    // Iterate hours 06:00 to 22:00
                    const hoursList = Object.keys(dayRoutine).filter(k => k.includes(":00"));

                    for (const hour of hoursList) {
                        const hourData = dayRoutine[hour];
                        const slots = hourData?.slots || {};
                        const category = hourToCategory[hour]; // Category for this HOUR

                        if (!category) continue;

                        // Standardize category name from DB to match ours if needed
                        // The DB has "Care of others/Home" vs UI "Care of Others / Home"
                        // We'll normalize broadly
                        let normalizedCat = categories.find(c => c.toLowerCase().replace(/[^a-z]/g, "") === category.toLowerCase().replace(/[^a-z]/g, "")) || "Other";
                        if (normalizedCat === "Other") continue; // Skip unknown

                        let filledSlotsInHour = 0;
                        Object.values(slots).forEach(s => {
                            if (s.filled || s === true) { // handle {filled: true} or just true
                                filledSlotsInHour++;
                            }
                        });

                        if (filledSlotsInHour > 0) {
                            dayHasActivity = true;
                            activitiesTracked++; // Count this hour as 'tracked'
                            checkIns += filledSlotsInHour; // Granular slots

                            const mins = filledSlotsInHour * 15;
                            weekCategoryMinutes[normalizedCat] += mins;
                            categoryMinutes[normalizedCat] += mins; // Add to global total
                        }
                    }

                    if (dayHasActivity) daysUsed++;
                }
            }

            weeks.push({
                week: `Week ${w + 1}`,
                daysUsed,
                checkIns,
                activitiesTracked,
                selfCareTime: formatDuration(weekCategoryMinutes["Care of Self"]),
                othersHomeTime: formatDuration(weekCategoryMinutes["Care of Others / Home"]),
                workEduTime: formatDuration(weekCategoryMinutes["Work or Education"]),
                leisureTime: formatDuration(weekCategoryMinutes["Leisure"]),
                restSleepTime: formatDuration(weekCategoryMinutes["Rest or Sleep"]),
                socialTime: formatDuration(weekCategoryMinutes["Social Participation"]),
                comments: daysUsed > 0 ? "Data recorded" : "No data"
            });
        }

        // Actually re-map to ensure all categories exist in logic
        const finalCategoryData = categories.map(name => ({
            name,
            value: categoryMinutes[name]
        }));

        return NextResponse.json({
            categoryData: finalCategoryData,
            weekData: weeks
        });

    } catch (error) {
        console.error("❌ Error fetching user details:", error);
        return NextResponse.json(
            { detail: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
