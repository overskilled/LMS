"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, BookOpen, ChevronRight, Video, BarChart3, Trophy } from "lucide-react"

import { useProgressTracking } from "@/hooks/use-progress-tracking"
import { useCourseCompletion } from "@/hooks/use-course-completion"
import { ChapterNavigation } from "@/components/custom/LearnHub/chapter-navigation"
import { VideoPlayer } from "@/components/custom/LearnHub/video-player"
import { ProgressDashboard } from "@/components/custom/LearnHub/progress-dashboard"
import { CertificateGenerator } from "@/components/custom/LearnHub/certificate-generator"
import { CourseCompletionModal } from "@/components/custom/LearnHub/course-completion-modal"
import { QuizModal } from "@/components/custom/LearnHub/quiz-modal"
import {
    VideoPlayerSkeleton,
    VideoInfoSkeleton,
    ChapterNavigationSkeleton,
    HeaderSkeleton,
    ProgressDashboardSkeleton,
} from "@/components/custom/LearnHub/loading-skeletons"
import { courseApi } from "@/utils/courseApi"
import type { CourseData } from "@/types/course"

export default function LearningHubPage() {
    const params = useParams()
    const courseId = params.id as string

    const [courseData, setCourseData] = useState<CourseData | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [showQuiz, setShowQuiz] = useState(false)
    const [showCertificate, setShowCertificate] = useState(false)

    const {
        progressData,
        markVideoComplete,
        markChapterComplete,
        markQuizPassed,
        updateCurrentPosition,
        updateVideoWatchTime,
        resetProgress,
    } = useProgressTracking(courseId)

    const { completionData, showCompletionModal, hideCompletionModal, markCertificateGenerated } = useCourseCompletion(
        progressData,
        courseData?.videos.videos.length || 0,
        courseData?.videos.chapters.length || 0,
    )

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                setLoading(true)
                setError(null)
                const response = await courseApi.getCourseById(courseId)
                if (response.success && response.data) {
                    setCourseData(response.data)
                    console.log("Courses: ", response.data)
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

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <HeaderSkeleton />
                <div className="container mx-auto px-4 py-6">
                    <Tabs defaultValue="learning" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-6">
                            <TabsTrigger value="learning" className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                <span className="hidden sm:inline">Learning</span>
                            </TabsTrigger>
                            <TabsTrigger value="progress" className="flex items-center gap-2">
                                <BarChart3 className="h-4 w-4" />
                                <span className="hidden sm:inline">Progress</span>
                            </TabsTrigger>
                            <TabsTrigger value="certificate" className="flex items-center gap-2">
                                <Trophy className="h-4 w-4" />
                                <span className="hidden sm:inline">Certificate</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="learning">
                            <div className="grid lg:grid-cols-4 gap-6">
                                <div className="lg:col-span-1">
                                    <ChapterNavigationSkeleton />
                                </div>
                                <div className="lg:col-span-3 space-y-6">
                                    <VideoPlayerSkeleton />
                                    <VideoInfoSkeleton />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="progress">
                            <ProgressDashboardSkeleton />
                        </TabsContent>

                        <TabsContent value="certificate">
                            <ProgressDashboardSkeleton />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        )
    }

    if (error || !courseData) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="max-w-md mx-auto">
                    <CardContent className="text-center py-12">
                        <h3 className="text-xl font-semibold mb-2">Course Not Found</h3>
                        <p className="text-muted-foreground mb-4">
                            {error || "The course you're looking for doesn't exist or couldn't be loaded."}
                        </p>
                        <Button onClick={() => window.location.reload()}>Try Again</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const chapters = courseData.videos.chapters
    const videos = courseData.videos.videos

    const currentChapter = progressData.currentChapter
    const currentVideo = progressData.currentVideo
    const completedVideos = new Set(progressData.completedVideos)
    const completedChapters = new Set(progressData.completedChapters)
    const quizPassed = new Set(progressData.quizPassed)

    const currentChapterData = chapters[currentChapter]
    const currentChapterVideos = videos.filter((v) => v.chapterId === currentChapterData?.id)
    const currentVideoData = currentChapterVideos[currentVideo]

    const overallProgress = videos.length > 0 ? (completedVideos.size / videos.length) * 100 : 0

    const setCurrentChapter = (index: number) => {
        updateCurrentPosition(index, 0)
    }

    const setCurrentVideo = (index: number) => {
        updateCurrentPosition(currentChapter, index)
    }

    const handleVideoComplete = (videoId: string) => {
        markVideoComplete(videoId)

        // Check if all videos in current chapter are completed
        const chapterVideoIds = currentChapterVideos.map((v) => v.id)
        const chapterCompleted = chapterVideoIds.every((id) => completedVideos.has(id) || id === videoId)

        if (chapterCompleted) {
            setShowQuiz(true)
        }
    }

    const handleQuizPass = (chapterId: string) => {
        markQuizPassed(chapterId)
        markChapterComplete(chapterId)
        setShowQuiz(false)
    }

    const canAccessChapter = (chapterIndex: number) => {
        if (chapterIndex === 0) return true
        const previousChapter = chapters[chapterIndex - 1]
        return quizPassed.has(previousChapter.id)
    }

    const getChapterProgress = (chapterId: string) => {
        const chapterVideos = videos.filter((v) => v.chapterId === chapterId)
        const completedInChapter = chapterVideos.filter((v) => completedVideos.has(v.id)).length
        return chapterVideos.length > 0 ? (completedInChapter / chapterVideos.length) * 100 : 0
    }

    const handleVideoSelect = (chapterIndex: number, videoIndex: number) => {
        updateCurrentPosition(chapterIndex, videoIndex)
    }

    const handleDownloadCertificate = () => {
        setShowCertificate(true)
        markCertificateGenerated()
    }

    const handleCertificateDownload = (certificateData: string) => {
        // Create and trigger download
        const element = document.createElement("a")
        const file = new Blob([certificateData], { type: "text/plain" })
        element.href = URL.createObjectURL(file)
        element.download = `${courseData.title.replace(/\s+/g, "_")}_Certificate.txt`
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
        setShowCertificate(false)
    }

    const handleShareAchievement = () => {
        if (navigator.share) {
            navigator.share({
                title: "Course Completed!",
                text: `I just completed "${courseData.title}" with a ${Math.round(completionData.finalScore)}% score!`,
                url: window.location.href,
            })
        } else {
            // Fallback to copying to clipboard
            navigator.clipboard.writeText(
                `I just completed "${courseData.title}" with a ${Math.round(completionData.finalScore)}% score! ${window.location.href}`,
            )
        }
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <h1 className="text-xl sm:text-2xl font-bold text-foreground">{courseData.title}</h1>
                                {completionData.isCompleted && (
                                    <Badge variant="default" className="bg-primary w-fit">
                                        <Trophy className="h-3 w-3 mr-1" />
                                        Completed
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm sm:text-base text-muted-foreground">
                                Chapter {currentChapter + 1}: {currentChapterData?.title}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-xs sm:text-sm text-muted-foreground">Overall Progress</p>
                                <p className="text-sm sm:text-base font-semibold">{Math.round(overallProgress)}% Complete</p>
                            </div>
                            <div className="w-24 sm:w-32">
                                <Progress value={overallProgress} className="h-2" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-6">
                <Tabs defaultValue="learning" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="learning" className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            <span className="hidden sm:inline">Learning</span>
                        </TabsTrigger>
                        <TabsTrigger value="progress" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            <span className="hidden sm:inline">Progress</span>
                        </TabsTrigger>
                        <TabsTrigger value="certificate" className="flex items-center gap-2" disabled={!completionData.isCompleted}>
                            <Trophy className="h-4 w-4" />
                            <span className="hidden sm:inline">Certificate</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="learning">
                        <div className="grid lg:grid-cols-4 gap-6">
                            {/* Sidebar - Chapter Navigation */}
                            <div className="lg:col-span-1 order-2 lg:order-1">
                                <Card className="lg:sticky lg:top-24">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                                            Course Content
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ChapterNavigation
                                            chapters={chapters}
                                            videos={videos}
                                            currentChapter={currentChapter}
                                            currentVideo={currentVideo}
                                            completedVideos={completedVideos}
                                            completedChapters={completedChapters}
                                            quizPassed={quizPassed}
                                            onChapterSelect={setCurrentChapter}
                                            onVideoSelect={handleVideoSelect}
                                            canAccessChapter={canAccessChapter}
                                        />
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Main Content */}
                            <div className="lg:col-span-3 space-y-6 order-1 lg:order-2">
                                {/* Video Player */}
                                {currentVideoData && (
                                    <Card>
                                        <CardContent className="p-0">
                                            <VideoPlayer
                                                videoUrl={currentVideoData.metadata.downloadURL}
                                                title={currentVideoData.title}
                                                onComplete={() => handleVideoComplete(currentVideoData.id)}
                                                duration={currentVideoData.metadata.duration}
                                            />
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Video Info */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <CardTitle className="text-lg sm:text-xl">{currentVideoData?.title}</CardTitle>
                                                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                                                    Chapter {currentChapter + 1} • Video {currentVideo + 1} of {currentChapterVideos.length}
                                                </p>
                                            </div>
                                            <Badge variant={completedVideos.has(currentVideoData?.id || "") ? "default" : "secondary"}>
                                                {completedVideos.has(currentVideoData?.id || "") ? "Completed" : "In Progress"}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                <span>{Math.round(currentVideoData?.metadata.duration || 0)}s</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Video className="h-4 w-4" />
                                                <span>HD Quality</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Navigation */}
                                <div className="flex flex-col sm:flex-row justify-between gap-4">
                                    <Button
                                        variant="outline"
                                        disabled={currentVideo === 0 && currentChapter === 0}
                                        onClick={() => {
                                            if (currentVideo > 0) {
                                                setCurrentVideo(currentVideo - 1)
                                            } else if (currentChapter > 0) {
                                                setCurrentChapter(currentChapter - 1)
                                                const prevChapterVideos = videos.filter((v) => v.chapterId === chapters[currentChapter - 1].id)
                                                updateCurrentPosition(currentChapter - 1, prevChapterVideos.length - 1)
                                            }
                                        }}
                                        className="w-full sm:w-auto"
                                    >
                                        Previous
                                    </Button>

                                    <Button
                                        disabled={
                                            currentVideo === currentChapterVideos.length - 1 && currentChapter === chapters.length - 1
                                        }
                                        onClick={() => {
                                            if (currentVideo < currentChapterVideos.length - 1) {
                                                setCurrentVideo(currentVideo + 1)
                                            } else if (currentChapter < chapters.length - 1 && canAccessChapter(currentChapter + 1)) {
                                                updateCurrentPosition(currentChapter + 1, 0)
                                            }
                                        }}
                                        className="w-full sm:w-auto"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="progress">
                        <div className="max-w-4xl mx-auto">
                            <ProgressDashboard
                                progressData={progressData}
                                totalVideos={videos.length}
                                totalChapters={chapters.length}
                                estimatedDuration={60} // 1 hour estimated
                                onResetProgress={resetProgress}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="certificate">
                        <div className="max-w-4xl mx-auto">
                            {completionData.isCompleted ? (
                                <CertificateGenerator
                                    studentName="Student Name" // In real app, get from user data
                                    courseTitle={courseData.title}
                                    completionDate={completionData.completionDate || new Date()}
                                    onDownload={handleCertificateDownload}
                                />
                            ) : (
                                <Card>
                                    <CardContent className="text-center py-12">
                                        <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold mb-2">Certificate Not Available</h3>
                                        <p className="text-muted-foreground">
                                            Complete all chapters and pass all quizzes to unlock your certificate.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Course Completion Modal */}
            {showCompletionModal && completionData.completionDate && (
                <CourseCompletionModal
                    courseTitle={courseData.title}
                    completionDate={completionData.completionDate}
                    totalVideos={videos.length}
                    totalChapters={chapters.length}
                    timeSpent={progressData.totalTimeSpent}
                    finalScore={completionData.finalScore}
                    onClose={hideCompletionModal}
                    onDownloadCertificate={handleDownloadCertificate}
                    onShareAchievement={handleShareAchievement}
                />
            )}

            {/* Quiz Modal */}
            {showQuiz && (
                <QuizModal
                    chapterId={currentChapterData.id}
                    questions={courseData.quiz.questions.filter((q) => q.chapterId === currentChapterData.id)}
                    onPass={() => handleQuizPass(currentChapterData.id)}
                    onClose={() => setShowQuiz(false)}
                />
            )}
        </div>
    )
}
