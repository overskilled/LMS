"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Lock, Eye, EyeOff, User, Loader2 } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { useAuthState, useSignInWithEmailAndPassword } from "react-firebase-hooks/auth"
import { auth, db } from "@/firebase/config"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { doc, getDoc } from "firebase/firestore"

export default function LoginForm() {
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
    const [authUser, authLoading] = useAuthState(auth);

    console.log("Logged in user: ", authUser)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
    };
    // useEffect(() => {
    //     if (!authLoading && authUser) {
    //         router.push('/');
    //     }
    // }, [authUser, authLoading, router]);

    // useEffect(() => {
    //     if (user) {
    //         router.push('/');
    //     }
    // }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors("");

        if (!formData.email || !formData.password) {
            setErrors("Please fill in all required fields");
            return;
        }

        try {
            const userInfo = await signInWithEmailAndPassword(formData.email, formData.password);

            console.log("euerer: ", userInfo)

            if (!userInfo) {
                setErrors("We couldn't log you in, check you information or try later!")
            }

            if (userInfo) {
                const docRef = doc(db, "users", userInfo?.user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    localStorage.setItem("user-info", JSON.stringify(docSnap.data()));
                }

                router.push("/");
                toast.success("Welcome back to NMD Courses");
            }

            console.log("euerer: end",)

        } catch (error: any) {
            // let message = "An unexpected error occurred.";

            console.log("errorrrr: ", error.message)

            // ✅ Handle Firebase REST API error format
            const firebaseErrorCode = error?.error?.message || error?.message || "";

            switch (firebaseErrorCode) {
                case "INVALID_EMAIL":
                    error.message = "The email address is not valid.";
                    break;
                case "EMAIL_NOT_FOUND":
                    error.message = "No user found with this email.";
                    break;
                case "INVALID_PASSWORD":
                    error.message = "Incorrect password.";
                    break;
                case "USER_DISABLED":
                    error.message = "This user account has been disabled.";
                    break;
                case "EMAIL_EXISTS":
                    error.message = "This email is already in use.";
                    break;
                case "WEAK_PASSWORD":
                    error.message = "The password is too weak.";
                    break;
                case "TOO_MANY_ATTEMPTS_TRY_LATER":
                    error.message = "Too many login attempts. Please try again later.";
                    break;
                case "OPERATION_NOT_ALLOWED":
                    error.message = "This operation is not allowed.";
                    break;
                case "INVALID_LOGIN_CREDENTIALS":
                    error.message = "Invalid login credentials.";
                    break;
                case "NETWORK_REQUEST_FAILED":
                    error.message = "Network error. Please check your connection.";
                    break;
                case "INTERNAL_ERROR":
                    error.message = "Internal server error. Try again.";
                    break;
                default:
                    error.message = firebaseErrorCode || error.message;
                    break;
            }

            toast.error(error.message);
            setErrors(error.message);
            console.log("Firebase Auth Error:", error.message);
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
                    <h1 className="text-2xl font-bold text-gray-900">Welcome Back!</h1>
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
                            name="email"
                            type="text"
                            autoComplete="email"
                            required
                            placeholder="Enter your email"
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

                {/* Divider */}
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-gray-300" />
                    <span className="text-sm text-gray-500">or</span>
                    <div className="h-px flex-1 bg-gray-300" />
                </div>

                <div className="flex flex-col space-y-2 -mt-5">


                    <div className="text-center text-sm text-gray-600">
                        New on our platform?{" "}
                        <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                            Create an account
                        </Link>
                    </div>

                    {/* Google Sign-In */}
                    {/* <Button
                        type="button"
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                        <FcGoogle className="h-5 w-5" />
                        Sign in with Google
                    </Button> */}


                </div>
            </div>
        </div>
    )
}
