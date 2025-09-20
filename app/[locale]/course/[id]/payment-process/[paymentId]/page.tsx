"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore"
import Link from "next/link"
import {
    CheckCircle,
    Clock,
    Loader2,
    XCircle,
    Banknote,
    Calendar,
    Store,
    FileText,
    Hash,
    ArrowLeft,
    RefreshCcw,
    ShieldCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { db } from "@/firebase/config"
import { courseApi } from "@/utils/courseApi"
import { useRecordAffiliateConversion } from "@/hooks/useRecordClientConversion"
import { useAuth } from "@/context/authContext"

interface ParamsProps {
    params: {
        id: string
        paymentId: string
    }
}

export default function PaymentProcessingPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { id, paymentId } = useParams<{ id: string; paymentId: string }>();

    const courseId = id

    const depositId = paymentId;

    const [status, setStatus] = useState<"SUBMITTED" | "COMPLETED" | "FAILED">("SUBMITTED")
    const [transaction, setTransaction] = useState<any>(null)
    const [isPolling, setIsPolling] = useState(true)
    const [progress, setProgress] = useState(0)
    const [pollingCount, setPollingCount] = useState(0)

    const { user } = useAuth()
    const [loading, setLoading] = useState<boolean>(false)
    const { recordConversion } = useRecordAffiliateConversion();
    const handleSubscribe = async () => {
        try {
            setLoading(true);

            if (!user) {
                toast.error("User not authenticated!");
                return;
            }

            console.log("Authenticated user:", user);
            
            
            console.log("Course ID in process:", courseId);

            // Fetch course details
            const courseSnap = await getDoc(doc(db, "courses", courseId));
            const course = courseSnap.data();

            // Fetch transaction record using depositId
            const txQuery = query(
                collection(db, "transactions"),
                where("depositId", "==", transaction?.depositId)
            );
            const txSnap = await getDocs(txQuery);
            
            if (txSnap.empty) {
                throw new Error("Transaction not found for this depositId");
            }
            
            const txData = txSnap.docs[0].data();
            const txID = txSnap.docs[0].id;
            
            // Purchase the course
            await courseApi.purchaseCourse(user.uid, courseId, txID);


            // Record conversion if refCode exists
            const refCode = searchParams.get("ref");
            if (refCode !== null && course) {
                const amount = Number(txData.amount) - 4000;
                recordConversion(refCode, courseId, amount);
            }

            toast.success("Subscription activated successfully!");

            // Send invoice email with clean data
            await fetch("/en/api/send-invoice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user: {
                        name: user.name,
                        email: user.email,
                    },
                    course: {
                        title: course?.aboutCourse.title,
                        amount: course?.aboutCourse.pricing.xafPrice,
                        currency: "FCFA",
                    },
                    transaction: {
                        id: txID,
                        amount: txData.amount,
                        date: txData.createdAt || new Date().toISOString(),
                    },
                }),
            });

            router.push(`/course/${courseId}`);
        } catch (error) {
            console.error("Error subscribing:", error);
            toast.error("Failed to activate subscription. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    const handleManualRefresh = async () => {
        if (status !== "SUBMITTED") return

        try {
            const res = await fetch(`/en/api/check-deposit-status?id=${depositId}`)
            const data = await res.json()

            if (res.ok && Array.isArray(data) && data.length > 0) {
                const txn = data[0]
                setTransaction(txn)

                const newStatus = txn.status === "COMPLETED" ? "COMPLETED" : txn.status === "FAILED" ? "FAILED" : "SUBMITTED"

                setStatus(newStatus)

                if (txn.status === "COMPLETED" || txn.status === "FAILED") {
                    setIsPolling(false)
                }
            }
        } catch (error) {
            console.error("Error fetching payment status:", error)
        }
    }

    useEffect(() => {
        if (!depositId || !isPolling) return

        const fetchStatus = async () => {
            try {
                const res = await fetch(`/en/api/check-deposit-status?id=${depositId}`)
                const data = await res.json()

                if (res.ok && Array.isArray(data) && data.length > 0) {
                    const txn = data[0]
                    setTransaction(txn)

                    const newStatus = txn.status === "COMPLETED" ? "COMPLETED" : txn.status === "FAILED" ? "FAILED" : "SUBMITTED"

                    setStatus(newStatus)

                    if (txn.status === "COMPLETED" || txn.status === "FAILED") {
                        setIsPolling(false)
                        setProgress(100)
                    } else {
                        // Increment progress for visual feedback
                        setPollingCount((prev) => prev + 1)
                        setProgress(Math.min(85, pollingCount * 5)) // Cap at 85% until complete
                    }
                }
            } catch (error) {
                console.error("Error fetching payment status:", error)
            }
        }

        const timeout = setTimeout(fetchStatus, 1500)
        return () => clearTimeout(timeout)
    }, [depositId, status, isPolling, pollingCount])

    if (!depositId) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
                <Card className="w-full max-w-md shadow-lg border-0">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl text-center">Payment Processing</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center py-8">
                            <XCircle className="h-16 w-16 text-red-500 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">Invalid Request</h3>
                            <p className="mt-2 text-sm text-gray-500 text-center">
                                We couldn't find the payment information you're looking for.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full">
                            <Link href="/en/subscribe">Return to Payment</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 sm:p-6">
            <Card className="w-full max-w-xl shadow-xl border-0">
                <CardHeader className="pb-4 relative">
                    <div className="absolute top-4 left-4">
                        <Button onClick={() => router.back()} variant="ghost" size="icon" asChild>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </div>
                    <CardTitle className="text-xl text-center pt-2">Payment Processing</CardTitle>
                </CardHeader>

                <CardContent className="pb-6">
                    {/* Status Indicator */}
                    <div className="flex flex-col items-center justify-center mb-8">
                        <div
                            className={cn(
                                "w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-lg",
                                status === "SUBMITTED" ? "bg-amber-500" : status === "FAILED" ? "bg-red-500" : "bg-green-500",
                            )}
                        >
                            {status === "SUBMITTED" ? (
                                <Clock className="h-10 w-10 text-white" />
                            ) : status === "FAILED" ? (
                                <XCircle className="h-10 w-10 text-white" />
                            ) : (
                                <CheckCircle className="h-10 w-10 text-white" />
                            )}
                        </div>

                        <h2 className="text-xl font-semibold text-gray-900 mb-1">
                            {status === "SUBMITTED"
                                ? "Processing Payment"
                                : status === "FAILED"
                                    ? "Payment Failed"
                                    : "Payment Successful"}
                        </h2>

                        <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
                            {status === "SUBMITTED"
                                ? "Please wait while we confirm your payment. This may take a few moments."
                                : status === "FAILED"
                                    ? "We couldn't process your payment. Please try again or use a different payment method."
                                    : "Your payment has been confirmed and your subscription is ready to be activated."}
                        </p>

                        {status === "SUBMITTED" && (
                            <div className="w-full max-w-md mb-2">
                                <Progress value={progress} className="h-2" />
                                <div className="flex justify-between mt-1">
                                    <span className="text-xs text-gray-500">Processing</span>
                                    <span className="text-xs text-gray-500">Confirming</span>
                                    <span className="text-xs text-gray-500">Complete</span>
                                </div>
                            </div>
                        )}

                        {status === "SUBMITTED" && (
                            <Button variant="outline" size="sm" className="mt-2" onClick={handleManualRefresh}>
                                <RefreshCcw className="h-3 w-3 mr-1" />
                                Refresh Status
                            </Button>
                        )}
                    </div>

                    {/* Transaction Details */}
                    {transaction && (
                        <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-base font-medium text-gray-900">Transaction Details</h3>
                                <Badge variant={status === "COMPLETED" ? "default" : status === "FAILED" ? "destructive" : "outline"}>
                                    {status === "COMPLETED" ? "Completed" : status === "FAILED" ? "Failed" : "Processing"}
                                </Badge>
                            </div>

                            <Separator className="mb-4" />

                            <div className="space-y-3">
                                <TransactionDetail
                                    icon={Banknote}
                                    label="Amount"
                                    value={`${transaction.depositedAmount || transaction.requestedAmount} ${transaction.currency}`}
                                />
                                <TransactionDetail
                                    icon={Store}
                                    label="Payment Method"
                                    value={transaction?.correspondent === "MTN_MOMO_CMR" ? "MTN Mobile Money" : "Orange Money"}
                                />
                                <TransactionDetail
                                    icon={Calendar}
                                    label="Date & Time"
                                    value={new Date(transaction.customerTimestamp).toLocaleString()}
                                />
                                <TransactionDetail icon={FileText} label="Description" value={transaction.statementDescription} />
                                <TransactionDetail icon={Hash} label="Transaction ID" value={transaction?.depositId} monospace />
                            </div>

                            {status === "COMPLETED" && (
                                <div className="mt-6 bg-green-50 p-3 rounded-md border border-green-100 flex items-start">
                                    <ShieldCheck className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-green-700">
                                        Your payment has been successfully processed. Click the button below to activate your subscription.
                                    </p>
                                </div>
                            )}

                            {status === "FAILED" && (
                                <div className="mt-6 bg-red-50 p-3 rounded-md border border-red-100 flex items-start">
                                    <XCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-700">
                                        We couldn't process your payment. Please check your payment details and try again.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col space-y-3">
                    {status === "COMPLETED" && (
                        <Button
                            onClick={handleSubscribe}
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            size="lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Activating Subscription...
                                </>
                            ) : (
                                "Activate Subscription"
                            )}
                        </Button>
                    )}

                    {status === "FAILED" && (
                        <Button asChild className="w-full" variant="default">
                            <Link href="/en/subscribe">Try Again</Link>
                        </Button>
                    )}

                    {status === "SUBMITTED" && (
                        <div className="text-center text-sm text-gray-500">
                            <p>
                                Please wait while we process your payment. If you've already confirmed the payment on your mobile
                                device, your subscription will be updated shortly.
                            </p>
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}

const TransactionDetail = ({
    icon: Icon,
    label,
    value,
    monospace = false,
}: {
    icon: React.ElementType
    label: string
    value: string
    monospace?: boolean
}) => {
    return (
        <div className="flex items-center justify-between py-2">
            <div className="flex items-center text-gray-700">
                <Icon className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm">{label}</span>
            </div>
            <span
                className={cn("text-sm font-medium text-gray-900", monospace && "font-mono text-xs bg-gray-100 p-1 rounded")}
            >
                {value}
            </span>
        </div>
    )
}
