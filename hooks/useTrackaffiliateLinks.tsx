import { useState } from "react";
import { collection, query, where, getDocs, updateDoc, doc, increment } from "firebase/firestore";
import { auth, db } from "@/firebase/config"; // adjust the path as needed
import { toast } from "sonner";

export function useTrackAffiliateClickClient() {
    const [loading, setLoading] = useState(false);

    async function trackClick(code: string, courseId: string) {
        setLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("User must be logged in to track clicks");
            }

            const [courseFromCode, _randomCode] = code.split("-");
            if (courseFromCode !== courseId) {
                throw new Error("Invalid code for this course");
            }

            const affiliatesRef = collection(db, "courses", courseId, "affiliates");
            const q = query(affiliatesRef, where("code", "==", code));

            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                throw new Error("Affiliate code not found");
            }

            const affiliateDoc = snapshot.docs[0];

            await updateDoc(doc(db, "courses", courseId, "affiliates", affiliateDoc.id), {
                clicks: increment(1),
                updatedAt: Date.now(),
            });

            // toast.success("Click tracked successfully");
            return { success: true };
        } catch (error: any) {
            // toast.error(error.message || "Failed to track click");
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    }

    return { trackClick, loading };
}
