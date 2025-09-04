"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Skeleton } from "@/components/ui/skeleton";
import { courseApi } from "@/utils/courseApi";

function Message({ content }: { content: any }) {
    return <p className="my-4 text-center">{content}</p>;
}

export default function PayPalPaymentPage() {
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState("");

    // Get the courseId from the URL params and ref from search params
    const params = useParams();
    const searchParams = useSearchParams();
    const courseId = params.id as string;
    const refCode = searchParams.get("ref");

    // PayPal initial options
    const initialOptions = {
        "clientId": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
        "enable-funding": "venmo",
        "buyer-country": "US",
        currency: "USD",
        components: "buttons",
    };

    // Fetch course details
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

        if (courseId) {
            fetchCourse();
        } else {
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

    // Get pricing information
    const pricing = course.aboutCourse.pricing;
    const price = pricing.discountPrice || pricing.basePrice;
    const currency = pricing.currency || "USD";

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <h1 className="text-2xl font-bold mb-6">Checkout</h1>

            {/* Course Summary */}
            <div className="bg-card border rounded-lg p-4 mb-6">
                <h2 className="text-xl font-semibold mb-2">{course.aboutCourse.title}</h2>
                <p className="text-muted-foreground mb-4">{course.aboutCourse.shortDescription}</p>

                {/* Pricing display */}
                <div className="flex justify-between items-center border-t pt-4">
                    <span className="font-medium">Total:</span>
                    <div className="text-right">
                        {pricing.discountPrice && (
                            <p className="text-sm text-muted-foreground line-through">
                                {currency} {pricing.basePrice.toFixed(2)}
                            </p>
                        )}
                        <p className="text-2xl font-bold">
                            {currency} {price.toFixed(2)}
                        </p>
                        {pricing.discountPrice && (
                            <p className="text-sm text-green-600">
                                Save {(((pricing.basePrice - pricing.discountPrice) / pricing.basePrice) * 100).toFixed(0)}%
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* PayPal Button Component */}
            <div className="paypal-button-container">
                <PayPalScriptProvider options={initialOptions}>
                    <PayPalButtons
                        style={{
                            shape: "rect",
                            layout: "vertical",
                            color: "gold",
                            label: "paypal",
                        }}
                        createOrder={async () => {
                            try {
                                const response = await fetch("/en/api/orders", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    // use the "body" param to optionally pass additional order information
                                    // like product ids and quantities
                                    body: JSON.stringify({
                                        cart: [
                                            {
                                                id: "YOUR_PRODUCT_ID",
                                                quantity: "YOUR_PRODUCT_QUANTITY",
                                            },
                                        ],
                                    }),
                                });

                                const orderData = await response.json();

                                if (orderData.id) {
                                    return orderData.id;
                                } else {
                                    const errorDetail = orderData?.details?.[0];
                                    const errorMessage = errorDetail
                                        ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                                        : JSON.stringify(orderData);

                                    throw new Error(errorMessage);
                                }
                            } catch (error) {
                                console.error(error);
                                setMessage(`Could not initiate PayPal Checkout...${error}`);
                            }
                        }}
                        onApprove={async (data, actions) => {
                            try {
                                const response = await fetch(
                                    `/en/api/orders/${data.orderID}/capture`,
                                    {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                    }
                                );

                                const orderData = await response.json();
                                // Three cases to handle:
                                //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
                                //   (2) Other non-recoverable errors -> Show a failure message
                                //   (3) Successful transaction -> Show confirmation or thank you message

                                const errorDetail = orderData?.details?.[0];

                                if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
                                    // (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
                                    // recoverable state, per https://developer.paypal.com/docs/checkout/standard/customize/handle-funding-failures/
                                    return actions.restart();
                                } else if (errorDetail) {
                                    // (2) Other non-recoverable errors -> Show a failure message
                                    throw new Error(
                                        `${errorDetail.description} (${orderData.debug_id})`
                                    );
                                } else {
                                    // (3) Successful transaction -> Show confirmation or thank you message
                                    // Or go to another URL:  actions.redirect('thank_you.html');
                                    const transaction =
                                        orderData.purchase_units[0].payments.captures[0];
                                    setMessage(
                                        `Transaction ${transaction.status}: ${transaction.id}. See console for all available details`
                                    );
                                    console.log(
                                        "Capture result",
                                        orderData,
                                        JSON.stringify(orderData, null, 2)
                                    );
                                }
                            } catch (error) {
                                console.error(error);
                                setMessage(
                                    `Sorry, your transaction could not be processed...${error}`
                                );
                            }
                        }}
                    />
                </PayPalScriptProvider>
                <Message content={message} />
            </div>
        </div>
    );
}