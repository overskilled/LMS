"use client"

import { useState, useCallback, useEffect } from "react"
import { StepIndicator, type Step } from "./step-indicator"
import { CourseFormSteps } from "./course-form-steps"
import { AboutCourseStep } from "./about-course-step"
import { QuizCreationStep } from "./quiz-creation-step"
import { PublishSummaryStep } from "./publish-summary-step"
import { Button } from "@/components/ui/button"
import { ChevronRight, Save } from "lucide-react"
import { CourseData } from "@/types/course"
import { ApiResponse, courseApi, PublishedCourse } from "@/utils/courseApi"
import { CourseDraft, draftStorage } from "@/utils/localStorage"
import { VideoUploadStep } from "./video-upload-steps"
import { SaveStatus } from "./save-status"
import { PublishDialog } from "./publish-dialog"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { serverTimestamp } from "firebase/firestore"
import { db } from "@/firebase/config"
import { InstructorInfoStep } from "./instructor-info-step"

const steps: Step[] = [
    { id: "course-details", title: "Course Details" },
    { id: "upload-videos", title: "Upload Videos" },
    // { id: "instructor-info", title: "Instructor Info" },
    { id: "about-course", title: "About Course" },
    { id: "create-quiz", title: "Create Quiz" },
    { id: "publish-course", title: "Publish Course" },
]

interface CompleteCourseStepperProps {
    onSaveAsDraft?: (data: CourseData) => void
    onPublishCourse?: (data: CourseData) => void
    onCancel?: () => void
    courseId?: string // For editing existing courses
}

