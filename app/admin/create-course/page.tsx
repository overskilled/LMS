"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { CompleteStepper } from "../components/course-stepper-component"
import Loading from "../loading"
import type { CourseData } from "@/types/course"
import { courseApi } from "@/utils/courseApi"

// Keys for localStorage
const LOCAL_STORAGE_KEYS = {
    COURSE_DETAILS: "courseDetailsFormData",
    VIDEO_UPLOAD: "videoUploadFormData",
    ABOUT_COURSE: "aboutCourseFormData",
    QUIZ_DATA: "quizFormData",
    PUBLISH_SETTINGS: "publishSettingsFormData",
}

// Helper to get data from localStorage
const getLocalStorageItem = <T,>(key: string, defaultValue: T): T => {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
}

// Helper to save slice to localStorage
const saveLocalStorageItem = <T,>(key: string, value: T) => {
    localStorage.setItem(key, JSON.stringify(value))
}

// Helper to gather all slices as CourseData
const getAllCourseData = (): any => ({
    courseDetails: getLocalStorageItem(LOCAL_STORAGE_KEYS.COURSE_DETAILS, {}),
    videos: getLocalStorageItem(LOCAL_STORAGE_KEYS.VIDEO_UPLOAD, { videos: [] }),
    aboutCourse: getLocalStorageItem(LOCAL_STORAGE_KEYS.ABOUT_COURSE, {}),
    quiz: getLocalStorageItem(LOCAL_STORAGE_KEYS.QUIZ_DATA, { questions: [] }),
    publishSettings: getLocalStorageItem(LOCAL_STORAGE_KEYS.PUBLISH_SETTINGS, {}),
})

export default function CompleteCourseCreator() {
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [initialData, setInitialData] = useState<CourseData | null>(null)

    // Load all data from localStorage on mount
    useEffect(() => {
        setInitialData(getAllCourseData())
    }, [])

    const handleSaveAsDraft = () => {
        setIsProcessing(true)
        setError(null)
        try {
            const data = getAllCourseData()
            Object.entries(data).forEach(([key, value]) => {
                const storageKey = (LOCAL_STORAGE_KEYS as any)[key.toUpperCase()]
                if (storageKey) saveLocalStorageItem(storageKey, value)
            })
            alert("Draft saved locally!")
        } catch (err) {
            setError("Failed to save draft")
        } finally {
            setIsProcessing(false)
        }
    }

    const handlePublishCourse = async () => {
        setIsProcessing(true)
        setError(null)
        try {
            const data = getAllCourseData()
            // Replace this with your API call
            console.log("Publishing course:", data)
            await courseApi.publishCourse(data)
            alert("Course published successfully!")
            // Optionally clear localStorage
            Object.values(LOCAL_STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))
        } catch (err) {
            setError("Failed to publish course")
        } finally {
            setIsProcessing(false)
        }
    }

    const handleCancel = () => {
        if (confirm("Discard current draft?")) {
            Object.values(LOCAL_STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))
            setInitialData(getAllCourseData())
        }
    }

    if (!initialData) return <Loading />

    return (
        <div className="relative">
            {error && (
                <div className="fixed top-4 right-4 z-50 p-4 bg-red-100 text-red-700 rounded shadow-lg">
                    {error}
                </div>
            )}

            <Suspense fallback={<Loading />}>
                <CompleteStepper
                    initialData={initialData}
                    // onUpdateDraft={(data: any) => {
                    //     Object.entries(data).forEach(([key, value]) => {
                    //         const storageKey = (LOCAL_STORAGE_KEYS as any)[key.toUpperCase()]
                    //         if (storageKey) saveLocalStorageItem(storageKey, value)
                    //     })
                    //     setInitialData(getAllCourseData())
                    // }}
                    onSaveAsDraft={handleSaveAsDraft}
                    onPublishCourse={handlePublishCourse}
                    onCancel={handleCancel}
                />
            </Suspense>
        </div>
    )
}
