// middleware/authMiddleware.ts
import { adminAuth } from "@/firebase/admin"; // ✅ central import
import { NextRequest } from "next/server";

export async function authMiddleware(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.warn("Missing or invalid auth header");
            return null;
        }

        const idToken = authHeader.split("Bearer ")[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken); 
        return decodedToken;
    } catch (error) {
        console.error("authMiddleware failed to verify token:", error);
        return null;
    }
}
