"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Clock, PlayCircle, CheckCircle, Target, RotateCcw, TrendingUp } from "lucide-react"
import type { ProgressData } from "@/hooks/use-progress-tracking"

interface ProgressDashboardProps {
    progressData: ProgressData
    totalVideos: number
    totalChapters: number
    estimatedDuration: number
    onResetProgress: () => void
}

export function ProgressDashboard({
    progressData,
    totalVideos,
    totalChapters,
    estimatedDuration,
    onResetProgress,
}: ProgressDashboardProps) {
    const completionPercentage = totalVideos > 0 ? (progressData.completedVideos.length / totalVideos) * 100 : 0
    const chaptersCompleted = progressData.completedChapters.length
    const quizzesCompleted = progressData.quizPassed.length

    const formatTime = (milliseconds: number) => {
        const hours = Math.floor(milliseconds / (1000 * 60 * 60))
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))

        if (hours > 0) {
            return `${hours}h ${minutes}m`
        }
        return `${minutes}m`
    }

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

    const getCompletionBadge = () => {
        if (completionPercentage === 100) return { variant: "default" as const, text: "Completed" }
        if (completionPercentage >= 75) return { variant: "secondary" as const, text: "Almost Done" }
        if (completionPercentage >= 50) return { variant: "outline" as const, text: "Halfway" }
        if (completionPercentage >= 25) return { variant: "outline" as const, text: "Getting Started" }
        return { variant: "outline" as const, text: "Just Started" }
    }

    const badge = getCompletionBadge()

    return (
        <div className="space-y-6">
            {/* Overall Progress Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Your Progress
                        </CardTitle>
                        <Badge variant={badge.variant}>{badge.text}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Course Completion</span>
                            <span className="font-medium">{Math.round(completionPercentage)}%</span>
                        </div>
                        <Progress value={completionPercentage} className="h-3" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                        <div className="text-center">
                            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto mb-2">
                                <PlayCircle className="h-6 w-6 text-primary" />
                            </div>
                            <p className="text-2xl font-bold">{progressData.completedVideos.length}</p>
                            <p className="text-xs text-muted-foreground">Videos Watched</p>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center w-12 h-12 bg-secondary/10 rounded-full mx-auto mb-2">
                                <CheckCircle className="h-6 w-6 text-secondary" />
                            </div>
                            <p className="text-2xl font-bold">{chaptersCompleted}</p>
                            <p className="text-xs text-muted-foreground">Chapters Done</p>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-full mx-auto mb-2">
                                <Trophy className="h-6 w-6 text-accent" />
                            </div>
                            <p className="text-2xl font-bold">{quizzesCompleted}</p>
                            <p className="text-xs text-muted-foreground">Quizzes Passed</p>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-full mx-auto mb-2">
                                <Clock className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-2xl font-bold">{formatTime(progressData.totalTimeSpent)}</p>
                            <p className="text-xs text-muted-foreground">Time Spent</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Learning Stats */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Learning Statistics
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Last Accessed</span>
                        <span className="text-sm font-medium">{formatDate(progressData.lastAccessed)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Current Chapter</span>
                        <span className="text-sm font-medium">Chapter {progressData.currentChapter + 1}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Estimated Time Remaining</span>
                        <span className="text-sm font-medium">
                            {formatTime(estimatedDuration * 60 * 1000 - progressData.totalTimeSpent)}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Average Session</span>
                        <span className="text-sm font-medium">
                            {formatTime(progressData.totalTimeSpent / Math.max(1, progressData.completedVideos.length))}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Achievement Milestones */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5" />
                        Achievements
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div
                            className={`flex items-center gap-3 p-3 rounded-lg ${progressData.completedVideos.length >= 1 ? "bg-primary/10" : "bg-muted/50"
                                }`}
                        >
                            <CheckCircle
                                className={`h-5 w-5 ${progressData.completedVideos.length >= 1 ? "text-primary" : "text-muted-foreground"
                                    }`}
                            />
                            <div className="flex-1">
                                <p className="font-medium">First Video</p>
                                <p className="text-xs text-muted-foreground">Complete your first video</p>
                            </div>
                            {progressData.completedVideos.length >= 1 && (
                                <Badge variant="default" className="text-xs">
                                    Unlocked
                                </Badge>
                            )}
                        </div>

                        <div
                            className={`flex items-center gap-3 p-3 rounded-lg ${chaptersCompleted >= 1 ? "bg-primary/10" : "bg-muted/50"
                                }`}
                        >
                            <CheckCircle className={`h-5 w-5 ${chaptersCompleted >= 1 ? "text-primary" : "text-muted-foreground"}`} />
                            <div className="flex-1">
                                <p className="font-medium">Chapter Master</p>
                                <p className="text-xs text-muted-foreground">Complete your first chapter</p>
                            </div>
                            {chaptersCompleted >= 1 && (
                                <Badge variant="default" className="text-xs">
                                    Unlocked
                                </Badge>
                            )}
                        </div>

                        <div
                            className={`flex items-center gap-3 p-3 rounded-lg ${completionPercentage >= 50 ? "bg-primary/10" : "bg-muted/50"
                                }`}
                        >
                            <CheckCircle
                                className={`h-5 w-5 ${completionPercentage >= 50 ? "text-primary" : "text-muted-foreground"}`}
                            />
                            <div className="flex-1">
                                <p className="font-medium">Halfway Hero</p>
                                <p className="text-xs text-muted-foreground">Reach 50% completion</p>
                            </div>
                            {completionPercentage >= 50 && (
                                <Badge variant="default" className="text-xs">
                                    Unlocked
                                </Badge>
                            )}
                        </div>

                        <div
                            className={`flex items-center gap-3 p-3 rounded-lg ${completionPercentage === 100 ? "bg-primary/10" : "bg-muted/50"
                                }`}
                        >
                            <Trophy
                                className={`h-5 w-5 ${completionPercentage === 100 ? "text-primary" : "text-muted-foreground"}`}
                            />
                            <div className="flex-1">
                                <p className="font-medium">Course Champion</p>
                                <p className="text-xs text-muted-foreground">Complete the entire course</p>
                            </div>
                            {completionPercentage === 100 && (
                                <Badge variant="default" className="text-xs">
                                    Unlocked
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Reset Progress */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <RotateCcw className="h-5 w-5" />
                        Reset Progress
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        This will permanently delete all your progress data for this course. This action cannot be undone.
                    </p>
                    <Button variant="destructive" onClick={onResetProgress} className="w-full">
                        Reset All Progress
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
