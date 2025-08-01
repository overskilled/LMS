"use client"

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/authContext";
import { auth } from "@/firebase/config";
import { signOut } from "firebase/auth";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function LogoutButton() {
    const router = useRouter()

    const logout = async () => {

        try {
            await signOut(auth);

            localStorage.removeItem('user-info')

            toast.success('Logged out successfully');

            router.push("/login")

        } catch (error: any) {
            console.log("An error occured: ", error.message)
        }
    }

    return (
        <Button variant="ghost" onClick={logout} className="w-full justify-start text-red-500 hover:bg-red-150 hover:text-red-500">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
        </Button>
    );
}