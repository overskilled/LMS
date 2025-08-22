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
import MainLayout from "@/app/main-layout"
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

export default function CourseDetailPage() {
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

    const { user } = useAuth()

    const { trackClick } = useTrackAffiliateClickClient();

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
            
            toast.success("Course deleted successfully!", {
                description: "The course has been removed from the system.",
            })
        } catch (error: any) {
            console.error("An error occurred:", error)

            toast.error("Failed to delete course!", {
                description: "Please try again later.",
            })
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
        if (price === 0) return "Free"

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
            toast.success("Your referral link has been created successfully");
        } catch (error: any) {
            console.error(error);
            // toast.error(error.message || "Failed to generate affiliate link");
        } finally {
            setGeneratingLinks(false);
        }
    };

    const joinWaitlist = async () => {
        if (!email) {
            toast.success("Please enter a valid email address")
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

            toast.success("You've been added to the waitlist for this course")
            setShowWaitlistForm(false)
        } catch (error) {
            toast.success("Failed to join waitlist. Please try again.")
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
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => window.location.reload()}
                        >
                            Retry
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
                        <AlertTitle>Course not found</AlertTitle>
                        <AlertDescription>
                            The course you're looking for doesn't exist or may have been removed.
                        </AlertDescription>
                        <Link href="/courses" className="mt-4 inline-block">
                            <Button variant="outline">Browse Courses</Button>
                        </Link>
                    </Alert>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <div className="bg-white min-h-screen">
                {/* Breadcrumbs */}
                <div className="bg-blue-50 text-black py-3 px-4 md:px-6">
                    <nav className="container mx-auto text-sm">
                        <ol className="flex items-center space-x-2">
                            <li>
                                <Link href="/" className="hover:underline" prefetch={false}>
                                    Home
                                </Link>
                            </li>
                            <li>/</li>
                            <li>
                                <Link href="/courses" className="hover:underline" prefetch={false}>
                                    Courses
                                </Link>
                            </li>
                            <li>/</li>
                            <li className="text-blue-400">{course.aboutCourse.title}</li>
                        </ol>
                    </nav>
                </div>

                {/* Hero Section */}
                <section className="bg-blue-50 text-black py-12 md:py-20">
                    <div className="container mx-auto px-4 md:px-6 grid lg:grid-cols-2 gap-12 items-start">
                        {/* Left Content */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 flex-wrap">
                                {isUpcoming && (
                                    <Badge className="bg-purple-600 text-white px-3 py-1 rounded-md text-sm font-semibold">
                                        Coming Soon
                                    </Badge>
                                )}
                                {course.aboutCourse.pricing.discountPrice && (
                                    <Badge className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-semibold">
                                        {Math.round(
                                            ((course.aboutCourse.pricing.basePrice - course.aboutCourse.pricing.discountPrice) /
                                                course.aboutCourse.pricing.basePrice * 100
                                            ))
                                        }% OFF
                                    </Badge>
                                )}
                                <Badge className="bg-gray-700 text-gray-200 px-3 py-1 rounded-md text-sm font-semibold capitalize">
                                    {course.courseDetails.courseCategory}
                                </Badge>
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                                {course.aboutCourse.title}
                            </h1>
                            <div className="flex items-center gap-4 text-gray-600 text-lg flex-wrap">
                                {/* <div className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    <span>{course.instructor?.name || "Unknown Instructor"}</span>
                                </div> */}
                                <span>Last Update {formatDate(course.updatedAt)}</span>
                                {isUpcoming && course?.aboutCourse?.availabilityDate && (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        <span>Starts {formatDate(course?.aboutCourse?.availabilityDate)}</span>
                                    </div>
                                )}
                            </div>
                            {user?.admin ? (
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-600">{course.enrollmentCount || 0} already enrolled</span>
                                    <span className="text-gray-600">{(course?.aboutCourse?.metrics?.targetRevenue || 0).toLocaleString()} {course.aboutCourse.pricing.currency} revenue</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 text-gray-600 text-lg">
                                    <span className="font-bold">4.8 / 5</span>
                                    <div className="flex items-center gap-1 text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-5 w-5 ${i < 4 ? 'fill-current' : ''}`}
                                            />
                                        ))}
                                    </div>
                                    <span>({course.enrollmentCount || 0} students)</span>
                                </div>
                            )}
                        </div>

                        {/* Right Content - Video and Price Box */}
                        <div className="flex flex-col items-center lg:items-end">
                            <div className="w-full max-w-md bg-gray-600 rounded-lg overflow-hidden shadow-lg">
                                <div className="relative w-full aspect-video bg-black flex items-center justify-center text-gray-400 overflow-hidden">
                                    {isUpcoming ? (
                                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center p-6">
                                            <ClockIcon className="h-12 w-12 text-white mb-4" />
                                            <h3 className="text-xl font-bold text-white mb-2">
                                                Course Coming Soon
                                            </h3>
                                            {course?.aboutCourse?.availabilityDate && (
                                                <CountdownTimer
                                                    targetDate={new Date(course.aboutCourse?.availabilityDate)}
                                                    className="text-white mb-4"
                                                />
                                            )}
                                            <p className="text-gray-300 mb-4">
                                                This course will be available on {formatDate(course?.aboutCourse?.availabilityDate!)}
                                            </p>
                                            {/* <Button
                                                variant="default"
                                                onClick={() => setShowWaitlistForm(true)}
                                                className="flex items-center gap-2"
                                            >
                                                <Bell className="h-4 w-4" />
                                                Join Waitlist
                                            </Button> */}
                                        </div>
                                    ) : course.courseDetails.previewVideo?.downloadURL ? (
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
                                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center">
                                            <p>Video not available</p>
                                            <p className="text-sm">Preview video or thumbnail not set</p>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 space-y-4">
                                    {/* Pricing Display */}
                                    {!hasPurchased && (
                                        <div className="flex items-baseline gap-2">
                                            {isEarlyAccess && course?.aboutCourse?.earlyAccessPrice ? (
                                                <>
                                                    <span className="text-3xl font-bold text-white">
                                                        {formatPrice(
                                                            course?.aboutCourse?.earlyAccessPrice!,
                                                            course.aboutCourse.pricing.currency
                                                        )}
                                                    </span>
                                                    <span className="text-sm text-gray-300">Early Access Price</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-3xl font-bold text-white">
                                                        {formatPrice(
                                                            course.aboutCourse.pricing.discountPrice || course.aboutCourse.pricing.basePrice,
                                                            course.aboutCourse.pricing.currency
                                                        )}
                                                    </span>
                                                    {course.aboutCourse.pricing.discountPrice && (
                                                        <span className="text-md text-gray-400 line-through">
                                                            {formatPrice(course.aboutCourse.pricing.basePrice, course.aboutCourse.pricing.currency)}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* Course Metadata */}
                                    <div className="grid grid-cols-2 gap-4 text-gray-300">
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="h-5 w-5" />
                                            <span>Level</span>
                                        </div>
                                        <span className="capitalize">{course.courseDetails.difficulty || course.courseDetails.courseLevel}</span>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-5 w-5" />
                                            <span>Duration</span>
                                        </div>
                                        <span>{course.courseDetails.estimatedHours} hours</span>
                                        <div className="flex items-center gap-2">
                                            <Book className="h-5 w-5" />
                                            <span>Lectures</span>
                                        </div>
                                        <span>{course.videos?.videos?.length || 0} lectures</span>
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="h-5 w-5" />
                                            <span>Subject</span>
                                        </div>
                                        <span className="capitalize">{course.courseDetails.courseCategory}</span>
                                        <div className="flex items-center gap-2">
                                            <Globe className="h-5 w-5" />
                                            <span>Language</span>
                                        </div>
                                        <span>English & French</span>
                                    </div>

                                    {/* Material Includes */}
                                    <div className="space-y-2 pt-4">
                                        <h4 className="text-lg font-semibold text-white">Material Includes</h4>
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Check className="h-5 w-5 text-green-400" />
                                            <span>Videos</span>
                                        </div>
                                        {course.publishSettings.downloadableResources && (
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <Check className="h-5 w-5 text-green-400" />
                                                <span>Resources</span>
                                            </div>
                                        )}
                                        {course.publishSettings.certificateEnabled && (
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <Check className="h-5 w-5 text-green-400" />
                                                <span>Certificate of Completion</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    {user?.admin ? (
                                        <div className="space-y-3">
                                            <Link href={`/admin/edit-course/${courseId}`}>
                                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold rounded-md">
                                                    Update Course
                                                </Button>
                                            </Link>

                                            <Button
                                                variant="outline"
                                                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 py-3 text-lg font-semibold rounded-md bg-transparent"
                                            >
                                                View Analytics
                                            </Button>
                                            <Button
                                                onClick={() => setOpen(true)}
                                                variant="destructive"
                                                disabled={isDeleting}
                                                className="w-full border-gray-600 text-white bg-red-500 hover:bg-red-400 py-3 text-lg font-semibold rounded-md"
                                            >
                                                Delete Course
                                            </Button>

                                            <Dialog open={open} onOpenChange={setOpen}>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Delete Course</DialogTitle>
                                                        <DialogDescription>
                                                            Are you sure you want to delete this course? This action cannot be undone.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <DialogFooter>
                                                        <Button variant="secondary" onClick={() => setOpen(false)} disabled={isDeleting}>
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            onClick={handleCourseDelete}
                                                            disabled={isDeleting}
                                                            className="bg-red-500 hover:bg-red-400"
                                                        >
                                                            {isDeleting ? "Deleting..." : "Confirm Delete"}
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    ) : user?.uid && hasPurchased ? (
                                        <div className="space-y-3">
                                            <Button
                                                onClick={() => router.push(`/course/${courseId}/learn`)}
                                                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold rounded-md flex items-center gap-2"
                                            >
                                                <Play className="h-5 w-5" />
                                                Continue Learning
                                            </Button>
                                            <Button
                                                variant="outline"
                                                disabled={generatingLinks}
                                                className="w-full text-md"
                                                onClick={() => generateCode(courseId)}
                                            >
                                                {generatingLinks ? (
                                                    <>
                                                        <Loader2Icon className="animate-spin mr-2 h-4 w-4" />
                                                        Generating...
                                                    </>
                                                ) : (
                                                    "Generate Affiliate Code"
                                                )}
                                            </Button>
                                            {links[courseId] && (
                                                <div className="mt-2 flex flex-col w-full">
                                                    <ReferralCodeDisplay referralCode={links[courseId]} />
                                                    <p className="mt-4 w-full text-xs text-center text-gray-300">
                                                        Click the "Copy" button to get your referral code.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : user?.uid && isUpcoming ? (
                                        <div className="space-y-3">
                                            {isEarlyAccess ? (
                                                <Button
                                                    onClick={() => router.push(`/course/${courseId}/subscribe?ref=${searchParams.get("ref")}`)}
                                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold "
                                                >
                                                    Get Early Access
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setShowWaitlistForm(true)}
                                                    className="w-full text-md"
                                                >
                                                    <Bell className="h-5 w-5" />
                                                    Join Waitlist
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                disabled={generatingLinks}
                                                className="w-full text-md"
                                                onClick={() => generateCode(courseId)}
                                            >
                                                {generatingLinks ? (
                                                    <>
                                                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                                        Generating...
                                                    </>
                                                ) : (
                                                    "Generate Affiliate Code"
                                                )}
                                            </Button>
                                            {links[courseId] && (
                                                <div className="mt-2 flex flex-col w-full">
                                                    <ReferralCodeDisplay referralCode={links[courseId]} />
                                                    <p className="mt-4 w-full text-xs text-center text-gray-300">
                                                        Click the "Copy" button to get your referral code.
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
                                                    className="w-full text-md"
                                                >
                                                    <Bell className="h-5 w-5" />
                                                    Join Waitlist
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={() => router.push(`/course/${courseId}/subscribe?ref=${searchParams.get("ref")}`)}
                                                    className="w-full text-md"
                                                >
                                                    <CheckCircle className="h-5 w-5" />
                                                    Enroll
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                disabled={generatingLinks}
                                                className="w-full text-md"
                                                onClick={() => generateCode(courseId)}
                                            >
                                                {generatingLinks ? (
                                                    <>
                                                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                                        Generating...
                                                    </>
                                                ) : (
                                                    "Generate Affiliate Code"
                                                )}
                                            </Button>
                                            {links[courseId] && (
                                                <div className="mt-2 flex flex-col w-full">
                                                    <ReferralCodeDisplay referralCode={links[courseId]} />
                                                    <p className="mt-4 w-full text-xs text-center text-gray-300">
                                                        Click the "Copy" button to get your referral code.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <Button
                                                variant={"outline"}
                                                onClick={() => router.push(`/login/?courseId=${courseId}&ref=${searchParams.get("ref")}`)}
                                                className="w-full text-md"
                                            >
                                                Log into your account
                                            </Button>
                                            <Button
                                                onClick={() => router.push(`/register/?courseId=${courseId}&ref=${searchParams.get("ref")}`)}
                                                className="w-full text-md"
                                            >
                                                Purchase now <span className="text-sm">(Get early access)</span>
                                            </Button>

                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Waitlist Modal */}
                {showWaitlistForm && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold">Join the Waitlist</h3>
                                <button
                                    onClick={() => setShowWaitlistForm(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <p className="text-gray-600 mb-4">
                                Be the first to know when this course launches. We'll notify you when it's available.
                            </p>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="waitlist-email" className="block mb-1">
                                        Email Address
                                    </Label>
                                    <Input
                                        id="waitlist-email"
                                        type="email"
                                        placeholder="your@email.com"
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
                                                Joining...
                                            </>
                                        ) : (
                                            "Join Waitlist"
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowWaitlistForm(false)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Section */}
                <section className="py-12 md:py-20">
                    <div className="container mx-auto px-4 md:px-6 grid lg:grid-cols-3 gap-12">
                        {/* Left Column - Course Details */}
                        <div className="lg:col-span-2 space-y-10">
                            {/* Course Progress (for enrolled students) */}
                            {/* {hasPurchased && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            Your Progress
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>25% Complete</span>
                                                <span>3 of 12 lessons</span>
                                            </div>
                                            <Progress value={25} className="h-2" />
                                        </div>
                                    </CardContent>
                                </Card>
                            )} */}

                            {/* Course Prerequisites */}
                            {course.aboutCourse.prerequisites?.length > 0 && (
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Course Prerequisites</h2>
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
                                        <AlertTitle>Please note that this course has the following prerequisites</AlertTitle>
                                        <AlertDescription>which must be completed before it can be accessed</AlertDescription>
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
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">About This Course</h2>
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
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">This Course Is Coming Soon</h3>
                                            <p className="text-gray-700 mb-4">
                                                The instructor is still working on this course. You can join the waitlist to be notified when it's ready.
                                            </p>
                                            {course?.aboutCourse?.availabilityDate && (
                                                <div className="flex items-center gap-2 text-blue-600 font-medium">
                                                    <Calendar className="h-5 w-5" />
                                                    <span>Expected launch: {formatDate(course?.aboutCourse?.availabilityDate)}</span>
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
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Course Stats</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Students Enrolled</span>
                                        <span className="font-medium">{course.enrollmentCount || 0}</span>
                                    </div>
                                    {/* <div className="flex justify-between">
                                        <span className="text-gray-600">Average Rating</span>
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                            <span className="font-medium">4.8</span>
                                        </div>
                                    </div> */}
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Last Updated</span>
                                        <span className="font-medium">{formatDate(course.updatedAt)}</span>
                                    </div>
                                    {isUpcoming && course?.aboutCourse?.availabilityDate && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Expected Launch</span>
                                            <span className="font-medium">{formatDate(course?.aboutCourse?.availabilityDate)}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Share Course */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Share This Course</CardTitle>
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

                {/* <CurriculumSection
                    course={course}
                // hasPurchased={hasPurchased}
                // isUpcoming={isUpcoming}
                /> */}

                {/* Floating scroll to top button */}
                <WhatsAppFloating
                    href="https://chat.whatsapp.com/JuiXcG9AqDKCwNpqPnopBw"
                    label="Join AI group"
                    communityName="INTELLIGENCE ARTIFICIELLE"
                />
            </div>
        </MainLayout>
    )
}