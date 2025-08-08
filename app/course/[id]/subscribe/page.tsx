"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import { Check, Loader2, Shield } from "lucide-react"
import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { courseApi } from "@/utils/courseApi"

// Initialize Firebase
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function CoursePayment() {
    const params = useParams()
    const courseId = params.id as string
    const [selectedMobileMethod, setSelectedMobileMethod] = useState<"mtn" | "orange">("mtn")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [course, setCourse] = useState<any>(null)
    const router = useRouter()

    const searchParams = useSearchParams();

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await courseApi.getCourseById(courseId)
                if (response.success && response.data) {
                    setCourse(response.data)
                } else {
                    setError(response.message || "Failed to load course details")
                }
            } catch (err) {
                setError("An error occurred while fetching course details")
                console.error("Error fetching course:", err)
            }
        }

        if (courseId) {
            fetchCourse()
        }
    }, [courseId])

    const generateDepositId = () => uuidv4()

    const validatePhoneNumber = () => {
        setError(null)

        if (!phoneNumber) {
            setError("Please enter your phone number")
            return false
        }

        if (phoneNumber.length < 9) {
            setError("Please enter a valid phone number")
            return false
        }

        return true
    }

    const createTransactionRecord = async (depositId: string, status: string) => {
        try {
            const transactionData = {
                depositId,
                courseId,
                courseTitle: course?.aboutCourse.title,
                amount: course?.aboutCourse.pricing.basePrice,
                currency: "XAF",
                paymentMethod: selectedMobileMethod === "mtn" ? "MTN Mobile Money" : "Orange Money",
                phoneNumber: `+237${phoneNumber}`,
                status,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                ref: searchParams.get("ref") || null,
                metadata: {
                    // Add any additional metadata you want to track
                    platform: "web",
                    attemptCount: 3 // You might want to track how many attempts were made
                }
            };

            await addDoc(collection(db, "transactions"), transactionData);
            console.log("Transaction record created successfully");
        } catch (error) {
            console.error("Error creating transaction record:", error);
            // Don't fail the payment flow if Firestore fails
        }
    }

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!course) {
            setError("Course information not available");
            return;
        }

        if (!validatePhoneNumber()) {
            return;
        }

        setLoading(true);
        let depositId = generateDepositId();
        let attempt = 0;
        let success = false;
        let result = null;

        while (attempt < 3 && !success) {
            try {
                const res = await fetch("/api/deposits", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        depositId,
                        amount: course.aboutCourse.pricing.basePrice.toString(),
                        currency: "XAF",
                        correspondent: selectedMobileMethod === "mtn" ? "MTN_MOMO_CMR" : "ORANGE_CMR",
                        payer: { address: { value: `237${phoneNumber}` }, type: "MSISDN" },
                        customerTimestamp: new Date().toISOString(),
                        statementDescription: `NMD Course`,
                        country: "CMR",
                        preAuthorisationCode: "PMxQYqfDx",
                        metadata: [
                            { fieldName: "courseId", fieldValue: courseId },
                            { fieldName: "customerId", fieldValue: "customer@email.com", isPII: true },
                        ],
                    }),
                });

                result = await res.json();

                if (result?.status === "REJECTED" || result?.status === "DUPLICATE_IGNORED") {
                    success = false;
                    if (result?.status === "DUPLICATE_IGNORED") {
                        depositId = generateDepositId();
                    }
                } else if (res.ok && result?.status !== "DUPLICATE_IGNORED") {
                    success = true;
                } else {
                    throw new Error(result?.message || "Unknown error");
                }
            } catch (error: any) {
                if (attempt >= 2) {
                    setError("Payment failed: " + error.message);
                    // Create a failed transaction record
                    await createTransactionRecord(depositId, "failed");
                }
            }
            attempt++;
        }

        if (success && result?.depositId) {
            // Create a successful transaction record
            await createTransactionRecord(result.depositId, "pending");
            router.push(`/course/${courseId}/payment-process/${result.depositId}?ref=${searchParams.get("ref")}`);
        } else if (result?.status === "REJECTED") {
            setError("Payment was rejected, check your network or try later.");
            console.log(result?.rejectionReason?.rejectionMessage || "Payment was rejected, check your network or try later.");
            // Create a rejected transaction record
            await createTransactionRecord(depositId, "rejected");
        }

        setLoading(false);
    };

    if (!course) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
                <div className="w-full max-w-4xl">
                    {error ? (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ) : (
                        <div className="flex justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
            <div className="w-full max-w-4xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Complete Your Purchase</h1>
                    <p className="text-gray-500 mt-2">Secure payment for: {course.aboutCourse.title}</p>
                </div>

                {/* Payment Form */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 bg-gray-50 border-b">
                        <h2 className="text-xl font-semibold text-gray-900">Course Details</h2>
                    </div>

                    <div className="p-6">
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Course Summary */}
                            <div className="md:w-1/2">
                                <h3 className="text-lg font-medium mb-4">Order Summary</h3>
                                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-600">Course</span>
                                        <span className="font-medium">{course.aboutCourse.title}</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-600">Price</span>
                                        <span className="font-medium">
                                            {course.aboutCourse.pricing.basePrice.toLocaleString()} XAF
                                        </span>
                                    </div>
                                    <div className="border-t border-gray-200 my-2"></div>
                                    <div className="flex justify-between font-bold">
                                        <span>Total</span>
                                        <span>{course.aboutCourse.pricing.basePrice.toLocaleString()} XAF</span>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                    <div className="flex">
                                        <Shield className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-medium text-blue-800">Secure Transaction</h4>
                                            <p className="text-sm text-blue-600">Your payment information is encrypted and secure.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Form */}
                            <div className="md:w-1/2">
                                <h3 className="text-lg font-medium mb-4">Payment Method</h3>

                                <form onSubmit={handlePayment} className="space-y-6">
                                    {/* Mobile Money Selection */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <Card
                                            className={cn(
                                                "p-4 h-24 rounded-xl cursor-pointer border-2 transition-all",
                                                selectedMobileMethod === "mtn"
                                                    ? "border-yellow-500 bg-yellow-50"
                                                    : "border-gray-200 hover:border-gray-300",
                                            )}
                                            onClick={() => setSelectedMobileMethod("mtn")}
                                        >
                                            <div className="flex items-center justify-center h-full">
                                                <img src="/mtn.webp" alt="MTN Logo" className="h-14" />
                                            </div>
                                        </Card>
                                        <Card
                                            className={cn(
                                                "p-4 h-24 rounded-xl cursor-pointer border-2 transition-all",
                                                selectedMobileMethod === "orange"
                                                    ? "border-orange-500 bg-orange-50"
                                                    : "border-gray-200 hover:border-gray-300",
                                            )}
                                            onClick={() => setSelectedMobileMethod("orange")}
                                        >
                                            <div className="flex items-center justify-center h-full">
                                                <img src="/orange.webp" alt="Orange Money Logo" className="h-14" />
                                            </div>
                                        </Card>
                                    </div>

                                    {/* Phone Number Input */}
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                                            Phone Number
                                        </Label>
                                        <div className="flex">
                                            <div className="flex items-center justify-center px-3 border border-r-0 border-gray-300 bg-gray-50 rounded-l-md">
                                                <span className="text-gray-500">+237</span>
                                            </div>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                placeholder="6XXXXXXXX"
                                                className="rounded-l-none"
                                                maxLength={9}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500">Enter your 9-digit number without the country code</p>
                                    </div>

                                    {/* Error Message */}
                                    {error && (
                                        <Alert variant="destructive">
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}

                                    {/* Submit Button */}
                                    <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            `Pay ${course.aboutCourse.pricing.basePrice.toLocaleString()} XAF`
                                        )}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 border-t text-center">
                        <p className="text-sm text-gray-500">
                            By proceeding with payment, you agree to our{" "}
                            <a href="#" className="text-blue-600 hover:underline">
                                Terms of Service
                            </a>{" "}
                            and{" "}
                            <a href="#" className="text-blue-600 hover:underline">
                                Privacy Policy
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}