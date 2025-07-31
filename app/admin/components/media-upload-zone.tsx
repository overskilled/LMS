"use client"
import { useCallback, useState } from "react"
import { Upload, FileImage, FileVideo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface MediaUploadZoneProps {
    accept: string
    maxSize: number
    onFileSelected: (file: File) => Promise<void>
    disabled?: boolean
}

export function MediaUploadZone({ accept, maxSize, onFileSelected, disabled }: MediaUploadZoneProps) {
    const [dragActive, setDragActive] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleFile = useCallback(
        async (file: File) => {
            setError(null)

            // Validate file size
            if (file.size > maxSize) {
                setError(`File size exceeds maximum allowed size of ${formatFileSize(maxSize)}`)
                return
            }

            // Validate file type
            if (!accept.split(",").includes(file.type)) {
                setError(`File type ${file.type} is not supported`)
                return
            }

            try {
                await onFileSelected(file)
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to upload file")
            }
        },
        [accept, maxSize, onFileSelected]
    )

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleFile(file)
        }
    }

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()

        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        const file = e.dataTransfer.files?.[0]
        if (file) {
            handleFile(file)
        }
    }

    const isImage = accept.includes("image")
    const isVideo = accept.includes("video")

    return (
        <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <input
                type="file"
                accept={accept}
                onChange={handleChange}
                className="hidden"
                id="media-upload-input"
                disabled={disabled}
            />

            <label
                htmlFor="media-upload-input"
                className="cursor-pointer block"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        document.getElementById("media-upload-input")?.click()
                    }
                }}
            >
                <div className="flex flex-col items-center justify-center gap-2">
                    {isImage ? (
                        <FileImage className="w-12 h-12 text-gray-400 mx-auto" />
                    ) : isVideo ? (
                        <FileVideo2 className="w-12 h-12 text-gray-400 mx-auto" />
                    ) : (
                        <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    )}
                    <p className="text-lg font-medium text-gray-700 mb-2">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500">
                        {isImage
                            ? "PNG, JPEG (max 5MB) • Recommended: 1280x720"
                            : isVideo
                                ? "MP4, MOV, AVI (max 100MB) • Keep it under 2 minutes"
                                : ""}
                    </p>
                    <Button type="button" variant="outline" className="mt-4">
                        Select File
                    </Button>
                </div>
            </label>

            {error && (
                <div className="mt-2 flex items-center justify-center gap-2 text-red-500 text-sm">
                    <span>{error}</span>
                </div>
            )}
        </div>
    )
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}