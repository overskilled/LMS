"use client"

import type React from "react"

import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react"
import { Upload, Play, Trash2, GripVertical, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AccessibleStepWrapper, type StepRef } from "./accessible-step-wrapper"
import { useMediaUpload } from "@/hooks/useMediaUpload"
import { batchUploadMedia, formatFileSize, formatDuration, type MediaMetadata } from "@/lib/mediaUpload"
import { cn } from "@/lib/utils"

interface Video {
    id: string
    metadata: any
    title: string
    description: string
    duration?: number
    order: number
    isPreview: boolean
    thumbnail?: File
}

interface VideoUploadStepProps {
    initialData?: any
    onDataChange: (data: Video[], isValid: boolean) => void
    onNext?: () => void
    onPrevious?: () => void
    onCancel?: () => void
    courseId?: string
}

const LOCAL_STORAGE_KEY = 'videoUploadFormData';

export const VideoUploadStep = forwardRef<StepRef, VideoUploadStepProps>(
    ({ initialData = [], onDataChange, onNext, onPrevious, onCancel, courseId }, ref) => {
        // Load initial data from localStorage if available
        const getInitialData = (): Video[] => {
            try {
                if (typeof window !== 'undefined') {
                    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
                    if (savedData) {
                        return JSON.parse(savedData);
                    }
                }
            } catch (error) {
                console.error('Failed to parse saved video data:', error);
            }
            return initialData;
        };

        const [videos, setVideos] = useState<Video[]>(getInitialData());
        const [dragActive, setDragActive] = useState(false);
        const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
        const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});
        const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
        const [isValid, setIsValid] = useState(false);
        const [isLoading, setIsLoading] = useState(false);

        const fileInputRef = useRef<HTMLInputElement>(null);
        const { error: uploadError, clearError } = useMediaUpload();

        // Save to localStorage whenever videos change
        useEffect(() => {
            try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(videos));
            } catch (error) {
                console.error('Failed to save video data:', error);
            }
        }, [videos]);

        // Validation function
        const validateVideos = (): boolean => {
            const errors: Record<string, string> = {};

            if (videos.length === 0) {
                errors.videos = "At least one video is required";
            }

            videos.forEach((video, index) => {
                if (!video.title.trim()) {
                    errors[`video-${index}-title`] = "Video title is required";
                }
            });

            setValidationErrors(errors);
            const valid = Object.keys(errors).length === 0;
            setIsValid(valid);
            return valid;
        };

        const handleDrag = (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.type === "dragenter" || e.type === "dragover") {
                setDragActive(true);
            } else if (e.type === "dragleave") {
                setDragActive(false);
            }
        };

        const handleDrop = (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);

            const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("video/"));
            if (files.length > 0) {
                handleMultipleFileUpload(files);
            }
        };

        const handleMultipleFileUpload = async (files: File[]) => {
            setIsLoading(true);
            clearError();
            setUploadingFiles(files);
            setUploadProgress({});

            try {
                const uploadedMetadata = await batchUploadMedia(files, "video", courseId, (fileIndex, progress) => {
                    setUploadProgress((prev) => ({
                        ...prev,
                        [fileIndex]: progress.progress,
                    }));
                });

                // Convert metadata to Video objects
                const newVideos: Video[] = uploadedMetadata.map((metadata, index) => ({
                    id: metadata.id,
                    metadata,
                    title: metadata.originalName.replace(/\.[^/.]+$/, ""),
                    description: "",
                    order: videos.length + index,
                    isPreview: false,
                }));

                setVideos((prev) => [...prev, ...newVideos]);
            } catch (error) {
                console.error("Batch upload failed:", error);
                setValidationErrors({ upload: "Failed to upload videos. Please try again." });
            } finally {
                setIsLoading(false);
                setUploadingFiles([]);
                setUploadProgress({});
            }
        };

        const updateVideo = (id: string, updates: Partial<Video>) => {
            setVideos((prev) => prev.map((video) => (video.id === id ? { ...video, ...updates } : video)));
        };

        const removeVideo = (id: string) => {
            setVideos((prev) => prev.filter((video) => video.id !== id));
        };

        const reorderVideos = (fromIndex: number, toIndex: number) => {
            const newVideos = [...videos];
            const [removed] = newVideos.splice(fromIndex, 1);
            newVideos.splice(toIndex, 0, removed);

            // Update order numbers
            const reorderedVideos = newVideos.map((video, index) => ({
                ...video,
                order: index,
            }));

            setVideos(reorderedVideos);
        };

        const togglePreview = (id: string) => {
            // Only one video can be preview
            setVideos((prev) =>
                prev.map((video) => ({
                    ...video,
                    isPreview: video.id === id ? !video.isPreview : false,
                })),
            );
        };

        const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                handleMultipleFileUpload(Array.from(files));
            }
        };

        const handleNext = () => {
            const isValid = validateVideos();
            if (isValid && onNext) {
                onNext();
            }
        };

        useImperativeHandle(ref, () => ({
            validate: async () => validateVideos(),
            getData: () => videos,
            focus: () => {
                fileInputRef.current?.focus();
            },
            reset: () => {
                setVideos([]);
                setValidationErrors({});
                try {
                    localStorage.removeItem(LOCAL_STORAGE_KEY);
                } catch (error) {
                    console.error('Failed to clear saved video data:', error);
                }
            },
        }));

        return (
            <AccessibleStepWrapper
                stepNumber={2}
                title="Upload Videos"
                description="Add video lessons for your course"
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
                    {/* Upload Area */}
                    <div>
                        <Label className="text-sm font-medium mb-2 block">
                            Course Videos{" "}
                            <span className="text-red-500" aria-label="required">
                                *
                            </span>
                        </Label>

                        <Card
                            className={cn(
                                "border-2 border-dashed transition-colors cursor-pointer",
                                dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300",
                                "hover:border-blue-400 hover:bg-gray-50",
                                uploadingFiles.length > 0 && "pointer-events-none opacity-50",
                                validationErrors.videos && "border-red-300 bg-red-50",
                            )}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            role="button"
                            tabIndex={0}
                            aria-describedby="video-upload-help video-upload-error"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault()
                                    fileInputRef.current?.click()
                                }
                            }}
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
                                    aria-describedby="video-upload-help"
                                    disabled={isLoading}
                                />
                            </CardContent>
                        </Card>

                        <div id="video-upload-help" className="sr-only">
                            Upload video files for your course. You can select multiple files at once. Supported formats: MP4, MOV,
                            AVI. Maximum size per file: 500MB.
                        </div>

                        {validationErrors.videos && (
                            <Alert variant="destructive" className="mt-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription id="video-upload-error" role="alert">
                                    {validationErrors.videos}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    {/* Upload Progress */}
                    {uploadingFiles.length > 0 && (
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-medium mb-4">
                                    Uploading {uploadingFiles.length} file{uploadingFiles.length > 1 ? "s" : ""}...
                                </h3>
                                <div className="space-y-3" role="status" aria-live="polite">
                                    {uploadingFiles.map((file, index) => (
                                        <div key={index} className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="truncate" title={file.name}>
                                                    {file.name}
                                                </span>
                                                <span>{Math.round(uploadProgress[index] || 0)}%</span>
                                            </div>
                                            <Progress
                                                value={uploadProgress[index] || 0}
                                                className="h-2"
                                                aria-label={`Upload progress for ${file.name}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Video List */}
                    {videos.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">
                                Course Videos ({videos.length}) <span className="sr-only">- Use arrow keys to navigate</span>
                            </h3>

                            <div className="space-y-4" role="list" aria-label="Course videos">
                                {videos.map((video, index) => (
                                    <Card key={video.id} className="p-4" role="listitem">
                                        <div className="flex gap-4">
                                            <div className="flex items-center">
                                                <button
                                                    className="p-1 hover:bg-gray-100 rounded cursor-move"
                                                    aria-label={`Reorder video ${index + 1}: ${video.title}`}
                                                    tabIndex={0}
                                                >
                                                    <GripVertical className="w-5 h-5 text-gray-400" />
                                                </button>
                                            </div>

                                            <div className="w-32 h-20 bg-gray-100 rounded-lg flex items-center justify-center relative">
                                                <Play className="w-8 h-8 text-gray-400" aria-hidden="true" />
                                                {video.isPreview && (
                                                    <Badge className="absolute -top-2 -right-2 text-xs" aria-label="Preview video">
                                                        Preview
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="flex-1 space-y-3">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor={`video-title-${video.id}`} className="text-sm font-medium">
                                                            Video Title{" "}
                                                            <span className="text-red-500" aria-label="required">
                                                                *
                                                            </span>
                                                        </Label>
                                                        <Input
                                                            id={`video-title-${video.id}`}
                                                            value={video.title}
                                                            onChange={(e) => updateVideo(video.id, { title: e.target.value })}
                                                            placeholder="Enter video title"
                                                            className={cn(validationErrors[`video-${index}-title`] && "border-red-500")}
                                                            aria-describedby={`video-title-help-${video.id} ${validationErrors[`video-${index}-title`] ? `video-title-error-${video.id}` : ""
                                                                }`}
                                                            aria-invalid={!!validationErrors[`video-${index}-title`]}
                                                        />
                                                        <div id={`video-title-help-${video.id}`} className="sr-only">
                                                            Enter a descriptive title for this video lesson.
                                                        </div>
                                                        {validationErrors[`video-${index}-title`] && (
                                                            <p
                                                                id={`video-title-error-${video.id}`}
                                                                className="text-sm text-red-600 mt-1"
                                                                role="alert"
                                                            >
                                                                {validationErrors[`video-${index}-title`]}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={`video-filename-${video.id}`} className="text-sm font-medium">
                                                            File Name
                                                        </Label>
                                                        <Input
                                                            id={`video-filename-${video.id}`}
                                                            value={video.metadata.originalName}
                                                            disabled
                                                            className="bg-gray-50"
                                                            aria-describedby={`video-filename-help-${video.id}`}
                                                        />
                                                        <div id={`video-filename-help-${video.id}`} className="sr-only">
                                                            Original filename of the uploaded video.
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label htmlFor={`video-description-${video.id}`} className="text-sm font-medium">
                                                        Description
                                                    </Label>
                                                    <Textarea
                                                        id={`video-description-${video.id}`}
                                                        value={video.description}
                                                        onChange={(e) => updateVideo(video.id, { description: e.target.value })}
                                                        placeholder="Brief description of this video lesson"
                                                        rows={2}
                                                        aria-describedby={`video-description-help-${video.id}`}
                                                    />
                                                    <div id={`video-description-help-${video.id}`} className="sr-only">
                                                        Provide a brief description of what students will learn in this video.
                                                    </div>
                                                </div>

                                                {/* Video Metadata */}
                                                <div className="flex items-center gap-4 text-sm text-gray-600" aria-label="Video information">
                                                    <span>{formatFileSize(video.metadata.fileSize)}</span>
                                                    {video.metadata.duration && <span>{formatDuration(video.metadata.duration)}</span>}
                                                    {video.metadata.width && video.metadata.height && (
                                                        <span>
                                                            {video.metadata.width} × {video.metadata.height}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => togglePreview(video.id)}
                                                    className={cn("text-xs", video.isPreview && "bg-blue-50 text-blue-600 border-blue-200")}
                                                    aria-pressed={video.isPreview}
                                                    aria-describedby={`preview-help-${video.id}`}
                                                >
                                                    {video.isPreview ? "Remove Preview" : "Set as Preview"}
                                                </Button>
                                                <div id={`preview-help-${video.id}`} className="sr-only">
                                                    {video.isPreview
                                                        ? "This video is currently set as the course preview"
                                                        : "Set this video as the course preview that students can watch before enrolling"}
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeVideo(video.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                    aria-label={`Remove video: ${video.title}`}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {videos.length === 0 && !isLoading && (
                        <div className="text-center py-8 text-gray-500" role="status">
                            <Play className="w-12 h-12 mx-auto mb-4 opacity-50" aria-hidden="true" />
                            <p>No videos uploaded yet. Add your first video to get started.</p>
                        </div>
                    )}
                </div>
            </AccessibleStepWrapper>
        )
    },
)

VideoUploadStep.displayName = "VideoUploadStep"
