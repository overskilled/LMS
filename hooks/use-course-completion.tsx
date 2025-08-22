"use client"

import { useState, useEffect } from "react"
import type { ProgressData } from "./use-progress-tracking"

interface CourseCompletionData {
    isCompleted: boolean
    completionDate: Date | null
    finalScore: number
    certificateGenerated: boolean
}

export function useCourseCompletion(progressData: ProgressData, totalVideos: number, totalChapters: number) {
    const [completionData, setCompletionData] = useState<CourseCompletionData>({
        isCompleted: false,
        completionDate: null,
        finalScore: 0,
        certificateGenerated: false,
    })

    const [showCompletionModal, setShowCompletionModal] = useState(false)

    useEffect(() => {
        const videosCompleted = progressData.completedVideos.length === totalVideos
        const chaptersCompleted = progressData.completedChapters.length === totalChapters
        const quizzesPassed = progressData.quizPassed.length === totalChapters

        const isNowCompleted = videosCompleted && chaptersCompleted && quizzesPassed

        if (isNowCompleted && !completionData.isCompleted) {
            // Course just completed
            const finalScore = totalChapters > 0 ? (progressData.quizPassed.length / totalChapters) * 100 : 100

            setCompletionData({
                isCompleted: true,
                completionDate: new Date(),
                finalScore,
                certificateGenerated: false,
            })

            setShowCompletionModal(true)

            // Save completion data to localStorage
            localStorage.setItem(
                `course_completion_${progressData.courseId}`,
                JSON.stringify({
                    isCompleted: true,
                    completionDate: new Date().toISOString(),
                    finalScore,
                    certificateGenerated: false,
                }),
            )
        }
    }, [progressData, totalVideos, totalChapters, completionData.isCompleted])

    // Load completion data from localStorage on mount
    useEffect(() => {
        const savedCompletion = localStorage.getItem(`course_completion_${progressData.courseId}`)
        if (savedCompletion) {
            try {
                const parsed = JSON.parse(savedCompletion)
                setCompletionData({
                    ...parsed,
                    completionDate: parsed.completionDate ? new Date(parsed.completionDate) : null,
                })
            } catch (error) {
                console.error("Failed to parse saved completion data:", error)
            }
        }
    }, [progressData.courseId])

    const markCertificateGenerated = () => {
        const updatedData = { ...completionData, certificateGenerated: true }
        setCompletionData(updatedData)

        localStorage.setItem(
            `course_completion_${progressData.courseId}`,
            JSON.stringify({
                ...updatedData,
                completionDate: updatedData.completionDate?.toISOString(),
            }),
        )
    }

    const hideCompletionModal = () => {
        setShowCompletionModal(false)
    }

    return {
        completionData,
        showCompletionModal,
        hideCompletionModal,
        markCertificateGenerated,
    }
}
