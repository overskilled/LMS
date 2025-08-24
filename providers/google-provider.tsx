"use client";

import GoogleRedirectHandler from "@/app/[locale]/(auth)/components/GoogleRedirectHandler";
import { ReactNode } from "react";

export default function GoogleProvider({ children }: { children: ReactNode }) {
    return (
        <>
            <GoogleRedirectHandler />
            {children}
        </>
    );
}
