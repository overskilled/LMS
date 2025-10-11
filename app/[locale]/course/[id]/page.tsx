"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    User, Star, Clock, Book, GraduationCap, Globe, Check, Calendar,
    Facebook, Twitter, Linkedin, Instagram, ArrowUp, X, ShoppingCart,
    Play, Loader2, Loader2Icon, Clock as ClockIcon, Bell, LockKeyhole,
    CheckCircle
} from "lucide-react"
import MainLayout from "@/app/[locale]/main-layout"
import { courseApi } from "@/utils/courseApi"
import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { CourseData } from "@/types/course"
import { format, isFuture } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { CourseDetails } from "../components/course-details"
import { CurriculumSection } from "../components/curriculum-section"
import { LinksMap } from "@/types/link"
import { ReferralCodeDisplay } from "../components/referral-code-display"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { CountdownTimer } from "../components/countdown-timer"
import { ShareCourseButton } from "../components/share-course-button"
import { getAuth } from "firebase/auth"
import { generateAffiliateCodeClientSide } from "@/hooks/useGenerateAffiliateCode"
import { useTrackAffiliateClickClient } from "@/hooks/useTrackaffiliateLinks"
import { useAuth } from "@/context/authContext"
import WhatsAppFloating from "@/components/custom/WhatappButton"
import LearningObjectivesDisplay from "@/components/custom/Course/LearningObjectivesDisplay"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { useI18n } from "@/locales/client"
import Head from "next/head"
import { Metadata, ResolvingMetadata } from "next"


