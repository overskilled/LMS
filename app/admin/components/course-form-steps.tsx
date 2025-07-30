"use client"

import type React from "react"

import { useState } from "react"
import { Upload, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface CourseDetailsData {
    thumbnailImage?: File
    previewVideo?: File
    lessonName: string
    courseSlug: string
    courseCategory: string
    courseLevel: string
    courseTime: string
    totalLessons: string
    difficulty: "beginner" | "intermediate" | "advanced" | "expert"
    estimatedHours: number
}

interface EnhancedCourseFormStepsProps {
    currentStep: number
    onDataChange: (stepIndex: number, data: any) => void
    onNext: () => void
    onPrevious: () => void
    onCancel: () => void
    stepData: Record<number, any>
}

export function CourseFormSteps({
    currentStep,
    onDataChange,
    onNext,
    onPrevious,
    onCancel,
    stepData,
}: EnhancedCourseFormStepsProps) {
    const [dragActive, setDragActive] = useState(false)
    const [previewDragActive, setPreviewDragActive] = useState(false)
    const [formData, setFormData] = useState<CourseDetailsData>(
        stepData[currentStep] || {
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
        },
    )

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
        onDataChange(currentStep, newData)
    }

    const handleFileUpload = (file: File, type: "thumbnail" | "preview") => {
        if (
            type === "thumbnail" &&
            file &&
            (file.type === "image/png" || file.type === "image/jpeg") &&
            file.size <= 5 * 1024 * 1024
        ) {
            const newData = { ...formData, thumbnailImage: file }
            setFormData(newData)
            onDataChange(currentStep, newData)
        } else if (type === "preview" && file && file.type.startsWith("video/") && file.size <= 100 * 1024 * 1024) {
            const newData = { ...formData, previewVideo: file }
            setFormData(newData)
            onDataChange(currentStep, newData)
        }
    }

    const handleDrag = (e: React.DragEvent, type: "thumbnail" | "preview") => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            if (type === "thumbnail") setDragActive(true)
            else setPreviewDragActive(true)
        } else if (e.type === "dragleave") {
            if (type === "thumbnail") setDragActive(false)
            else setPreviewDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent, type: "thumbnail" | "preview") => {
        e.preventDefault()
        e.stopPropagation()
        if (type === "thumbnail") setDragActive(false)
        else setPreviewDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0], type)
        }
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

                        <Card
                            className={cn(
                                "border-2 border-dashed transition-colors cursor-pointer",
                                dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300",
                                "hover:border-blue-400 hover:bg-gray-50",
                            )}
                            onDragEnter={(e) => handleDrag(e, "thumbnail")}
                            onDragLeave={(e) => handleDrag(e, "thumbnail")}
                            onDragOver={(e) => handleDrag(e, "thumbnail")}
                            onDrop={(e) => handleDrop(e, "thumbnail")}
                            onClick={() => document.getElementById("thumbnail-upload")?.click()}
                        >
                            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                                <div className="w-16 h-16 border-2 border-gray-400 rounded-lg flex items-center justify-center mb-4">
                                    <Upload className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-lg font-medium mb-2">
                                    Drag thumbnail or <span className="text-blue-500 underline">Browse</span>
                                </p>
                                <p className="text-sm text-gray-500">PNG, JPEG (max 5mb) • Recommended: 1280x720</p>
                                <input
                                    id="thumbnail-upload"
                                    type="file"
                                    accept="image/png,image/jpeg"
                                    className="hidden"
                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "thumbnail")}
                                />
                            </CardContent>
                        </Card>

                        {formData.thumbnailImage && <p className="text-sm text-green-600 mt-2">✓ {formData.thumbnailImage.name}</p>}
                    </div>

                    {/* Preview Video Upload */}
                    <div>
                        <Label className="text-sm font-medium">
                            Course Preview Video <span className="text-gray-500">(Optional)</span>
                        </Label>
                        <p className="text-xs text-gray-500 mb-2">A short preview to showcase your course content</p>

                        <Card
                            className={cn(
                                "border-2 border-dashed transition-colors cursor-pointer",
                                previewDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300",
                                "hover:border-blue-400 hover:bg-gray-50",
                            )}
                            onDragEnter={(e) => handleDrag(e, "preview")}
                            onDragLeave={(e) => handleDrag(e, "preview")}
                            onDragOver={(e) => handleDrag(e, "preview")}
                            onDrop={(e) => handleDrop(e, "preview")}
                            onClick={() => document.getElementById("preview-upload")?.click()}
                        >
                            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                                <div className="w-16 h-16 border-2 border-gray-400 rounded-lg flex items-center justify-center mb-4">
                                    <Upload className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-lg font-medium mb-2">
                                    Drag preview video or <span className="text-blue-500 underline">Browse</span>
                                </p>
                                <p className="text-sm text-gray-500">MP4, MOV (max 100mb) • Keep it under 2 minutes</p>
                                <input
                                    id="preview-upload"
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "preview")}
                                />
                            </CardContent>
                        </Card>

                        {formData.previewVideo && <p className="text-sm text-green-600 mt-2">✓ {formData.previewVideo.name}</p>}
                    </div>
                </div>

                {/* Right Column - Course Information */}
                <div className="space-y-6">
                    {/* Course Name & Slug */}
                    <div className="space-y-4">
                        <div>
                            <Label className="text-sm font-medium">
                                Lesson Name <span className="text-red-500">(Required)</span>
                            </Label>
                            <div className="relative mt-2">
                                <Input
                                    placeholder="e.g., Complete React Development Bootcamp"
                                    value={formData.lessonName}
                                    onChange={(e) => handleInputChange("lessonName", e.target.value)}
                                    className="pr-16"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                                    {formData.lessonName.length} / 100
                                </span>
                            </div>
                        </div>

                        <div>
                            <Label className="text-sm font-medium">Course URL Slug</Label>
                            <div className="flex items-center mt-2">
                                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-l-md border border-r-0">
                                    nmd.course.com/courses/
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
                                onValueChange={(value) => handleInputChange("courseCategory", value)}
                            >
                                <SelectTrigger>
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
                        </div>

                        <div>
                            <Label className="text-sm font-medium mb-2 block">Course Level</Label>
                            <Select value={formData.courseLevel} onValueChange={(value) => handleInputChange("courseLevel", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="beginner">Beginner</SelectItem>
                                    <SelectItem value="intermediate">Intermediate</SelectItem>
                                    <SelectItem value="advanced">Advanced</SelectItem>
                                    <SelectItem value="expert">Expert</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Difficulty & Duration */}
                    <div className="space-y-4">
                        <div>
                            <Label className="text-sm font-medium mb-2 block">Difficulty Level</Label>
                            <Select
                                value={formData.difficulty}
                                onValueChange={(value: any) => handleInputChange("difficulty", value)}
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
                            <Select value={formData.courseTime} onValueChange={(value) => handleInputChange("courseTime", value)}>
                                <SelectTrigger>
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
                        </div>

                        <div>
                            <Label className="text-sm font-medium mb-2 block">Total Lessons</Label>
                            <Select value={formData.totalLessons} onValueChange={(value) => handleInputChange("totalLessons", value)}>
                                <SelectTrigger>
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
                    {currentStep > 0 && (
                        <Button variant="outline" onClick={onPrevious}>
                            Previous
                        </Button>
                    )}
                    <Button onClick={onNext}>Continue</Button>
                </div>
            </div>
        </div>
    )
}
