"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/firebase/config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Eye, EyeOff, User, Mail, Phone, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useI18n } from "@/locales/client"

export default function SignupForm() {
    const t = useI18n()
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams()

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

        const { name, email, phone, password } = formData;

        if (!name || !email || !phone || !password) {
            setError(t("signup.errorRequired"));
            setLoading(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name,
                email,
                phone,
                createdAt: new Date(),
            });

            toast.success(t("signup.success"));
            localStorage.setItem("user-info", JSON.stringify({ uid: user.uid, name, email, phone }));

            const courseId = searchParams.get("courseId")
            const refCode = searchParams.get("ref")

            if (courseId && refCode) {
                router.push(`/course/${courseId}/subscribe?ref=${searchParams.get("ref")}`)
            } else {
                router.push("/");
            }
        } catch (err: any) {
            console.error("Signup error:", err.message);
            setError(err.message);
            toast.error(t("signup.failed"), {
                description: err.message
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex w-full min-h-screen items-center justify-center bg-white px-4 py-6 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-6">
                {/* Logo */}
                <div className="flex flex-col items-center">
                    <Image src="/nmd-logo.webp" alt="NMD logo" width={150} height={150} priority />
                    <span className="-mt-4 rounded-xl bg-blue-100 px-2 py-1 text-sm font-medium text-neutral-900">
                        {t("signup.tag")}
                    </span>
                </div>

                {/* Heading */}
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">{t("signup.title")}</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        {t("signup.subtitle")}
                    </p>
                </div>

                {/* Form */}
                <form className="space-y-5" onSubmit={handleSubmit}>
                    {/* Full Name */}
                    <div className="relative">
                        <Label htmlFor="name" className="sr-only">{t("signup.nameLabel")}</Label>
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                            id="name"
                            type="text"
                            required
                            placeholder={t("signup.namePlaceholder")}
                            className="pl-10"
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Email */}
                    <div className="relative">
                        <Label htmlFor="email" className="sr-only">{t("signup.emailLabel")}</Label>
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                            id="email"
                            type="email"
                            autoComplete="email"
                            required
                            placeholder={t("signup.emailPlaceholder")}
                            className="pl-10"
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Phone */}
                    <div className="relative">
                        <Label htmlFor="phone" className="sr-only">{t("signup.phoneLabel")}</Label>
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                            id="phone"
                            type="tel"
                            required
                            placeholder={t("signup.phonePlaceholder")}
                            className="pl-10"
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <Label htmlFor="password" className="sr-only">{t("signup.passwordLabel")}</Label>
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder={t("signup.passwordPlaceholder")}
                            className="pl-10 pr-10"
                            onChange={handleInputChange}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            aria-label={t("signup.togglePassword")}
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
                                {t("signup.creating")}
                            </>
                        ) : (
                            t("signup.createBtn")
                        )}
                    </Button>
                </form>

                {/* Existing Account */}
                <p className="text-center text-sm text-gray-600">
                    {t("signup.haveAccount")}{" "}
                    <Link href="/login" className="text-blue-600 font-medium hover:underline">
                        {t("signup.signIn")}
                    </Link>
                </p>
            </div>
        </div>
    )
}
