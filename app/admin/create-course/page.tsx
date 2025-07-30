"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { CourseData } from "@/types/course"
import { CourseDraft } from "@/utils/localStorage"
import { DraftManager } from "../components/draft-manager"
import { CompleteCourseStepper } from "../components/course-stepper-component"

export default function CompleteCourseCreator() {
    const [showDrafts, setShowDrafts] = useState(false)
    const [currentDraft, setCurrentDraft] = useState<CourseDraft | null>(null)

    const handleSaveAsDraft = (data: CourseData) => {
        console.log("Course saved as draft:", data)
        // Show success notification
        alert("Course saved as draft!")
    }

    const handlePublishCourse = (data: CourseData) => {
        console.log("Course published:", data)
        // The publishing logic is now handled in the stepper component
    }

    const handleCancel = () => {
        if (confirm("Are you sure you want to cancel? Any unsaved changes will be lost.")) {
            setShowDrafts(true)
        }
    }

    const handleLoadDraft = (draft: CourseDraft) => {
        setCurrentDraft(draft)
        setShowDrafts(false)
    }

    const handleNewCourse = () => {
        setCurrentDraft(null)
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
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <DraftManager onLoadDraft={handleLoadDraft} onNewCourse={handleNewCourse} currentDraftId={currentDraft?.id} />
                </div>
            </div>
        )
    }

    return (
        <div className="relative">
            <div className="absolute top-4 left-4 z-10">
                <Button variant="ghost" onClick={handleBackToDrafts} className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Drafts
                </Button>
            </div>

            <CompleteCourseStepper
                onSaveAsDraft={handleSaveAsDraft}
                onPublishCourse={handlePublishCourse}
                onCancel={handleCancel}
                // initialDraft={currentDraft}
            />
        </div>
    )
}
