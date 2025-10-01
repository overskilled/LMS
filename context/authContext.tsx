"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { onAuthStateChanged, signOut, type User } from "firebase/auth"
import { auth, db } from "@/firebase/config"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { doc, onSnapshot, getDoc, DocumentData } from "firebase/firestore"

interface AppUser extends User {
    admin: boolean
    superAdmin: boolean
    courses: string[]
    createdAt: Date
    name: string
}

type AuthContextType = {
    user: AppUser | null
    loading: boolean
    logout: () => Promise<void>
    refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    logout: async () => { },
    refreshUserData: async () => { },
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AppUser | null>(null)
    const [loading, setLoading] = useState(true)
    const [isLoggingOut, setIsLoggingOut] = useState(false) // New state to track logout
    const router = useRouter()

    
    const updateUserState = useCallback((authUser: User | null, userData?: DocumentData) => {
        // Skip updates during logout
        if (isLoggingOut) return

        if (authUser && userData) {
            const combinedUser: AppUser = {
                ...authUser,
                uid: authUser.uid,
                email: userData.email || authUser.email || '',
                superAdmin: userData.superAdmin || false,
                admin: userData.admin || false,
                courses: userData.courses || [],
                createdAt: userData.createdAt?.toDate?.() || new Date(),
                name: userData.name || authUser.displayName || '',
                displayName: authUser.displayName || userData.name || '',
            }
            setUser(combinedUser)
            localStorage.setItem("user-info", JSON.stringify(combinedUser))
        } else {
            setUser(null)
            localStorage.removeItem("user-info")
        }
        setLoading(false)
    }, [isLoggingOut])// Add dependency

    const refreshUserData = useCallback(async () => {
        const currentUser = auth.currentUser
        if (!currentUser) return

        setLoading(true)
        try {
            const userDocRef = doc(db, "users", currentUser.uid)
            const docSnapshot = await getDoc(userDocRef)

            if (docSnapshot.exists()) {
                updateUserState(currentUser, docSnapshot.data())
            } else {
                updateUserState(null)
            }
        } catch (error) {
            console.error("Error refreshing user data:", error)
            toast.error("Failed to refresh user data")
        } finally {
            setLoading(false)
        }
    }, [updateUserState])

    useEffect(() => {
        let unsubscribeFirestore: () => void

        const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
            if (authUser) {
                const userDocRef = doc(db, "users", authUser.uid)
                unsubscribeFirestore = onSnapshot(
                    userDocRef,
                    (docSnapshot) => {
                        if (docSnapshot.exists()) {
                            updateUserState(authUser, docSnapshot.data())
                        } else {
                            updateUserState(null)
                        }
                    },
                    (error) => {
                        console.error("Firestore listener error:", error)
                        updateUserState(authUser)
                    }
                )
            } else {
                updateUserState(null)
                if (unsubscribeFirestore) unsubscribeFirestore()
            }
        })

        return () => {
            unsubscribeAuth()
            if (unsubscribeFirestore) unsubscribeFirestore()
        }
    }, [updateUserState])

    const logout = useCallback(async () => {
        setIsLoggingOut(true) // Set logout flag
        setLoading(true)

        try {
            // Clear Firestore listener first
            localStorage.removeItem("user-info")
            setUser(null)

            await signOut(auth)
            toast.success("Logged out successfully")
            router.push("/admin/login")
        } catch (error) {
            console.error("Logout error:", error)
            toast.error("Failed to logout")
        } finally {
            setLoading(false)
            setIsLoggingOut(false) // Reset logout flag
        }
    }, [router])

    // Hydrate from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem("user-info")
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser)
                if (parsedUser.uid) {
                    // Verify the user is still logged in
                    if (auth.currentUser?.uid === parsedUser.uid) {
                        setUser(parsedUser)
                    } else {
                        localStorage.removeItem("user-info")
                    }
                }
            } catch (error) {
                console.error("Error parsing stored user:", error)
                localStorage.removeItem("user-info")
            }
        }
    }, [])

    return (
        <AuthContext.Provider value={{ user, loading, logout, refreshUserData }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}