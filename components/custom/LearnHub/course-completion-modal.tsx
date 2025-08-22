"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Trophy, Download, Share2, Star, Calendar, Clock, Target, Award, Sparkles, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface CourseCompletionModalProps {
    courseTitle: string
    completionDate: Date
    totalVideos: number
    totalChapters: number
    timeSpent: number
    finalScore: number
    onClose: () => void
    onDownloadCertificate: () => void
    onShareAchievement: () => void
}

export function CourseCompletionModal({
    courseTitle,
    completionDate,
    totalVideos,
    totalChapters,
    timeSpent,
    finalScore,
    onClose,
    onDownloadCertificate,
    onShareAchievement,
}: CourseCompletionModalProps) {
    const [showConfetti, setShowConfetti] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => setShowConfetti(false), 3000)
        return () => clearTimeout(timer)
    }, [])

    const formatTime = (milliseconds: number) => {
        const hours = Math.floor(milliseconds / (1000 * 60 * 60))
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))

        if (hours > 0) {
            return `${hours}h ${minutes}m`
        }
        return `${minutes}m`
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const getPerformanceLevel = (score: number) => {
        if (score >= 95) return { level: "Outstanding", color: "text-yellow-600", icon: Trophy }
        if (score >= 85) return { level: "Excellent", color: "text-primary", icon: Award }
        if (score >= 75) return { level: "Good", color: "text-secondary", icon: Star }
        return { level: "Satisfactory", color: "text-muted-foreground", icon: CheckCircle }
    }

    const performance = getPerformanceLevel(finalScore)

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            {/* Confetti Effect */}
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "absolute w-2 h-2 rounded-full animate-bounce",
                                i % 4 === 0 && "bg-primary",
                                i % 4 === 1 && "bg-secondary",
                                i % 4 === 2 && "bg-yellow-500",
                                i % 4 === 3 && "bg-pink-500",
                            )}
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${2 + Math.random() * 3}s`,
                            }}
                        />
                    ))}
                </div>
            )}

            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader className="text-center pb-6">
                    <div className="mx-auto mb-6 relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                            <Trophy className="h-12 w-12 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2">
                            <Sparkles className="h-8 w-8 text-yellow-500 animate-pulse" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl mb-2">Congratulations!</CardTitle>
                    <p className="text-lg text-muted-foreground">You have successfully completed</p>
                    <h2 className="text-2xl font-bold text-primary mt-2">{courseTitle}</h2>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Achievement Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-primary/5 rounded-lg">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                <CheckCircle className="h-6 w-6 text-primary" />
                            </div>
                            <p className="text-2xl font-bold text-primary">{totalVideos}</p>
                            <p className="text-xs text-muted-foreground">Videos Completed</p>
                        </div>

                        <div className="text-center p-4 bg-secondary/5 rounded-lg">
                            <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Target className="h-6 w-6 text-secondary" />
                            </div>
                            <p className="text-2xl font-bold text-secondary">{totalChapters}</p>
                            <p className="text-xs text-muted-foreground">Chapters Mastered</p>
                        </div>

                        <div className="text-center p-4 bg-accent/5 rounded-lg">
                            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Clock className="h-6 w-6 text-accent" />
                            </div>
                            <p className="text-2xl font-bold text-accent">{formatTime(timeSpent)}</p>
                            <p className="text-xs text-muted-foreground">Time Invested</p>
                        </div>

                        <div className="text-center p-4 bg-yellow-500/5 rounded-lg">
                            <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                <performance.icon className="h-6 w-6 text-yellow-600" />
                            </div>
                            <p className="text-2xl font-bold text-yellow-600">{Math.round(finalScore)}%</p>
                            <p className="text-xs text-muted-foreground">Final Score</p>
                        </div>
                    </div>

                    <Separator />

                    {/* Performance Badge */}
                    <div className="text-center">
                        <Badge variant="outline" className={cn("text-lg px-4 py-2", performance.color)}>
                            <performance.icon className="h-5 w-5 mr-2" />
                            {performance.level} Performance
                        </Badge>
                    </div>

                    {/* Course Details */}
                    <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Course Completion Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Completion Date:</span>
                                <span className="font-medium">{formatDate(completionDate)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Course Duration:</span>
                                <span className="font-medium">{formatTime(timeSpent)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Videos Watched:</span>
                                <span className="font-medium">
                                    {totalVideos}/{totalVideos}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Quizzes Passed:</span>
                                <span className="font-medium">
                                    {totalChapters}/{totalChapters}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Certificate Preview */}
                    <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center bg-gradient-to-br from-primary/5 to-secondary/5">
                        <Award className="h-12 w-12 text-primary mx-auto mb-3" />
                        <h3 className="font-semibold text-lg mb-2">Certificate of Completion</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Your certificate is ready! Download it to showcase your achievement.
                        </p>
                        <Button onClick={onDownloadCertificate} className="w-full">
                            <Download className="h-4 w-4 mr-2" />
                            Download Certificate
                        </Button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button onClick={onShareAchievement} variant="outline" className="flex-1 bg-transparent">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share Achievement
                        </Button>
                        <Button onClick={onClose} className="flex-1">
                            Continue Learning
                        </Button>
                    </div>

                    {/* Motivational Message */}
                    <div className="text-center p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                            "Success is not final, failure is not fatal: it is the courage to continue that counts."
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">- Winston Churchill</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
