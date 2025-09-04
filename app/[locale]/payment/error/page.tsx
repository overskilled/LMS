// app/payment/error/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft } from "lucide-react";

export default function PaymentErrorPage() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
    const courseId = searchParams.get("courseId");

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="container mx-auto px-4 max-w-2xl">
                {/* Error Icon */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="h-10 w-10 text-red-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Payment Failed</h1>
                    <p className="text-muted-foreground">
                        We encountered an issue processing your payment.
                    </p>
                </div>

                {/* Error Details */}
                <div className="bg-card border rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Error Details</h2>
                    <p className="text-muted-foreground mb-4">
                        {error || "An unknown error occurred during payment processing."}
                    </p>
                    <p className="text-sm">
                        Please try again or use a different payment method. If the problem persists, contact our support team.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                    {courseId && (
                        <Button asChild className="flex-1">
                            <Link href={`/course/${courseId}/paypal-payment`}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Try Again
                            </Link>
                        </Button>
                    )}

                    <Button variant="outline" asChild className="flex-1">
                        <Link href="/">
                            Return to Home
                        </Link>
                    </Button>
                </div>

                {/* Support Info */}
                <div className="mt-8 text-center text-sm text-muted-foreground">
                    <p>Need immediate assistance? Contact our support team at support@yourplatform.com</p>
                </div>
            </div>
        </div>
    );
}