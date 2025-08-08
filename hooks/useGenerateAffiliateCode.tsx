import { getFirestore, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { nanoid } from "nanoid";

export const generateAffiliateCodeClientSide = async (courseId: string) => {
    const auth = getAuth();
    const db = getFirestore();
    const user = auth.currentUser;

    if (!user) throw new Error("User not logged in");

    // 1. Check existing affiliate for this user & course
    const q = query(
        collection(db, "courses", courseId, "affiliates"),
        where("userId", "==", user.uid)
    );

    const existingSnapshot = await getDocs(q);

    if (!existingSnapshot.empty) {
        // Return existing code/link
        const existing = existingSnapshot.docs[0].data();
        return {
            code: existing.code,
            link: `${process.env.NEXT_PUBLIC_APP_URL}/course/${courseId}?ref=${existing.code}`,
        };
    }

    // 2. Generate new affiliate code
    const code = `${courseId}-${nanoid(5)}`.toUpperCase();

    // 3. Add new affiliate doc
    await addDoc(collection(db, "courses", courseId, "affiliates"), {
        userId: user.uid,
        code,
        clicks: 0,
        conversions: 0,
        totalEarnings: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    });

    return {
        code,
        link: `${process.env.NEXT_PUBLIC_APP_URL}/course/${courseId}?ref=${code}`,
    };
};
