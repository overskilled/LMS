"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { courseApi } from "@/utils/courseApi";
import PayPalButton from "@/components/custom/PayPalButton/PayPalButton";

function Message({ content }: { content: any }) {
    return <p className="my-4 text-center">{content}</p>;
}

export default function PayPalPaymentPage() {
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const params = useParams();
    const courseId = params.id as string;

    // Helper function to format price
    const formatPrice = (price: number, currency: string) => {
        if (price === 0) return "Free";
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0
        }).format(price);
    };

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await courseApi.getCourseById(courseId);
                if (response.success && response.data) {
                    setCourse(response.data);
                } else {
                    setError(response.message || "Failed to load course details");
                }
            } catch (err) {
                setError("An error occurred while fetching course details");
                console.error("Error fetching course:", err);
            } finally {
                setLoading(false);
            }
        };

        if (courseId) fetchCourse();
        else {
            setError("Course ID is missing from the URL");
            setLoading(false);
        }
    }, [courseId]);

    if (loading) {
        return (
            <div className="container mx-auto p-6 max-w-2xl">
                <Skeleton className="h-8 w-1/3 mb-6" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6 max-w-2xl">
                <h1 className="text-2xl font-bold mb-6">Checkout</h1>
                <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="container mx-auto p-6 max-w-2xl">
                <h1 className="text-2xl font-bold mb-6">Checkout</h1>
                <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
                    <p>Course not found</p>
                </div>
            </div>
        );
    }

    const pricing = course.aboutCourse.pricing;

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <h1 className="text-2xl font-bold mb-6">Checkout</h1>

            {/* Course Summary */}
            <div className="bg-card border rounded-lg p-4 mb-6">
                <h2 className="text-xl font-semibold mb-2">{course.aboutCourse.title}</h2>
                <p className="text-muted-foreground mb-4">{course.aboutCourse.shortDescription}</p>

                {/* Pricing display */}
                {pricing && (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900">XAF:</span>
                            <span className="text-xl font-semibold text-gray-900">
                                {formatPrice(pricing.xafPrice, "XAF")}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900">USD:</span>
                            <span className="text-xl font-semibold text-gray-900">
                                {formatPrice(pricing.usdPrice, "USD")}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900">EUR:</span>
                            <span className="text-xl font-semibold text-gray-900">
                                {formatPrice(pricing.euroPrice, "EUR")}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* PayPal Button */}
            <div className="paypal-button-container">
                <PayPalButton amount={pricing.usdPrice} courseId={courseId} description={course.aboutCourse.title} />
            </div>
        </div>
    );
}
