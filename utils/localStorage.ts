import type { CourseData } from "../types/course"

const DRAFT_KEY = "course_draft"
const DRAFTS_LIST_KEY = "course_drafts_list"

export interface CourseDraft {
    id: string
    title: string
    lastModified: Date
    data: CourseData
    progress: {
        completedSteps: number
        totalSteps: number
        percentage: number
    }
}

export const draftStorage = {
    // Save current draft
    saveDraft: (data: CourseData, draftId?: string): string => {
        const id = draftId || generateDraftId()
        const title = data.aboutCourse?.title || data.courseDetails?.lessonName || "Untitled Course"

        const progress = calculateProgress(data)

        const draft: CourseDraft = {
            id,
            title,
            lastModified: new Date(),
            data,
            progress,
        }

        // Save current draft
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))

        // Update drafts list
        const drafts = getDraftsList()
        const existingIndex = drafts.findIndex((d) => d.id === id)

        if (existingIndex >= 0) {
            drafts[existingIndex] = draft
        } else {
            drafts.unshift(draft)
        }

        // Keep only last 10 drafts
        const limitedDrafts = drafts.slice(0, 10)
        localStorage.setItem(DRAFTS_LIST_KEY, JSON.stringify(limitedDrafts))

        return id
    },

    // Load current draft
    loadCurrentDraft: (): CourseDraft | null => {
        try {
            const draft = localStorage.getItem(DRAFT_KEY)
            if (draft) {
                const parsed = JSON.parse(draft)
                // Convert date strings back to Date objects
                parsed.lastModified = new Date(parsed.lastModified)
                parsed.data.publishSettings.publishDate = new Date(parsed.data.publishSettings.publishDate)
                return parsed
            }
        } catch (error) {
            console.error("Error loading draft:", error)
        }
        return null
    },

    // Get all drafts
    getDraftsList: (): CourseDraft[] => {
        return getDraftsList()
    },

    // Load specific draft
    loadDraft: (draftId: string): CourseDraft | null => {
        const drafts = getDraftsList()
        const draft = drafts.find((d) => d.id === draftId)
        if (draft) {
            // Convert date strings back to Date objects
            draft.lastModified = new Date(draft.lastModified)
            draft.data.publishSettings.publishDate = new Date(draft.data.publishSettings.publishDate)
        }
        return draft || null
    },

    // Delete draft
    deleteDraft: (draftId: string): void => {
        const drafts = getDraftsList().filter((d) => d.id !== draftId)
        localStorage.setItem(DRAFTS_LIST_KEY, JSON.stringify(drafts))

        // If deleting current draft, clear it
        const currentDraft = draftStorage.loadCurrentDraft()
        if (currentDraft?.id === draftId) {
            localStorage.removeItem(DRAFT_KEY)
        }
    },

    // Clear current draft
    clearCurrentDraft: (): void => {
        localStorage.removeItem(DRAFT_KEY)
    },
}

function getDraftsList(): CourseDraft[] {
    try {
        const drafts = localStorage.getItem(DRAFTS_LIST_KEY)
        return drafts ? JSON.parse(drafts) : []
    } catch (error) {
        console.error("Error loading drafts list:", error)
        return []
    }
}

function generateDraftId(): string {
    return `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function calculateProgress(data: CourseData): { completedSteps: number; totalSteps: number; percentage: number } {
    let completedSteps = 0
    const totalSteps = 5

    // Step 1: Course Details
    if (data.courseDetails?.lessonName && data.courseDetails?.courseCategory) {
        completedSteps++
    }

    // Step 2: Videos
    if (data.videos && data.videos.length > 0) {
        completedSteps++
    }

    // Step 3: About Course
    if (data.aboutCourse?.title && data.aboutCourse?.shortDescription) {
        completedSteps++
    }

    // Step 4: Quiz
    if (data.quiz?.questions && data.quiz.questions.length > 0) {
        completedSteps++
    }

    // Step 5: Publish settings are always considered complete
    completedSteps++

    return {
        completedSteps,
        totalSteps,
        percentage: Math.round((completedSteps / totalSteps) * 100),
    }
}
