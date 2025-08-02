"use client"

import { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from "react"
import { Upload, CheckCircle, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AccessibleStepWrapper, type StepRef } from "./accessible-step-wrapper"
import { useMediaUpload } from "@/hooks/useMediaUpload"
import { formatFileSize, type MediaMetadata } from "@/lib/mediaUpload"
import { cn } from "@/lib/utils"

interface CourseDetailsData {
    thumbnailImage?: any
    previewVideo?: any
    lessonName: string
    courseSlug: string
    courseCategory: string
    courseLevel: string
    courseTime: string
    totalLessons: string
    difficulty: "beginner" | "intermediate" | "advanced" | "expert"
    estimatedHours: number
}

interface CourseDetailsStepProps {
    initialData?: Partial<CourseDetailsData>
    onDataChange: (data: CourseDetailsData, isValid: boolean) => void
    onNext?: () => void
    onPrevious?: () => void
    onCancel?: () => void
    courseId?: string
}

const LOCAL_STORAGE_KEY = 'courseDetailsFormData';

export const CourseDetailsStep = forwardRef<StepRef, CourseDetailsStepProps>(
    ({ initialData, onDataChange, onNext, onPrevious, onCancel, courseId }, ref) => {
        // Load initial data from localStorage if available
        const getInitialData = (): Partial<CourseDetailsData> => {
            try {
                if (typeof window !== 'undefined') {
                    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
                    if (savedData) {
                        return JSON.parse(savedData);
                    }
                }
            } catch (error) {
                console.error('Failed to parse saved form data:', error);
            }
            return initialData || {};
        };

        const [formData, setFormData] = useState<CourseDetailsData>({
            thumbnailImage: null,
            previewVideo: null,
            lessonName: "",
            courseSlug: "",
            courseCategory: "",
            courseLevel: "",
            courseTime: "",
            totalLessons: "",
            difficulty: "beginner",
            estimatedHours: 1,
            ...getInitialData(),
        });

        const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
        const [isValid, setIsValid] = useState(false);
        const [isLoading, setIsLoading] = useState(false);

        const { uploadFile, uploading, progress, error: uploadError, clearError } = useMediaUpload();

        // Save to localStorage whenever formData changes
        useEffect(() => {
            try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));
            } catch (error) {
                console.error('Failed to save form data:', error);
            }
        }, [formData]);

        // Validation function - only called when needed
        const validateForm = (): boolean => {
            const errors: Record<string, string> = {};

            if (!formData.lessonName.trim()) {
                errors.lessonName = "Course name is required";
            } else if (formData.lessonName.length < 3) {
                errors.lessonName = "Course name must be at least 3 characters";
            } else if (formData.lessonName.length > 100) {
                errors.lessonName = "Course name must be less than 100 characters";
            }

            if (!formData.courseSlug.trim()) {
                errors.courseSlug = "Course URL slug is required";
            } else if (!/^[a-z0-9-]+$/.test(formData.courseSlug)) {
                errors.courseSlug = "URL slug can only contain lowercase letters, numbers, and hyphens";
            }

            if (!formData.courseCategory) {
                errors.courseCategory = "Please select a course category";
            }

            if (!formData.courseLevel) {
                errors.courseLevel = "Please select a course level";
            }

            if (!formData.courseTime) {
                errors.courseTime = "Please select course duration";
            }

            if (!formData.totalLessons) {
                errors.totalLessons = "Please select number of lessons";
            }

            if (!formData.thumbnailImage) {
                errors.thumbnailImage = "Course thumbnail is required";
            }

            setValidationErrors(errors);
            const valid = Object.keys(errors).length === 0;
            setIsValid(valid);
            return valid;
        };

        // Update form data without validation
        const updateFormData = useCallback((updates: Partial<CourseDetailsData>) => {
            setFormData(prev => {
                let newData = { ...prev, ...updates };

                // Only auto-generate slug if lessonName is being updated
                if (updates.lessonName !== undefined) {
                    newData = {
                        ...newData,
                        courseSlug: updates.lessonName
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-+|-+$/g, "")
                    };
                }

                return newData;
            });
        }, []);

        // Handle file uploads
        const handleThumbnailUpload = useCallback(async (file: File) => {
            setIsLoading(true);
            clearError();

            try {
                const metadata = await uploadFile(file, "thumbnail", courseId);
                updateFormData({ thumbnailImage: metadata });
            } catch (error) {
                console.error("Thumbnail upload failed:", error);
            } finally {
                setIsLoading(false);
            }
        }, [uploadFile, courseId, clearError]);

        const handlePreviewVideoUpload = useCallback(async (file: File) => {
            setIsLoading(true);
            clearError();

            try {
                const metadata = await uploadFile(file, "preview", courseId);
                updateFormData({ previewVideo: metadata });
            } catch (error) {
                console.error("Preview video upload failed:", error);
            } finally {
                setIsLoading(false);
            }
        }, [uploadFile, courseId, clearError]);

        // File input handlers
        const handleFileInput = (
            event: React.ChangeEvent<HTMLInputElement>,
            type: "thumbnail" | "preview",
            maxSize: number,
            acceptedTypes: string[],
        ) => {
            const file = event.target.files?.[0];
            if (!file) return;

            // Validate file size
            if (file.size > maxSize) {
                setValidationErrors(prev => ({
                    ...prev,
                    [type]: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(maxSize)})`,
                }));
                return;
            }

            // Validate file type
            if (!acceptedTypes.includes(file.type)) {
                setValidationErrors(prev => ({
                    ...prev,
                    [type]: `File type ${file.type} is not supported`,
                }));
                return;
            }

            // Clear previous errors
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[type];
                return newErrors;
            });

            // Upload file
            if (type === "thumbnail") {
                handleThumbnailUpload(file);
            } else {
                handlePreviewVideoUpload(file);
            }
        };

        // Handle next button click with validation
        const handleNext = useCallback(() => {
            const isValid = validateForm();
            if (isValid && onNext) {
                onNext();
            }
        }, [validateForm, onNext]);

        useImperativeHandle(ref, () => ({
            validate: async () => validateForm(),
            getData: () => formData,
            focus: () => {
                document.getElementById("lesson-name-input")?.focus();
            },
            reset: () => {
                setFormData({
                    thumbnailImage: null,
                    previewVideo: null,
                    lessonName: "",
                    courseSlug: "",
                    courseCategory: "",
                    courseLevel: "",
                    courseTime: "",
                    totalLessons: "",
                    difficulty: "beginner",
                    estimatedHours: 1,
                });
                setValidationErrors({});
                try {
                    localStorage.removeItem(LOCAL_STORAGE_KEY);
                } catch (error) {
                    console.error('Failed to clear saved form data:', error);
                }
            },
        }));
        
        return (
            <AccessibleStepWrapper
                stepNumber={1}
                title="Course Details"
                description="Provide basic information about your course"
                isActive={true}
                isCompleted={false}
                isValid={isValid}
                isLoading={isLoading || uploading}
                error={uploadError}
                onNext={onNext}
                onPrevious={onPrevious}
                onCancel={onCancel}
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Media Uploads */}
                    <div className="space-y-6">
                        {/* Thumbnail Upload */}
                        <div>
                            <Label htmlFor="thumbnail-upload" className="text-sm font-medium">
                                Course Thumbnail{" "}
                                <span className="text-red-500" aria-label="required">
                                    *
                                </span>
                            </Label>
                            <p className="text-xs text-gray-500 mb-2">This will be the main image for your course</p>

                            <div
                                className={cn(
                                    "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                                    validationErrors.thumbnailImage
                                        ? "border-red-300 bg-red-50"
                                        : "border-gray-300 hover:border-gray-400",
                                    formData.thumbnailImage && "border-green-300 bg-green-50",
                                )}
                            >
                                <input
                                    id="thumbnail-upload"
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg"
                                    onChange={(e) =>
                                        handleFileInput(e, "thumbnail", 5 * 1024 * 1024, ["image/png", "image/jpeg", "image/jpg"])
                                    }
                                    className="hidden"
                                    aria-describedby="thumbnail-help thumbnail-error"
                                    disabled={uploading}
                                />

                                <label
                                    htmlFor="thumbnail-upload"
                                    className="cursor-pointer block"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault()
                                            document.getElementById("thumbnail-upload")?.click()
                                        }
                                    }}
                                >
                                    {formData.thumbnailImage ? (
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-8 h-8 text-green-600" />
                                            <div className="text-left">
                                                <p className="font-medium text-green-900">{formData.thumbnailImage.originalName}</p>
                                                <p className="text-sm text-green-700">{formatFileSize(formData.thumbnailImage.fileSize)}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-lg font-medium text-gray-700 mb-2">Click to upload or drag and drop</p>
                                            <p className="text-sm text-gray-500">PNG, JPEG (max 5MB) • Recommended: 1280x720</p>
                                        </>
                                    )}
                                </label>
                            </div>

                            <div id="thumbnail-help" className="sr-only">
                                Upload a thumbnail image for your course. Supported formats: PNG, JPEG. Maximum size: 5MB.
                            </div>

                            {validationErrors.thumbnailImage && (
                                <Alert variant="destructive" className="mt-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription id="thumbnail-error">{validationErrors.thumbnailImage}</AlertDescription>
                                </Alert>
                            )}

                            {uploading && progress && (
                                <div className="mt-2 space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Uploading...</span>
                                        <span>{Math.round(progress.progress)}%</span>
                                    </div>
                                    <Progress value={progress.progress} className="h-2" />
                                </div>
                            )}
                        </div>

                        {/* Preview Video Upload */}
                        <div>
                            <Label htmlFor="preview-upload" className="text-sm font-medium">
                                Course Preview Video <span className="text-gray-500">(Optional)</span>
                            </Label>
                            <p className="text-xs text-gray-500 mb-2">A short preview to showcase your course content</p>

                            <div
                                className={cn(
                                    "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                                    validationErrors.previewVideo ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400",
                                    formData.previewVideo && "border-green-300 bg-green-50",
                                )}
                            >
                                <input
                                    id="preview-upload"
                                    type="file"
                                    accept="video/mp4,video/mov,video/avi"
                                    onChange={(e) =>
                                        handleFileInput(e, "preview", 100 * 1024 * 1024, ["video/mp4", "video/mov", "video/avi"])
                                    }
                                    className="hidden"
                                    aria-describedby="preview-help preview-error"
                                    disabled={uploading}
                                />

                                <label
                                    htmlFor="preview-upload"
                                    className="cursor-pointer block"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault()
                                            document.getElementById("preview-upload")?.click()
                                        }
                                    }}
                                >
                                    {formData.previewVideo ? (
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-8 h-8 text-green-600" />
                                            <div className="text-left">
                                                <p className="font-medium text-green-900">{formData.previewVideo.originalName}</p>
                                                <p className="text-sm text-green-700">
                                                    {formatFileSize(formData.previewVideo.fileSize)}
                                                    {formData.previewVideo.duration && ` • ${Math.round(formData.previewVideo.duration)}s`}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-lg font-medium text-gray-700 mb-2">Click to upload or drag and drop</p>
                                            <p className="text-sm text-gray-500">MP4, MOV, AVI (max 100MB) • Keep it under 2 minutes</p>
                                        </>
                                    )}
                                </label>
                            </div>

                            <div id="preview-help" className="sr-only">
                                Upload a preview video for your course. Supported formats: MP4, MOV, AVI. Maximum size: 100MB.
                            </div>

                            {validationErrors.previewVideo && (
                                <Alert variant="destructive" className="mt-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription id="preview-error">{validationErrors.previewVideo}</AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Course Information */}
                    <div className="space-y-6">
                        {/* Course Name & Slug */}
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="lesson-name-input" className="text-sm font-medium">
                                    Course Name{" "}
                                    <span className="text-red-500" aria-label="required">
                                        *
                                    </span>
                                </Label>
                                <div className="relative mt-2">
                                    <Input
                                        id="lesson-name-input"
                                        placeholder="e.g., Complete React Development Bootcamp"
                                        value={formData.lessonName}
                                        onChange={(e) => updateFormData({ lessonName: e.target.value })}
                                        className={cn("pr-16", validationErrors.lessonName && "border-red-500")}
                                        aria-describedby="lesson-name-help lesson-name-error"
                                        aria-invalid={!!validationErrors.lessonName}
                                        maxLength={100}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400" aria-live="polite">
                                        {formData.lessonName.length} / 100
                                    </span>
                                </div>
                                <div id="lesson-name-help" className="sr-only">
                                    Enter a descriptive name for your course. This will be displayed to students.
                                </div>
                                {validationErrors.lessonName && (
                                    <p id="lesson-name-error" className="text-sm text-red-600 mt-1" role="alert">
                                        {validationErrors.lessonName}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="course-slug-input" className="text-sm font-medium">
                                    Course URL Slug
                                </Label>
                                <div className="flex items-center mt-2">
                                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-l-md border border-r-0">
                                        yoursite.com/courses/
                                    </span>
                                    <Input
                                        id="course-slug-input"
                                        value={formData.courseSlug}
                                        onChange={(e) => updateFormData({ courseSlug: e.target.value })}
                                        className={cn("rounded-l-none", validationErrors.courseSlug && "border-red-500")}
                                        placeholder="course-slug"
                                        aria-describedby="course-slug-help course-slug-error"
                                        aria-invalid={!!validationErrors.courseSlug}
                                    />
                                </div>
                                <div id="course-slug-help" className="sr-only">
                                    This will be part of your course URL. Use lowercase letters, numbers, and hyphens only.
                                </div>
                                {validationErrors.courseSlug && (
                                    <p id="course-slug-error" className="text-sm text-red-600 mt-1" role="alert">
                                        {validationErrors.courseSlug}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Course Category & Level */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="course-category-select" className="text-sm font-medium mb-2 block">
                                    Course Category{" "}
                                    <span className="text-red-500" aria-label="required">
                                        *
                                    </span>
                                </Label>
                                <Select
                                    value={formData.courseCategory}
                                    onValueChange={(value) => updateFormData({ courseCategory: value })}
                                >
                                    <SelectTrigger
                                        id="course-category-select"
                                        className={cn(validationErrors.courseCategory && "border-red-500")}
                                        aria-describedby="course-category-help course-category-error"
                                        aria-invalid={!!validationErrors.courseCategory}
                                    >
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="programming">Satellite Engineering</SelectItem>
                                        <SelectItem value="design">Geomatics</SelectItem>
                                        <SelectItem value="business">Artificial Intelligence</SelectItem>
                                        <SelectItem value="marketing">Mission Operations</SelectItem>
                                        <SelectItem value="data-science">Space Science</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div id="course-category-help" className="sr-only">
                                    Select the primary category that best describes your course content.
                                </div>
                                {validationErrors.courseCategory && (
                                    <p id="course-category-error" className="text-sm text-red-600 mt-1" role="alert">
                                        {validationErrors.courseCategory}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="course-level-select" className="text-sm font-medium mb-2 block">
                                    Course Level{" "}
                                    <span className="text-red-500" aria-label="required">
                                        *
                                    </span>
                                </Label>
                                <Select value={formData.courseLevel} onValueChange={(value) => updateFormData({ courseLevel: value })}>
                                    <SelectTrigger
                                        id="course-level-select"
                                        className={cn(validationErrors.courseLevel && "border-red-500")}
                                        aria-describedby="course-level-help course-level-error"
                                        aria-invalid={!!validationErrors.courseLevel}
                                    >
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="beginner">Beginner</SelectItem>
                                        <SelectItem value="intermediate">Intermediate</SelectItem>
                                        <SelectItem value="advanced">Advanced</SelectItem>
                                        <SelectItem value="expert">Expert</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div id="course-level-help" className="sr-only">
                                    Select the skill level required for students to take this course.
                                </div>
                                {validationErrors.courseLevel && (
                                    <p id="course-level-error" className="text-sm text-red-600 mt-1" role="alert">
                                        {validationErrors.courseLevel}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Difficulty & Duration */}
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="difficulty-select" className="text-sm font-medium mb-2 block">
                                    Difficulty Level
                                </Label>
                                <Select
                                    value={formData.difficulty}
                                    onValueChange={(value: any) => updateFormData({ difficulty: value })}
                                >
                                    <SelectTrigger id="difficulty-select" aria-describedby="difficulty-help">
                                        <SelectValue placeholder="Select difficulty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="beginner">🟢 Beginner - No prior experience needed</SelectItem>
                                        <SelectItem value="intermediate">🟡 Intermediate - Some experience required</SelectItem>
                                        <SelectItem value="advanced">🟠 Advanced - Significant experience needed</SelectItem>
                                        <SelectItem value="expert">🔴 Expert - Professional level</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div id="difficulty-help" className="sr-only">
                                    Select the difficulty level that best matches your course content and requirements.
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="estimated-hours-slider" className="text-sm font-medium mb-2 block">
                                    Estimated Course Duration: {formData.estimatedHours} hours
                                </Label>
                                <Slider
                                    id="estimated-hours-slider"
                                    value={[formData.estimatedHours]}
                                    onValueChange={(value) => updateFormData({ estimatedHours: value[0] })}
                                    max={100}
                                    min={1}
                                    step={0.5}
                                    className="w-full"
                                    aria-describedby="estimated-hours-help"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>1 hour</span>
                                    <span>100+ hours</span>
                                </div>
                                <div id="estimated-hours-help" className="sr-only">
                                    Estimate how many hours it will take students to complete your course.
                                </div>
                            </div>
                        </div>

                        {/* Course Time & Lessons */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="course-time-select" className="text-sm font-medium mb-2 block">
                                    Course Duration{" "}
                                    <span className="text-red-500" aria-label="required">
                                        *
                                    </span>
                                </Label>
                                <Select value={formData.courseTime} onValueChange={(value) => updateFormData({ courseTime: value })}>
                                    <SelectTrigger
                                        id="course-time-select"
                                        className={cn(validationErrors.courseTime && "border-red-500")}
                                        aria-describedby="course-time-help course-time-error"
                                        aria-invalid={!!validationErrors.courseTime}
                                    >
                                        <SelectValue placeholder="Select duration" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1-2 hours">1-2 hours</SelectItem>
                                        <SelectItem value="3-5 hours">3-5 hours</SelectItem>
                                        <SelectItem value="6-10 hours">6-10 hours</SelectItem>
                                        <SelectItem value="11-20 hours">11-20 hours</SelectItem>
                                        <SelectItem value="21-40 hours">21-40 hours</SelectItem>
                                        <SelectItem value="40+ hours">40+ hours</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div id="course-time-help" className="sr-only">
                                    Select the total duration range for your course.
                                </div>
                                {validationErrors.courseTime && (
                                    <p id="course-time-error" className="text-sm text-red-600 mt-1" role="alert">
                                        {validationErrors.courseTime}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="total-lessons-select" className="text-sm font-medium mb-2 block">
                                    Total Lessons{" "}
                                    <span className="text-red-500" aria-label="required">
                                        *
                                    </span>
                                </Label>
                                <Select
                                    value={formData.totalLessons}
                                    onValueChange={(value) => updateFormData({ totalLessons: value })}
                                >
                                    <SelectTrigger
                                        id="total-lessons-select"
                                        className={cn(validationErrors.totalLessons && "border-red-500")}
                                        aria-describedby="total-lessons-help total-lessons-error"
                                        aria-invalid={!!validationErrors.totalLessons}
                                    >
                                        <SelectValue placeholder="Number of lessons" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1-5">1-5 lessons</SelectItem>
                                        <SelectItem value="6-10">6-10 lessons</SelectItem>
                                        <SelectItem value="11-20">11-20 lessons</SelectItem>
                                        <SelectItem value="21-50">21-50 lessons</SelectItem>
                                        <SelectItem value="50+">50+ lessons</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div id="total-lessons-help" className="sr-only">
                                    Select the approximate number of lessons in your course.
                                </div>
                                {validationErrors.totalLessons && (
                                    <p id="total-lessons-error" className="text-sm text-red-600 mt-1" role="alert">
                                        {validationErrors.totalLessons}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </AccessibleStepWrapper>
        )
    },
)

CourseDetailsStep.displayName = "CourseDetailsStep"
