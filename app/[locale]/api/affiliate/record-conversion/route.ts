import { NextRequest, NextResponse } from "next/server";
import { adminDB } from "@/firebase/admin";
import admin from "firebase-admin";

export async function POST(req: NextRequest) {
    try {
        const { code, courseId, amount } = await req.json();

        if (!code || !courseId || !amount) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        const courseDoc = await adminDB.collection("courses").doc(courseId).get();

        if (!courseDoc.exists) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        const courseData = courseDoc.data()?.courseDatails;
        const affiliateRate = courseData?.affiliateRate ?? 0.2; // Default to 20% if not defined

        const affiliatesRef = adminDB
            .collection("courses")
            .doc(courseId)
            .collection("affiliates");

        const snapshot = await affiliatesRef.where("code", "==", code).get();

        if (!snapshot.empty) {
            const doc = snapshot.docs[0];

            const commission = amount * affiliateRate;

            await doc.ref.update({
                conversions: admin.firestore.FieldValue.increment(1),
                totalEarnings: admin.firestore.FieldValue.increment(commission),
                updatedAt: Date.now(),
            });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Record conversion error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
