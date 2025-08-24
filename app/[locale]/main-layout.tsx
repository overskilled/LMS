import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1  w-full px-0">
                {children}
            </main>
            {/* <Footer /> */}
        </div>
    );
}
