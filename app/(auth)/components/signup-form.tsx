"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithRedirect } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/firebase/config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Eye, EyeOff, User, Mail, Loader2 } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { toast } from "sonner"

export default function SignupForm() {
    const isLogin = false

    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const { name, email, password } = formData;

        if (!name || !email || !password) {
            setError("All fields are required.");
            setLoading(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Save user data to Firestore
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name,
                email,
                createdAt: new Date(),
            });

            toast.success("Account created successfully");
            localStorage.setItem("user-info", JSON.stringify({ uid: user.uid, name, email }));
            router.push("/");
        } catch (err: any) {
            console.error("Signup error:", err.message);
            setError(err.message);
            toast.error("Signup failed", {
                description: err.message
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithRedirect(auth, provider);
    };

   

    return (
        <div className="flex w-full min-h-screen items-center justify-center bg-white px-4 py-6 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-6">
                {/* Logo */}
                <div className="flex flex-col items-center">
                    <Image src="/nmd-logo.webp" alt="NMD logo" width={150} height={150} priority />
                    <span className="-mt-4 rounded-xl bg-blue-100 px-2 py-1 text-sm font-medium text-neutral-900">
                        Courses
                    </span>
                </div>

                {/* Heading */}
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Sign up to get started with our platform.
                    </p>
                </div>

                {/* Form */}
                <form className="space-y-5" onSubmit={handleSubmit}>
                    {/* Full Name */}
                    <div className="relative">
                        <Label htmlFor="name" className="sr-only">Full Name</Label>
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                            id="name"
                            type="text"
                            required
                            placeholder="Full name"
                            className="pl-10"
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Email */}
                    <div className="relative">
                        <Label htmlFor="email" className="sr-only">Email</Label>
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                            id="email"
                            type="email"
                            autoComplete="email"
                            required
                            placeholder="Email address"
                            className="pl-10"
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <Label htmlFor="password" className="sr-only">Password</Label>
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="Password"
                            className="pl-10 pr-10"
                            onChange={handleInputChange}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            aria-label="Toggle password visibility"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && <p className="text-red-600 text-sm">{error}</p>}

                    {/* Submit Button */}
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                Creating Account...
                            </>
                        ) : (
                            "Create Account"
                        )}
                    </Button>
                </form>

                {/* Existing Account */}
                <p className="text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-600 font-medium hover:underline">
                        Sign In
                    </Link>
                </p>

                {/* Divider */}
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-gray-300" />
                    <span className="text-sm text-gray-500">or</span>
                    <div className="h-px flex-1 bg-gray-300" />
                </div>

                {/* Google Sign-Up */}
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                    <FcGoogle className="h-5 w-5" />
                    Sign {isLogin ? "in" : "up"} with Google
                </Button>
            </div>
        </div>
    )
}
