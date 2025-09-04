"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Lock, Eye, EyeOff, User, Loader2 } from "lucide-react"
import { useAuthState, useSignInWithEmailAndPassword } from "react-firebase-hooks/auth"
import { auth, db } from "@/firebase/config"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { doc, getDoc } from "firebase/firestore"
import { useI18n } from "@/locales/client"

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false)
    const [errors, setErrors] = useState<string>("")

    const router = useRouter()
    const t = useI18n()

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })

    const searchParams = useSearchParams()

    const [
        signInWithEmailAndPassword,
        user,
        loading,
        error,
    ] = useSignInWithEmailAndPassword(auth);
    const [authUser, authLoading] = useAuthState(auth);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors("");

        if (!formData.email || !formData.password) {
            setErrors(t("login.errors.required"));
            return;
        }

        try {
            const userInfo = await signInWithEmailAndPassword(formData.email, formData.password);

            if (!userInfo) {
                setErrors(t("login.errors.invalidCredentials"));
            }

            if (userInfo) {
                const docRef = doc(db, "users", userInfo?.user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    localStorage.setItem("user-info", JSON.stringify(docSnap.data()));
                }

                toast.success(t("login.success"));

                const courseId = searchParams.get("courseId")
                const refCode = searchParams.get("ref")

                if (courseId && refCode) {
                    router.push(`/course/${courseId}?ref=${refCode}`)
                } else {
                    router.push("/")
                }
            }

        } catch (error: any) {
            const firebaseErrorCode = error?.error?.message || error?.message || "";
            setErrors(firebaseErrorCode);
            toast.error(firebaseErrorCode);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-white px-4 py-6 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                {/* Logo and Title */}
                <div className="flex flex-col items-center">
                    <Image src="/nmd-logo.webp" alt="NMD logo" width={150} height={150} />
                    <span className="-mt-4 rounded-xl bg-blue-100 px-2 py-1 text-sm font-medium text-neutral-900">
                        {t("login.courses")}
                    </span>
                </div>

                {/* Welcome Message */}
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">{t("login.title")}</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        {t("login.subtitle")}
                    </p>
                </div>

                {/* Form */}
                <form className="space-y-6" onSubmit={handleSubmit}>

                    {/* Username / Email */}
                    <div className="relative">
                        <Label htmlFor="email" className="sr-only">
                            {t("login.emailLabel")}
                        </Label>
                        <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <Input
                            id="email"
                            name="email"
                            type="text"
                            autoComplete="email"
                            required
                            placeholder={t("login.emailPlaceholder")}
                            className="pl-10"
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <Label htmlFor="password" className="sr-only">
                            {t("login.passwordLabel")}
                        </Label>
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            required
                            placeholder={t("login.passwordPlaceholder")}
                            className="pl-10 pr-10"
                            onChange={handleInputChange}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            aria-label={showPassword ? t("login.hidePassword") : t("login.showPassword")}
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>

                    {/* Remember Me + Forgot */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="remember-me" />
                            <Label htmlFor="remember-me" className="text-sm text-gray-900">
                                {t("login.rememberMe")}
                            </Label>
                        </div>
                        <Link
                            href="/reset"
                            className="text-sm font-medium text-blue-600 hover:underline"
                        >
                            {t("login.forgotPassword")}
                        </Link>
                    </div>

                    {/* Submit */}
                    <Button type="submit" className="w-full mt-6 bg-blue-500 hover:bg-blue-400">
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t("login.signingIn")}
                            </>
                        ) : (
                            <>{t("login.signIn")}</>
                        )}
                    </Button>
                    {errors && <p className="text-red-600 text-sm mt-2">{errors}</p>}
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-gray-300" />
                    <span className="text-sm text-gray-500">{t("login.or")}</span>
                    <div className="h-px flex-1 bg-gray-300" />
                </div>

                <div className="flex flex-col space-y-2 -mt-5">
                    <div className="text-center text-sm text-gray-600">
                        {t("login.newUser")}{" "}
                        <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                            {t("login.createAccount")}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
