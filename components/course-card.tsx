"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Star, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

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
    idx: number
}

export function CourseCard({ id, image, level, title, instructor, price, rating, reviews, isFree, idx }: Course) {
    const ref = useRef(null)
    const isInView = useInView(ref, {
        once: true,
        margin: "0px 0px -100px 0px",
    })

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut", delay: idx * 0.1 }}
            className="bg-white rounded-lg shadow-md overflow-hidden group relative transition-all"
        >
            <div className="relative">
                <Image
                    src={image || "/placeholder.svg"}
                    width={400}
                    height={250}
                    alt={title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {isFree && (
                    <Badge className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                        FREE
                    </Badge>
                )}
            </div>

            <div className="p-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-600 mb-2">
                    {level}
                </Badge>
                <Link href={`/course/${id}`}>
                    <h3 className="text-lg font-semibold hover:underline hover:text-blue-400 text-gray-900 mb-2 line-clamp-2">{title}</h3>
                </Link>
                <p className="text-sm text-gray-600 mb-3">{instructor}</p>

                <div className="flex items-center justify-between">
                    <span className="text-xl font-semibold text-gray-900">{price}</span>
                    <div className="flex items-center gap-1 text-yellow-500">
                        {[...Array(rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                        <span className="text-sm text-gray-600">({reviews})</span>
                    </div>
                </div>
            </div>

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
