// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
    ApiError,
    CheckoutPaymentIntent,
    Client,
    Environment,
    LogLevel,
    OrdersController,
} from "@paypal/paypal-server-sdk";

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error("Missing PayPal environment variables");
}

const client = new Client({
    clientCredentialsAuthCredentials: {
        oAuthClientId: PAYPAL_CLIENT_ID,
        oAuthClientSecret: PAYPAL_CLIENT_SECRET,
    },
    timeout: 0,
    environment: Environment.Sandbox,
    logging: {
        logLevel: LogLevel.Info,
        logRequest: {
            logBody: true,
        },
        logResponse: {
            logHeaders: true,
        },
    },
});

const ordersController = new OrdersController(client);

/**
 * Create an order to start the transaction.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_create
 */
const createOrder = async (cart: any) => {
    const collect = {
        body: {
            intent: CheckoutPaymentIntent.Capture,
            purchaseUnits: [
                {
                    amount: {
                        currencyCode: "USD",
                        value: "100.00",
                    },
                },
            ],
        },
        prefer: "return=minimal" as const,
    };

    try {
        const { body, ...httpResponse } = await ordersController.createOrder(collect);
        return {
            jsonResponse: JSON.parse(body as string),
            httpStatusCode: httpResponse.statusCode,
        };
    } catch (error) {
        if (error instanceof ApiError) {
            throw new Error(error.message);
        }
        throw error;
    }
};

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const body = await request.json();

        // use the cart information passed from the front-end to calculate the order amount details
        const { cart } = body;

        if (!cart) {
            return NextResponse.json(
                { error: "Missing cart information" },
                { status: 400 }
            );
        }

        const { jsonResponse, httpStatusCode } = await createOrder(cart);
        return NextResponse.json(jsonResponse, { status: httpStatusCode });
    } catch (error) {
        console.error("Failed to create order:", error);

        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create order." },
            { status: 500 }
        );
    }
}