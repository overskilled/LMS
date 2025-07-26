import type { Metadata } from "next";
import { Suspense } from "react";
import { AppSidebar } from "./components/app-sidebar";
import Loading from "./loading";
import { SidebarProvider } from "@/components/ui/sidebar";

export const metadata: Metadata = {
    title: "Admin | NMD LMS",
    description: "Admin dashboard for managing the LMS",
};

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">
                <SidebarProvider>
                    <AppSidebar />
                    <Suspense fallback={<Loading />}>
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {/* <Header /> */}
                            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent">
                                <div className="container mx-auto px-6 py-8">{children}</div>
                            </main>

                        </div>
                    </Suspense>
                </SidebarProvider>
            </body>
        </html>
    );
}
