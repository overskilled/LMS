"use client"

import { useState, useEffect } from "react"
import { DraftManager } from "@/components/draft-manager"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { courseApi } from "@/utils/courseApi"
import type { CourseData } from "@/types/course"
import { useRouter } from "next/navigation"
import { CompleteStepper } from "../components/course-stepper-component"

// Local storage keys used by different steps
const LOCAL_STORAGE_KEYS = {
    COURSE_DETAILS: 'courseDetailsFormData',
    VIDEO_UPLOAD: 'videoUploadFormData',
    ABOUT_COURSE: 'aboutCourseFormData',
    QUIZ_DATA: 'quizFormData',
    PUBLISH_SETTINGS: 'publishSettingsFormData',
    COURSE_DRAFT: 'courseDraft'
}

// Helper function to safely parse localStorage items
const getLocalStorageItem = <T,>(key: string, defaultValue: T): T => {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
}

export default function CompleteCourseCreator() {
    const router = useRouter()
    const [showDrafts, setShowDrafts] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Clear all course-related local storage when component unmounts
    useEffect(() => {
        return () => {
            Object.values(LOCAL_STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key)
            })
        }
    }, [])

    const getAllCourseData = (): any => {
        return {
            courseDetails: getLocalStorageItem(LOCAL_STORAGE_KEYS.COURSE_DETAILS, {}),
            videos: getLocalStorageItem(LOCAL_STORAGE_KEYS.VIDEO_UPLOAD, []),
            aboutCourse: getLocalStorageItem(LOCAL_STORAGE_KEYS.ABOUT_COURSE, {}),
            quiz: getLocalStorageItem(LOCAL_STORAGE_KEYS.QUIZ_DATA, { questions: [] }),
            publishSettings: getLocalStorageItem(LOCAL_STORAGE_KEYS.PUBLISH_SETTINGS, {})
        }
    }

    const clearAllCourseData = () => {
        Object.values(LOCAL_STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key)
        })
    }

    const hasUnsavedChanges = () => {
        return Object.values(LOCAL_STORAGE_KEYS)
            .some(key => localStorage.getItem(key) !== null)
    }

    const handleSaveAsDraft = async () => {
        setIsProcessing(true)
        setError(null)

        try {
            const courseData = getAllCourseData()

            // Save draft to Firestore
            const response = await courseApi.updateCourse(
                `draft_${Date.now()}`, // Generate a new draft ID
                {
                    ...courseData,
                    status: 'draft',
                    updatedAt: new Date().toISOString(),
                }
            )

            if (!response.success) {
                throw new Error(response.message || 'Failed to save draft')
            }

            clearAllCourseData()
            alert("Course saved as draft!")
            setShowDrafts(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save draft')
        } finally {
            setIsProcessing(false)
        }
    }

    const handlePublishCourse = async () => {
        setIsProcessing(true)
        setError(null)

        try {
            const courseData = getAllCourseData()

            // Publish using courseApi
            const response = await courseApi.publishCourse(courseData)

            if (!response.success) {
                throw new Error(
                    response.errors?.join(', ') ||
                    response.message ||
                    'Failed to publish course'
                )
            }

            clearAllCourseData()
            alert(`Course published successfully!`)
            router.push(`/courses/${response.data?.slug}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to publish course')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleCancel = () => {
        if (!hasUnsavedChanges() || confirm("Are you sure you want to cancel? Any unsaved changes will be lost.")) {
            clearAllCourseData()
            setShowDrafts(true)
        }
    }

    const handleLoadDraft = (draftData: CourseData) => {
        // Save each piece of draft data to its respective local storage key
        localStorage.setItem(LOCAL_STORAGE_KEYS.COURSE_DETAILS, JSON.stringify(draftData.courseDetails || {}))
        localStorage.setItem(LOCAL_STORAGE_KEYS.VIDEO_UPLOAD, JSON.stringify(draftData.videos || []))
        localStorage.setItem(LOCAL_STORAGE_KEYS.ABOUT_COURSE, JSON.stringify(draftData.aboutCourse || {}))
        localStorage.setItem(LOCAL_STORAGE_KEYS.QUIZ_DATA, JSON.stringify(draftData.quiz || { questions: [] }))
        localStorage.setItem(LOCAL_STORAGE_KEYS.PUBLISH_SETTINGS, JSON.stringify(draftData.publishSettings || {}))

        setShowDrafts(false)
    }

    const handleNewCourse = () => {
        clearAllCourseData()
        setShowDrafts(false)
    }

    const handleBackToDrafts = () => {
        setShowDrafts(true)
    }

    if (showDrafts) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="bg-white border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <h1 className="text-xl font-semibold">Course Creator</h1>
                            <Button
                                variant="outline"
                                onClick={handleNewCourse}
                                disabled={isProcessing}
                            >
                                New Course
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {error && (
                        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                            {error}
                        </div>
                    )}
                    <DraftManager
                        onLoadDraft={handleLoadDraft}
                        onNewCourse={handleNewCourse}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="relative">
            {/* <Button
                variant="ghost"
                className="absolute top-4 left-4 z-10"
                onClick={handleBackToDrafts}
                disabled={isProcessing}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Drafts
            </Button> */}

            {error && (
                <div className="fixed top-4 right-4 z-50 p-4 bg-red-100 text-red-700 rounded shadow-lg">
                    {error}
                </div>
            )}

            <CompleteStepper
                onSaveAsDraft={handleSaveAsDraft}
                onPublishCourse={handlePublishCourse}
                onCancel={handleCancel}
            />
        </div>
    )
}