export default function Page() {

    const params = useParams()
    const courseId = params.id as string
    const [course, setCourse] = useState<CourseData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [hasPurchased, setHasPurchased] = useState(false)
    const [links, setLinks] = useState<LinksMap>({})
    const [generatingLinks, setGeneratingLinks] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showWaitlistForm, setShowWaitlistForm] = useState(false)
    const [email, setEmail] = useState("")
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isDeleting, setIsDeleting] = useState(false)
    const [open, setOpen] = useState(false)

    const t = useI18n()

    const { user } = useAuth()

    const { trackClick } = useTrackAffiliateClickClient();

    const priceLabels: Record<string, string> = {
        xafPrice: "XAF",
        usdPrice: "USD",
        euroPrice: "EUR",
    };

    const earlyPriceLabels: Record<string, string> = {
        usdPrice: "USD",
        euroPrice: "EUR",
    };

    // Check if course is upcoming
    const isUpcoming = course?.aboutCourse?.isUpcoming && course?.aboutCourse?.availabilityDate && isFuture(new Date(course?.aboutCourse?.availabilityDate))
    const isEarlyAccess = isUpcoming && course?.aboutCourse?.earlyAccessEnabled

    useEffect(() => {

        const fetchCourse = async () => {
            try {
                setLoading(true)
                const response = await courseApi.getCourseById(courseId)
                if (response.success && response.data) {
                    setCourse(response.data)
                    console.log("Courses: ", response.data)

                    if (user && Array.isArray(user.courses)) {
                        setHasPurchased(user.courses.includes(courseId))
                    } else {
                        setHasPurchased(false)
                    }
                } else {
                    // setError(response.message || "Failed to load course")
                }
            } catch (err) {
                // setError("An error occurred while fetching the course")
                console.error("Error fetching course:", err)
            } finally {
                setLoading(false)
            }
        }

        if (courseId) {
            fetchCourse()
        }


    }, [courseId, user])


    const handleCourseDelete = async () => {
        try {
            await courseApi.deleteCourse(courseId)

            toast.success(t("course.delete.success.title"), {
                description: t("course.delete.success.description"),
            });
        } catch (error: any) {
            console.error("An error occurred:", error);

            toast.error(t("course.delete.error.title"), {
                description: t("course.delete.error.description"),
            });
        } finally {
            setIsDeleting(false)
            router.push("/admin")
        }
    }


    useEffect(() => {
        const refCode = searchParams.get("ref")

        console.log("tracking click: ", refCode)
        trackClick(refCode!, courseId!);
    }, [searchParams])

    const formatPrice = (price: number, currency: string) => {
        if (price === 0) return t("course.free")

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0
        }).format(price)
    }

    const formatDate = (date: Date | string | number) => {
        if (typeof date === 'number') {
            return format(new Date(date), 'MMMM d, yyyy')
        }
        if (typeof date === 'string') {
            return format(new Date(date), 'MMMM d, yyyy')
        }
        return format(date, 'MMMM d, yyyy')
    }


    const generateCode = async (courseId: string) => {
        try {
            setGeneratingLinks(true);
            const { link } = await generateAffiliateCodeClientSide(courseId);
            setLinks((prev) => ({ ...prev, [courseId]: link }));
            toast.success(t("course.affiliate.success"));
        } catch (error: any) {
            console.error(error);
            // toast.error(error.message || "Failed to generate affiliate link");
        } finally {
            setGeneratingLinks(false);
        }
    };

    const joinWaitlist = async () => {
        if (!email) {
            toast.error(t("course.waitlist.invalidEmail"));
            return
        }

        setIsSubmitting(true)
        try {
            // Replace with your actual waitlist API call
            await fetch("/api/waitlist", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    courseId,
                    courseName: course?.aboutCourse.title
                })
            })

            toast.success(t("course.waitlist.success"));
            setShowWaitlistForm(false)
        } catch (error) {
            toast.error(t("course.waitlist.error"));
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) {
        return (
            <MainLayout>
                <div className="bg-white min-h-screen">
                    <div className="container mx-auto px-4 md:px-6 py-12">
                        <div className="grid lg:grid-cols-3 gap-12">
                            <div className="lg:col-span-2 space-y-10">
                                <Skeleton className="h-12 w-3/4" />
                                <Skeleton className="h-96 w-full" />
                            </div>
                            <div className="space-y-6">
                                <Skeleton className="h-96 w-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </MainLayout>
        )
    }

    if (error) {
        return (
            <MainLayout>
                <div className="bg-white min-h-screen flex items-center justify-center">
                    <Alert variant="destructive" className="w-full max-w-md">
                        <AlertTitle>{t('course.error')}</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => window.location.reload()}
                        >
                            {t('course.retry')}
                        </Button>
                    </Alert>
                </div>
            </MainLayout>
        )
    }

    if (!course) {
        return (
            <MainLayout>
                <div className="bg-white min-h-screen flex items-center justify-center">
                    <Alert>
                        <AlertTitle>{t("course.notFound.title")}</AlertTitle>
                        <AlertDescription>
                            {t("course.notFound.description")}
                        </AlertDescription>
                        <Link href="/courses" className="mt-4 inline-block">
                            <Button variant="outline">{t("course.notFound.browseButton")}</Button>
                        </Link>
                    </Alert>
                </div>
            </MainLayout>

        )
    }

    return (
        <MainLayout>
            {/* <Head> */}
            {/* <title>{course.aboutCourse.title}</title>
                <meta name="description" content={course.aboutCourse.shortDescription} /> */}

            {/* Open Graph / Facebook */}
            {/* <meta property="og:type" content="website" />
                <meta property="og:url" content={`https://learning.nanosatellitemissions.com/fr/course/${courseId}`} />
                <meta property="og:title" content={course.aboutCourse.title} />
                <meta property="og:description" content={course.aboutCourse.shortDescription} />
                <meta property="og:image" content={course?.courseDetails?.thumbnailImage?.downloadURL} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" /> */}

            {/* Twitter */}
            {/* <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content={`https://yourdomain.com/course/${courseId}`} />
                <meta property="twitter:title" content={course.aboutCourse.title} />
                <meta property="twitter:description" content={course.aboutCourse.shortDescription} />
                <meta property="twitter:image" content={course?.courseDetails?.thumbnailImage?.downloadURL} /> */}
            {/* </Head> */}



            <div className="bg-white min-h-screen">
                {/* Breadcrumbs */}
                <div className="bg-blue-50 text-black py-3 px-4 md:px-6">
                    <nav className="container mx-auto text-sm">
                        <ol className="flex items-center space-x-2">
                            <li>
                                <Link href="/" className="hover:underline" prefetch={false}>
                                    {t("breadcrumbs.home")}
                                </Link>
                            </li>
                            <li>/</li>
                            <li>
                                <Link href="/courses" className="hover:underline" prefetch={false}>
                                    {t("breadcrumbs.courses")}
                                </Link>
                            </li>
                            <li>/</li>
                            <li className="text-blue-400">{course.aboutCourse.title}</li>
                        </ol>
                    </nav>
                </div>

                {/* Hero Section */}
                <section className="bg-blue-50 text-black py-8 md:py-12 lg:py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start">
                            {/* Left Content */}
                            <div className="space-y-4 md:space-y-6">
                                <div className="flex items-center gap-2 flex-wrap">
                                    {isUpcoming && (
                                        <Badge className="bg-purple-600 text-white px-3 py-1 rounded-md text-sm font-semibold">
                                            {t("course.comingSoon")}
                                        </Badge>
                                    )}
                                    <Badge className="bg-gray-700 text-gray-200 px-3 py-1 rounded-md text-sm font-semibold capitalize">
                                        {course.courseDetails.courseCategory}
                                    </Badge>
                                </div>

                                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                                    {course.aboutCourse.title}
                                </h1>

                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-600 text-base md:text-lg flex-wrap">
                                    <span>
                                        {t("course.lastUpdate")} {formatDate(course.updatedAt)}
                                    </span>
                                    {isUpcoming && course?.aboutCourse?.availabilityDate && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                                            <span>
                                                {t("course.starts")} {formatDate(course?.aboutCourse?.availabilityDate)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {user?.admin ? (
                                    <div className="flex items-center gap-4">
                                        <span className="text-gray-600">
                                            {course.enrollmentCount || 0} {t("course.alreadyEnrolled")}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4 text-gray-600 text-base md:text-lg">
                                        <span>
                                            ({course.enrollmentCount || 0} {t("course.students")})
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Right Content - Video and Price Box */}
                            <div className="flex flex-col items-center lg:items-end w-full">
                                <div className="w-full max-w-md lg:max-w-full bg-gray-600 rounded-lg overflow-hidden shadow-lg">
                                    <div className="relative w-full aspect-video bg-black flex items-center justify-center text-gray-400 overflow-hidden">
                                        {course.courseDetails.previewVideo?.downloadURL ? (
                                            <iframe
                                                src={course.courseDetails.previewVideo.downloadURL}
                                                title={`Preview of ${course.aboutCourse.title}`}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                        ) : course.courseDetails.thumbnailImage?.downloadURL ? (
                                            <img
                                                src={course.courseDetails.thumbnailImage.downloadURL}
                                                alt={`Thumbnail of ${course.aboutCourse.title}`}
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                                <p className="text-white">Video not available</p>
                                            </div>
                                        )}

                                        {/* ✅ Overlay only if upcoming */}
                                        {isUpcoming && (
                                            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center p-4 md:p-6">
                                                <ClockIcon className="h-8 w-8 md:h-12 md:w-12 text-white mb-3 md:mb-4" />
                                                <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                                                    {t("course.upcoming.title")}
                                                </h3>

                                                {course?.aboutCourse?.availabilityDate && (
                                                    <CountdownTimer
                                                        targetDate={new Date(course.aboutCourse.availabilityDate)}
                                                        className="text-white mb-3 md:mb-4"
                                                    />
                                                )}

                                                <p className="text-gray-300 text-sm md:text-base mb-3 md:mb-4">
                                                    {t("course.upcoming.expectedLaunch", {
                                                        date: formatDate(course?.aboutCourse?.availabilityDate!),
                                                    })}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 md:p-6 space-y-4">
                                        {/* Pricing Display */}
                                        {!hasPurchased && !course?.aboutCourse?.pricing?.isFree && (
                                            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                                                {isEarlyAccess && course?.aboutCourse?.earlyAccessPrice ? (
                                                    <>
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-xl md:text-2xl font-bold flex text-white gap-2">
                                                                {formatPrice(
                                                                    course?.aboutCourse?.earlyAccessPrice!,
                                                                    course.aboutCourse.pricing.currency
                                                                )}
                                                                {Object.entries(course.aboutCourse.pricing)
                                                                    .filter(([key]) => key in earlyPriceLabels)
                                                                    .map(([key, value]) => (
                                                                        <span key={key}>
                                                                            {formatPrice(value as number, earlyPriceLabels[key])}
                                                                        </span>
                                                                    ))}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-gray-300">{t("course.earlyAccessPrice")}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-xl md:text-2xl font-bold text-white flex flex-wrap gap-2 md:gap-4">
                                                        {Object.entries(course.aboutCourse.pricing)
                                                            .filter(([key]) => key in priceLabels)
                                                            .map(([key, value]) => (
                                                                <span key={key}>
                                                                    {formatPrice(value as number, priceLabels[key])}
                                                                </span>
                                                            ))}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Course Metadata */}
                                        <div className="grid grid-cols-2 gap-3 md:gap-4 text-gray-300 text-sm md:text-base">
                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="h-4 w-4 md:h-5 md:w-5" />
                                                <span>{t("course.level")}</span>
                                            </div>
                                            <span className="capitalize">
                                                {course.courseDetails.difficulty || course.courseDetails.courseLevel}
                                            </span>

                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 md:h-5 md:w-5" />
                                                <span>{t("course.duration")}</span>
                                            </div>
                                            <span>{course.courseDetails.estimatedHours} {t("course.hours")}</span>

                                            <div className="flex items-center gap-2">
                                                <Book className="h-4 w-4 md:h-5 md:w-5" />
                                                <span>{t("course.lectures")}</span>
                                            </div>
                                            <span>{course.videos?.videos?.length || 0} {t("course.lectures")}</span>

                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="h-4 w-4 md:h-5 md:w-5" />
                                                <span>{t("course.subject")}</span>
                                            </div>
                                            <span className="capitalize">{course.courseDetails.courseCategory}</span>

                                            <div className="flex items-center gap-2">
                                                <Globe className="h-4 w-4 md:h-5 md:w-5" />
                                                <span>{t("course.language")}</span>
                                            </div>
                                            <span>{t("course.languagesAvailable")}</span>
                                        </div>

                                        {/* Material Includes */}
                                        <div className="space-y-2 pt-3 md:pt-4">
                                            <h4 className="text-base md:text-lg font-semibold text-white">
                                                {t("course.materialIncludes")}
                                            </h4>
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <Check className="h-4 w-4 md:h-5 md:w-5 text-green-400" />
                                                <span className="text-sm md:text-base">{t("course.videos")}</span>
                                            </div>
                                            {course.publishSettings.downloadableResources && (
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <Check className="h-4 w-4 md:h-5 md:w-5 text-green-400" />
                                                    <span className="text-sm md:text-base">{t("course.resources")}</span>
                                                </div>
                                            )}
                                            {course.publishSettings.certificateEnabled && (
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <Check className="h-4 w-4 md:h-5 md:w-5 text-green-400" />
                                                    <span className="text-sm md:text-base">{t("course.certificate")}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="space-y-3 pt-3">
                                            {user?.admin ? (
                                                <div className="space-y-3">
                                                    <Link href={`/admin/edit-course/${courseId}`}>
                                                        <Button className="w-full text-white py-2 md:py-3 text-base md:text-lg font-semibold">
                                                            {t("course.updateCourse")}
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="outline"
                                                        disabled={generatingLinks}
                                                        className="w-full text-sm md:text-md mt-2"
                                                        onClick={() => generateCode(courseId)}
                                                    >
                                                        {generatingLinks ? (
                                                            <>
                                                                <Loader2Icon className="animate-spin mr-2 h-3 w-3 md:h-4 md:w-4" />
                                                                {t("course.generating")}
                                                            </>
                                                        ) : (
                                                            t("course.generateAffiliate")
                                                        )}
                                                    </Button>
                                                </div>
                                            ) : user?.admin && user?.superAdmin ? (
                                                <div className="space-y-3">
                                                    <Link href={`/admin/edit-course/${courseId}`}>
                                                        <Button className="w-full text-white py-2 md:py-3 text-base md:text-lg font-semibold">
                                                            {t("course.updateCourse")}
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="outline"
                                                        disabled={generatingLinks}
                                                        className="w-full text-sm md:text-md"
                                                        onClick={() => generateCode(courseId)}
                                                    >
                                                        {generatingLinks ? (
                                                            <>
                                                                <Loader2Icon className="animate-spin mr-2 h-3 w-3 md:h-4 md:w-4" />
                                                                {t("course.generating")}
                                                            </>
                                                        ) : (
                                                            t("course.generateAffiliate")
                                                        )}
                                                    </Button>
                                                    <Button
                                                        onClick={() => setOpen(true)}
                                                        variant="destructive"
                                                        disabled={isDeleting}
                                                        className="w-full border-gray-600 text-white bg-red-500 hover:bg-red-400 py-2 md:py-3 text-base md:text-lg font-semibold"
                                                    >
                                                        {t("course.deleteCourse")}
                                                    </Button>
                                                </div>
                                            ) : user?.uid && hasPurchased ? (
                                                <div className="space-y-3">
                                                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 md:py-3 text-base md:text-lg font-semibold rounded-md flex items-center justify-center gap-2">
                                                        <Play className="h-4 w-4 md:h-5 md:w-5" />
                                                        {t("course.continueLearning")}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        disabled={generatingLinks}
                                                        className="w-full text-sm md:text-md"
                                                        onClick={() => generateCode(courseId)}
                                                    >
                                                        {generatingLinks ? (
                                                            <>
                                                                <Loader2Icon className="animate-spin mr-2 h-3 w-3 md:h-4 md:w-4" />
                                                                {t("course.generating")}
                                                            </>
                                                        ) : (
                                                            t("course.generateAffiliate")
                                                        )}
                                                    </Button>
                                                    {links[courseId] && (
                                                        <div className="mt-2 flex flex-col w-full">
                                                            <ReferralCodeDisplay referralCode={links[courseId]} />
                                                            <p className="mt-2 md:mt-4 w-full text-xs text-center text-gray-300">
                                                                {t("course.copyReferral")}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : user?.uid && isUpcoming ? (
                                                <div className="space-y-3">
                                                    {isEarlyAccess ? (
                                                        <Button
                                                            onClick={() => router.push(`/course/${courseId}/choose-payment-method?ref=${searchParams.get("ref")}`)}
                                                            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 md:py-3 text-base md:text-lg font-semibold"
                                                        >
                                                            {t("course.getEarlyAccess")}
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => setShowWaitlistForm(true)}
                                                            className="w-full text-sm md:text-md"
                                                        >
                                                            <Bell className="h-4 w-4 md:h-5 md:w-5" />
                                                            {t("course.joinWaitlist")}
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="outline"
                                                        disabled={generatingLinks}
                                                        className="w-full text-sm md:text-md"
                                                        onClick={() => generateCode(courseId)}
                                                    >
                                                        {generatingLinks ? (
                                                            <>
                                                                <Loader2 className="animate-spin mr-2 h-3 w-3 md:h-4 md:w-4" />
                                                                {t("course.generating")}
                                                            </>
                                                        ) : (
                                                            t("course.generateAffiliate")
                                                        )}
                                                    </Button>
                                                    {links[courseId] && (
                                                        <div className="mt-2 flex flex-col w-full">
                                                            <ReferralCodeDisplay referralCode={links[courseId]} />
                                                            <p className="mt-2 md:mt-4 w-full text-xs text-center text-gray-300">
                                                                {t("course.copyReferral")}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : user?.uid ? (
                                                <div className="space-y-3">
                                                    {isEarlyAccess ? (
                                                        <Button
                                                            variant="default"
                                                            onClick={() => setShowWaitlistForm(true)}
                                                            className="w-full text-sm md:text-md"
                                                        >
                                                            <Bell className="h-4 w-4 md:h-5 md:w-5" />
                                                            {t("course.joinWaitlist")}
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            onClick={() => router.push(`/course/${courseId}/choose-payment-method?ref=${searchParams.get("ref")}`)}
                                                            className="w-full text-sm md:text-md"
                                                        >
                                                            <CheckCircle className="h-4 w-4 md:h-5 md:w-5" />
                                                            {t("course.enroll")}
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="outline"
                                                        disabled={generatingLinks}
                                                        className="w-full text-sm md:text-md"
                                                        onClick={() => generateCode(courseId)}
                                                    >
                                                        {generatingLinks ? (
                                                            <>
                                                                <Loader2 className="animate-spin mr-2 h-3 w-3 md:h-4 md:w-4" />
                                                                {t("course.generating")}
                                                            </>
                                                        ) : (
                                                            t("course.generateAffiliate")
                                                        )}
                                                    </Button>
                                                    {links[courseId] && (
                                                        <div className="mt-2 flex flex-col w-full">
                                                            <ReferralCodeDisplay referralCode={links[courseId]} />
                                                            <p className="mt-2 md:mt-4 w-full text-xs text-center text-gray-300">
                                                                {t("course.copyReferral")}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => router.push(`/login/?courseId=${courseId}&ref=${searchParams.get("ref")}`)}
                                                        className="w-full text-sm md:text-md"
                                                    >
                                                        {t("auth.loginToContinue")}
                                                    </Button>
                                                    <Button
                                                        onClick={() => router.push(`/register/?courseId=${courseId}&ref=${searchParams.get("ref")}`)}
                                                        className="w-full text-sm md:text-md"
                                                    >
                                                        {t("course.purchaseNow")} <span className="text-xs md:text-sm">{t("course.getEarlyAccess")}</span>
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


                <CurriculumSection
                    course={course}
                // hasPurchased={hasPurchased}
                // isUpcoming={isUpcoming}
                />

                {/* Waitlist Modal */}
                {
                    showWaitlistForm && (
                        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold">{t("waitlist.title")}</h3>
                                    <button
                                        onClick={() => setShowWaitlistForm(false)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    {t("waitlist.description")}
                                </p>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="waitlist-email" className="block mb-1">
                                            {t("waitlist.emailLabel")}
                                        </Label>
                                        <Input
                                            id="waitlist-email"
                                            type="email"
                                            placeholder={t("waitlist.emailPlaceholder")}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={joinWaitlist}
                                            disabled={isSubmitting}
                                            className="flex-1"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                                    {t("waitlist.joining")}
                                                </>
                                            ) : (
                                                t("waitlist.joinButton")
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowWaitlistForm(false)}
                                            className="flex-1"
                                        >
                                            {t("waitlist.cancelButton")}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Main Content Section */}
                <section className="py-12 md:py-20">
                    <div className="container mx-auto px-4 md:px-6 grid lg:grid-cols-3 gap-12">
                        {/* Left Column - Course Details */}
                        <div className="lg:col-span-2 space-y-10">
                            {/* Course Prerequisites */}
                            {course.aboutCourse.prerequisites?.length > 0 && (
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                        {t("course.prerequisites.title")}
                                    </h2>
                                    <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="lucide lucide-triangle-alert h-5 w-5"
                                        >
                                            <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                                            <path d="M12 9v4" />
                                            <path d="M12 17h.01" />
                                        </svg>
                                        <AlertTitle>{t("course.prerequisites.alertTitle")}</AlertTitle>
                                        <AlertDescription>{t("course.prerequisites.alertDescription")}</AlertDescription>
                                    </Alert>
                                    <div className="mt-6 space-y-4">
                                        {course.aboutCourse.prerequisites.map((prereq, i) => (
                                            <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <div className="bg-gray-200 rounded-md w-20 h-16 flex items-center justify-center">
                                                    <Book className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <span className="text-lg font-medium text-gray-800">{prereq}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* About This Course */}
                            <div className="w-full">
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">{t("course.about.title")}</h2>
                                <div className="space-y-4 text-gray-700 text-md mb-2 font-bold leading-relaxed whitespace-pre-line break-words">
                                    {course.aboutCourse.shortDescription}
                                </div>
                                <div className="space-y-4 text-gray-700 text-lg leading-relaxed whitespace-pre-line break-all overflow-x-auto">
                                    {course.aboutCourse.fullDescription}
                                </div>
                            </div>

                            {/* Upcoming Course Info */}
                            {isUpcoming && (
                                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-blue-100 p-3 rounded-full">
                                            <ClockIcon className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{t("course.upcoming.title")}</h3>
                                            <p className="text-gray-700 mb-4">{t("course.upcoming.description")}</p>
                                            {course?.aboutCourse?.availabilityDate && (
                                                <div className="flex items-center gap-2 text-blue-600 font-medium">
                                                    <Calendar className="h-5 w-5" />
                                                    <span>{t("course.upcoming.expectedLaunch", { date: formatDate(course?.aboutCourse?.availabilityDate) })}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>


                        {/* Right Column - Sidebar */}
                        <div className="space-y-6">

                            {/* Learning objectifs */}
                            <LearningObjectivesDisplay objectives={course?.aboutCourse?.learningObjectives} />


                            {/* Course Stats */}
                            {user?.admin && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">{t("course.stats.title")}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">{t("course.stats.studentsEnrolled")}</span>
                                            <span className="font-medium">{course.enrollmentCount || 0}</span>
                                        </div>
                                        {/* <div className="flex justify-between">
      <span className="text-gray-600">{t("course.stats.averageRating")}</span>
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 text-yellow-400 fill-current" />
        <span className="font-medium">4.8</span>
      </div>
    </div> */}
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">{t("course.stats.lastUpdated")}</span>
                                            <span className="font-medium">{formatDate(course.updatedAt)}</span>
                                        </div>
                                        {isUpcoming && course?.aboutCourse?.availabilityDate && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">{t("course.stats.expectedLaunch")}</span>
                                                <span className="font-medium">{formatDate(course?.aboutCourse?.availabilityDate)}</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}


                            {/* Share Course */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">{t("course.share.title")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ShareCourseButton
                                        courseId={courseId}
                                        title={course.aboutCourse.title}
                                        className="w-full"
                                    />
                                </CardContent>
                            </Card>

                        </div>
                    </div>
                </section>

                <CourseDetails course={course} />



                {/* Floating scroll to top button */}
                <WhatsAppFloating
                    href="https://chat.whatsapp.com/JInHyERsWK37QHnPQztDBo"
                    label="Join Whatsapp Community"
                    communityName="SATELLITES AND SPACE MISSIONS"
                />
            </div >
        </MainLayout >
    )
}