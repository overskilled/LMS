import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { authMiddleware } from '@/lib/auth-middleware';
import { adminDB } from '@/firebase/admin';

export async function POST(req: NextRequest) {
    try {
        // 1️⃣ Authenticate the user
        const user = await authMiddleware(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log("uzer : ", user)
        console.log('auth header:', req.headers.get('authorization'));


        // 2️⃣ Extract courseId from request body
        const { courseId } = await req.json();
        if (!courseId) {
            return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
        }

        // 3️⃣ Check if user already has an affiliate code for this course
        const existingAffiliate = await adminDB
            .collection('courses')
            .doc(courseId)
            .collection('affiliates')
            .where('userId', '==', user.uid)
            .limit(1)
            .get();

        if (!existingAffiliate.empty) {
            const existingData = existingAffiliate.docs[0].data();
            return NextResponse.json({
                code: existingData.code,
                link: `${process.env.NEXT_PUBLIC_APP_URL}/course/${courseId}?ref=${existingData.code}`
            });
        }

        // 4️⃣ Generate a unique affiliate code and document ID
        const affiliateDocId = nanoid(); // Generate a random ID for the document
        const code = `${courseId}-${nanoid(5)}`.toUpperCase(); // Make code more readable

        // 5️⃣ Write to Firestore (Admin SDK)
        await adminDB
            .collection('courses')
            .doc(courseId)
            .collection('affiliates')
            .doc(affiliateDocId) // Use generated ID instead of user UID
            .set({
                id: affiliateDocId, // Store the generated ID as a field
                userId: user.uid,
                code,
                clicks: 0,
                conversions: 0,
                totalEarnings: 0,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });

        // 6️⃣ Return generated link
        const link = `${process.env.NEXT_PUBLIC_APP_URL}/course/${courseId}?ref=${code}`;

        return NextResponse.json({ code, link });
    } catch (error: any) {
        console.error('Affiliate generation error:', error);
        return NextResponse.json(
            { error: `Failed to generate affiliate code ${error.message}` },
            { status: 500 }
        );
    }
}