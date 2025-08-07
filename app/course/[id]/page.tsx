"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    User,
    Star,
    Clock,
    Book,
    GraduationCap,
    Globe,
    Check,
    Facebook,
    Twitter,
    Linkedin,
    Instagram,
    ArrowUp,
    X,
    ShoppingCart,
    Play,
} from "lucide-react"
import MainLayout from "@/app/main-layout"
import { courseApi } from "@/utils/courseApi"
import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { CourseData } from "@/types/course"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { CourseDetails } from "../components/course-details"
import { CurriculumSection } from "../components/curriculum-section"
import { getAuth } from "firebase/auth"
import { LinksMap } from "@/types/link"
import { ReferralCodeDisplay } from "../components/referral-code-display"

export default function CourseDetailPage() {
    const params = useParams()
    const courseId = params.id as string
    const [course, setCourse] = useState<CourseData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [user, setUser] = useState<any>(null)
    const [hasPurchased, setHasPurchased] = useState(false)
    const [links, setLinks] = useState<LinksMap>({});
    const router = useRouter()

    useEffect(() => {
        // Get user info from localStorage
        const userInfo = typeof window !== 'undefined' ? localStorage.getItem('user-info') : null
        if (userInfo) {
            try {
                const parsedUser = JSON.parse(userInfo)
                setUser(parsedUser)

                // Check if user has purchased this course
                if (parsedUser.courses && Array.isArray(parsedUser.courses)) {
                    setHasPurchased(parsedUser.courses.includes(courseId))
                }
            } catch (e) {
                console.error("Error parsing user info", e)
            }
        }

        const fetchCourse = async () => {
            try {
                setLoading(true)
                const response = await courseApi.getCourseById(courseId)
                if (response.success && response.data) {
                    setCourse(response.data)
                } else {
                    setError(response.message || "Failed to load course")
                }
            } catch (err) {
                setError("An error occurred while fetching the course")
                console.error("Error fetching course:", err)
            } finally {
                setLoading(false)
            }
        }

        if (courseId) {
            fetchCourse()
        }
    }, [courseId])

    const searchParams = useSearchParams();

    useEffect(() => {
        const refCode = searchParams.get("ref");
        if (refCode) {
            fetch("/api/affiliate/track-click", {
                method: "POST",
                body: JSON.stringify({ code: refCode, courseId: params.id }),
            });
        }
    }, [searchParams, params.id]);

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
        const auth = getAuth();
        const token = await auth.currentUser?.getIdToken();

        const res = await fetch("/api/affiliate/generate", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ courseId })
        });

        const data = await res.json();
        setLinks((prev) => ({ ...prev, [courseId]: data.link }));
    };

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
                            <div className="flex items-center gap-2">
                                {course.aboutCourse.pricing.discountPrice && (
                                    <Badge className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-semibold">
                                        {/* {Math.round(
                                            ((course.aboutCourse.pricing.basePrice - course.aboutCourse.pricing.discountPrice) /
                                                course.aboutCourse.pricing.basePrice * 100
                                            )} */}
                                    </Badge>
                                )}
                                <Badge className="bg-gray-700 text-gray-200 px-3 py-1 rounded-md text-sm font-semibold capitalize">
                                    {course.courseDetails.courseCategory}
                                </Badge>
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                                {course.aboutCourse.title}
                            </h1>
                            <div className="flex items-center gap-4 text-gray-600 text-lg">
                                <div className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    {/* <span>{course.instructor?.name || "Unknown Instructor"}</span> */}
                                </div>
                                <span>Last Update {formatDate(course.updatedAt)}</span>
                            </div>
                            {user?.admin ? (
                                <>
                                    <span className="ml-4">{course.enrollmentCount || 0} already enrolled</span>
                                </>
                            )
                                : (
                                    <div className="flex items-center gap-4 text-gray-600 text-lg">
                                        <span className="font-bold">4.38 / 5</span>
                                        <div className="flex items-center gap-1 text-yellow-400">
                                            <Star className="h-5 w-5 fill-current" />
                                            <Star className="h-5 w-5 fill-current" />
                                            <Star className="h-5 w-5 fill-current" />
                                            <Star className="h-5 w-5 fill-current" />
                                            <Star className="h-5 w-5" />
                                        </div>
                                        <span>(8)</span>
                                    </div>
                                )
                            }
                        </div>

                        {/* Right Content - Video and Price Box */}
                        <div className="flex flex-col items-center lg:items-end">
                            <div className="w-full max-w-md bg-gray-600 rounded-lg overflow-hidden shadow-lg">
                                <div className="relative w-full aspect-video bg-black flex items-center justify-center text-gray-400 overflow-hidden">
                                    {course.courseDetails.previewVideo?.downloadURL ? (
                                        <iframe
                                            src={course.courseDetails.previewVideo.downloadURL}
                                            title={`Preview of ${course.aboutCourse.title}`}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="absolute inset-0 w-full h-full object-cover"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                            }}
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
                                    {!hasPurchased && (
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-bold text-white">
                                                {formatPrice(
                                                    course.aboutCourse.pricing.discountPrice || course.aboutCourse.pricing.basePrice,
                                                    course.aboutCourse.pricing.currency
                                                )}
                                            </span>
                                            {course.aboutCourse.pricing.discountPrice && (
                                                <>
                                                    <span className="text-md text-gray-400 line-through">
                                                        {formatPrice(course.aboutCourse.pricing.basePrice, course.aboutCourse.pricing.currency)}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    )}

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
                                        <span>{course.videos?.length || 0} lectures</span>
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="h-5 w-5" />
                                            <span>Subject</span>
                                        </div>
                                        <span className="capitalize">{course.courseDetails.courseCategory}</span>
                                        <div className="flex items-center gap-2">
                                            <Globe className="h-5 w-5" />
                                            <span>Language</span>
                                        </div>
                                        <span>{course.aboutCourse.language}</span>
                                    </div>
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
                                    </div>
                                    {user?.admin ? (
                                        <>
                                            <Link href={`/admin/edit-course/${courseId}`}>
                                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold rounded-md mt-4">
                                                    Update Course
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 py-3 text-lg font-semibold rounded-md bg-transparent"
                                            >
                                                View Analytics
                                            </Button>
                                        </>
                                    ) : hasPurchased ? (
                                        <>
                                            <Button
                                                onClick={() => router.push(`/course/${courseId}/learn`)}
                                                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold rounded-md mt-4 flex items-center gap-2"
                                            >
                                                <Play className="h-5 w-5" />
                                                Continue Learning
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 py-3 text-lg font-semibold rounded-md bg-transparent"
                                                onClick={() => generateCode(courseId)}
                                            >
                                                Generate affiliation code
                                            </Button>
                                            {links[courseId] && (
                                                <div className="mt-2">
                                                    <ReferralCodeDisplay referralCode={links[courseId]} />
                                                    <p className="mt-4 text-sm text-muted-foreground">
                                                        Click the "Copy" button to get your referral code.
                                                    </p>
                                                </div>
                                            )}


                                        </>
                                    ) : (
                                        <>
                                            <Button onClick={() => router.push(`/course/${courseId}/subscribe?ref=${searchParams.get("ref")}`)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold rounded-md mt-4">
                                                Purchase Course
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full text-md"
                                                onClick={() => generateCode(courseId)}
                                            >
                                                Generate affiliation code
                                            </Button>
                                            {links[courseId] && (
                                                <div className="mt-2 flex flex-col w-full">
                                                    <ReferralCodeDisplay referralCode={links[courseId]} />
                                                    <p className="mt-4 w-full text-xs text-center text-gray-300">
                                                        Click the "Copy" button to get your referral code.
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Content Section (White Background) */}
                <section className="py-12 md:py-20">
                    <div className="container mx-auto px-4 md:px-6 grid lg:grid-cols-3 gap-12">
                        {/* Left Column - Course Details */}
                        <div className="lg:col-span-2 space-y-10">
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
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">About This Course</h2>
                                <div className="space-y-4 text-gray-700 text-md mb-2 font-bold leading-relaxed whitespace-pre-line">
                                    {course.aboutCourse.shortDescription}
                                </div>
                                <div className="space-y-4 text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                                    {course.aboutCourse.fullDescription}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <CourseDetails course={course} />

                <CurriculumSection course={course} hasPurchased={hasPurchased} />

                {/* Floating scroll to top button */}
                <Button
                    variant="default"
                    size="icon"
                    className="fixed bottom-4 right-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg z-50"
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                >
                    <ArrowUp className="h-6 w-6" />
                    <span className="sr-only">Scroll to top</span>
                </Button>
            </div>
        </MainLayout>
    )
}