import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { authMiddleware } from '@/lib/auth-middleware';
import { adminDB } from '@/firebase/admin'; // ✅ Use Admin SDK here

export async function POST(req: NextRequest) {
    try {
        // 1️⃣ Authenticate the user
        const user = await authMiddleware(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2️⃣ Extract courseId from request body
        const { courseId } = await req.json();
        if (!courseId) {
            return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
        }

        // 3️⃣ Generate a unique affiliate code
        const code = `${courseId}-${nanoid(5)}`;

        // 4️⃣ Write to Firestore (Admin SDK)
        await adminDB
            .collection('courses')
            .doc(courseId)
            .collection('affiliates')
            .doc(user.uid)
            .set(
                {
                    userId: user.uid,
                    code,
                    clicks: 0,
                    conversions: 0,
                    totalEarnings: 0,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
                { merge: true }
            );

        // 5️⃣ Return generated link
        const link = `${process.env.NEXT_PUBLIC_APP_URL}/course/${courseId}?ref=${code}`;

        return NextResponse.json({ code, link });
    } catch (error) {
        console.error('Affiliate generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate affiliate code' },
            { status: 500 }
        );
    }
}
