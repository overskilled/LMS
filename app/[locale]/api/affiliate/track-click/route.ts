import { NextRequest, NextResponse } from "next/server";
import { adminDB } from "@/firebase/admin";
import admin from "firebase-admin";

export async function POST(req: NextRequest) {
    try {
        const { code, courseId } = await req.json();

        const [course, randomCode] = code.split("-");
        if (course !== courseId) {
            return NextResponse.json({ error: "Invalid code" }, { status: 400 });
        }

        const affiliatesRef = adminDB
            .collection("courses")
            .doc(courseId)
            .collection("affiliates");

        const snapshot = await affiliatesRef.where("code", "==", code).get();

        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            await doc.ref.update({
                clicks: admin.firestore.FieldValue.increment(1),
                updatedAt: Date.now(),
            });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Track click error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
