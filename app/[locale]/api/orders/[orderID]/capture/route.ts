import { NextRequest, NextResponse } from "next/server";
import {
    ApiError,
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
        logRequest: { logBody: true },
        logResponse: { logHeaders: true },
    },
});

const ordersController = new OrdersController(client);

const captureOrder = async (orderID: string) => {
    const collect = { id: orderID, prefer: "return=minimal" as const };

    try {
        const { body, ...httpResponse } = await ordersController.captureOrder(collect);
        return {
            jsonResponse: JSON.parse(body as string),
            httpStatusCode: httpResponse.statusCode,
        };
    } catch (error) {
        if (error instanceof ApiError) throw new Error(error.message);
        throw error;
    }
};

// ✅ Important: Do NOT type the second argument!
export async function POST(request: NextRequest, context: any) {
    try {
        const { orderID } = context.params; // access dynamically
        const { jsonResponse, httpStatusCode } = await captureOrder(orderID);
        return NextResponse.json(jsonResponse, { status: httpStatusCode });
    } catch (error) {
        console.error("Failed to capture order:", error);

        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ error: "Failed to capture order." }, { status: 500 });
    }
}
