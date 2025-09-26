import {
    collection,
    doc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp,
    DocumentData,
    QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/firebase/config";

// Base API response interface
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message: string;
    errors?: string[];
}

// Dashboard summary metrics
export interface DashboardSummary {
    totalCourses: number;
    activeEnrollments: number;
    totalRevenue: number;
    affiliateRevenue: number;
    conversionRate: number;
}

// Course performance data
export interface CoursePerformance {
    id: string;
    title: string;
    enrollments: number;
    revenue?: number;
    completion: number;
    target: number;
    affiliatePercentage: number;
    thumbnailUrl?: string;
    createdAt: Date;
}

// Enrollment trend data
export interface EnrollmentTrend {
    month: string;
    enrollments: number;
}

// Affiliate performance data
export interface AffiliatePerformance {
    id: string;
    name: string;
    clicks: number;
    conversions: number;
    earnings: number;
    conversionRate: number;
    userId: string;
    lastActive: Date;
}

// User distribution data
export interface UserDistribution {
    students: number;
    admins: number;
    instructors: number;
}

// Recent activity data
export interface RecentActivity {
    id: string;
    type: "course" | "enrollment" | "affiliate" | "completion" | "sales";
    title: string;
    timestamp: Date;
    userId?: string;
    courseId?: string;
    affiliateId?: string;
}

