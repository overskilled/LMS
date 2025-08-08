import { useState } from "react";
import {
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    increment,
} from "firebase/firestore";
import { db } from "@/firebase/config"; // your firebase client config export
import { toast } from "sonner"; // or your toast lib

export function useRecordAffiliateConversion() {
    const [loading, setLoading] = useState(false);

    /**
     * Records a conversion for an affiliate code on a course.
     * @param code Affiliate code
     * @param courseId Course ID
     * @param amount Transaction amount (number)
     */
    async function recordConversion(
        code: string,
        courseId: string,
        amount: number
    ) {
        setLoading(true);
        try {
            if (!code || !courseId || !amount) {
                // throw new Error("Missing data");
            }

            // TODO: affiliateRate should be fetched or configured on client
            // You might want to store it in Firestore or pass as param
            const affiliateRate = 0.2; // 20% default commission

            const affiliatesRef = collection(db, "courses", courseId, "affiliates");
            const q = query(affiliatesRef, where("code", "==", code));

            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                // throw new Error("Affiliate code not found");
            }

            const affiliateDoc = snapshot.docs[0];
            const commission = amount * affiliateRate;

            await updateDoc(
                doc(db, "courses", courseId, "affiliates", affiliateDoc.id),
                {
                    conversions: increment(1),
                    totalEarnings: increment(commission),
                    updatedAt: Date.now(),
                }
            );

            toast.success("Conversion recorded successfully");
            return { success: true };
        } catch (error: any) {
            // toast.error(error.message || "Failed to record conversion");
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    }

    return { recordConversion, loading };
}
