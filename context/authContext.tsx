"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, signOut, type User } from "firebase/auth"
import { auth } from "@/firebase/config"
import { toast } from "sonner"
import { useRouter } from "next/navigation"


type AuthContextType = {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    logout: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user: any) => {
            setUser(user)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const logout = async () => {
        setLoading(true)

        try {
            await signOut(auth);

            localStorage.removeItem('user-info')

            toast.success('Logged out successfully');

            router.push("/admin/login")

        } catch (error: any) {
            console.log("An error occured: ", error.message)
        }
    }

    return <AuthContext.Provider value={{ user, loading, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
