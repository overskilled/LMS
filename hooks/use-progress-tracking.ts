"use client"

import { useState, useEffect, useCallback } from "react"

export interface ProgressData {
    courseId: string
    completedVideos: string[]
    completedChapters: string[]
    quizPassed: string[]
    currentChapter: number
    currentVideo: number
    lastAccessed: number
    totalTimeSpent: number
    videoWatchTime: Record<string, number>
}

export function useProgressTracking(courseId: string) {
    const [progressData, setProgressData] = useState<ProgressData>({
        courseId,
        completedVideos: [],
        completedChapters: [],
        quizPassed: [],
        currentChapter: 0,
        currentVideo: 0,
        lastAccessed: Date.now(),
        totalTimeSpent: 0,
        videoWatchTime: {},
    })

    const [sessionStartTime, setSessionStartTime] = useState(Date.now())

    // Load progress from localStorage on mount
    useEffect(() => {
        const savedProgress = localStorage.getItem(`course_progress_${courseId}`)
        if (savedProgress) {
            try {
                const parsed = JSON.parse(savedProgress)
                setProgressData(parsed)
            } catch (error) {
                console.error("Failed to parse saved progress:", error)
            }
        }
        setSessionStartTime(Date.now())
    }, [courseId])

    // Save progress to localStorage whenever it changes
    useEffect(() => {
        const timeSpent = Date.now() - sessionStartTime
        const updatedProgress = {
            ...progressData,
            lastAccessed: Date.now(),
            totalTimeSpent: progressData.totalTimeSpent + timeSpent,
        }

        localStorage.setItem(`course_progress_${courseId}`, JSON.stringify(updatedProgress))
        setSessionStartTime(Date.now())
    }, [progressData, courseId, sessionStartTime])

    const markVideoComplete = useCallback((videoId: string) => {
        setProgressData((prev) => ({
            ...prev,
            completedVideos: [...new Set([...prev.completedVideos, videoId])],
        }))
    }, [])

    const markChapterComplete = useCallback((chapterId: string) => {
        setProgressData((prev) => ({
            ...prev,
            completedChapters: [...new Set([...prev.completedChapters, chapterId])],
        }))
    }, [])

    const markQuizPassed = useCallback((chapterId: string) => {
        setProgressData((prev) => ({
            ...prev,
            quizPassed: [...new Set([...prev.quizPassed, chapterId])],
        }))
    }, [])

    const updateCurrentPosition = useCallback((chapterIndex: number, videoIndex: number) => {
        setProgressData((prev) => ({
            ...prev,
            currentChapter: chapterIndex,
            currentVideo: videoIndex,
        }))
    }, [])

    const updateVideoWatchTime = useCallback((videoId: string, watchTime: number) => {
        setProgressData((prev) => ({
            ...prev,
            videoWatchTime: {
                ...prev.videoWatchTime,
                [videoId]: Math.max(prev.videoWatchTime[videoId] || 0, watchTime),
            },
        }))
    }, [])

    const resetProgress = useCallback(() => {
        const resetData: ProgressData = {
            courseId,
            completedVideos: [],
            completedChapters: [],
            quizPassed: [],
            currentChapter: 0,
            currentVideo: 0,
            lastAccessed: Date.now(),
            totalTimeSpent: 0,
            videoWatchTime: {},
        }
        setProgressData(resetData)
        localStorage.removeItem(`course_progress_${courseId}`)
    }, [courseId])

    return {
        progressData,
        markVideoComplete,
        markChapterComplete,
        markQuizPassed,
        updateCurrentPosition,
        updateVideoWatchTime,
        resetProgress,
    }
}