export function CompleteCourseStepper({
    onSaveAsDraft,
    onPublishCourse,
    onCancel,
    courseId
}: CompleteCourseStepperProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [courseData, setCourseData] = useState<CourseData>({
        courseDetails: {
            thumbnailImage: undefined,
            previewVideo: undefined,
            lessonName: "",
            courseSlug: "",
            courseCategory: "",
            courseLevel: "",
            courseTime: "",
            totalLessons: "",
            difficulty: "beginner" as const,
            estimatedHours: 1,
        },
        videos: [],
        // instructor: {
        //     name: "",
        //     bio: "",
        //     avatar: undefined as File | undefined,
        //     title: "",
        //     experience: "",
        //     expertise: [] as string[],
        //     socialLinks: {
        //         website: "",
        //         linkedin: "",
        //         twitter: "",
        //         github: "",
        //     },
        //     credentials: [] as string[],
        //     teachingExperience: 0,
        //     totalStudents: 0,
        //     averageRating: 0,
        //     totalCourses: 0,
        // },
        aboutCourse: {
            title: "",
            shortDescription: "",
            fullDescription: "",
            learningObjectives: [],
            prerequisites: [],
            targetAudience: "",
            language: "",
            subtitles: [],
            tags: [],
            pricing: {
                basePrice: 0,
                currency: "USD",
                discountPrice: 0,
                discountPercentage: 0,
                discountEndDate: undefined,
                pricingTier: "basic" as const,
                paymentOptions: ["one-time" as const],
            },
            metrics: {
                expectedEnrollments: 0,
                targetRevenue: 0,
                marketingBudget: 0,
            },
        },
        quiz: {
            questions: [],
            passingScore: 70,
            timeLimit: 30,
            allowRetakes: true,
            maxAttempts: 3,
            showCorrectAnswers: true,
            randomizeQuestions: false,
            certificateRequired: false,
        },
        publishSettings: {
            isPublic: true,
            publishDate: new Date(),
            enrollmentLimit: undefined,
            certificateEnabled: true,
            certificateTemplate: "",
            accessDuration: undefined,
            prerequisites: [],
            courseLevel: "beginner" as const,
            supportEmail: "",
            discussionEnabled: true,
            downloadableResources: false,
        },
    })

    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
    const [lastSaved, setLastSaved] = useState<Date | undefined>()
    const [currentDraftId, setCurrentDraftId] = useState<string | undefined>()
    const [isPublishing, setIsPublishing] = useState(false)
    const [publishResult, setPublishResult] = useState<ApiResponse<PublishedCourse> | null>(null)
    const [showPublishDialog, setShowPublishDialog] = useState(false)

    // Load course data if editing existing course
    useEffect(() => {
        const loadCourseData = async () => {
            if (courseId) {
                try {
                    const docRef = doc(db, "courses", courseId)
                    const docSnap = await getDoc(docRef)

                    if (docSnap.exists()) {
                        const data = docSnap.data()
                        setCourseData(data as CourseData)
                    }
                } catch (error) {
                    console.error("Error loading course:", error)
                }
            } else {
                // Load draft if new course
                const savedDraft = draftStorage.loadCurrentDraft()
                if (savedDraft) {
                    setCourseData(savedDraft.data)
                    setCurrentDraftId(savedDraft.id)
                    setLastSaved(savedDraft.lastModified)
                }
            }
        }

        loadCourseData()
    }, [courseId])

    useEffect(() => {
        const autoSaveTimer = setTimeout(() => {
            if (currentDraftId || hasUnsavedChanges()) {
                handleSaveAsDraft(true) // true for auto-save
            }
        }, 30000) // Auto-save every 30 seconds

        return () => clearTimeout(autoSaveTimer)
    }, [courseData, currentDraftId])

    const hasUnsavedChanges = () => {
        return !!(
            courseData.courseDetails.lessonName ||
            courseData.videos.length > 0 ||
            courseData.aboutCourse.title ||
            courseData.quiz.questions.length > 0
        )
    }

    const handleStepClick = useCallback(
        (stepIndex: number) => {
            if (stepIndex <= currentStep + 1) {
                setCurrentStep(stepIndex)
            }
        },
        [currentStep],
    )


    const updateCourseData = useCallback((updates: Partial<CourseData>) => {
        setCourseData((prev) => ({ ...prev, ...updates }))
    }, [])



    const handleNext = useCallback(() => {
        if (currentStep < steps.length - 1) {
            setCurrentStep((prev) => prev + 1)
        } else {
            setShowPublishDialog(true)
        }
    }, [currentStep])

    const handlePrevious = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1)
        }
    }, [currentStep])

    const handleSaveAsDraft = useCallback(
        async (isAutoSave = false) => {
            if (!isAutoSave) setSaveStatus("saving")

            try {
                // Save to Firestore if we have a courseId (editing existing course)
                if (courseId) {
                    await setDoc(doc(db, "courses", courseId), {
                        ...courseData,
                        status: "draft",
                        updatedAt: serverTimestamp(),
                    }, { merge: true })
                    setLastSaved(new Date())
                    setSaveStatus("saved")
                } else {
                    // Save to local storage for new courses
                    const draftId = draftStorage.saveDraft(courseData, currentDraftId)
                    setCurrentDraftId(draftId)
                    setLastSaved(new Date())
                    setSaveStatus("saved")
                }

                if (!isAutoSave) {
                    onSaveAsDraft?.(courseData)
                }
            } catch (error) {
                console.error("Error saving draft:", error)
                setSaveStatus("error")
            }
        },
        [courseData, currentDraftId, onSaveAsDraft, courseId],
    )

    const handlePublishCourse = useCallback(async () => {
        setIsPublishing(true)

        try {
            console.log("tryinig to save course")
            const result = await courseApi.publishCourse(courseData)
            console.log("Course published:", courseData)
            setPublishResult(result)

            if (result.success) {
                // Clear draft after successful publish
                if (currentDraftId) {
                    draftStorage.deleteDraft(currentDraftId)
                    setCurrentDraftId(undefined)
                }
                onPublishCourse?.(courseData)
            }
        } catch (error) {
            console.log("Error publishing course:", error)
            setPublishResult({
                success: false,
                message: "An unexpected error occurred. Please try again.",
            })
        } finally {
            setIsPublishing(false)
        }
    }, [courseData, currentDraftId, onPublishCourse])

    const handleCancel = useCallback(() => {
        onCancel?.()
    }, [onCancel])

    const handleLoadDraft = useCallback((draft: CourseDraft) => {
        setCourseData(draft.data)
        setCurrentDraftId(draft.id)
        setLastSaved(draft.lastModified)
        setCurrentStep(0) // Reset to first step
    }, [])

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <CourseFormSteps
                        currentStep={currentStep}
                        onDataChange={(stepIndex: any, data: any) => updateCourseData({ courseDetails: data })}
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                        onCancel={handleCancel}
                        stepData={{ [currentStep]: courseData.courseDetails }}
                    />
                )
            case 1:
                return (
                    <div className="space-y-8">
                        <VideoUploadStep
                            videos={courseData.videos}
                            onVideosChange={(videos) => updateCourseData({ videos })}
                        />
                        <div className="flex justify-between pt-6 border-t">
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
            // case 2:
            //     return (
            //         <div className="space-y-8">
            //             <InstructorInfoStep
            //                 data={courseData.instructor}
            //                 onDataChange={(data: any) => updateCourseData({ instructor: data })}
            //             />
            //             <div className="flex justify-between pt-6 border-t">
            //                 <Button variant="outline" onClick={handleCancel}>
            //                     Cancel
            //                 </Button>
            //                 <div className="flex gap-3">
            //                     <Button variant="outline" onClick={handlePrevious}>
            //                         Previous
            //                     </Button>
            //                     <Button onClick={handleNext}>Continue</Button>
            //                 </div>
            //             </div>
            //         </div>
            //     )
            case 2:
                return (
                    <div className="space-y-8">
                        <AboutCourseStep
                            data={courseData.aboutCourse}
                            onDataChange={(data) => updateCourseData({ aboutCourse: data })}
                        />
                        <div className="flex justify-between pt-6 border-t">
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
                    <div className="space-y-8">
                        <QuizCreationStep
                            data={courseData.quiz}
                            onDataChange={(data) => updateCourseData({ quiz: data })}
                        />
                        <div className="flex justify-between pt-6 border-t">
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
                    <div className="space-y-8">
                        <PublishSummaryStep
                            courseData={courseData}
                            onPublishSettingsChange={(settings) => updateCourseData({ publishSettings: settings })}
                        />
                        <div className="flex justify-between pt-6 border-t">
                            <Button variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={handlePrevious}>
                                    Previous
                                </Button>
                                <Button
                                    onClick={() => handlePublishCourse()}
                                    size="lg"
                                    disabled={isPublishing}
                                >
                                    {isPublishing ? "Publishing..." : "Publish Course"}
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
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            {/* <div className="flex items-center space-x-2 text-sm">
                                <span className="text-gray-500">Home</span>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                <span className="text-blue-500">Create Course</span>
                            </div> */}
                            {/* <SaveStatus status={saveStatus} lastSaved={lastSaved} /> */}
                        </div>
                        <div className="flex items-center space-x-3">
                            <Button
                                variant="outline"
                                onClick={() => handleSaveAsDraft()}
                                disabled={saveStatus === "saving"}
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {saveStatus === "saving" ? "Saving..." : "Save As Draft"}
                            </Button>
                            <Button
                                onClick={() => handlePublishCourse()}
                                disabled={isPublishing}
                            >
                                {isPublishing ? "Publishing..." : "Publish Course"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Step Indicator */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <StepIndicator steps={steps} currentStep={currentStep} onStepClick={handleStepClick} />
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-sm p-8">{renderStepContent()}</div>
            </div>

            <PublishDialog
                isOpen={showPublishDialog}
                onClose={() => setShowPublishDialog(false)}
                publishResult={publishResult}
                isPublishing={isPublishing}
                onPublish={handlePublishCourse}
            />
        </div>
    )
}