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
} from "lucide-react"
import CourseDetails from "@/components/course-details"
import CurriculumSection from "@/components/curriculum-section"

export default function CourseDetailPage() {
    return (
        <div className="bg-white min-h-screen">
            {/* Breadcrumbs */}
            <div className="bg-blue-50 text-black  py-3 px-4 md:px-6">
                <nav className="container mx-auto text-sm">
                    <ol className="flex items-center space-x-2">
                        <li>
                            <Link href="#" className="hover:underline" prefetch={false}>
                                Home
                            </Link>
                        </li>
                        <li>/</li>
                        <li>
                            <Link href="#" className="hover:underline" prefetch={false}>
                                courses
                            </Link>
                        </li>
                        <li>/</li>
                        <li className="text-blue-400">Mastering Data Modeling Fundamentals</li>
                    </ol>
                </nav>
            </div>

            {/* Hero Section */}
            <section className="bg-blue-50 text-black py-12 md:py-20">
                <div className="container mx-auto px-4 md:px-6 grid lg:grid-cols-2 gap-12 items-start">
                    {/* Left Content */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <Badge className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-semibold">-39%</Badge>
                            <Badge className="bg-gray-700 text-gray-200 px-3 py-1 rounded-md text-sm font-semibold">
                                Data Modeling
                            </Badge>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                            Mastering Data Modeling Fundamentals
                        </h1>
                        <div className="flex items-center gap-4 text-gray-600 text-lg">
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                <span>Owen Christ</span>
                            </div>
                            <span>Last Update December 1, 2025</span>
                        </div>
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
                            <span className="ml-4">0 already enrolled</span>
                        </div>
                    </div>

                    {/* Right Content - Video and Price Box */}
                    <div className="flex flex-col items-center lg:items-end">
                        <div className="w-full max-w-md bg-gray-600 rounded-lg overflow-hidden shadow-lg">
                            <div className="relative w-full aspect-video bg-black flex items-center justify-center text-gray-400">
                                <iframe
                                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="absolute inset-0 w-full h-full"
                                ></iframe>
                                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center">
                                    <p>Video non disponible</p>
                                    <p className="text-sm">Cette vidéo est privée</p>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-white">70,000 FCFA</span>
                                    <span className="text-md text-gray-400 line-through">150,000 FCFA</span>
                                    <Badge className="bg-blue-600 text-white px-2 py-1 rounded-md text-sm font-semibold">39% OFF</Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-gray-300">
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="h-5 w-5" />
                                        <span>Level</span>
                                    </div>
                                    <span>Beginner</span>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        <span>Duration</span>
                                    </div>
                                    <span>15.3 hours</span>
                                    <div className="flex items-center gap-2">
                                        <Book className="h-5 w-5" />
                                        <span>Lectures</span>
                                    </div>
                                    <span>4 lectures</span>
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="h-5 w-5" />
                                        <span>Subject</span>
                                    </div>
                                    <span>Data Modeling</span>
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-5 w-5" />
                                        <span>Language</span>
                                    </div>
                                    <span>French</span>
                                </div>
                                <div className="space-y-2 pt-4">
                                    <h4 className="text-lg font-semibold text-white">Material Includes</h4>
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <Check className="h-5 w-5 text-green-400" />
                                        <span>Videos</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <Check className="h-5 w-5 text-green-400" />
                                        <span>Booklets</span>
                                    </div>
                                </div>
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold rounded-md mt-4">
                                    Add to cart
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 py-3 text-lg font-semibold rounded-md bg-transparent"
                                >
                                    Add to wishlist
                                </Button>
                                <div className="flex justify-center gap-4 pt-4">
                                    <Link href="#" className="text-gray-400 hover:text-blue-600" prefetch={false}>
                                        <Facebook className="h-6 w-6" />
                                    </Link>
                                    <Link href="#" className="text-gray-400 hover:text-blue-600" prefetch={false}>
                                        <Twitter className="h-6 w-6" />
                                    </Link>
                                    <Link href="#" className="text-gray-400 hover:text-blue-600" prefetch={false}>
                                        <Linkedin className="h-6 w-6" />
                                    </Link>
                                    <Link href="#" className="text-gray-400 hover:text-blue-600" prefetch={false}>
                                        <Instagram className="h-6 w-6" />
                                    </Link>
                                </div>
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
                            <div className="mt-6 flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <Image
                                    src="https://placehold.co/600x400"
                                    width={80}
                                    height={60}
                                    alt="Artificial Intelligence & Machine Learning"
                                    className="rounded-md object-cover"
                                />
                                <span className="text-lg font-medium text-gray-800">Artificial Intelligence & Machine Learning</span>
                            </div>
                        </div>

                        {/* About This Course */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">About This Course</h2>
                            <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
                                <p>
                                    In this course, I take you from the fundamentals and concepts of data modeling all the way through a
                                    number of best practices and techniques that you'll need to build data models in your organization.
                                    You'll find many examples that clearly demonstrate the key concepts and techniques covered throughout
                                    the course.
                                </p>
                                <p>
                                    By the end of the course, you'll be all set to not only put these principles to work, but also to make
                                    the key data modeling and design decisions required by the "art" of data modeling that transcend the
                                    nuts-and-bolts techniques and design patterns.
                                </p>
                                <p>
                                    Organisations, or groups of organisations, may establish the need for master data management when they
                                    recognise that they have a problem with their master data. The symptoms of this problem are often
                                    inconsistent data across different systems, poor data quality, and a lack of a single, authoritative
                                    source for critical business entities.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Floating side buttons */}
            <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-50">
                <Button variant="outline" size="icon" className="rounded-full shadow-md bg-white">
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close</span>
                </Button>
                <Button variant="outline" size="icon" className="rounded-full shadow-md bg-white">
                    <Globe className="h-5 w-5" />
                    <span className="sr-only">Globe</span>
                </Button>
                <Button variant="outline" size="icon" className="rounded-full shadow-md bg-white">
                    <ShoppingCart className="h-5 w-5" />
                    <span className="sr-only">Shopping Cart</span>
                </Button>
            </div>

            <CourseDetails />

            <CurriculumSection />

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
    )
}
