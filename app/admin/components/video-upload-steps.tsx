"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, Play, Trash2, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Video {
    id: string
    file: File
    title: string
    description: string
    duration?: number
    order: number
    isPreview?: boolean
}

interface VideoUploadStepProps {
    videos: Video[]
    onVideosChange: (videos: Video[]) => void
}

export function VideoUploadStep({ videos, onVideosChange }: VideoUploadStepProps) {
    const [dragActive, setDragActive] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

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

        const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("video/"))

        files.forEach(addVideo)
    }

    const addVideo = (file: File) => {
        const newVideo: Video = {
            id: Math.random().toString(36).substr(2, 9),
            file,
            title: file.name.replace(/\.[^/.]+$/, ""),
            description: "",
            order: videos.length,
        }

        onVideosChange([...videos, newVideo])
    }

    const updateVideo = (id: string, updates: Partial<Video>) => {
        onVideosChange(videos.map((video) => (video.id === id ? { ...video, ...updates } : video)))
    }

    const removeVideo = (id: string) => {
        onVideosChange(videos.filter((video) => video.id !== id))
    }

    const reorderVideos = (fromIndex: number, toIndex: number) => {
        const newVideos = [...videos]
        const [removed] = newVideos.splice(fromIndex, 1)
        newVideos.splice(toIndex, 0, removed)

        // Update order numbers
        const reorderedVideos = newVideos.map((video, index) => ({
            ...video,
            order: index,
        }))

        onVideosChange(reorderedVideos)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <h2 className="text-xl font-semibold">Upload Videos</h2>
            </div>

            {/* Upload Area */}
            <Card
                className={cn(
                    "border-2 border-dashed transition-colors cursor-pointer",
                    dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300",
                    "hover:border-blue-400 hover:bg-gray-50",
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
                        onChange={(e) => {
                            if (e.target.files) {
                                Array.from(e.target.files).forEach(addVideo)
                            }
                        }}
                    />
                </CardContent>
            </Card>

            {/* Video List */}
            {videos.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Course Videos ({videos.length})</h3>

                    {videos.map((video, index) => (
                        <Card key={video.id} className="p-4">
                            <div className="flex gap-4">
                                <div className="flex items-center">
                                    <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                                </div>

                                <div className="w-32 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Play className="w-8 h-8 text-gray-400" />
                                </div>

                                <div className="flex-1 space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium">Video Title</Label>
                                            <Input
                                                value={video.title}
                                                onChange={(e) => updateVideo(video.id, { title: e.target.value })}
                                                placeholder="Enter video title"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">File Name</Label>
                                            <Input value={video.file.name} disabled className="bg-gray-50" />
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium">Description</Label>
                                        <Textarea
                                            value={video.description}
                                            onChange={(e) => updateVideo(video.id, { description: e.target.value })}
                                            placeholder="Brief description of this video lesson"
                                            rows={2}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeVideo(video.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {videos.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <p>No videos uploaded yet. Add your first video to get started.</p>
                </div>
            )}
        </div>
    )
}
