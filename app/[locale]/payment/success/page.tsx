// app/payment/success/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, ArrowRight, Mail } from "lucide-react";
import { CourseData } from "@/types/course"; // Adjust import path as needed
import { courseApi } from "@/utils/courseApi";

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    const courseId = searchParams.get("courseId");
    const amount = searchParams.get("amount");
    const currency = searchParams.get("currency");

    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            if (courseId) {
                try {
                    const response = await courseApi.getCourseById(courseId);
                    if (response.success && response.data) {
                        setCourse(response.data);
                    }
                } catch (error) {
                    console.error("Error fetching course:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchCourse();

        // Track conversion or enrollment here
        if (orderId && courseId) {
            trackPurchase(orderId, courseId, amount, currency);
        }
    }, [courseId, orderId, amount, currency]);

    const trackPurchase = async (orderId: string, courseId: string, amount: string | null, currency: string | null) => {
        // Implement your purchase tracking logic here
        console.log("Tracking purchase:", { orderId, courseId, amount, currency });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="container mx-auto px-4 max-w-2xl">
                {/* Success Icon */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Payment Successful!</h1>
                    <p className="text-muted-foreground">
                        Thank you for your purchase. You now have access to the course.
                    </p>
                </div>

                {/* Order Summary */}
                <div className="bg-card border rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                    <div className="space-y-3">
                        {orderId && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Order ID</span>
                                <span className="font-medium">{orderId}</span>
                            </div>
                        )}

                        {course && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Course</span>
                                <span className="font-medium">{course.title}</span>
                            </div>
                        )}

                        {amount && currency && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Amount Paid</span>
                                <span className="font-medium">
                                    {currency} {parseFloat(amount).toFixed(2)}
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <span className="font-medium text-green-600">Completed</span>
                        </div>
                    </div>
                </div>

                {/* Next Steps */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                    <h2 className="text-lg font-semibold mb-4">What's Next?</h2>
                    <ul className="space-y-3">
                        <li className="flex items-start">
                            <Mail className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                            <span>Check your email for a receipt and course access instructions</span>
                        </li>
                        <li className="flex items-start">
                            <Download className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                            <span>You can access the course from your learning dashboard</span>
                        </li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button asChild className="flex-1">
                        <Link href={`/course/${courseId}/learn`}>
                            Start Learning <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>

                    <Button variant="outline" asChild className="flex-1">
                        <Link href="/dashboard">
                            Go to Dashboard
                        </Link>
                    </Button>
                </div>

                {/* Support Info */}
                <div className="mt-8 text-center text-sm text-muted-foreground">
                    <p>Need help? Contact our support team at support@yourplatform.com</p>
                </div>
            </div>
        </div>
    );
}