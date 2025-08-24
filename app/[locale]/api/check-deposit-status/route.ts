import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const id = req.nextUrl.searchParams.get("id");
        if (!id) {
            return NextResponse.json({ error: "Missing deposit ID" }, { status: 400 });
        }

        const apiUrl = `https://api.pawapay.io/deposits/${id}`;

        // Extract the Authorization token from environment variables
        const token = process.env.PAWAPAY_API_KEY;
        if (!token) {
            console.error("API Key is missing");
            return NextResponse.json({ error: "API key is missing" }, { status: 401 });
        }

        // Make the request to the external API
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`, // Include API key in headers
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("API Error:", errorData);
            return NextResponse.json(
                { error: "API request failed", status: response.status, message: errorData?.message || "Unknown error" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error("Server Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
