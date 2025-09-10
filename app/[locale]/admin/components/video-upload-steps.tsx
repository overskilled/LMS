"use client"

import type React from "react"

import { useState, useEffect, forwardRef, useImperativeHandle, useRef, useCallback } from "react"
import { Upload, Play, Trash2, AlertCircle, Plus, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AccessibleStepWrapper, type StepRef } from "./accessible-step-wrapper"
import { useMediaUpload } from "@/hooks/useMediaUpload"
import { batchUploadMedia, formatFileSize, formatDuration } from "@/lib/mediaUpload"
import { cn } from "@/lib/utils"
import { courseApi } from "@/utils/courseApi"
import { useParams } from "next/navigation"

interface Chapter {
    id: string
    title: string
    description: string
    order: number
    isExpanded: boolean
}

interface Video {
    id: string
    metadata: any
    title: string
    description: string
    duration?: number
    order: number
    isPreview: boolean
    thumbnail?: File
    chapterId: string // Added chapterId to associate videos with chapters
}

interface VideoUploadStepProps {
    initialData?: any
    onDataChange: (data: { chapters: Chapter[]; videos: Video[] }, isValid: boolean) => void
    onNext?: () => void
    isEditing?: boolean
    onPrevious?: () => void
    onCancel?: () => void
    courseId?: string
}

const LOCAL_STORAGE_KEY = "videoUploadFormData"

