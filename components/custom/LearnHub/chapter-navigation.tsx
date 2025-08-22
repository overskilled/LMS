"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
    CheckCircle,
    Lock,
    VideoIcon,
    ChevronDown,
    ChevronRight,
    Play,
    Clock,
    Trophy,
    Target,
    Star,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Chapter {
    id: string
    title: string
    description: string
    order: number
    estimatedDuration?: number
}

interface Video {
    id: string
    title: string
    chapterId: string
    order: number
    metadata: {
        duration: number
    }
}

interface ChapterNavigationProps {
    chapters: Chapter[]
    videos: Video[]
    currentChapter: number
    currentVideo: number
    completedVideos: Set<string>
    completedChapters: Set<string>
    quizPassed: Set<string>
    onChapterSelect: (index: number) => void
    onVideoSelect: (chapterIndex: number, videoIndex: number) => void
    canAccessChapter: (index: number) => boolean
}

export function ChapterNavigation({
    chapters,
    videos,
    currentChapter,
    currentVideo,
    completedVideos,
    completedChapters,
    quizPassed,
    onChapterSelect,
    onVideoSelect,
    canAccessChapter,
}: ChapterNavigationProps) {
    const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set([currentChapter]))

    const getChapterProgress = (chapterId: string) => {
        const chapterVideos = videos.filter((v) => v.chapterId === chapterId)
        const completedInChapter = chapterVideos.filter((v) => completedVideos.has(v.id)).length
        return chapterVideos.length > 0 ? (completedInChapter / chapterVideos.length) * 100 : 0
    }

    const getChapterDuration = (chapterId: string) => {
        const chapterVideos = videos.filter((v) => v.chapterId === chapterId)
        const totalSeconds = chapterVideos.reduce((sum, video) => sum + video.metadata.duration, 0)
        const minutes = Math.round(totalSeconds / 60)
        return minutes
    }

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes}m`
        const hours = Math.floor(minutes / 60)
        const remainingMinutes = minutes % 60
        return `${hours}h ${remainingMinutes}m`
    }

    const toggleChapterExpansion = (chapterIndex: number) => {
        setExpandedChapters((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(chapterIndex)) {
                newSet.delete(chapterIndex)
            } else {
                newSet.add(chapterIndex)
            }
            return newSet
        })
    }

    const getChapterStatus = (chapter: Chapter, index: number) => {
        const isAccessible = canAccessChapter(index)
        const isCompleted = completedChapters.has(chapter.id)
        const hasQuizPassed = quizPassed.has(chapter.id)
        const progress = getChapterProgress(chapter.id)

        if (!isAccessible) return { status: "locked", color: "text-muted-foreground" }
        if (isCompleted && hasQuizPassed) return { status: "completed", color: "text-primary" }
        if (progress > 0) return { status: "in-progress", color: "text-secondary" }
        return { status: "not-started", color: "text-muted-foreground" }
    }

    const getVideoStatus = (video: Video, chapterIndex: number, videoIndex: number) => {
        const isCompleted = completedVideos.has(video.id)
        const isCurrent = chapterIndex === currentChapter && videoIndex === currentVideo
        const isAccessible = canAccessChapter(chapterIndex)

        if (!isAccessible) return { status: "locked", icon: Lock, color: "text-muted-foreground" }
        if (isCompleted) return { status: "completed", icon: CheckCircle, color: "text-primary" }
        if (isCurrent) return { status: "current", icon: Play, color: "text-secondary" }
        return { status: "not-started", icon: VideoIcon, color: "text-muted-foreground" }
    }

    return (
        <div className="space-y-1">
            {chapters.map((chapter, chapterIndex) => {
                const isAccessible = canAccessChapter(chapterIndex)
                const isCompleted = completedChapters.has(chapter.id)
                const hasQuizPassed = quizPassed.has(chapter.id)
                const progress = getChapterProgress(chapter.id)
                const isActive = chapterIndex === currentChapter
                const isExpanded = expandedChapters.has(chapterIndex)
                const chapterVideos = videos.filter((v) => v.chapterId === chapter.id)
                const duration = getChapterDuration(chapter.id)
                const chapterStatus = getChapterStatus(chapter, chapterIndex)

                return (
                    <Collapsible key={chapter.id} open={isExpanded} onOpenChange={() => toggleChapterExpansion(chapterIndex)}>
                        <div
                            className={cn(
                                "rounded-lg border transition-all duration-200",
                                isActive && "border-primary/50 bg-primary/5",
                                !isAccessible && "opacity-60",
                            )}
                        >
                            {/* Chapter Header */}
                            <CollapsibleTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className={cn("w-full justify-start p-4 h-auto hover:bg-transparent", isActive && "bg-transparent")}
                                    onClick={() => {
                                        if (isAccessible) {
                                            onChapterSelect(chapterIndex)
                                            toggleChapterExpansion(chapterIndex)
                                        }
                                    }}
                                    disabled={!isAccessible}
                                >
                                    <div className="flex items-center gap-3 w-full">
                                        {/* Chapter Status Icon */}
                                        <div className="flex-shrink-0">
                                            {isCompleted && hasQuizPassed ? (
                                                <div className="relative">
                                                    <CheckCircle className="h-6 w-6 text-primary" />
                                                    <Trophy className="h-3 w-3 text-primary absolute -top-1 -right-1" />
                                                </div>
                                            ) : !isAccessible ? (
                                                <Lock className="h-6 w-6 text-muted-foreground" />
                                            ) : progress > 0 ? (
                                                <div className="relative">
                                                    <div className="w-6 h-6 rounded-full border-2 border-secondary bg-secondary/20" />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-2 h-2 rounded-full bg-secondary" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 rounded-full border-2 border-muted-foreground" />
                                            )}
                                        </div>

                                        {/* Chapter Info */}
                                        <div className="flex-1 text-left">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-semibold">{chapter.title}</p>
                                                {isCompleted && hasQuizPassed && (
                                                    <Badge variant="default" className="text-xs">
                                                        <Star className="h-3 w-3 mr-1" />
                                                        Completed
                                                    </Badge>
                                                )}
                                                {progress > 0 && progress < 100 && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {Math.round(progress)}%
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mb-2">{chapter.description}</p>

                                            {/* Chapter Metadata */}
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <VideoIcon className="h-3 w-3" />
                                                    <span>{chapterVideos.length} videos</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{formatDuration(duration)}</span>
                                                </div>
                                                {hasQuizPassed && (
                                                    <div className="flex items-center gap-1">
                                                        <Trophy className="h-3 w-3" />
                                                        <span>Quiz passed</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Progress Bar */}
                                            {progress > 0 && (
                                                <div className="mt-2">
                                                    <Progress value={progress} className="h-1.5" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Expand/Collapse Icon */}
                                        <div className="flex-shrink-0">
                                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                        </div>
                                    </div>
                                </Button>
                            </CollapsibleTrigger>

                            {/* Chapter Videos */}
                            <CollapsibleContent>
                                <div className="px-4 pb-4">
                                    <div className="ml-9 space-y-1 border-l-2 border-muted pl-4">
                                        {chapterVideos
                                            .sort((a, b) => a.order - b.order)
                                            .map((video, videoIndex) => {
                                                const videoStatus = getVideoStatus(video, chapterIndex, videoIndex)
                                                const isCurrent = chapterIndex === currentChapter && videoIndex === currentVideo
                                                const isVideoCompleted = completedVideos.has(video.id)
                                                const videoDuration = Math.round(video.metadata.duration / 60)

                                                return (
                                                    <Button
                                                        key={video.id}
                                                        variant={isCurrent ? "secondary" : "ghost"}
                                                        size="sm"
                                                        className={cn(
                                                            "w-full justify-start text-xs h-auto p-3 transition-all",
                                                            isCurrent && "bg-secondary/20 border border-secondary/30",
                                                            isVideoCompleted && "text-primary",
                                                            !isAccessible && "opacity-50 cursor-not-allowed",
                                                        )}
                                                        onClick={() => isAccessible && onVideoSelect(chapterIndex, videoIndex)}
                                                        disabled={!isAccessible}
                                                    >
                                                        <div className="flex items-center gap-3 w-full">
                                                            <videoStatus.icon className={cn("h-3 w-3", videoStatus.color)} />
                                                            <div className="flex-1 text-left">
                                                                <p className="font-medium truncate">{video.title}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-xs text-muted-foreground">{videoDuration}m</span>
                                                                    {isVideoCompleted && (
                                                                        <Badge variant="outline" className="text-xs px-1 py-0">
                                                                            Watched
                                                                        </Badge>
                                                                    )}
                                                                    {isCurrent && (
                                                                        <Badge variant="secondary" className="text-xs px-1 py-0">
                                                                            Current
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Button>
                                                )
                                            })}
                                    </div>

                                    {/* Quiz Indicator */}
                                    {chapterVideos.length > 0 && (
                                        <div className="ml-9 mt-2 pl-4">
                                            <div
                                                className={cn(
                                                    "flex items-center gap-2 p-2 rounded-lg border-2 border-dashed transition-colors",
                                                    hasQuizPassed ? "border-primary bg-primary/5" : "border-muted-foreground/30",
                                                )}
                                            >
                                                <div className="flex-shrink-0">
                                                    {hasQuizPassed ? (
                                                        <Trophy className="h-4 w-4 text-primary" />
                                                    ) : (
                                                        <Target className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-medium">{hasQuizPassed ? "Quiz Completed" : "Chapter Quiz"}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {hasQuizPassed ? "You passed the quiz!" : "Complete all videos to unlock"}
                                                    </p>
                                                </div>
                                                {hasQuizPassed && (
                                                    <Badge variant="default" className="text-xs">
                                                        Passed
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CollapsibleContent>
                        </div>
                    </Collapsible>
                )
            })}
        </div>
    )
}
