import { adminAuth } from "@/firebase/admin";
import { NextRequest } from "next/server";

export async function authMiddleware(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return null;
        }

        const idToken = authHeader.split("Bearer ")[1];
        if (!idToken) return null;

        const decodedToken = await adminAuth.verifyIdToken(idToken);
        return {
            uid: decodedToken.uid,
            email: decodedToken.email,
            name: decodedToken.name ?? "",
            picture: decodedToken.picture ?? "",
            role: decodedToken.role ?? "user", 
        };
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return null;
    }
}