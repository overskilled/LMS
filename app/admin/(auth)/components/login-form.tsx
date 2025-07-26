"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Lock, Eye, EyeOff, User, Loader2 } from "lucide-react"
import { auth, db } from "@/firebase/config"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuthState, useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth'
import { doc, getDoc } from "firebase/firestore"

export default function AdminLoginForm() {
    const [showPassword, setShowPassword] = useState(false)

    const router = useRouter();
    const [errors, setErrors] = useState<string>("");

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [
        signInWithEmailAndPassword,
        user,
        loading,
        error,
    ] = useSignInWithEmailAndPassword(auth);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
    };

    

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors("");

        console.log("Submitted fields: ", formData)

        if (!formData.email || !formData.password) {
            setErrors('Fill in all fields');
            return;
        }

        try {
            const userInfo = await signInWithEmailAndPassword(formData.email, formData.password);
            
            if (!userInfo) {
                setErrors("We seem to have trouble login you in! Check your network or try later/");
                return;
            }

            const docRef = doc(db, "users", userInfo.user.uid);
            const docSnap = await getDoc(docRef);
            
            
            if (docSnap.exists()) {

                if(!docSnap.data().admin) {
                    setErrors("You don't have admin rights! Please contact the team.")
                    return
                }

                localStorage.setItem("user-info", JSON.stringify(docSnap.data()));
            } 
            
            
            toast.success("Logging successful, welcome back!")
            router.push("/admin")

        } catch (error: any) {
            let message = "An unexpected error occurred.";

            if (error.code) {
                switch (error.code) {
                    case "auth/invalid-email":
                        message = "The email address is not valid.";
                        break;
                    case "auth/user-disabled":
                        message = "This user account has been disabled.";
                        break;
                    case "auth/user-not-found":
                        message = "No user found with this email.";
                        break;
                    case "auth/wrong-password":
                        message = "Incorrect password.";
                        break;
                    case "auth/email-already-in-use":
                        message = "This email is already in use.";
                        break;
                    case "auth/weak-password":
                        message = "The password is too weak.";
                        break;
                    case "auth/too-many-requests":
                        message = "Too many requests. Please try again later.";
                        break;
                    case "auth/network-request-failed":
                        message = "Network error. Please check your connection.";
                        break;
                    case "auth/operation-not-allowed":
                        message = "This operation is not allowed.";
                        break;
                    case "auth/invalid-credential":
                        message = "Invalid login credentials.";
                        break;
                    case "auth/invalid-verification-code":
                        message = "Invalid verification code.";
                        break;
                    case "auth/missing-verification-code":
                        message = "Verification code is missing.";
                        break;
                    case "auth/internal-error":
                        message = "Internal server error. Try again.";
                        break;
                    default:
                        message = error.message || message;
                        break;
                }
            }

            toast.error(message);
            setErrors(message);
            console.error("Firebase Auth Error:", error);
        }

    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-white px-4 py-6 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                {/* Logo and Title */}
                <div className="flex flex-col items-center">
                    <Image src="/nmd-logo.webp" alt="NMD logo" width={150} height={150} />
                    <span className="-mt-4 rounded-xl bg-blue-100 px-2 py-1 text-sm font-medium text-neutral-900">
                        Courses
                    </span>
                </div>

                {/* Welcome Message */}
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">NMD COURSES ADMIN</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Please sign in to your account and get back at it.
                    </p>
                </div>

                {/* Form */}
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* Username / Email */}
                    <div className="relative">
                        <Label htmlFor="email-username" className="sr-only">
                            Email or Username
                        </Label>
                        <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <Input
                            id="email"
                            name="email-username"
                            type="text"
                            autoComplete="username"
                            required
                            placeholder="Enter username or email"
                            className="pl-10"
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <Label htmlFor="password" className="sr-only">
                            Password
                        </Label>
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            required
                            placeholder="••••••••"
                            className="pl-10 pr-10"
                            onChange={handleInputChange}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>

                    {/* Remember Me + Forgot */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="remember-me" />
                            <Label htmlFor="remember-me" className="text-sm text-gray-900">
                                Remember Me
                            </Label>
                        </div>
                        <Link
                            href="#"
                            className="text-sm font-medium text-blue-600 hover:underline"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    {/* Submit */}
                    <Button type="submit" className="w-full mt-6 bg-blue-500 hover:bg-blue-400">
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing In
                            </>
                        ) : (
                            <>Sign In</>
                        )}
                    </Button>
                    {errors && <p className="text-red-600 text-sm mt-2">{errors}</p>}

                </form>
            </div>
        </div>
    )
}
