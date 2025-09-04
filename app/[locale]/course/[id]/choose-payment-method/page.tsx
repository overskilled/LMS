"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CreditCard, Smartphone, Wallet } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export default function PaymentMethodPage() {
    const [selectedMethod, setSelectedMethod] = useState<string>("")
    const searchParams = useSearchParams()
    const router = useRouter()

    // Get the ref parameter from URL
    const refParam = searchParams.get("ref")

    // Extract courseId from the current path
    const pathParts = window.location.pathname.split('/')
    const courseIdIndex = pathParts.indexOf('course') + 1
    const courseId = courseIdIndex > 0 && courseIdIndex < pathParts.length
        ? pathParts[courseIdIndex]
        : null

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