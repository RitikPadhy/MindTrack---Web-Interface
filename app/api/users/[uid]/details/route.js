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

/**
 * Helper: Normalizes a category string to match our known set.
 */
function normalizeCategory(cat) {
    if (!cat) return "Other";
    const categories = [
        "Care of Self",
        "Care of Others / Home",
        "Work or Education",
        "Leisure",
        "Rest or Sleep",
        "Social Participation"
    ];
    const normalized = cat.toLowerCase().replace(/[^a-z]/g, "");
    return categories.find(c => c.toLowerCase().replace(/[^a-z]/g, "") === normalized) || "Other";
}

/**
 * Helper: Formats "YYYY-MM-DD" from a Date object without timezone shift issues.
 */
function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export async function GET(req, { params }) {
    try {
        const { uid } = await params;

        if (!uid) {
            return NextResponse.json({ detail: "Missing uid" }, { status: 400 });
        }

        // 1. Fetch User Doc for startDate
        const userDocRef = db.collection("users").doc(uid);
        const userSnap = await userDocRef.get();

        if (!userSnap.exists) {
            return NextResponse.json({ detail: "User not found" }, { status: 404 });
        }

        const userData = userSnap.data();

        // Handle Firestore Timestamp or String
        let startDateValue = userData.startDate || userData.createdAt;
        if (startDateValue && typeof startDateValue.toDate === 'function') {
            startDateValue = startDateValue.toDate();
        }
        const startDateObj = new Date(startDateValue || Date.now());

        // 2. Fetch Routine Doc
        const routineDocRef = db.collection("daily_routines").doc(uid);
        const routineSnap = await routineDocRef.get();

        if (!routineSnap.exists) {
            console.log(`[API] User ${uid}: No daily_routines doc found.`);
            return NextResponse.json({ categoryData: [], weekData: [] });
        }

        const routineData = routineSnap.data();
        const tasksConfig = routineData.tasks || [];
        const routines = routineData.routines || {};

        console.log(`[API] User ${uid}: Found routines. Task config length: ${tasksConfig.length}`);

        const categories = [
            "Care of Self",
            "Care of Others / Home",
            "Work or Education",
            "Leisure",
            "Rest or Sleep",
            "Social Participation",
            "Other" // Added "Other" to catch uncategorized
        ];

        const totalCategoryMinutes = {};
        categories.forEach(c => totalCategoryMinutes[c] = 0);

        const weeks = [];

        // Iterate 4 weeks
        for (let w = 0; w < 4; w++) {
            const weekStart = new Date(startDateObj);
            weekStart.setDate(startDateObj.getDate() + (w * 7));

            let daysUsed = 0;
            let checkIns = 0;
            let activitiesTracked = 0;

            const weekCategoryMinutes = {};
            categories.forEach(c => weekCategoryMinutes[c] = 0);

            for (let d = 0; d < 7; d++) {
                const dayDate = new Date(weekStart);
                dayDate.setDate(weekStart.getDate() + d);
                const dateKey = formatDateKey(dayDate);

                const dayRoutine = routines[dateKey];
                if (dayRoutine) {
                    let dayActive = false;
                    const hoursList = Object.keys(dayRoutine).filter(k => k.includes(":00"));

                    for (const hour of hoursList) {
                        const hourData = dayRoutine[hour];
                        const slots = hourData?.slots || {};
                        const hourInt = parseInt(hour.split(":")[0]);
                        const hourIndex = hourInt - 6;

                        Object.values(slots).forEach((slotData) => {
                            if (slotData.filled === true || slotData === true) {
                                dayActive = true;
                                checkIns++;

                                // Determine Category
                                let cat = "Other";
                                if (hourIndex >= 0 && hourIndex < tasksConfig.length) {
                                    const taskIdx = slotData.taskIndex ?? 0;
                                    const config = tasksConfig[hourIndex];

                                    // Extract category from config based on taskIndex
                                    let rawCat = null;
                                    if (Array.isArray(config.items) && config.items[taskIdx]) {
                                        rawCat = config.items[taskIdx].category;
                                    } else if (Array.isArray(config.tasks) && config.tasks[taskIdx]) {
                                        rawCat = (typeof config.tasks[taskIdx] === 'object')
                                            ? config.tasks[taskIdx].category
                                            : null;
                                    }
                                    cat = normalizeCategory(rawCat);
                                }

                                weekCategoryMinutes[cat] += 15;
                                totalCategoryMinutes[cat] += 15;
                            }
                        });

                        // If any slot filled in this hour, increment activitiesTracked
                        if (Object.values(slots).some(s => s.filled || s === true)) {
                            activitiesTracked++;
                        }
                    }
                    if (dayActive) daysUsed++;
                }
            }

            const format = (mins) => {
                const h = Math.floor(mins / 60);
                const m = mins % 60;
                return `${h}h ${String(m).padStart(2, '0')}m`;
            };

            weeks.push({
                week: `Week ${w + 1}`,
                daysUsed,
                checkIns,
                activitiesTracked,
                selfCareTime: format(weekCategoryMinutes["Care of Self"]),
                othersHomeTime: format(weekCategoryMinutes["Care of Others / Home"]),
                workEduTime: format(weekCategoryMinutes["Work or Education"]),
                leisureTime: format(weekCategoryMinutes["Leisure"]),
                restSleepTime: format(weekCategoryMinutes["Rest or Sleep"]),
                socialTime: format(weekCategoryMinutes["Social Participation"]),
                comments: daysUsed > 0 ? `${daysUsed} days active` : "No data"
            });
        }

        const categoryData = categories.map(name => ({
            name,
            value: totalCategoryMinutes[name]
        }));

        console.log(`[API] Success for ${uid}. Total mins: ${Object.values(totalCategoryMinutes).reduce((a, b) => a + b, 0)}`);

        return NextResponse.json({ categoryData, weekData: weeks });

    } catch (error) {
        console.error("❌ Error in details API:", error);
        return NextResponse.json({ detail: error.message }, { status: 500 });
    }
}
