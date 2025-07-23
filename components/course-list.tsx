"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import Link from "next/link"
import { CourseCard } from "./course-card"

interface Course {
    id: string
    image: string
    level: string
    title: string
    instructor: string
    price: string
    rating: number
    reviews: number
    isFree?: boolean
}

const courses: Course[] = [
    {
        id: "1",
        image: "/banner04.jpg",
        level: "All Levels",
        title: "Successful Negotiation: Master Your Negotiating...",
        instructor: "parra",
        price: "150,000 XAF",
        rating: 5,
        reviews: 2,
    },
    {
        id: "2",
        image: "/banner04.jpg",
        level: "All Levels",
        title: "Time Management Mastery: Do More, Stress...",
        instructor: "parra",
        price: "15,000 XAF",
        rating: 5,
        reviews: 2,
    },
    {
        id: "3",
        image: "/banner04.jpg",
        level: "Beginner",
        title: "Angular - The Complete Guide (2020 Edition)",
        instructor: "parra",
        price: "35,000 XAF",
        rating: 5,
        reviews: 2,
    },
    {
        id: "4",
        image: "/banner04.jpg",
        level: "All Levels",
        title: "Consulting Approach to Problem Solving",
        instructor: "parra",
        price: "Free",
        rating: 5,
        reviews: 2,
        isFree: true,
    },
    {
        id: "4",
        image: "/banner04.jpg",
        level: "All Levels",
        title: "Consulting Approach to Problem Solving",
        instructor: "parra",
        price: "Free",
        rating: 5,
        reviews: 2,
        isFree: true,
    },
    {
        id: "4",
        image: "/banner04.jpg",
        level: "All Levels",
        title: "Consulting Approach to Problem Solving",
        instructor: "parra",
        price: "Free",
        rating: 5,
        reviews: 2,
        isFree: true,
    },
    {
        id: "4",
        image: "/banner04.jpg",
        level: "All Levels",
        title: "Consulting Approach to Problem Solving",
        instructor: "parra",
        price: "Free",
        rating: 5,
        reviews: 2,
        isFree: true,
    },
    {
        id: "4",
        image: "/banner04.jpg",
        level: "All Levels",
        title: "Consulting Approach to Problem Solving",
        instructor: "parra",
        price: "Free",
        rating: 5,
        reviews: 2,
        isFree: true,
    },
]

export default function CourseListing() {
    return (
        <section className="flex w-[92%] mx-10 my-10 py-20 md:py-8 lg:py-0 bg-white font-slab">
            <div className="w-full px-4 md:px-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold relative inline-block mb-4 md:mb-0">
                        Top Courses
                        <span className="absolute left-0 right-0 bottom-0 h-1 bg-yellow-400 rounded-full -mb-2" />
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white">
                            All
                        </Button>
                        <Button variant="outline" className="text-gray-700 hover:bg-gray-100 bg-transparent">
                            Trending
                        </Button>
                        <Button variant="outline" className="text-gray-700 hover:bg-gray-100 bg-transparent">
                            Popularity
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-10">
                    {courses.map((course, idx) => (
                        <CourseCard key={course.id + idx} {...course} idx={idx} />
                    ))}
                </div>
            </div>
        </section>
    )
}
