"use client"

import { Suspense, useEffect, useState } from "react";
import { AppSidebar } from "./components/app-sidebar";
import Loading from "./loading";
import { SidebarProvider } from "@/components/ui/sidebar";
import Header from "./components/header";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (user === undefined) return; // still loading auth state

        if (!user || !user.admin) {
            router.push("/admin/login");
        } else {
            setIsAuthorized(true);
        }
    }, [user, router]);

    
    if (!isAuthorized) {
        return <Loading />;
    }




    return (
        <SidebarProvider>
            <div className="flex h-screen w-full">
                <AppSidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent">
                        <div className="container mx-auto px-6 py-8">
                            <Suspense fallback={<Loading />}>
                                {children}
                            </Suspense>
                        </div>
                    </main>

                </div>
            </div>
        </SidebarProvider>
    );
}