"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase/config";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { useAuth } from "@/context/authContext";

interface AggregatedStats {
    totalClicks: number;
    totalConversions: number;
    totalEarnings: number;
    lastConversionDate: number | null;
}

export function useAffiliateStats() {
    const [stats, setStats] = useState<AggregatedStats>({
        totalClicks: 0,
        totalConversions: 0,
        totalEarnings: 0,
        lastConversionDate: null,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { user } = useAuth();

    useEffect(() => {
        async function fetchAggregatedStats() {
            if (!user) {
                setLoading(false);
                setError("User not authenticated");
                return;
            }

            try {
                setLoading(true);
                setError(null);

                let totalClicks = 0;
                let totalConversions = 0;
                let totalEarnings = 0;
                let lastConversionDate: number | null = null;

                const coursesSnapshot = await getDocs(collection(db, "courses"));

                for (const courseDoc of coursesSnapshot.docs) {
                    const courseId = courseDoc.id;
                    const affiliatesRef = collection(db, `courses/${courseId}/affiliates`);
                    const affiliateQuery = query(
                        affiliatesRef,
                        where("userId", "==", user.uid),
                        limit(1)
                    );

                    const affiliateSnapshot = await getDocs(affiliateQuery);

                    if (!affiliateSnapshot.empty) {
                        const affiliateData = affiliateSnapshot.docs[0].data();

                        totalClicks += affiliateData.clicks || 0;
                        totalConversions += affiliateData.conversions || 0;
                        totalEarnings += affiliateData.totalEarnings || 0;

                        if (
                            affiliateData.conversions > 0 &&
                            affiliateData.updatedAt &&
                            (!lastConversionDate || affiliateData.updatedAt > lastConversionDate)
                        ) {
                            lastConversionDate = affiliateData.updatedAt;
                        }
                    }
                }

                setStats({
                    totalClicks,
                    totalConversions,
                    totalEarnings,
                    lastConversionDate,
                });
            } catch (err: any) {
                console.error("Error fetching affiliate stats:", err);
                setError(err.message || "Error fetching affiliate stats");
            } finally {
                setLoading(false);
            }
        }

        if (user) {
            fetchAggregatedStats();
        }
    }, [user]);

    return { stats, loading, error, user };
}
