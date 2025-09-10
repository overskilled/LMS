"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { StepIndicator, type Step } from "./step-indicator"
import { CourseDetailsStep } from "./course-details-step"
import { VideoUploadStep } from "./video-upload-steps"
import { Button } from "@/components/ui/button"
import { ChevronRight, Save, UploadIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { StepRef } from "./accessible-step-wrapper"
import type { CourseData } from "@/types/course"
import { AboutCourseStep } from "./about-course-step"
import { QuizCreationStep } from "./quiz-creation-step"
import { PublishSummaryStep } from "./publish-summary-step"
import { useAuth } from "@/context/authContext"

const steps: Step[] = [
    { id: "course-details", title: "Course Details" },
    { id: "upload-videos", title: "Upload Videos" },
    { id: "about-course", title: "About Course" },
    { id: "create-quiz", title: "Create Quiz" },
    { id: "publish-course", title: "Publish Course" },
]

interface CompleteStepperProps {
    onSaveAsDraft?: (data: Partial<CourseData>) => void
    isEditing?: boolean
    onPublishCourse?: (data: CourseData) => void
    onCancel?: () => void
    initialData?: Partial<CourseData>
    courseId?: string
}

export function CompleteStepper({
    onSaveAsDraft,
    onPublishCourse,
    isEditing,
    onCancel,
    initialData,
    courseId
}: CompleteStepperProps) {
    const { user } = useAuth()
    const [currentStep, setCurrentStep] = useState(0)
    const [courseData, setCourseData] = useState<Partial<CourseData>>(initialData!)
    const [stepValidation, setStepValidation] = useState<Record<number, boolean>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Refs for each step component
    const stepRefs = useRef<(StepRef | null)[]>([])

    // Initialize step refs array
    useEffect(() => {
        stepRefs.current = stepRefs.current.slice(0, steps.length)
    }, [])



    const handleStepClick = useCallback(
        (stepIndex: number) => {
            const maxAllowedStep =
                Math.max(
                    ...Object.keys(stepValidation)
                        .map(Number)
                        .filter((n) => stepValidation[n]),
                ) + 1
            if (stepIndex <= maxAllowedStep && stepIndex <= currentStep + 1) {
                setCurrentStep(stepIndex)
                setTimeout(() => {
                    stepRefs.current[stepIndex]?.focus()
                }, 100)
            }
        },
        [stepValidation, currentStep],
    )

    const handleStepDataChange = useCallback((stepIndex: number, data: any, isValid: boolean) => {
        setCourseData(prev => {
            const key = getStepDataKey(stepIndex)
            return {
                ...prev,
                [key]: {
                    // ...prev[key],
                    ...data
                }
            }
        })

        setStepValidation(prev => ({
            ...prev,
            [stepIndex]: isValid,
        }))
    }, [])

    const getStepDataKey = (stepIndex: number): keyof CourseData => {
        switch (stepIndex) {
            case 0: return "courseDetails"
            case 1: return "videos"
            case 2: return "aboutCourse"
            case 3: return "quiz"
            case 4: return "publishSettings"
            default: return "courseDetails"
        }
    }

    const handleNext = useCallback(async () => {
        setError(null)
        const currentStepRef = stepRefs.current[currentStep]

        if (currentStepRef) {
            const isValid = await currentStepRef.validate()
            if (!isValid) {
                setError("Please fix the errors before continuing")
                return
            }
        }

        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1)
            setTimeout(() => {
                stepRefs.current[currentStep + 1]?.focus()
            }, 100)
        } else {
            await handlePublish()
        }
    }, [currentStep])

    const handlePrevious = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
            setTimeout(() => {
                stepRefs.current[currentStep - 1]?.focus()
            }, 100)
        }
    }, [currentStep])

    const handleSaveAsDraft = useCallback(async () => {
        setIsSubmitting(true)
        setError(null)

        try {
            // Validate current step before saving
            const currentStepRef = stepRefs.current[currentStep]
            if (currentStepRef) {
                const isValid = await currentStepRef.validate()
                if (!isValid) {
                    setError("Please fix the errors before saving")
                    return
                }
            }

            await onSaveAsDraft?.(courseData)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save draft")
        } finally {
            setIsSubmitting(false)
        }
    }, [courseData, currentStep, onSaveAsDraft])

    const handlePublish = useCallback(async () => {
        setIsSubmitting(true)
        setError(null)

        try {
            // Validate all steps
            for (let i = 0; i < steps.length; i++) {
                const stepRef = stepRefs.current[i]
                if (stepRef) {
                    const isValid = await stepRef.validate()
                    if (!isValid) {
                        setError(`Please complete step ${i + 1}: ${steps[i].title}`)
                        setCurrentStep(i)
                        setTimeout(() => stepRef.focus(), 100)
                        return
                    }
                }
            }

            // Combine all data into complete course data
            const completeCourseData: CourseData = {
                ...courseData
            } as CourseData

            await onPublishCourse?.(completeCourseData)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to publish course")
        } finally {
            setIsSubmitting(false)
        }
    }, [courseData, onPublishCourse])

    const handleCancel = useCallback(() => {
        if (Object.keys(courseData).length > 0) {
            if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                onCancel?.()
            }
        } else {
            onCancel?.()
        }
    }, [courseData, onCancel])

    // Auto-save to localStorage
    useEffect(() => {
        if (Object.keys(courseData).length > 0) {
            localStorage.setItem('courseDraft', JSON.stringify(courseData))
        }
    }, [courseData])

    // Load from localStorage on mount
    useEffect(() => {
        const savedData = localStorage.getItem('courseDraft')
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData)
                setCourseData(prev => ({
                    ...parsedData
                }))
            } catch (e) {
                console.error('Failed to parse saved course data', e)
            }
        }
    }, [])

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <CourseDetailsStep
                        ref={(ref) => { stepRefs.current[0] = ref }}
                        initialData={courseData.courseDetails}
                        isEditing
                        onDataChange={(data, isValid) => handleStepDataChange(0, data, isValid)}
                        onNext={handleNext}
                        onPrevious={undefined}
                        onCancel={handleCancel}
                        courseId={courseId}
                    />
                )
            case 1:
                return (
                    <VideoUploadStep
                        ref={(ref) => { stepRefs.current[1] = ref }}
                        initialData={courseData.videos}
                        isEditing
                        onDataChange={(data, isValid) => handleStepDataChange(1, data, isValid)}
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                        onCancel={handleCancel}
                        courseId={courseId}
                    />
                )
            case 2:
                return (
                    <AboutCourseStep
                        ref={(ref) => { stepRefs.current[2] = ref }}
                        // initialData={courseData.aboutCourse}
                        isEditing
                        onDataChange={(data, isValid) => handleStepDataChange(2, data, isValid)}
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                        onCancel={handleCancel}
                    />
                )
            case 3:
                return (
                    <QuizCreationStep
                        ref={(ref) => { stepRefs.current[3] = ref }}
                        onDataChange={(data, isValid) => handleStepDataChange(3, data, isValid)}
                        isEditing
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                        onCancel={handleCancel}
                    />
                )
            case 4:
                return (
                    <PublishSummaryStep
                        ref={(ref) => { stepRefs.current[4] = ref }}
                        // courseData={courseData}
                        // initialSettings={courseData.publishSettings}
                        isEditing
                        onDataChange={(data, isValid) => handleStepDataChange(4, data, isValid)}
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                        onCancel={handleCancel}
                    />
                )
            default:
                return null
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Breadcrumb */}
                        <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
                            <a href="/" className="text-gray-500 hover:text-gray-700">
                                Home
                            </a>
                            <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
                            <span
                                className={isEditing ? "text-green-500" : "text-blue-500"}
                                aria-current="page"
                            >
                                {isEditing ? "Edit Course" : "Create Course"}
                            </span>
                        </nav>

                        {/* Action Buttons */}
                        {/* <div className="flex items-center space-x-3">
                            <Button
                                variant="outline"
                                onClick={handleSaveAsDraft}
                                disabled={isSubmitting}
                                aria-describedby="save-draft-help"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save As Draft
                            </Button>
                            <div id="save-draft-help" className="sr-only">
                                Save your progress and continue editing later
                            </div>

                            <Button
                                onClick={handlePublish}
                                disabled={isSubmitting || Object.keys(stepValidation).length < steps.length}
                                aria-describedby="publish-help"
                            >
                                <UploadIcon className="w-4 h-4 mr-2" />
                                Publish Course
                            </Button>
                            <div id="publish-help" className="sr-only">
                                Publish your completed course for students to enroll
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>

            {/* Step Indicator */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <StepIndicator
                        steps={steps}
                        currentStep={currentStep}
                        onStepClick={handleStepClick}
                    // completedSteps={Object.keys(stepValidation)
                    //     .map(Number)
                    //     .filter((stepIndex) => stepValidation[stepIndex])}
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <Alert variant="destructive" className="mb-6" role="alert">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <main role="main" aria-live="polite" aria-atomic="false">
                    {renderCurrentStep()}
                </main>
            </div>
        </div>
    )
}