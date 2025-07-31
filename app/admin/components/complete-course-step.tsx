"use client"

import { useState, useRef, useCallback } from "react"
import { StepIndicator, type Step } from "./step-indicator"
import { CourseDetailsStep } from "./course-details-step"
import { VideoUploadStep } from "./video-upload-steps"
import { Button } from "@/components/ui/button"
import { ChevronRight, Save, UploadIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { StepRef } from "./accessible-step-wrapper"
import type { CourseData } from "@/types/course"

const steps: Step[] = [
    { id: "course-details", title: "Course Details" },
    { id: "upload-videos", title: "Upload Videos" },
    { id: "about-course", title: "About Course" },
    { id: "create-quiz", title: "Create Quiz" },
    { id: "publish-course", title: "Publish Course" },
]

interface CompleteStepperProps {
    onSaveAsDraft?: (data: Partial<CourseData>) => Promise<void>
    onPublishCourse?: (data: CourseData) => Promise<void>
    onCancel?: () => void
    initialData?: Partial<CourseData>
}

export function CompleteStepper({ onSaveAsDraft, onPublishCourse, onCancel, initialData }: CompleteStepperProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [courseData, setCourseData] = useState<Partial<CourseData>>(initialData || {})
    const [stepValidation, setStepValidation] = useState<Record<number, boolean>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Refs for each step component
    const stepRefs = useRef<(StepRef | null)[]>([])

    const handleStepClick = useCallback(
        (stepIndex: number) => {
            // Only allow navigation to completed steps or the next step
            const maxAllowedStep =
                Math.max(
                    ...Object.keys(stepValidation)
                        .map(Number)
                        .filter((n) => stepValidation[n]),
                ) + 1
            if (stepIndex <= maxAllowedStep && stepIndex <= currentStep + 1) {
                setCurrentStep(stepIndex)
                // Focus the step content
                setTimeout(() => {
                    stepRefs.current[stepIndex]?.focus()
                }, 100)
            }
        },
        [stepValidation, currentStep],
    )

    const handleStepDataChange = useCallback((stepIndex: number, data: any, isValid: boolean) => {
        setCourseData((prev) => ({
            ...prev,
            [getStepDataKey(stepIndex)]: data,
        }))

        setStepValidation((prev) => ({
            ...prev,
            [stepIndex]: isValid,
        }))
    }, [])

    const getStepDataKey = (stepIndex: number): keyof CourseData => {
        switch (stepIndex) {
            case 0:
                return "courseDetails"
            case 1:
                return "videos"
            case 2:
                return "aboutCourse"
            case 3:
                return "quiz"
            case 4:
                return "publishSettings"
            default:
                return "courseDetails"
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
            setCurrentStep((prev) => prev + 1)
            // Focus the next step
            setTimeout(() => {
                stepRefs.current[currentStep + 1]?.focus()
            }, 100)
        } else {
            // Final step - publish course
            await handlePublish()
        }
    }, [currentStep])

    const handlePrevious = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1)
            // Focus the previous step
            setTimeout(() => {
                stepRefs.current[currentStep - 1]?.focus()
            }, 100)
        }
    }, [currentStep])

    const handleSaveAsDraft = useCallback(async () => {
        setIsSubmitting(true)
        setError(null)

        try {
            await onSaveAsDraft?.(courseData)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save draft")
        } finally {
            setIsSubmitting(false)
        }
    }, [courseData, onSaveAsDraft])

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

            await onPublishCourse?.(courseData as CourseData)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to publish course")
        } finally {
            setIsSubmitting(false)
        }
    }, [courseData, onPublishCourse])

    const handleCancel = useCallback(() => {
        onCancel?.()
    }, [onCancel])

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <CourseDetailsStep
                        // ref={(ref) => (stepRefs.current[0] = ref)}
                        initialData={courseData.courseDetails}
                        onDataChange={(data, isValid) => handleStepDataChange(0, data, isValid)}
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                        onCancel={handleCancel}
                    />
                )
            case 1:
                return (
                    <VideoUploadStep
                        // ref={(ref) => (stepRefs.current[1] = ref)}
                        initialData={courseData.videos}
                        onDataChange={(data, isValid) => handleStepDataChange(1, data, isValid)}
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                        onCancel={handleCancel}
                    />
                )
            case 2:
                return (
                    <div className="text-center py-12">
                        <h2 className="text-xl font-semibold mb-4">About Course</h2>
                        <p className="text-gray-500">Course description and details step coming soon...</p>
                        <div className="flex justify-between pt-6 border-t mt-8">
                            <Button variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={handlePrevious}>
                                    Previous
                                </Button>
                                <Button onClick={handleNext}>Continue</Button>
                            </div>
                        </div>
                    </div>
                )
            case 3:
                return (
                    <div className="text-center py-12">
                        <h2 className="text-xl font-semibold mb-4">Create Quiz</h2>
                        <p className="text-gray-500">Quiz creation interface coming soon...</p>
                        <div className="flex justify-between pt-6 border-t mt-8">
                            <Button variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={handlePrevious}>
                                    Previous
                                </Button>
                                <Button onClick={handleNext}>Continue</Button>
                            </div>
                        </div>
                    </div>
                )
            case 4:
                return (
                    <div className="text-center py-12">
                        <h2 className="text-xl font-semibold mb-4">Publish Course</h2>
                        <p className="text-gray-500">Final review and publish options coming soon...</p>
                        <div className="flex justify-between pt-6 border-t mt-8">
                            <Button variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={handlePrevious}>
                                    Previous
                                </Button>
                                <Button onClick={handlePublish} disabled={isSubmitting}>
                                    {isSubmitting ? "Publishing..." : "Publish Course"}
                                </Button>
                            </div>
                        </div>
                    </div>
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
                            <span className="text-blue-500" aria-current="page">
                                Create Course
                            </span>
                        </nav>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-3">
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
                        </div>
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
