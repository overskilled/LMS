"use client"

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/authContext";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function LogoutButton() {
    const router = useRouter();
    const { logout, loading } = useAuth(); 

    const handleLogout = async () => {
        try {
            await logout(); // Using the logout function from auth context
            toast.success('Logged out successfully');
            router.push("/login");
        } catch (error: any) {
            console.error("Logout error:", error.message);
            toast.error("Failed to logout");
        }
    };

    return (
        <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-red-500 hover:bg-red-150 hover:text-red-500"
            disabled={loading} // Disable button during logout process
        >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
        </Button>
    );
}