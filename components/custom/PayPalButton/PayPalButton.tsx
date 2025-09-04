// components/custom/PayPalButton/PayPalButton.tsx
"use client";

import { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

interface PayPalButtonProps {
    amount: number;
    currency?: string;
}

export default function PayPalButton({ amount, currency = "XAF" }: PayPalButtonProps) {
    const [message, setMessage] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    // Use the same currency in the SDK options that you use in the API
    const initialOptions = {
        "clientId": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
        "enable-funding": "venmo",
        "buyer-country": "US",
        currency: "USD",
        components: "buttons",
    };

    const createOrder = async () => {
        setIsProcessing(true);
        try {
            const response = await fetch("/en/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    cart: {
                        price: 100.00,
                        currency: "USD"
                    }
                }),
            });

            const orderData = await response.json();

            console.log("order Daata: ", orderData)


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
            throw error;
        } finally {
            setIsProcessing(false);
        }
    };

    const onApprove = async (data: any, actions: any) => {
        setIsProcessing(true);
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
            const errorDetail = orderData?.details?.[0];

            if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
                return actions.restart();
            } else if (errorDetail) {
                throw new Error(
                    `${errorDetail.description} (${orderData.debug_id})`
                );
            } else {
                const transaction =
                    orderData.purchase_units[0].payments.captures[0];
                setMessage(
                    `Transaction ${transaction.status}: ${transaction.id}`
                );

                // Redirect to success page
                window.location.href = `/payment/success?orderId=${data.orderID}&amount=${amount}&currency=${currency}`;
            }
        } catch (error) {
            console.error(error);
            setMessage(
                `Sorry, your transaction could not be processed...${error}`
            );
        } finally {
            setIsProcessing(false);
        }
    };

    const onError = (error: any) => {
        console.error("PayPal Button Error:", error);
        setMessage(`Payment error: ${error.message || "Unknown error"}`);
    };

    return (
        <div className="paypal-button-container">
            {isProcessing && (
                <div className="text-center mb-4">
                    <p>Processing payment...</p>
                </div>
            )}

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

            {message && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm">{message}</p>
                </div>
            )}
        </div>
    );
}