"use client"

import { useState, useEffect, useRef } from "react"
import { PlayCircle, Lock, CheckCircle, X, Clock, BookOpen, Eye } from "lucide-react"
import { CourseData } from "@/types/course"
import Image from "next/image"
import ReactPlayer from "react-player"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/authContext"
import { useI18n } from "@/locales/client"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Link from "next/link"

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
    description?: string
    isPreview?: boolean
    metadata: VideoMetadata
    thumbnailImage?: {
        downloadURL: string
    }
    chapterId?: string
}

interface Chapter {
    id: string
    title: string
    description?: string
    order: number
}

export function CurriculumSection({ course }: CurriculumSectionProps) {
    const { user } = useAuth()
    const [currentVideo, setCurrentVideo] = useState<{
        url: string;
        title: string;
        videoId: string;
    } | null>(null)
    const [isPlayerOpen, setIsPlayerOpen] = useState(false)
    const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set())
    const [isPlaying, setIsPlaying] = useState(true)
    const playerRef = useRef<any>(null)
    const [prefetchedVideos, setPrefetchedVideos] = useState<Set<string>>(new Set())

    const t = useI18n()
    const hasPurchased = user?.courses?.includes(course?.id || "") || false

    // Enhanced prefetching function
    const prefetchVideo = (url: string, videoId: string) => {
        if (prefetchedVideos.has(videoId)) return

        // Method 1: Using link prefetch
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = url
        link.as = 'video'
        document.head.appendChild(link)

        // Method 2: Using fetch for better browser compatibility
        fetch(url, { method: 'GET', mode: 'no-cors' })
            .then(() => {
                console.log(`Prefetched video: ${videoId}`)
            })
            .catch(() => {
                // Silent fail - prefetch is just an optimization
            })

        setPrefetchedVideos(prev => new Set(prev.add(videoId)))
    }

    // Prefetch all preview videos on component mount
    useEffect(() => {
        if (course.videos?.videos) {
            course.videos.videos.forEach(video => {
                if (video.metadata?.downloadURL && (video.isPreview || hasPurchased)) {
                    prefetchVideo(video.metadata.downloadURL, video.id)
                }
            })
        }
    }, [course.videos?.videos, hasPurchased])

    // Group videos by chapter
    const chaptersMap = new Map<string, { chapter: Chapter; videos: VideoItem[] }>()

    course.videos.videos?.forEach(video => {
        const chapterId = video.chapterId || "default-chapter"
        if (!chaptersMap.has(chapterId)) {
            chaptersMap.set(chapterId, {
                chapter: {
                    id: chapterId,
                    title: `Chapter ${video.order + 1}`,
                    order: video.order
                },
                videos: []
            })
        }
        chaptersMap.get(chapterId)!.videos.push(video)
    })

    const chapters = Array.from(chaptersMap.values())
        .sort((a, b) => a.chapter.order - b.chapter.order)

    const formatDuration = (seconds: number) => {
        if (!seconds) return "0:00"
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = Math.floor(seconds % 60)
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    const getTotalDuration = (videos: VideoItem[]) => {
        return videos.reduce((total, video) => total + (video.metadata?.duration || 0), 0)
    }

    const getThumbnailUrl = (video: VideoItem) => {
        return video.thumbnailImage?.downloadURL || course.courseDetails.thumbnailImage?.downloadURL || "/placeholder-thumbnail.jpg"
    }

    const handleVideoClick = (video: VideoItem) => {
        if (hasPurchased || video.isPreview) {
            // Prefetch the video if not already done
            if (!prefetchedVideos.has(video.id)) {
                prefetchVideo(video.metadata.downloadURL, video.id)
            }

            console.log("Watching: ", video)

            setCurrentVideo({
                url: video.metadata.downloadURL,
                title: video.title || "Lecture",
                videoId: video.id
            })
            setIsPlayerOpen(true)
            setIsPlaying(true)
        }
    }

    const toggleChapter = (chapterId: string) => {
        const newExpanded = new Set(expandedChapters)
        if (newExpanded.has(chapterId)) {
            newExpanded.delete(chapterId)
        } else {
            newExpanded.add(chapterId)
        }
        setExpandedChapters(newExpanded)
    }

    const closePlayer = () => {
        setIsPlayerOpen(false)
        setCurrentVideo(null)
        setIsPlaying(false)
    }

    // Close player on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isPlayerOpen) {
                closePlayer()
            }
        }

        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [isPlayerOpen])

    // Close player when clicking outside content
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            closePlayer()
        }
    }

    const totalVideos = course.videos?.videos?.length || 0
    const totalDuration = getTotalDuration(course.videos?.videos || [])
    const previewVideos = course.videos?.videos?.filter(v => v.isPreview) || []

    return (
        <section className="py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white relative">
            {/* Enhanced Video Player Modal */}
            {isPlayerOpen && currentVideo && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
                    onClick={handleBackdropClick}
                >
                    <div className="w-full max-w-6xl relative bg-black rounded-xl overflow-hidden">
                        {/* Top Close Button */}
                        <button
                            onClick={closePlayer}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10 bg-gray-800 rounded-full p-2"
                            aria-label="Close video player"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        {/* Video Player */}
                        <div className="aspect-video w-full bg-black">
                            <video
                                src={currentVideo.url}
                                width="100%"
                                height="100%"
                                controls
                                controlsList="nodownload"
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                style={{ borderRadius: "12px", background: "black" }}
                            >
                                Your browser does not support the video tag.
                            </video>


                            {/* Mobile close button */}
                            <button
                                onClick={closePlayer}
                                className="absolute top-4 left-4 sm:hidden text-white bg-black/50 rounded-full p-2 z-10"
                                aria-label="Close video"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Video Info Footer */}
                        <div className="p-4 bg-gray-900 border-t border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <PlayCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                    <h3 className="text-lg font-bold text-white truncate">
                                        {currentVideo.title}
                                    </h3>
                                </div>
                                <button
                                    onClick={closePlayer}
                                    className="hidden sm:flex items-center gap-2 text-white hover:text-gray-300 transition-colors bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg"
                                >
                                    <X className="h-4 w-4" />
                                    <span>Close</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="container mx-auto px-4 md:px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            {t("course.curriculum.title")}
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            {t("course.curriculum.subtitle")}
                        </p>

                        {/* Course Stats */}
                        <div className="flex flex-wrap justify-center gap-6 mt-8">
                            <div className="flex items-center gap-2 text-gray-600">
                                <BookOpen className="h-5 w-5" />
                                <span>{chapters.length} {t("course.curriculum.chapters")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <PlayCircle className="h-5 w-5" />
                                <span>{totalVideos} {t("course.curriculum.lectures")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="h-5 w-5" />
                                <span>{formatDuration(totalDuration)} {t("course.curriculum.totalTime")}</span>
                            </div>
                            {previewVideos.length > 0 && !hasPurchased && (
                                <div className="flex items-center gap-2 text-blue-600">
                                    <Eye className="h-5 w-5" />
                                    <span>{previewVideos.length} {t("course.curriculum.previewLectures")}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Curriculum Content */}
                    <div className="space-y-6">
                        {chapters.map(({ chapter, videos }) => {
                            const chapterDuration = getTotalDuration(videos)
                            const isExpanded = expandedChapters.has(chapter.id)
                            const chapterVideos = videos.sort((a, b) => a.order - b.order)

                            return (
                                <Card key={chapter.id} className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    <CardHeader
                                        className={`p-6 cursor-pointer ${isExpanded ? 'bg-blue-50' : 'bg-white'}`}
                                        onClick={() => toggleChapter(chapter.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                                                    {chapter.order + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-xl font-bold text-gray-900">
                                                            {chapter.title}
                                                        </h3>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                        <span className="flex items-center gap-1">
                                                            <PlayCircle className="h-4 w-4" />
                                                            {videos.length} {t("course.curriculum.lectures")}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-4 w-4" />
                                                            {formatDuration(chapterDuration)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className="p-2 hover:bg-blue-100 rounded-full transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        toggleChapter(chapter.id)
                                                    }}
                                                >
                                                    <svg
                                                        className={`w-5 h-5 text-blue-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    {isExpanded && (
                                        <CardContent className="p-0 border-t border-gray-100">
                                            <div className="divide-y divide-gray-100">
                                                {chapterVideos.map((video, index) => {
                                                    const isAccessible = hasPurchased || video.isPreview

                                                    return (
                                                        <div
                                                            key={video.id}
                                                            className={`p-6 transition-all hover:bg-gray-50 ${!isAccessible ? 'opacity-60' : 'cursor-pointer'
                                                                }`}
                                                            onClick={() => isAccessible && handleVideoClick(video)}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                {/* Video Thumbnail */}
                                                                <div className="relative flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden">
                                                                    <Image
                                                                        src={getThumbnailUrl(video)}
                                                                        alt={video.title || `Lecture ${index + 1}`}
                                                                        width={128}
                                                                        height={80}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                    <div className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity ${isAccessible ? 'opacity-0 hover:opacity-100' : 'opacity-70'}`}>
                                                                        {isAccessible ? (
                                                                            <PlayCircle className="h-8 w-8 text-white transform scale-110" />
                                                                        ) : (
                                                                            <Lock className="h-6 w-6 text-white" />
                                                                        )}
                                                                    </div>
                                                                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-1 rounded">
                                                                        {formatDuration(video.metadata?.duration || 0)}
                                                                    </div>
                                                                </div>

                                                                {/* Video Info */}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <h4 className="text-lg font-semibold text-gray-900 truncate">
                                                                            {video.title!}
                                                                        </h4>
                                                                        {video.isPreview && !hasPurchased && (
                                                                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                                                                {t("course.curriculum.preview")}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-gray-600 text-sm line-clamp-2">
                                                                        {video.description || t("course.curriculum.noDescription")}
                                                                    </p>
                                                                </div>

                                                                {/* Status Icon */}
                                                                <div className="flex-shrink-0">
                                                                    {isAccessible ? (
                                                                        <PlayCircle className="h-6 w-6 text-blue-500" />
                                                                    ) : (
                                                                        <Lock className="h-6 w-6 text-gray-400" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            )
                        })}
                    </div>

                    {/* Call to Action */}
                    {!hasPurchased && (
                        <Card className="mt-12 border-l-4 border-l-blue-500 bg-blue-50">
                            <CardContent className="p-8 text-center">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    {t("course.curriculum.readyToStart")}
                                </h3>
                                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                                    {t("course.curriculum.enrollDescription")}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    {!user ? (
                                        <>
                                            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                                                <Link href="/login">
                                                    {t("course.curriculum.loginToEnroll")}
                                                </Link>
                                            </Button>
                                            <Button asChild variant="outline" size="lg" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                                                <Link href="/register">
                                                    {t("course.curriculum.createAccount")}
                                                </Link>
                                            </Button>
                                        </>
                                    ) : (
                                        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                                            <Link href={`/course/${course.id}/purchase`}>
                                                {t("course.curriculum.enrollNow")}
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                                <p className="text-sm text-blue-600 mt-4">
                                    {previewVideos.length > 0 &&
                                        `${previewVideos.length} ${t("course.curriculum.previewLecturesAvailable")}`
                                    }
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </section>
    )
}