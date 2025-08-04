"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, signOut, type User } from "firebase/auth"
import { auth, db } from "@/firebase/config"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { doc, onSnapshot, getFirestore } from "firebase/firestore"

type AuthContextType = {
    user: User | null
    loading: boolean
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    logout: async () => { },
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Listener for Firebase Auth state changes
        const unsubscribeAuth = onAuthStateChanged(auth, (authUser: User | null) => {
            // If a user is logged in, set up a Firestore listener
            if (authUser) {
                const userDocRef = doc(db, "users", authUser.uid)

                // Listener for the user's document in Firestore
                const unsubscribeFirestore = onSnapshot(
                    userDocRef,
                    (docSnapshot) => {
                        if (docSnapshot.exists()) {
                            const userData = {
                                uid: authUser.uid,
                                ...docSnapshot.data(),
                            }
                            setUser(userData as User)
                            localStorage.setItem("user-info", JSON.stringify(userData))
                        } else {
                            // Handle case where user document doesn't exist
                            setUser(null)
                            localStorage.removeItem("user-info")
                        }
                        setLoading(false)
                    },
                    (error) => {
                        console.error("Firestore listener error: ", error)
                        setLoading(false)
                    }
                )

                // Return a cleanup function for both listeners
                return () => {
                    unsubscribeFirestore()
                }
            } else {
                // If no user is logged in, clear state and local storage
                setUser(null)
                localStorage.removeItem("user-info")
                setLoading(false)
            }
        })

        // Cleanup function for the Auth listener
        return () => unsubscribeAuth()
    }, [])

    const logout = async () => {
        setLoading(true)

        try {
            await signOut(auth)

            localStorage.removeItem("user-info")

            toast.success("Logged out successfully")

            router.push("/admin/login")
        } catch (error: any) {
            console.log("An error occurred: ", error.message)
        } finally {
            setLoading(false)
        }
    }

    return <AuthContext.Provider value={{ user, loading, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)