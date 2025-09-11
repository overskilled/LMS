"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Star, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { CourseData } from "@/types/course"
import { truncate } from "@/utils/helper"
import { useI18n } from "@/locales/client"

interface CourseCardProps {
    course: CourseData
    idx: number
    courseType?: string
    courseTypeDisplay?: string
}

export function CourseCard({ course, idx, courseType, courseTypeDisplay }: CourseCardProps) {
    const ref = useRef(null)
    const isInView = useInView(ref, {
        once: true,
        margin: "0px 0px -100px 0px",
    })

    const t = useI18n()

    // Helper function to format price
    const formatPrice = (price: number, currency: string) => {
        if (price === 0) return "Free"

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0
        }).format(price)
    }

    // Get badge styling based on course type
    const getTypeBadgeStyle = () => {
        switch (courseType) {
            case "masterclass":
                return "bg-purple-100 text-purple-800 border-purple-200";
            case "partner":
                return "bg-green-100 text-green-800 border-green-200";
            case "course":
            default:
                return "bg-blue-100 text-blue-800 border-blue-200";
        }
    }

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut", delay: idx * 0.1 }}
            className="bg-white rounded-lg shadow-md overflow-hidden group relative transition-all h-full flex flex-col"
        >
            <Link href={`/course/${course.id}`}>
                <div className="relative flex-shrink-0">
                    <Image
                        src={course.courseDetails?.thumbnailImage?.downloadURL || "/placeholder.svg"}
                        width={400}
                        height={250}
                        alt={course.aboutCourse.title}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {/* Course Type Badge */}
                        <Badge className={`${getTypeBadgeStyle()} px-2 py-1 rounded-md text-xs font-semibold border`}>
                            {courseTypeDisplay}
                        </Badge>

                        {/* Free Badge */}
                        {course.aboutCourse?.pricing?.xafPrice === 0 && (
                            <Badge className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                                {t('course.free')}
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="p-4 flex-grow flex flex-col">
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600 mb-2 w-fit capitalize">
                        {course.courseDetails.courseLevel}
                    </Badge>
                    <h3 className="text-lg font-semibold hover:underline hover:text-blue-400 text-gray-900 mb-2 line-clamp-2">
                        {course.aboutCourse.title}
                    </h3>
                    <div className="space-y-4 text-gray-400 text-sm mb-2 font-meduim leading-relaxed whitespace-pre-line break-words">
                        {truncate(course.aboutCourse.shortDescription, 90)}
                    </div>

                    <div className="mt-auto flex flex-col gap-2">
                        {/* Prices */}
                        {course.aboutCourse?.pricing && (
                            <>
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-gray-900">XAF:</span>
                                    <span className="text-xl font-semibold text-gray-900">
                                        {formatPrice(course.aboutCourse.pricing.xafPrice, "XAF")}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-gray-900">USD:</span>
                                    <span className="text-xl font-semibold text-gray-900">
                                        {formatPrice(course.aboutCourse.pricing.usdPrice, "USD")}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-gray-900">EUR:</span>
                                    <span className="text-xl font-semibold text-gray-900">
                                        {formatPrice(course.aboutCourse.pricing.euroPrice, "EUR")}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </Link>
            <motion.div
                initial={{ opacity: 0, x: 10 }}
                whileHover={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <ChevronRight className="text-blue-600 w-6 h-6" />
            </motion.div>
        </motion.div>
    )
}