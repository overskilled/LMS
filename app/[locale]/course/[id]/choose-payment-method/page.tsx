"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CreditCard, Smartphone, Wallet, Ticket } from "lucide-react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { courseApi } from "@/utils/courseApi"
import { toast } from "sonner"
import { useAuth } from "@/context/authContext"
import { v4 as uuidv4 } from "uuid"

export default function PaymentMethodPage() {
    const params = useParams()
    const courseId = params.id as string
    const [selectedMethod, setSelectedMethod] = useState<string>("")
    const [accessCode, setAccessCode] = useState("")
    const [isRedeeming, setIsRedeeming] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const searchParams = useSearchParams()
    const router = useRouter()

    const { user } = useAuth()

    // Get the ref parameter from URL
    const refParam = searchParams.get("ref")


    const paymentMethods = [
        {
            id: "paypal",
            name: "PayPal/Bank card",
            description: "Pay securely with your PayPal account or credit or debit card",
            icon: Wallet,
            link: courseId ? `/course/${courseId}/paypal-payment` : "/paypal-payment"
        },
        {
            id: "mobile",
            name: "Mobile Payment",
            description: "Local mobile payment service",
            icon: Smartphone,
            link: courseId ? `/course/${courseId}/subscribe` : "/subscribe"
        },
    ]

    const handleContinue = () => {
        if (selectedMethod) {
            const selectedPayment = paymentMethods.find((m) => m.id === selectedMethod)

            if (selectedPayment) {
                // Create URL with ref parameter if it exists
                const url = refParam && refParam !== 'null'
                    ? `${selectedPayment.link}?ref=${encodeURIComponent(refParam)}`
                    : selectedPayment.link

                router.push(url)
            }
        }
    }

    const generateTransactionId = () => uuidv4()

    const handleRedeemCode = async () => {
        if (!accessCode.trim()) {
            alert("Please enter an access code")
            return
        }

        setIsRedeeming(true)

        try {
            // Call API to validate the access code
            const validationResult = await validateAccessCode(accessCode.trim())

            if (validationResult.isValid) {
                // If it's a 100% discount code, purchase the course
                if (validationResult.discountPercentage === 100) {
                    try {
                        if (!user) {
                            toast.error("You must be logged in to redeem an access code.");
                            setIsRedeeming(false);
                            setDialogOpen(false);
                            return;
                        }
                        await courseApi.purchaseCourse(user.uid, courseId);

                        const course = await courseApi.getCourseById(courseId)


                        let transactionId = generateTransactionId();

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
                                    title: course?.data?.aboutCourse?.title ?? "",
                                    amount: 0,
                                    currency: "FCFA",
                                },
                                transaction: {
                                    id: transactionId,
                                    amount: "FREE",
                                    date: new Date().toISOString(),
                                },
                            }),
                        });

                        // Show success toast
                        toast.success("Course purchased successfully with your access code!");
                    } catch (purchaseError) {
                        console.error("Error purchasing course:", purchaseError);
                        toast.error("Failed to purchase course. Please try again.");
                        return;
                    }
                } else {
                    // Show success toast for non-100% codes
                    toast.success(`Access code applied! You got ${validationResult.discountPercentage}% discount.`);
                }

                // Redirect to course page
                const courseUrl = courseId ? `/course/${courseId}` : "/courses";

                if (refParam && refParam !== 'null') {
                    router.push(`${courseUrl}?ref=${encodeURIComponent(refParam)}`)
                } else {
                    router.push(courseUrl)
                }
            } else {
                alert(validationResult.message || "Invalid access code. Please try again.")
            }
        } catch (error) {
            console.error("Error validating access code:", error)
            alert("An error occurred while validating your code. Please try again.")
        } finally {
            setIsRedeeming(false)
            setDialogOpen(false); // Close the dialog

        }
    }

    // Function to validate access code against the actual course data
    const validateAccessCode = async (code: string): Promise<{ isValid: boolean, discountPercentage?: number, message?: string }> => {
        try {
            // Get the course data from the database
            const course = await courseApi.getCourseById(courseId)

            if (!course || !course.data || !course.data.redeemCodes || !Array.isArray(course.data.redeemCodes)) {
                return {
                    isValid: false,
                    message: "Course not found or invalid course data."
                }
            }

            // Find the redeem code in the array
            const redeemCodeObj = course?.data.redeemCodes.find(
                item => item.code.toUpperCase() === code.toUpperCase()
            )

            if (redeemCodeObj) {
                const discountPercentage = parseInt(redeemCodeObj.percentage)

                // Check if the discount percentage is valid
                if (isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {
                    return {
                        isValid: false,
                        message: "Invalid discount value in access code."
                    }
                }

                return {
                    isValid: true,
                    discountPercentage: discountPercentage,
                    message: `Access code applied! You got ${discountPercentage}% discount.`
                }
            } else {
                return {
                    isValid: false,
                    message: "Invalid access code. Please check and try again."
                }
            }
        } catch (error) {
            console.error("Error in access code validation:", error)
            return {
                isValid: false,
                message: "An error occurred during validation. Please try again."
            }
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-foreground font-sans">Select Your Payment Method</h1>
                    <p className="text-muted-foreground text-sm">Choose how you'd like to complete your payment</p>
                </div>

                {/* Payment Methods */}
                <div className="space-y-3">
                    {paymentMethods.map((method) => {
                        const Icon = method.icon
                        const isSelected = selectedMethod === method.id

                        return (
                            <Card
                                key={method.id}
                                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${isSelected
                                    ? "ring-2 ring-primary border-primary bg-card"
                                    : "border-border hover:border-primary/50 bg-card"
                                    }`}
                                onClick={() => setSelectedMethod(method.id)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center space-x-4">
                                        <div
                                            className={`p-2 rounded-lg ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                                }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-card-foreground">{method.name}</h3>
                                            <p className="text-sm text-muted-foreground">{method.description}</p>
                                        </div>
                                        <div
                                            className={`w-4 h-4 rounded-full border-2 ${isSelected ? "bg-primary border-primary" : "border-border"
                                                }`}
                                        >
                                            {isSelected && <div className="w-full h-full rounded-full bg-primary-foreground scale-50" />}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or
                        </span>
                    </div>
                </div>

                {/* Redeem Access Code Button */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full"
                        >
                            <Ticket className="mr-2 h-4 w-4" />
                            Redeem Access Code
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Redeem Access Code</DialogTitle>
                            <DialogDescription>
                                Enter your access code to unlock the course content.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="accessCode">Access Code</Label>
                                <Input
                                    id="accessCode"
                                    placeholder="Enter your code"
                                    value={accessCode}
                                    onChange={(e) => setAccessCode(e.target.value)}
                                />
                            </div>
                            <Button
                                onClick={handleRedeemCode}
                                disabled={isRedeeming || !accessCode.trim()}
                            >
                                {isRedeeming ? "Verifying..." : "Redeem Code"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Continue Button */}
                <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                    disabled={!selectedMethod}
                    onClick={handleContinue}
                >
                    Continue
                </Button>

                {/* Trust Signals */}
                <div className="text-center space-y-2">
                    <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                        <div className="w-3 h-3 bg-accent rounded-full" />
                        <span>SSL Secured</span>
                        <span>•</span>
                        <span>256-bit Encryption</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Your payment information is secure and protected</p>
                </div>
            </div>
        </div>
    )
}