export const VideoUploadStep = forwardRef<StepRef, VideoUploadStepProps>(
    ({ initialData = { chapters: [], videos: [] }, onDataChange, onNext, onPrevious, onCancel, courseId, isEditing }, ref) => {

        const [chapters, setChapters] = useState<Chapter[]>([])
        const [videos, setVideos] = useState<Video[]>([])
        const [activeChapterId, setActiveChapterId] = useState<string | null>(null)
        const [dragActive, setDragActive] = useState(false)
        const [uploadingFiles, setUploadingFiles] = useState<File[]>([])
        const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({})
        const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
        const [isValid, setIsValid] = useState(false)
        const [isLoading, setIsLoading] = useState(false)

        const params = useParams();

        const fileInputRef = useRef<HTMLInputElement>(null)
        const { error: uploadError, clearError } = useMediaUpload()

        // ------------------------------
        // Load initial data (create or edit mode)
        // ------------------------------
        useEffect(() => {
            const fetchData = async () => {
                try {
                    if (isEditing) {
                        // 🔹 Fetch course data when editing
                        const idFromUrl = params?.id as string | undefined;
                        const idToUse = courseId || idFromUrl;

                        if (!idToUse) return;

                        const response = await courseApi.getCourseById(idToUse);
                        if (response.success && response.data) {
                            const courseVideos = response.data?.videos;
                            if (courseVideos) {
                                setChapters(courseVideos.chapters || []);
                                setVideos(courseVideos.videos || []);

                                // Set the first chapter as active if available
                                if (courseVideos.chapters?.length > 0) {
                                    setActiveChapterId(courseVideos.chapters[0].id);
                                }
                            }
                        } else {
                            console.error("Failed to fetch course:", response.message);
                            // Fallback to localStorage draft if available
                            const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
                            if (savedData) {
                                const parsed = JSON.parse(savedData);
                                setChapters(Array.isArray(parsed.chapters) ? parsed.chapters : []);
                                setVideos(Array.isArray(parsed.videos) ? parsed.videos : []);
                                if (parsed.chapters?.length > 0) {
                                    setActiveChapterId(parsed.chapters[0].id);
                                }
                            }
                        }
                    } else {
                        // 🔹 Creating new course - load draft from localStorage
                        const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
                        if (savedData) {
                            const parsed = JSON.parse(savedData);
                            setChapters(Array.isArray(parsed.chapters) ? parsed.chapters : []);
                            setVideos(Array.isArray(parsed.videos) ? parsed.videos : []);
                            if (parsed.chapters?.length > 0) {
                                setActiveChapterId(parsed.chapters[0].id);
                            }
                        }
                    }
                } catch (err) {
                    console.error("Failed to load initial course data:", err);
                }
            };

            fetchData();
        }, [courseId, isEditing, params?.id]);


        // ------------------------------
        // Save drafts only in create mode
        // ------------------------------
        useEffect(() => {
            try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ chapters, videos }))
            } catch (error) {
                console.error("Failed to save video data:", error)
            }
        }, [chapters, videos, isEditing])

        // ------------------------------
        // Validation
        // ------------------------------
        const validateVideos = useCallback((): boolean => {
            const errors: Record<string, string> = {}

            if (chapters.length === 0 && videos.length > 0) {
                errors.chapters = "At least one chapter is required when videos are uploaded"
            }

            chapters.forEach((chapter, index) => {
                if (!chapter.title.trim()) {
                    errors[`chapter-${index}-title`] = "Chapter title is required"
                }
            })

            videos.forEach((video, index) => {
                if (!video.title.trim()) {
                    errors[`video-${index}-title`] = "Video title is required"
                }
            })

            setValidationErrors(errors)
            const valid = Object.keys(errors).length === 0
            setIsValid(valid)
            return valid
        }, [chapters, videos])

        useEffect(() => {
            validateVideos()
        }, [validateVideos])

        // ------------------------------
        // Notify parent when data changes
        // ------------------------------
        const notifyDataChange = useCallback(() => {
            onDataChange({ chapters, videos }, isValid)
        }, [chapters, videos, isValid, onDataChange])

        useEffect(() => {
            notifyDataChange()
        }, [notifyDataChange])

        // ------------------------------
        // Chapter operations
        // ------------------------------
        const addChapter = () => {
            const newChapter: Chapter = {
                id: `chapter-${Date.now()}`,
                title: `Chapter ${chapters.length + 1}`,
                description: "",
                order: chapters.length,
                isExpanded: true,
            }
            setChapters((prev) => [...prev, newChapter])
            setActiveChapterId(newChapter.id)
        }

        const updateChapter = (id: string, updates: Partial<Chapter>) => {
            setChapters((prev) => prev.map((chapter) => (chapter.id === id ? { ...chapter, ...updates } : chapter)))
        }

        const removeChapter = (id: string) => {
            setVideos((prev) => prev.filter((video) => video.chapterId !== id))
            setChapters((prev) => prev.filter((chapter) => chapter.id !== id))
            if (activeChapterId === id) {
                setActiveChapterId(null)
            }
        }

        const toggleChapterExpansion = (id: string) => {
            setChapters((prev) =>
                prev.map((chapter) => (chapter.id === id ? { ...chapter, isExpanded: !chapter.isExpanded } : chapter))
            )
        }

        // ------------------------------
        // Video operations
        // ------------------------------
        const handleMultipleFileUpload = async (files: File[]) => {
            if (!activeChapterId) {
                setValidationErrors({ upload: "Please select a chapter first" })
                return
            }

            setIsLoading(true)
            clearError()
            setUploadingFiles(files)
            setUploadProgress({})

            try {
                const uploadedMetadata = await batchUploadMedia(files, "video", courseId, (fileIndex, progress) => {
                    setUploadProgress((prev) => ({
                        ...prev,
                        [fileIndex]: progress.progress,
                    }))
                })

                const chapterVideos = videos.filter((v) => v.chapterId === activeChapterId)
                const newVideos: Video[] = uploadedMetadata.map((metadata, index) => ({
                    id: metadata.id,
                    metadata,
                    title: metadata.originalName.replace(/\.[^/.]+$/, ""),
                    description: "",
                    order: chapterVideos.length + index,
                    isPreview: false,
                    chapterId: activeChapterId,
                }))

                setVideos((prev) => [...prev, ...newVideos])
            } catch (error) {
                console.error("Batch upload failed:", error)
                setValidationErrors({ upload: "Failed to upload videos. Please try again." })
            } finally {
                setIsLoading(false)
                setUploadingFiles([])
                setUploadProgress({})
            }
        }

        const updateVideo = (id: string, updates: Partial<Video>) => {
            setVideos((prev) => prev.map((video) => (video.id === id ? { ...video, ...updates } : video)))
        }

        const removeVideo = (id: string) => {
            setVideos((prev) => prev.filter((video) => video.id !== id))
        }

        const togglePreview = (id: string) => {
            setVideos((prev) =>
                prev.map((video) => ({
                    ...video,
                    isPreview: video.id === id ? !video.isPreview : false,
                }))
            )
        }

        const handleDrag = (e: React.DragEvent) => {
            e.preventDefault()
            e.stopPropagation()
            if (e.type === "dragenter" || e.type === "dragover") {
                setDragActive(true)
            } else if (e.type === "dragleave") {
                setDragActive(false)
            }
        }

        const handleDrop = (e: React.DragEvent) => {
            e.preventDefault()
            e.stopPropagation()
            setDragActive(false)

            if (!activeChapterId) {
                setValidationErrors({ upload: "Please select a chapter first" })
                return
            }

            const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("video/"))
            if (files.length > 0) {
                handleMultipleFileUpload(files)
            }
        }

        const getChapterVideos = (chapterId: string) => {
            return videos.filter((video) => video.chapterId === chapterId).sort((a, b) => a.order - b.order)
        }

        const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files
            if (files && files.length > 0) {
                handleMultipleFileUpload(Array.from(files))
            }
        }

        // ------------------------------
        // Expose methods to parent
        // ------------------------------
        useImperativeHandle(ref, () => ({
            validate: async () => validateVideos(),
            getData: () => ({ chapters, videos }),
            focus: () => {
                fileInputRef.current?.focus()
            },
            reset: () => {
                setChapters([])
                setVideos([])
                setActiveChapterId(null)
                setValidationErrors({})
                setIsValid(false)
                if (!isEditing) {
                    try {
                        localStorage.removeItem(LOCAL_STORAGE_KEY)
                    } catch (error) {
                        console.error("Failed to clear saved video data:", error)
                    }
                }
            },
        }))


        return (
            <AccessibleStepWrapper
                stepNumber={2}
                title="Create Chapters & Upload Videos"
                description="Organize your course content into chapters and add video lessons"
                isActive={true}
                isCompleted={false}
                isValid={isValid}
                isLoading={isLoading}
                error={uploadError || validationErrors.upload}
                onNext={onNext}
                onPrevious={onPrevious}
                onCancel={onCancel}
            >
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <Label className="text-sm font-medium">
                                Course Chapters{" "}
                                <span className="text-red-500" aria-label="required">
                                    *
                                </span>
                            </Label>
                            <Button onClick={addChapter} size="sm" variant="outline">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Chapter
                            </Button>
                        </div>

                        {chapters.length === 0 ? (
                            <Card className="border-dashed">
                                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                                    <div className="w-16 h-16 border-2 border-gray-400 rounded-lg flex items-center justify-center mb-4">
                                        <Plus className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-lg font-medium mb-2">No chapters created yet</p>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Create your first chapter to start organizing your course content
                                    </p>
                                    <Button onClick={addChapter} variant="outline">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create First Chapter
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {chapters.map((chapter, index) => (
                                    <Card
                                        key={chapter.id}
                                        className={cn("transition-colors", activeChapterId === chapter.id && "ring-2 ring-blue-500")}
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleChapterExpansion(chapter.id)}
                                                    className="p-1"
                                                >
                                                    {chapter.isExpanded ? (
                                                        <ChevronDown className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4" />
                                                    )}
                                                </Button>
                                                <div className="flex-1 grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Input
                                                            value={chapter.title}
                                                            onChange={(e) => updateChapter(chapter.id, { title: e.target.value })}
                                                            placeholder="Chapter title"
                                                            className={cn(validationErrors[`chapter-${index}-title`] && "border-red-500")}
                                                        />
                                                        {validationErrors[`chapter-${index}-title`] && (
                                                            <p className="text-sm text-red-600 mt-1">{validationErrors[`chapter-${index}-title`]}</p>
                                                        )}
                                                    </div>
                                                    <Input
                                                        value={chapter.description}
                                                        onChange={(e) => updateChapter(chapter.id, { description: e.target.value })}
                                                        placeholder="Chapter description (optional)"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary">{getChapterVideos(chapter.id).length} videos</Badge>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setActiveChapterId(activeChapterId === chapter.id ? null : chapter.id)}
                                                        className={cn(activeChapterId === chapter.id && "bg-blue-100 text-blue-700")}
                                                    >
                                                        {activeChapterId === chapter.id ? "Deselect" : "Select"}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeChapter(chapter.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>

                                        {chapter.isExpanded && (
                                            <CardContent className="pt-0">
                                                <div className="space-y-3">
                                                    {getChapterVideos(chapter.id).map((video, videoIndex) => (
                                                        <Card key={video.id} className="p-3 bg-gray-50">
                                                            <div className="flex gap-3">
                                                                <div className="w-20 h-12 bg-gray-200 rounded flex items-center justify-center">
                                                                    <Play className="w-4 h-4 text-gray-400" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <Input
                                                                        value={video.title}
                                                                        onChange={(e) => updateVideo(video.id, { title: e.target.value })}
                                                                        placeholder="Video title"
                                                                        className="mb-2"
                                                                    />
                                                                    <div className="flex items-center gap-4 text-xs text-gray-600">
                                                                        <span>{formatFileSize(video.metadata.fileSize)}</span>
                                                                        {video.metadata.duration && <span>{formatDuration(video.metadata.duration)}</span>}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => togglePreview(video.id)}
                                                                        className={cn("text-xs", video.isPreview && "bg-blue-50 text-blue-600")}
                                                                    >
                                                                        {video.isPreview ? "Preview" : "Set Preview"}
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => removeVideo(video.id)}
                                                                        className="text-red-500"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </Card>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {!activeChapterId && chapters.length > 0 && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>Select a chapter above to upload videos to it.</AlertDescription>
                        </Alert>
                    )}

                    {activeChapterId && (
                        <div>
                            <Label className="text-sm font-medium mb-2 block">
                                Upload Videos to: {chapters.find((c) => c.id === activeChapterId)?.title}
                            </Label>

                            <Card
                                className={cn(
                                    "border-2 border-dashed transition-colors cursor-pointer",
                                    dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300",
                                    "hover:border-blue-400 hover:bg-gray-50",
                                    uploadingFiles.length > 0 && "pointer-events-none opacity-50",
                                )}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                                    <div className="w-16 h-16 border-2 border-gray-400 rounded-lg flex items-center justify-center mb-4">
                                        <Upload className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-lg font-medium mb-2">
                                        Drop video files here or <span className="text-blue-500 underline">browse</span>
                                    </p>
                                    <p className="text-sm text-gray-500">MP4, MOV, AVI (max 500mb per file)</p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="video/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleFileInputChange}
                                        disabled={isLoading}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Upload Progress */}
                    {uploadingFiles.length > 0 && (
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-medium mb-4">
                                    Uploading {uploadingFiles.length} file{uploadingFiles.length > 1 ? "s" : ""}...
                                </h3>
                                <div className="space-y-3">
                                    {uploadingFiles.map((file, index) => (
                                        <div key={index} className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="truncate" title={file.name}>
                                                    {file.name}
                                                </span>
                                                <span>{Math.round(uploadProgress[index] || 0)}%</span>
                                            </div>
                                            <Progress value={uploadProgress[index] || 0} className="h-2" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </AccessibleStepWrapper>
        )
    },
)

VideoUploadStep.displayName = "VideoUploadStep"
