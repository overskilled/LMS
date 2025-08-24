import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const apiUrl = "https://api.pawapay.io/deposits";
        const body = await req.json();

        const token = process.env.PAWAPAY_API_KEY;
        
        if (!token) {
            console.error("API Key is missing");
            return NextResponse.json({ error: "API key is missing" }, { status: 401 });
        }

        
        const headers = new Headers({
            "Content-Digest": "tempor",
            "Signature": "minim consectetur sit nostrud",
            "Signature-Input": "tempor dolore aute",
            "Accept-Signature": "tempor sit",
            "Accept-Digest": "non in enim",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
            "Cookie": "JSESSIONID=CD26B1CEA35600DFBFBF3C0646B6D626",
        });

        console.log("Request body:", body);

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body),
            redirect: "follow",
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("API Error:", data);
            return NextResponse.json(
                { error: "API request failed", status: response.status, message: data?.message || "Unknown error" },
                { status: response.status }
            );
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Server Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
