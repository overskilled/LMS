"use client"

import { useState, useEffect, forwardRef } from "react"
import { HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { MediaUploadZone } from "./media-upload-zone"
import { uploadMediaFile, type MediaMetadata } from "@/lib/mediaUpload"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle } from "lucide-react"
import { StepRef } from "./accessible-step-wrapper"

interface CourseDetailsData {
    thumbnailImage?: MediaMetadata
    previewVideo?: MediaMetadata
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
}

export const CourseDetailsStep = forwardRef<StepRef, CourseDetailsStepProps>(
    ({ initialData, onDataChange, onNext, onPrevious, onCancel }, ref) => {
        const [formData, setFormData] = useState<CourseDetailsData>({
            thumbnailImage: undefined,
            previewVideo: undefined,
            lessonName: "",
            courseSlug: "",
            courseCategory: "",
            courseLevel: "",
            courseTime: "",
            totalLessons: "",
            difficulty: "beginner",
            estimatedHours: 1,
            ...initialData,
        })

        const [uploadProgress, setUploadProgress] = useState<{
            thumbnail?: number
            preview?: number
        }>({})
        const [uploadError, setUploadError] = useState<{
            thumbnail?: string
            preview?: string
        }>({})
        const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

        // Validate form and notify parent whenever formData changes
        useEffect(() => {
            const errors: Record<string, string> = {}

            if (!formData.lessonName.trim()) {
                errors.lessonName = "Course name is required"
            }

            if (!formData.courseCategory) {
                errors.courseCategory = "Course category is required"
            }

            if (!formData.courseLevel) {
                errors.courseLevel = "Course level is required"
            }

            // if (!formData.courseTime) {
            //     errors.courseTime = "Course duration is required"
            // }

            if (!formData.totalLessons) {
                errors.totalLessons = "Number of lessons is required"
            }

            if (!formData.thumbnailImage) {
                errors.thumbnailImage = "Thumbnail image is required"
            }

            setValidationErrors(errors)
            const isValid = Object.keys(errors).length === 0
            onDataChange(formData, isValid)
        }, [formData, onDataChange])

        const handleInputChange = (field: keyof CourseDetailsData, value: any) => {
            const newData = { ...formData, [field]: value }

            // Auto-generate slug from lesson name
            if (field === "lessonName") {
                newData.courseSlug = value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-+|-+$/g, "")
            }

            setFormData(newData)
        }

        const handleSelectChange = (field: keyof CourseDetailsData, value: string) => {
            const newData = { ...formData, [field]: value }
            setFormData(newData)
        }

        const handleThumbnailUpload = async (file: File) => {
            try {
                setUploadError(prev => ({ ...prev, thumbnail: undefined }))
                setUploadProgress(prev => ({ ...prev, thumbnail: 0 }))

                const metadata = await uploadMediaFile(file, "thumbnail", formData.lessonName, (progress) => {
                    setUploadProgress(prev => ({ ...prev, thumbnail: progress.progress }))
                })

                const newData = { ...formData, thumbnailImage: metadata }
                setFormData(newData)
            } catch (error) {
                console.error("Thumbnail upload failed:", error)
                setUploadError(prev => ({
                    ...prev,
                    thumbnail: error instanceof Error ? error.message : "Failed to upload thumbnail",
                }))
            } finally {
                setUploadProgress(prev => ({ ...prev, thumbnail: undefined }))
            }
        }

        const handlePreviewVideoUpload = async (file: File) => {
            try {
                setUploadError(prev => ({ ...prev, preview: undefined }))
                setUploadProgress(prev => ({ ...prev, preview: 0 }))

                const metadata = await uploadMediaFile(file, "preview", formData.lessonName, (progress) => {
                    setUploadProgress(prev => ({ ...prev, preview: progress.progress }))
                })

                const newData = { ...formData, previewVideo: metadata }
                setFormData(newData)
            } catch (error) {
                console.error("Preview video upload failed:", error)
                setUploadError(prev => ({
                    ...prev,
                    preview: error instanceof Error ? error.message : "Failed to upload preview video",
                }))
            } finally {
                setUploadProgress(prev => ({ ...prev, preview: undefined }))
            }
        }

        const removeThumbnail = () => {
            const newData = { ...formData, thumbnailImage: undefined }
            setFormData(newData)
            setUploadError(prev => ({ ...prev, thumbnail: undefined }))
        }

        const removePreviewVideo = () => {
            const newData = { ...formData, previewVideo: undefined }
            setFormData(newData)
            setUploadError(prev => ({ ...prev, preview: undefined }))
        }

        return (
            <div className="space-y-8">
                <div className="flex items-center gap-2 mb-6">
                    <h2 className="text-xl font-semibold">Course Details</h2>
                    <HelpCircle className="w-5 h-5 text-blue-500" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Media Uploads */}
                    <div className="space-y-6">
                        {/* Thumbnail Upload */}
                        <div>
                            <Label className="text-sm font-medium">
                                Course Thumbnail <span className="text-red-500">(Required)</span>
                            </Label>
                            <p className="text-xs text-gray-500 mb-2">This will be the main image for your course</p>

                            {formData.thumbnailImage ? (
                                <div className="border rounded-lg p-4 bg-gray-50">
                                    <div className="flex items-center gap-3 mb-3">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        <div className="flex-1">
                                            <p className="font-medium">{formData.thumbnailImage.originalName}</p>
                                            <p className="text-sm text-gray-500">
                                                {formData.thumbnailImage.dimensions?.width}×{formData.thumbnailImage.dimensions?.height}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={removeThumbnail}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                    <img
                                        src={formData.thumbnailImage.downloadURL}
                                        alt="Course thumbnail"
                                        className="w-full h-auto rounded border"
                                    />
                                </div>
                            ) : (
                                <MediaUploadZone
                                    accept="image/png,image/jpeg,image/jpg"
                                    maxSize={5 * 1024 * 1024} // 5MB
                                    onFileSelected={handleThumbnailUpload}
                                    disabled={!!uploadProgress.thumbnail}
                                />
                            )}

                            {uploadProgress.thumbnail !== undefined && (
                                <div className="mt-2">
                                    <Progress value={uploadProgress.thumbnail} className="h-2" />
                                    <p className="text-xs text-gray-500 mt-1 text-center">
                                        Uploading... {Math.round(uploadProgress.thumbnail)}%
                                    </p>
                                </div>
                            )}

                            {validationErrors.thumbnailImage && (
                                <div className="mt-2 flex items-center gap-2 text-red-500 text-sm">
                                    <XCircle className="w-4 h-4" />
                                    <span>{validationErrors.thumbnailImage}</span>
                                </div>
                            )}
                        </div>

                        {/* Preview Video Upload */}
                        <div>
                            <Label className="text-sm font-medium">
                                Course Preview Video <span className="text-gray-500">(Optional)</span>
                            </Label>
                            <p className="text-xs text-gray-500 mb-2">A short preview to showcase your course content</p>

                            {formData.previewVideo ? (
                                <div className="border rounded-lg p-4 bg-gray-50">
                                    <div className="flex items-center gap-3 mb-3">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        <div className="flex-1">
                                            <p className="font-medium">{formData.previewVideo.originalName}</p>
                                            <p className="text-sm text-gray-500">
                                                {formData.previewVideo.duration && `${Math.round(formData.previewVideo.duration)}s`}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={removePreviewVideo}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                    <video
                                        src={formData.previewVideo.downloadURL}
                                        controls
                                        className="w-full rounded border"
                                    />
                                </div>
                            ) : (
                                <MediaUploadZone
                                    accept="video/mp4,video/mov,video/avi"
                                    maxSize={100 * 1024 * 1024} // 100MB
                                    onFileSelected={handlePreviewVideoUpload}
                                    disabled={!!uploadProgress.preview}
                                />
                            )}

                            {uploadProgress.preview !== undefined && (
                                <div className="mt-2">
                                    <Progress value={uploadProgress.preview} className="h-2" />
                                    <p className="text-xs text-gray-500 mt-1 text-center">
                                        Uploading... {Math.round(uploadProgress.preview)}%
                                    </p>
                                </div>
                            )}

                            {uploadError.preview && (
                                <div className="mt-2 flex items-center gap-2 text-red-500 text-sm">
                                    <XCircle className="w-4 h-4" />
                                    <span>{uploadError.preview}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Course Information */}
                    <div className="space-y-6">
                        {/* Course Name & Slug */}
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium">
                                    Course Name <span className="text-red-500">(Required)</span>
                                </Label>
                                <div className="relative mt-2">
                                    <Input
                                        placeholder="e.g., Complete React Development Bootcamp"
                                        value={formData.lessonName}
                                        onChange={(e) => handleInputChange("lessonName", e.target.value)}
                                        className={validationErrors.lessonName ? "border-red-500 pr-16" : "pr-16"}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                                        {formData.lessonName.length} / 100
                                    </span>
                                </div>
                                {validationErrors.lessonName && (
                                    <p className="text-sm text-red-600 mt-1">{validationErrors.lessonName}</p>
                                )}
                            </div>

                            <div>
                                <Label className="text-sm font-medium">Course URL Slug</Label>
                                <div className="flex items-center mt-2">
                                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-l-md border border-r-0">
                                        yoursite.com/courses/
                                    </span>
                                    <Input
                                        value={formData.courseSlug}
                                        onChange={(e) => handleInputChange("courseSlug", e.target.value)}
                                        className="rounded-l-none"
                                        placeholder="course-slug"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Course Category & Level */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium mb-2 block">Course Category</Label>
                                <Select
                                    value={formData.courseCategory}
                                    onValueChange={(value) => handleSelectChange("courseCategory", value)}
                                >
                                    <SelectTrigger className={validationErrors.courseCategory ? "border-red-500" : ""}>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="programming">Programming</SelectItem>
                                        <SelectItem value="design">Design</SelectItem>
                                        <SelectItem value="business">Business</SelectItem>
                                        <SelectItem value="marketing">Marketing</SelectItem>
                                        <SelectItem value="data-science">Data Science</SelectItem>
                                        <SelectItem value="photography">Photography</SelectItem>
                                        <SelectItem value="music">Music</SelectItem>
                                        <SelectItem value="health">Health & Fitness</SelectItem>
                                    </SelectContent>
                                </Select>
                                {validationErrors.courseCategory && (
                                    <p className="text-sm text-red-600 mt-1">{validationErrors.courseCategory}</p>
                                )}
                            </div>

                            <div>
                                <Label className="text-sm font-medium mb-2 block">Course Level</Label>
                                <Select
                                    value={formData.courseLevel}
                                    onValueChange={(value) => handleSelectChange("courseLevel", value)}
                                >
                                    <SelectTrigger className={validationErrors.courseLevel ? "border-red-500" : ""}>
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="beginner">Beginner</SelectItem>
                                        <SelectItem value="intermediate">Intermediate</SelectItem>
                                        <SelectItem value="advanced">Advanced</SelectItem>
                                        <SelectItem value="expert">Expert</SelectItem>
                                    </SelectContent>
                                </Select>
                                {validationErrors.courseLevel && (
                                    <p className="text-sm text-red-600 mt-1">{validationErrors.courseLevel}</p>
                                )}
                            </div>
                        </div>

                        {/* Difficulty & Duration */}
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium mb-2 block">Difficulty Level</Label>
                                <Select
                                    value={formData.difficulty}
                                    onValueChange={(value: any) => handleSelectChange("difficulty", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select difficulty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="beginner">🟢 Beginner - No prior experience needed</SelectItem>
                                        <SelectItem value="intermediate">🟡 Intermediate - Some experience required</SelectItem>
                                        <SelectItem value="advanced">🟠 Advanced - Significant experience needed</SelectItem>
                                        <SelectItem value="expert">🔴 Expert - Professional level</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="text-sm font-medium mb-2 block">
                                    Estimated Course Duration: {formData.estimatedHours} hours
                                </Label>
                                <Slider
                                    value={[formData.estimatedHours]}
                                    onValueChange={(value) => handleInputChange("estimatedHours", value[0])}
                                    max={100}
                                    min={1}
                                    step={0.5}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>1 hour</span>
                                    <span>100+ hours</span>
                                </div>
                            </div>
                        </div>

                        {/* Course Time & Lessons */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium mb-2 block">Course Duration</Label>
                                <Select
                                    value={formData.courseTime}
                                    onValueChange={(value) => handleSelectChange("courseTime", value)}
                                >
                                    <SelectTrigger className={validationErrors.courseTime ? "border-red-500" : ""}>
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
                                {validationErrors.courseTime && (
                                    <p className="text-sm text-red-600 mt-1">{validationErrors.courseTime}</p>
                                )}
                            </div>

                            <div>
                                <Label className="text-sm font-medium mb-2 block">Total Lessons</Label>
                                <Select
                                    value={formData.totalLessons}
                                    onValueChange={(value) => handleSelectChange("totalLessons", value)}
                                >
                                    <SelectTrigger className={validationErrors.totalLessons ? "border-red-500" : ""}>
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
                                {validationErrors.totalLessons && (
                                    <p className="text-sm text-red-600 mt-1">{validationErrors.totalLessons}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between pt-6 border-t">
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <div className="flex gap-3">
                        {onPrevious && (
                            <Button variant="outline" onClick={onPrevious}>
                                Previous
                            </Button>
                        )}
                        <Button
                            onClick={onNext}
                            disabled={Object.keys(validationErrors).length > 0}
                        >
                            Continue
                        </Button>
                    </div>
                </div>
            </div>
        )
    }
)