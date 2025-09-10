// components/custom/PayPalButton/PayPalButton.tsx
"use client";

import { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useAuth } from "@/context/authContext";
import { toast } from "sonner";
import { addToSubCollection } from "@/functions/add-to-subcollection";
import { setToCollection } from "@/functions/add-to-collection";
import { nanoid } from "nanoid";
import { courseApi } from "@/utils/courseApi";
import { useRouter } from "next/navigation";

interface PayPalButtonProps {
    amount: number;
    courseId: string;
    description: string;
}

export default function PayPalButton({ amount, description, courseId }: PayPalButtonProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [paypalError, setPaypalError] = useState("");

    const { user } = useAuth()

    const router = useRouter()


    const createOrder = (data: any, actions: any) => {
        return actions.order.create({
            purchase_units: [
                {
                    amount: {
                        value: amount.toFixed(2),
                        currency_code: "USD",
                    },
                    description: description,
                },
            ],
        });
    };


    const onApprove = async (data: any, actions: any) => {
        setIsProcessing(true);

        try {
            const order = await actions.order.get();
            console.log("Payment successful", order);

            const payerName = order.payer?.name?.given_name || "";
            const payerEmail = order.payer?.email_address || "";

            const paymentData = {
                name: payerName,
                email: payerEmail,
                amount: amount.toFixed(2),
                orderID: data.orderID,
            };

            console.log("Sending to API:", paymentData);

            // const response = await fetch("/en/api/payment", {
            //     method: "POST",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify(paymentData),
            // });

            const response = await fetch(
                `/en/api/orders/${paymentData.orderID}/capture`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error("API error response:", errorText);
                throw new Error("Payment processing failed");
            }

            try {

                console.log(user);

                await setToCollection("transactions", data.orderId, {
                    transactionId: data.orderId,
                    userId: user?.uid,
                    amount: amount,
                    currency: "XAF",
                    status: "completed",
                    paymentMethod: "paypal",
                    type: `NMD course subscription`,
                    description: description
                        ? description
                        : "Course purchase",
                });

                await courseApi.purchaseCourse(user?.uid || "", courseId)

            } catch (error) {
                toast.error("Failed to transaction record . Please try again.");
            }

            toast.success("Subscription activated successfully!");

            // Ridirect to success page 
            router.push("/payment/success")


            const result = await response.json();
            console.log("API response:", result);
            alert("Payment processed successfully!");
        } catch (error) {
            console.error("Payment failed:", error);
            setPaypalError("Payment failed. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };



    const onError = (err: any) => {
        console.error("PayPal error:", err);
        setPaypalError("An error occurred with PayPal. Please try again.");
    };

    return (
        <div>
            {isProcessing && (
                <div className="mb-4 text-center">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mr-2"></div>
                    <span>Processing your payment...</span>
                </div>
            )}

            {paypalError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                    {paypalError}
                </div>
            )}
            <PayPalScriptProvider
                options={{
                    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
                    currency: "USD",
                    intent: "capture",
                }}
            >
                <PayPalButtons
                    createOrder={createOrder}
                    onApprove={onApprove}
                    onError={onError}
                    style={{ layout: "vertical" }}
                    disabled={isProcessing}
                />
            </PayPalScriptProvider>
        </div>
    );
}