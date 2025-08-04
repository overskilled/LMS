"use client"

import { Suspense, useEffect, useState } from "react";
import { AppSidebar } from "./components/app-sidebar";
import Loading from "./loading";
import { SidebarProvider } from "@/components/ui/sidebar";
import Header from "./components/header";
import { useRouter } from "next/navigation";

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        // Check localStorage for user info
        const userData = JSON.parse(localStorage.getItem("user-info") || "");

        console.log("userData: ", userData)

            // if (!userData.admin) {
            //     router.push('/admin/login');
            // } else {
            //     setIsAuthorized(true);
            // }
    }, [router]);

    // if (!isAuthorized) {
    //     return <Loading />;
    // }




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