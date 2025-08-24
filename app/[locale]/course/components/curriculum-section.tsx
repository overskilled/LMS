"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { PlayCircle, Lock, CheckCircle, X } from "lucide-react"
import { CourseData } from "@/types/course"
import Image from "next/image"
import { useState } from "react"
import ReactPlayer from "react-player"
import { ReactPlayerProps } from "react-player/types"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/context/authContext"
import { useI18n } from "@/locales/client"

interface CurriculumSectionProps {
    course: CourseData
}

interface VideoMetadata {
    downloadURL: string
    duration?: number
    [key: string]: any
}

interface VideoItem {
    id: string
    title?: string
    order: number
    isPreview?: boolean
    metadata: VideoMetadata
    thumbnailImage?: {
        downloadURL: string
    }
}

export function CurriculumSection({ course }: CurriculumSectionProps) {
    const { user } = useAuth()
    const [currentVideo, setCurrentVideo] = useState<{ url: string; title: string } | null>(null)
    const [isPlayerOpen, setIsPlayerOpen] = useState(false)

    const t = useI18n()

    console.log(user)
    const hasPurchased = user?.courses?.includes(course?.id || "") || false

    const formatDuration = (seconds: number) => {
        if (!seconds) return "0:00"
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = Math.floor(seconds % 60)
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    const getThumbnailUrl = (video: VideoItem) => {
        return video.thumbnailImage?.downloadURL || course.courseDetails.thumbnailImage?.downloadURL || ""
    }

    const handleVideoClick = (video: VideoItem) => {
        if (hasPurchased || video.isPreview) {
            setCurrentVideo({
                url: video.metadata.downloadURL,
                title: video.title || "Lecture"
            })
            setIsPlayerOpen(true)
        }
    }

    const closePlayer = () => {
        setIsPlayerOpen(false)
        setCurrentVideo(null)
    }

    return (
        <section className="py-12 md:py-16 bg-white relative">
            {isPlayerOpen && currentVideo && (
                <div className="fixed inset-0 bg-black h-[100vh] bg-opacity-90 z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-6xl relative">
                        <button
                            onClick={closePlayer}
                            className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
                            aria-label="Close video player"
                        >
                            <X className="h-8 w-8" />
                        </button>
                        <div className="bg-black rounded-lg overflow-hidden aspect-video w-full">
                            <ReactPlayer
                                src={currentVideo.url}
                                width="100%"
                                height="100%"
                                controls
                                playing
                            />
                        </div>
                        <div className="mt-4">
                            <h3 className="text-xl font-bold text-white">{currentVideo.title}</h3>
                        </div>
                    </div>
                </div>
            )}

            <div className="container mx-auto px-4 md:px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                        {t("course.curriculum.title")}
                    </h2>

                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <Accordion type="multiple" className="w-full">
                            {Array.from(new Set(course.videos.chapters?.map(v => v.order) || []))
                                .sort((a, b) => a - b)
                                .map((order, sectionIndex) => (
                                    <AccordionItem key={`section-${order}`} value={`section-${order}`}>
                                        <AccordionTrigger className="px-6 py-4 hover:bg-gray-100 hover:no-underline">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                    <span className="text-gray-600 font-semibold">{sectionIndex + 1}</span>
                                                </div>
                                                <div className="text-left">
                                                    <h3 className="font-semibold text-gray-900">
                                                        {order === 0 ? t("course.curriculum.gettingStarted") : `${t("course.curriculum.section")} ${sectionIndex + 1}`}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {course.videos.videos?.filter(v => v.order === order).length || 0} {t("course.curriculum.lectures")} • {formatDuration(
                                                            (course.videos.videos?.filter(v => v.order === order)
                                                                .reduce((total, video) => total + (video.metadata?.duration || 0), 0) || 0
                                                            )
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="border-t border-gray-200">
                                            <ul className="divide-y divide-gray-200">
                                                {course.videos.videos
                                                    ?.filter(v => v.order === order)
                                                    .map((video, index) => {
                                                        const isAccessible = hasPurchased || video.isPreview

                                                        return (
                                                            <li
                                                                key={video.id}
                                                                className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                                                                onClick={() => handleVideoClick(video)}
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className="relative flex-shrink-0 w-20 h-12">
                                                                        <Image
                                                                            src={getThumbnailUrl(video)}
                                                                            alt={video.title || `Lecture ${index + 1}`}
                                                                            width={80}
                                                                            height={45}
                                                                            className={`rounded-md object-cover w-full h-full ${isAccessible ? '' : 'opacity-70'}`}
                                                                        />
                                                                        <div className={`absolute inset-0 flex items-center justify-center ${isAccessible ? '' : 'bg-black/30'}`}>
                                                                            <PlayCircle className={`h-8 w-8 ${isAccessible ? 'text-white/80 hover:text-white' : 'text-gray-400'} transition-colors`} />
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <h4 className="text-gray-900 font-medium truncate">
                                                                            {video.title || `${t("course.curriculum.lecture")} ${index + 1}`}
                                                                            {video.isPreview && !hasPurchased && (
                                                                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                                                    {t("course.curriculum.preview")}
                                                                                </span>
                                                                            )}
                                                                        </h4>
                                                                        <p className="text-sm text-gray-500 mt-1">
                                                                            {formatDuration(video.metadata?.duration || 0)}
                                                                        </p>
                                                                    </div>
                                                                    {hasPurchased ? (
                                                                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                                                    ) : (
                                                                        <Lock className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                                                    )}
                                                                </div>
                                                            </li>
                                                        )
                                                    })}
                                            </ul>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                        </Accordion>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold text-gray-900">{t("course.curriculum.total")}</h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {course.videos?.videos?.length || 0} {t("course.curriculum.lectures")} • {formatDuration(
                                            (course.videos?.videos?.reduce((total, video) => total + (video.metadata?.duration || 0), 0) || 0)
                                        )}
                                    </p>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {course.courseDetails.estimatedHours} {t("course.curriculum.totalHours")}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* <div className="mt-8 flex gap-4">
                        {!user ? (
                            <>
                                <Button asChild className="w-full md:w-auto">
                                    <Link href="/login">Login to Enroll</Link>
                                </Button>
                                <Button asChild variant="outline" className="w-full md:w-auto">
                                    <Link href="/register">Create Account</Link>
                                </Button>
                            </>
                        ) : !hasPurchased ? (
                            <Button asChild className="w-full md:w-auto">
                                <Link href={`/course/${course.id}/purchase`}>Purchase Course</Link>
                            </Button>
                        ) : (
                            <Button asChild className="w-full md:w-auto">
                                <Link href={`/course/${course.id}/learn`}>Continue Learning</Link>
                            </Button>
                        )}
                    </div> */}
                </div>
            </div>
        </section>
    )
}