export const dashboardApi = {
    // Get summary metrics for dashboard
    getSummaryMetrics: async (): Promise<ApiResponse<DashboardSummary>> => {
        try {
            const [coursesSnapshot, usersSnapshot, affiliatesSnapshot, transactionsSnapshot] = await Promise.all([
                getDocs(collection(db, "courses")),
                getDocs(collection(db, "users")),
                getDocs(collection(db, "affiliates")),
                getDocs(collection(db, "transactions")),
            ]);

            // Initialize totals
            let totalRevenue = 0;
            let enrollments = 0;
            let affiliateRevenue = 0;

            // Step 1: Calculate totals from completed transactions
            transactionsSnapshot.forEach((doc) => {
                const tx = doc.data();
                const amount = tx.amount || 0;
                const status = tx.status;

                if (status === "completed") {
                    totalRevenue += amount;   // ✅ add only completed revenue
                    enrollments += 1;         // ✅ count only completed enrollments
                }
            });




            affiliatesSnapshot.forEach((doc) => {
                const affiliateData = doc.data();
                affiliateRevenue += affiliateData.totalEarnings || 0;
            });



            // Calculate conversion rate from affiliates
            let totalClicks = 0;
            let totalConversions = 0;
            affiliatesSnapshot.forEach((doc) => {
                const affiliateData = doc.data();
                totalClicks += affiliateData.clicks || 0;
                totalConversions += affiliateData.conversions || 0;
            });

            const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

            const summary: DashboardSummary = {
                totalCourses: coursesSnapshot.size,
                activeEnrollments: enrollments,
                totalRevenue,
                affiliateRevenue,
                conversionRate: parseFloat(conversionRate.toFixed(1)),
            };

            return {
                success: true,
                message: "Summary metrics retrieved successfully",
                data: summary,
            };
        } catch (error) {
            console.error("Error fetching summary metrics:", error);
            return {
                success: false,
                message: "Failed to fetch summary metrics",
                errors: ["FIRESTORE_ERROR"],
            };
        }
    },

    // Get course performance data
    getCoursePerformance: async (limitCount = 5): Promise<ApiResponse<CoursePerformance[]>> => {
        try {


            const [coursesSnapshot, transactionsSnapshot] = await Promise.all([
                getDocs(query(collection(db, "courses"), orderBy("publishedAt", "desc"))),
                getDocs(query(collection(db, "transactions"), orderBy("updatedAt", "desc"))),
            ]);


            // Use a dictionary (map) for revenues
            const revenueByCourse: Record<string, number> = {};

            // Collect transactions revenue grouped by courseId
            transactionsSnapshot.forEach((doc: any) => {
                const data = doc.data();
                const courseId = data.courseId; // adjust if the field differs
                const amount = data.amount || 0;
                const status = data.status;

                // Only accumulate completed transactions
                if (!courseId || status !== "completed") return;



                if (!revenueByCourse[courseId]) {
                    revenueByCourse[courseId] = 0;
                }
                revenueByCourse[courseId] += amount;
            });

            const statsByCourse: Record<string, { revenue: number; enrollments: number }> = {};

            // Step 1: Aggregate from completed transactions
            transactionsSnapshot.forEach((doc: any) => {
                const data = doc.data();
                const courseId = data.courseId; // adjust if field differs
                const amount = data.amount || 0;
                const status = data.status;

                if (!courseId || status !== "completed") return;

                if (!statsByCourse[courseId]) {
                    statsByCourse[courseId] = { revenue: 0, enrollments: 0 };
                }

                statsByCourse[courseId].revenue += amount;
                statsByCourse[courseId].enrollments += 1; // each completed transaction = 1 enrollment
            });


            // Build CoursePerformance[] array
            const courses: CoursePerformance[] = [];

            coursesSnapshot.forEach((doc: any) => {
                const data = doc.data();
                const courseId = doc.id;

                courses.push({
                    id: courseId,
                    title: data.aboutCourse?.title || "Untitled Course",
                    enrollments: statsByCourse[courseId]?.enrollments || 0,
                    revenue: revenueByCourse[courseId] || 0,
                    completion: calculateCompletionRate(data),
                    target: data.aboutCourse?.metrics?.targetRevenue || 0,
                    affiliatePercentage: calculateAffiliatePercentage(data),
                    thumbnailUrl: data.thumbnailImage?.downloadURL,
                    createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
                });
            });


            return {
                success: true,
                message: "Course performance data retrieved",
                data: courses,
            };
        } catch (error) {
            console.error("Error fetching course performance:", error);
            return {
                success: false,
                message: "Failed to fetch course performance",
                errors: ["FIRESTORE_ERROR"],
            };
        }
    },

    // Get enrollment trends
    getEnrollmentTrends: async (months = 6): Promise<ApiResponse<EnrollmentTrend[]>> => {
        try {
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

            const trends: EnrollmentTrend[] = []

            const [transactionsSnapShot] = await Promise.all([
                // getDocs(query(collection(db, "courses"), orderBy("publishedAt", "desc"))),
                // getDocs(query(collection(db, "affiliates"), orderBy("updatedAt", "desc"))),
                getDocs(query(collection(db, "transactions"), orderBy("updatedAt", "desc"))),
            ])

            // Create a map { monthIndex: count }
            const monthlyCounts: Record<number, number> = {}

            transactionsSnapShot.forEach((doc) => {
                const data = doc.data()

                if (data.status === "completed" && data.updatedAt) {
                    const ts = data.updatedAt.toDate() as Date
                    const monthIndex = ts.getMonth()

                    monthlyCounts[monthIndex] = (monthlyCounts[monthIndex] || 0) + 1
                }
            })

            // Convert map → trends array
            Object.entries(monthlyCounts).forEach(([monthIndex, count]) => {
                const idx = parseInt(monthIndex, 10)
                const data = new Date()

                trends.push({
                    month: monthNames[idx],
                    enrollments: count
                })
            })





            return {
                success: true,
                message: "Enrollment trends retrieved",
                data: trends,
            };
        } catch (error) {
            console.error("Error fetching enrollment trends:", error);
            return {
                success: false,
                message: "Failed to fetch enrollment trends",
                errors: ["FIRESTORE_ERROR"],
            };
        }
    },

    // Get affiliate performance data
    getAffiliatePerformance: async (limitCount = 5): Promise<ApiResponse<AffiliatePerformance[]>> => {
        try {
            const q = query(
                collection(db, "affiliates"),
                orderBy("conversions", "desc"),
                limit(limitCount)
            );

            const querySnapshot = await getDocs(q);
            const affiliates: AffiliatePerformance[] = [];

            for (const affiliateDoc of querySnapshot.docs) {
                const data = affiliateDoc.data();
                const userDoc = await getDoc(doc(db, "users", data.userId));

                const userData = userDoc.data() || {};
                const userName = userData.name || "Unknown Affiliate";

                affiliates.push({
                    id: affiliateDoc.id,
                    name: userName,
                    clicks: data.clicks || 0,
                    conversions: data.conversions || 0,
                    earnings: data.totalEarnings || 0,
                    conversionRate: data.clicks ? (data.conversions / data.clicks) * 100 : 0,
                    userId: data.userId,
                    lastActive: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
                });
            }

            return {
                success: true,
                message: "Affiliate performance data retrieved",
                data: affiliates,
            };
        } catch (error) {
            console.error("Error fetching affiliate performance:", error);
            return {
                success: false,
                message: "Failed to fetch affiliate performance",
                errors: ["FIRESTORE_ERROR"],
            };
        }
    },

    // Get user distribution data
    getUserDistribution: async (): Promise<ApiResponse<UserDistribution>> => {
        try {
            const usersQuery = query(collection(db, "users"));
            const snapshot = await getDocs(usersQuery);

            let students = 0;
            let admins = 0;
            let instructors = 0;

            snapshot.forEach((doc) => {
                const data = doc.data();
                if (data.admin) {
                    admins++;
                } else if (data.instructor) {
                    instructors++;
                } else {
                    students++;
                }
            });

            return {
                success: true,
                message: "User distribution retrieved",
                data: {
                    students,
                    admins,
                    instructors,
                },
            };
        } catch (error) {
            console.error("Error fetching user distribution:", error);
            return {
                success: false,
                message: "Failed to fetch user distribution",
                errors: ["FIRESTORE_ERROR"],
            };
        }
    },

    // Get recent activities
    getRecentActivities: async (limitCount = 10): Promise<ApiResponse<RecentActivity[]>> => {
        try {
            const [coursesSnapshot, affiliatesSnapshot, transactionsSnapShot] = await Promise.all([
                getDocs(query(collection(db, "courses"), orderBy("publishedAt", "desc"), limit(Math.floor(limitCount / 2)))),
                getDocs(query(collection(db, "affiliates"), orderBy("updatedAt", "desc"), limit(Math.floor(limitCount / 2)))),
                getDocs(query(collection(db, "transactions"), orderBy("updatedAt", "desc"), limit(Math.floor(limitCount / 2)))),
            ]);


            const activities: RecentActivity[] = [];

            // Add course publications
            coursesSnapshot.forEach((doc) => {
                const data = doc.data();
                activities.push({
                    id: doc.id,
                    type: "course",
                    title: `New course published: ${data.aboutCourse.title}`,
                    timestamp: data.publishedAt?.toDate?.() || new Date(data.publishedAt),
                    courseId: doc.id,
                });
            });

            // Add affiliate activities
            affiliatesSnapshot.forEach((doc) => {
                const data = doc.data();
                activities.push({
                    id: doc.id,
                    type: "affiliate",
                    title: `Affiliate generated $${data.totalEarnings || 0} in sales`,
                    timestamp: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
                    affiliateId: doc.id,
                    userId: data.userId,
                });
            });

            // transaction activity
            transactionsSnapShot.forEach((doc) => {
                const data = doc.data()
                activities.push({
                    id: doc.id,
                    type: "sales",
                    title: `Sales alert: ${data.userName} made a purchase request for the course ${data.courseTitle} of ${data.amount} with number ${data.phoneNumber} and it ended up being ${data.status}`,
                    timestamp: data.updatedAt?.toDate?.() || new Date(data.updatedAt)
                })
            })

            // Sort by timestamp
            activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

            return {
                success: true,
                message: "Recent activities retrieved",
                data: activities.slice(0, limitCount),
            };
        } catch (error) {
            console.error("Error fetching recent activities:", error);
            return {
                success: false,
                message: "Failed to fetch recent activities",
                errors: ["FIRESTORE_ERROR"],
            };
        }
    },

    // Get all courses with affiliate subcollection data
    getCoursesWithAffiliates: async (): Promise<ApiResponse<any[]>> => {
        try {
            const coursesQuery = query(collection(db, "courses"));
            const coursesSnapshot = await getDocs(coursesQuery);
            const courses: any[] = [];

            for (const courseDoc of coursesSnapshot.docs) {
                const courseData = courseDoc.data();
                const affiliatesQuery = query(collection(db, `courses/${courseDoc.id}/affiliates`));
                const affiliatesSnapshot = await getDocs(affiliatesQuery);
                const affiliates: any[] = [];

                affiliatesSnapshot.forEach((affiliateDoc) => {
                    affiliates.push({
                        id: affiliateDoc.id,
                        ...affiliateDoc.data(),
                    });
                });

                courses.push({
                    id: courseDoc.id,
                    ...courseData,
                    affiliates,
                });
            }

            return {
                success: true,
                message: "Courses with affiliates retrieved",
                data: courses,
            };
        } catch (error) {
            console.error("Error fetching courses with affiliates:", error);
            return {
                success: false,
                message: "Failed to fetch courses with affiliates",
                errors: ["FIRESTORE_ERROR"],
            };
        }
    },

    // Update course metrics (for testing/demo purposes)
    updateCourseMetrics: async (
        courseId: string,
        updates: {
            enrollmentCount?: number;
            revenue?: number;
        }
    ): Promise<ApiResponse> => {
        try {
            const courseRef = doc(db, "courses", courseId);
            await updateDoc(courseRef, {
                ...updates,
                updatedAt: serverTimestamp(),
            });

            return {
                success: true,
                message: "Course metrics updated",
            };
        } catch (error) {
            console.error("Error updating course metrics:", error);
            return {
                success: false,
                message: "Failed to update course metrics",
                errors: ["FIRESTORE_ERROR"],
            };
        }
    },

    // Update affiliate metrics (for testing/demo purposes)
    updateAffiliateMetrics: async (
        courseId: string,
        affiliateId: string,
        updates: {
            clicks?: number;
            conversions?: number;
            totalEarnings?: number;
        }
    ): Promise<ApiResponse> => {
        try {
            const affiliateRef = doc(db, `courses/${courseId}/affiliates`, affiliateId);
            await updateDoc(affiliateRef, {
                ...updates,
                updatedAt: serverTimestamp(),
            });

            return {
                success: true,
                message: "Affiliate metrics updated",
            };
        } catch (error) {
            console.error("Error updating affiliate metrics:", error);
            return {
                success: false,
                message: "Failed to update affiliate metrics",
                errors: ["FIRESTORE_ERROR"],
            };
        }
    },
};

// Helper functions
function calculateCompletionRate(courseData: DocumentData): number {
    return Math.floor(Math.random() * 26) + 70;
}

function calculateAffiliatePercentage(courseData: DocumentData): number {
    return Math.floor(Math.random() * 31) + 20;
}