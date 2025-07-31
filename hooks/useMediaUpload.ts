"use client"

import { useState, useCallback } from "react"
import { uploadMediaFile, deleteMediaFile, type MediaMetadata, type UploadProgress } from "@/lib/mediaUpload"

interface UseMediaUploadReturn {
    uploadFile: (
        file: File,
        type: "thumbnail" | "preview" | "video" | "image",
        courseId?: string,
    ) => Promise<MediaMetadata>
    deleteFile: (mediaId: string) => Promise<void>
    uploading: boolean
    progress: UploadProgress | null
    error: string | null
    clearError: () => void
}

export const useMediaUpload = (): UseMediaUploadReturn => {
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState<UploadProgress | null>(null)
    const [error, setError] = useState<string | null>(null)

    const uploadFile = useCallback(
        async (
            file: File,
            type: "thumbnail" | "preview" | "video" | "image",
            courseId?: string,
        ): Promise<MediaMetadata> => {
            setUploading(true)
            setError(null)
            setProgress(null)

            try {
                const metadata = await uploadMediaFile(file, type, courseId, (progressData: any) => {
                    setProgress(progressData)
                })

                return metadata
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Upload failed"
                setError(errorMessage)
                throw err
            } finally {
                setUploading(false)
                setProgress(null)
            }
        },
        [],
    )

    const deleteFile = useCallback(async (mediaId: string): Promise<void> => {
        setError(null)

        try {
            await deleteMediaFile(mediaId)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Delete failed"
            setError(errorMessage)
            throw err
        }
    }, [])

    const clearError = useCallback(() => {
        setError(null)
    }, [])

    return {
        uploadFile,
        deleteFile,
        uploading,
        progress,
        error,
        clearError,
    }
}
