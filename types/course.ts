import { CourseLevel } from "@/app/[locale]/admin/components/publish-summary-step"
import { Timestamp } from "firebase/firestore"

export interface CourseData {
    id: string
    title: string
    slug: string
    status: "draft" | "published" | "archived" | string
    revenue: number
    enrollmentCount: number
    redeemCodes?: any
    createdAt: number | string
    updatedAt: number | string
    publishedAt?: {
        type: string
        seconds: number
        nanoseconds: number
    }

    // Step 0: Course Details
    courseDetails: {
        courseType: string
        thumbnailImage?: {
            fileName: string
            originalName: string
            fileSize: number
            dimensions: {
                height: number
                width: number
            }
            mimeType: string
            id: string
            uploadedAt: string
            storagePath: string
            width: number
            downloadURL: string
            type: string
            height: number
        }
        previewVideo?: any
        lessonName: string
        courseSlug: string
        courseCategory: string
        courseLevel: CourseLevel | "beginner" | "intermediate" | "advanced" | "expert"
        courseTime: string
        totalLessons: string
        difficulty: "beginner" | "intermediate" | "advanced" | "expert"
        estimatedHours: number
        affiliateRate?: number
        authorId: string
    }

    // Step 1: Upload Videos
    videos: {
        chapters: Array<{
            id: string
            title: string
            description: string
            order: number
            isExpanded: boolean
        }>
        videos: Array<{
            id: string
            chapterId: string
            title: string
            description: string
            order: number
            isPreview: boolean
            metadata: {
                id: string
                downloadURL: string
                duration: number
                fileName: string
                fileSize: number
                height: number
                width: number
                mimeType: string
                originalName: string
                storagePath: string
                type: string
                uploadedAt: string
            }
            thumbnail?: File
        }>
    }

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
            currency: string;
            xafPrice: number;
            usdPrice: number;
            euroPrice: number;
            isFree?: boolean;
            discountPrice?: number | undefined;
            discountPercentage?: number | undefined;
            discountEndDate?: string | Date | undefined;
            pricingTier: "basic" | "free" | "premium" | "enterprise";
            paymentOptions: ("one-time" | "subscription" | "installments")[];
        }
        metrics: {
            expectedEnrollments?: number
            targetRevenue?: number
            marketingBudget?: number
        }
        isUpcoming: boolean
        availabilityDate?: Date | string
        earlyAccessEnabled: boolean
        earlyAccessPrice?: number
    }

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
            chapterId: string
        }>
        passingScore: number,
        timeLimit: number,
        allowRetakes: boolean,
        maxAttempts: number,
        showCorrectAnswers: boolean,
        randomizeQuestions: boolean,
        certificateRequired: boolean,
    }

    // Step 4: Publish
    publishSettings: {
        isPublic: boolean
        publishDate: any
        enrollmentLimit?: number
        certificateEnabled: boolean
        certificateTemplate?: string
        accessDuration?: number
        prerequisites: string[]
        courseLevel: string
        supportEmail?: string
        discussionEnabled: boolean
        downloadableResources: boolean
    }
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
    chapterId: string
}
