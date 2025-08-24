"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getRedirectResult, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/config";

export default function GoogleRedirectHandler() {
    const router = useRouter();

    useEffect(() => {
        const handleRedirect = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (!result) return;

                const user = result.user;
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);

                if (!userSnap.exists()) {
                    await setDoc(userRef, {
                        uid: user.uid,
                        name: user.displayName,
                        email: user.email,
                        photoURL: user.photoURL,
                        createdAt: new Date(),
                    });
                }

                // Optional: save user to Zustand or localStorage
                // useAuthStore.getState().setUser(user);
                localStorage.setItem("user", JSON.stringify(user));

                router.push("/corrections"); // or your post-login route
            } catch (error) {
                console.error("Redirect login error:", error);
            }
        };

        handleRedirect();
    }, [router]);

    return null; // no UI
}
