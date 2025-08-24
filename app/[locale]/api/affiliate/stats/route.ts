import { NextRequest, NextResponse } from "next/server";
import { adminDB } from "@/firebase/admin";
import { authMiddleware } from "@/lib/auth-middleware";

export async function POST(req: NextRequest) {
    try {
        const user = await authMiddleware(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userId = user.uid;

        const coursesSnapshot = await adminDB.collection("courses").get();
        const results = [];

        for (const courseDoc of coursesSnapshot.docs) {
            const courseId = courseDoc.id;
            const courseData = courseDoc.data();

            const affiliateQuery = await adminDB
                .collection(`courses/${courseId}/affiliates`)
                .where("userId", "==", userId)
                .limit(1)
                .get();

            if (!affiliateQuery.empty) {
                const affiliateData = affiliateQuery.docs[0].data();
                results.push({
                    courseId,
                    title: courseData.title,
                    thumbnail: courseData.thumbnail || null,
                    stats: affiliateData,
                });
            }
        }

        return NextResponse.json({ stats: results });
    } catch (err) {
        console.error("Affiliate stats error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
