"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import Link from "next/link"
import { CourseCard } from "./course-card"
import { courseApi } from "@/utils/courseApi"
import { CourseData } from "@/types/course"

export default function CourseListing() {
    const [courses, setCourses] = useState<(CourseData)[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true)
                const response = await courseApi.getPublishedCourses()

                console.log("Response: ", response)
                if (response) {
                    setCourses(response)
                }
            } catch (err) {
                setError("Failed to fetch courses")
                console.log("Error fetching courses:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchCourses()
    }, [])

    if (loading) {
        return (
            <section className="flex w-[92%] mx-10 my-10 py-20 md:py-8 lg:py-0 bg-white font-slab">
                <div className="w-full px-4 md:px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-10">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden h-80 animate-pulse">
                                <div className="bg-gray-200 h-48 w-full"></div>
                                <div className="p-4 space-y-2">
                                    <div className="bg-gray-200 h-4 w-1/4 rounded"></div>
                                    <div className="bg-gray-200 h-6 w-full rounded"></div>
                                    <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
                                    <div className="flex justify-between pt-4">
                                        <div className="bg-gray-200 h-6 w-1/3 rounded"></div>
                                        <div className="bg-gray-200 h-4 w-1/3 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    if (error) {
        return (
            <section className="flex w-[92%] mx-10 my-10 py-20 md:py-8 lg:py-0 bg-white font-slab">
                <div className="w-full px-4 md:px-6 text-center py-20">
                    <p className="text-red-500">{error}</p>
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </Button>
                </div>
            </section>
        )
    }

    return (
        <section className="flex w-[92%] mx-10 my-10 py-20 md:py-8 lg:py-0 bg-white font-slab">
            <div className="w-full px-4 md:px-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold relative inline-block mb-4 md:mb-0">
                        Courses
                        <span className="absolute left-0 right-0 bottom-0 h-1 bg-yellow-400 rounded-full -mb-2" />
                    </h2>
                    {/* <div className="flex flex-wrap gap-2">
                        <Button variant="outline" className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white">
                            All
                        </Button>
                        <Button variant="outline" className="text-gray-700 hover:bg-gray-100 bg-transparent">
                            Trending
                        </Button>
                        <Button variant="outline" className="text-gray-700 hover:bg-gray-100 bg-transparent">
                            Popularity
                        </Button>
                    </div> */}
                </div>

                {courses.length === 0 ? (
                    <div className="text-center py-20">
                        <p>No courses found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-10">
                        {courses.map((course, idx) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                idx={idx}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}