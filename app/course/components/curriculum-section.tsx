"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { PlayCircle, Lock } from "lucide-react"
import { CourseData } from "@/types/course"

interface CurriculumSectionProps {
    course: CourseData
}

export function CurriculumSection({ course }: CurriculumSectionProps) {
    const formatDuration = (seconds: number) => {
        if (!seconds) return "0:00"
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = Math.floor(seconds % 60)
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    return (
        <section className="py-12 md:py-16 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Course Curriculum</h2>

                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <Accordion type="multiple" className="w-full">
                            <AccordionItem value="section-1">
                                <AccordionTrigger className="px-6 py-4 bg-gray-50 hover:bg-gray-100 hover:no-underline">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                            <span className="text-blue-600 font-semibold">1</span>
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-semibold text-gray-900">Getting Started</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {course.videos?.filter(v => v.order === 0).length || 0} lectures • {formatDuration(
                                                    course.videos?.filter(v => v.order === 0)
                                                        .reduce((total, video) => total + (video.duration || 0), 0) || 0
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="border-t border-gray-200">
                                    <ul className="divide-y divide-gray-200">
                                        {course.videos
                                            ?.filter(v => v.order === 0)
                                            .map((video, index) => (
                                                <li key={index} className="px-6 py-4 hover:bg-gray-50">
                                                    <div className="flex items-center gap-4">
                                                        <PlayCircle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-gray-900 font-medium truncate">
                                                                {video.title || `Lecture ${index + 1}`}
                                                            </h4>
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                {formatDuration(video.duration || 0)}
                                                                {video.isPreview && (
                                                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                                        Preview
                                                                    </span>
                                                                )}
                                                            </p>
                                                        </div>
                                                        <Lock className="h-5 w-5 text-gray-300" />
                                                    </div>
                                                </li>
                                            ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>

                            {Array.from(new Set(course.videos?.map(v => v.order) || []))
                                .filter(order => order !== 0)
                                .map((order, sectionIndex) => (
                                    <AccordionItem key={order} value={`section-${order}`}>
                                        <AccordionTrigger className="px-6 py-4 hover:bg-gray-100 hover:no-underline">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                    <span className="text-gray-600 font-semibold">{sectionIndex + 2}</span>
                                                </div>
                                                <div className="text-left">
                                                    <h3 className="font-semibold text-gray-900">
                                                        {`Section ${sectionIndex + 2}`}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {course.videos?.filter(v => v.order === order).length || 0} lectures • {formatDuration(
                                                            course.videos?.filter(v => v.order === order)
                                                                .reduce((total, video) => total + (video.duration || 0), 0) || 0
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="border-t border-gray-200">
                                            <ul className="divide-y divide-gray-200">
                                                {course.videos
                                                    ?.filter(v => v.order === order)
                                                    .map((video, index) => (
                                                        <li key={index} className="px-6 py-4 hover:bg-gray-50">
                                                            <div className="flex items-center gap-4">
                                                                <PlayCircle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="text-gray-900 font-medium truncate">
                                                                        {video.title || `Lecture ${index + 1}`}
                                                                    </h4>
                                                                    <p className="text-sm text-gray-500 mt-1">
                                                                        {formatDuration(video.duration || 0)}
                                                                    </p>
                                                                </div>
                                                                <Lock className="h-5 w-5 text-gray-300" />
                                                            </div>
                                                        </li>
                                                    ))}
                                            </ul>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                        </Accordion>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold text-gray-900">Total</h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {course.videos?.length || 0} lectures • {formatDuration(
                                            course.videos?.reduce((total, video) => total + (video.duration || 0), 0) || 0
                                        )}
                                    </p>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {course.courseDetails.estimatedHours} hours total length
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}