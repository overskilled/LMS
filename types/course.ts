import { CourseLevel } from "@/app/admin/components/publish-summary-step"

export interface CourseData {
    // Step 0: Course Details
    id?: string
    courseDetails: {
        thumbnailImage?: any
        previewVideo?: any
        lessonName: string
        courseSlug: string
        courseCategory: string
        courseLevel: string
        courseTime: string
        totalLessons: string
        difficulty: "beginner" | "intermediate" | "advanced" | "expert"
        estimatedHours: number,
    }

    // Step 1: Upload Videos
    videos: Array<{
        id: string
        metadata: any
        title: string
        description: string
        duration?: number
        order: number
        isPreview?: boolean
        thumbnail?: File
    }>

    // Step 2: About Course
    aboutCourse: {
        title: string
        shortDescription: string
        fullDescription: string
        learningObjectives: string[]
        prerequisites: string[]
        targetAudience: string
        language: string
        subtitles: string[]
        tags: string[]
        pricing: {
            basePrice: number
            currency: string
            discountPrice?: number
            discountPercentage?: number
            discountEndDate?: Date | string
            pricingTier: "free" | "basic" | "premium" | "enterprise"
            paymentOptions: ("one-time" | "subscription" | "installments")[]
        }
        metrics: {
            expectedEnrollments?: number
            targetRevenue?: number
            marketingBudget?: number
        }
    }

    // instructor: {
    //     name: string
    //     bio: string
    //     avatar?: File
    //     title: string
    //     experience: string
    //     expertise: string[]
    //     socialLinks: {
    //         website?: string
    //         linkedin?: string
    //         twitter?: string
    //         github?: string
    //     }
    //     credentials: string[]
    //     teachingExperience: number
    //     totalStudents?: number
    //     averageRating?: number
    //     totalCourses?: number
    // }

    // Step 3: Create Quiz
    quiz: {
        questions: Array<{
            id: string
            question: string
            type: "multiple-choice" | "true-false" | "short-answer" | "essay"
            options: string[]
            correctAnswer: number | string
            explanation?: string
            points: number
            difficulty: "easy" | "medium" | "hard"
            timeLimit?: number
        }>
        passingScore: number
        timeLimit: number
        allowRetakes: boolean
        maxAttempts: number
        showCorrectAnswers: boolean
        randomizeQuestions: boolean
        certificateRequired: boolean
    }

    // Step 4: Publish
    publishSettings: {
        isPublic: boolean
        publishDate: Date
        enrollmentLimit?: number
        certificateEnabled: boolean
        certificateTemplate?: string
        accessDuration?: number
        prerequisites?: string[]
        courseLevel: string
        // courseLevel: "beginner" | "intermediate" | "advanced" | "expert"
        supportEmail?: string
        discussionEnabled: boolean
        downloadableResources: boolean
    }

    enrollmentCount?: number;

    status?: any;
    updatedAt: any;
    createdAt: any;
}

export interface QuizQuestion {
    id: string
    question: string
    type: "multiple-choice" | "true-false" | "short-answer" | "essay"
    options: string[]
    correctAnswer: number | string
    explanation?: string
    points: number
    difficulty: "easy" | "medium" | "hard"
    timeLimit?: number
}
