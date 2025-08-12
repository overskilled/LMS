import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage"
import { doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { db, storage } from "@/firebase/config"

export interface MediaMetadata {
    id: string
    originalName: string
    fileName: string
    fileSize: number
    mimeType: string
    downloadURL: string
    storagePath: string
    uploadedAt: Date
    type: "thumbnail" | "preview" | "video" | "image"
    courseId?: string
    // Video specific
    duration?: number
    width?: number
    height?: number
    frameRate?: number
    bitrate?: number
    // Image specific
    dimensions?: {
        width: number
        height: number
    }
}

export interface UploadProgress {
    progress: number
    bytesTransferred: number
    totalBytes: number
}

// Helper function to extract video metadata
const extractVideoMetadata = (
    file: File,
): Promise<{
    duration?: number
    width?: number
    height?: number
    frameRate?: number
}> => {
    return new Promise((resolve) => {
        const video = document.createElement("video")
        video.preload = "metadata"
        video.muted = true

        video.onloadedmetadata = () => {
            resolve({
                duration: video.duration,
                width: video.videoWidth,
                height: video.videoHeight,
                frameRate: undefined, // Not easily accessible from HTML5 video
            })
            URL.revokeObjectURL(video.src)
        }

        video.onerror = () => {
            resolve({})
            URL.revokeObjectURL(video.src)
        }

        video.src = URL.createObjectURL(file)
    })
}

// Helper function to extract image metadata
const extractImageMetadata = (
    file: File,
): Promise<{
    width?: number
    height?: number
}> => {
    return new Promise((resolve) => {
        const img = new Image()

        img.onload = () => {
            resolve({
                width: img.naturalWidth,
                height: img.naturalHeight,
            })
            URL.revokeObjectURL(img.src)
        }

        img.onerror = () => {
            resolve({})
            URL.revokeObjectURL(img.src)
        }

        img.src = URL.createObjectURL(file)
    })
}

// Generate unique filename
const generateFileName = (originalName: string, type: string): string => {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = originalName.split(".").pop()
    return `${type}/${timestamp}_${randomString}.${extension}`
}

// Upload single media file
export const uploadMediaFile = async (
    file: File,
    type: "thumbnail" | "preview" | "video" | "image",
    courseId?: string,
    onProgress?: (progress: UploadProgress) => void,
): Promise<MediaMetadata> => {

    if (!file) {
        throw new Error("No file provided")
    }

    if (file.size <= 0) {
        throw new Error("File is empty")
    }
    const fileName = generateFileName(file.name, type)
    const storageRef = ref(storage, fileName)

    // Extract metadata based on file type
    let additionalMetadata = {}
    if (file.type.startsWith("video/")) {
        additionalMetadata = await extractVideoMetadata(file)
    } else if (file.type.startsWith("image/")) {
        const imageData = await extractImageMetadata(file)
        additionalMetadata = {
            width: imageData.width,
            height: imageData.height,
            dimensions: imageData.width && imageData.height ? imageData : undefined,
        }
    }

    // Upload file
    const uploadTask = uploadBytesResumable(storageRef, file)


    return new Promise((resolve, reject) => {
        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                onProgress?.({
                    progress,
                    bytesTransferred: snapshot.bytesTransferred,
                    totalBytes: snapshot.totalBytes,
                })
            },
            (error) => {
                console.error("Upload failed:", error)
                reject(error)
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
                    const mediaId = `media_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

                    const metadata: MediaMetadata = {
                        id: mediaId,
                        originalName: file.name,
                        fileName,
                        fileSize: file.size,
                        mimeType: file.type,
                        downloadURL,
                        storagePath: fileName,
                        uploadedAt: new Date(),
                        type,
                        courseId,
                        ...additionalMetadata,
                    }

                    const cleanedMetadata = Object.fromEntries(
                        Object.entries({
                            ...metadata,
                            uploadedAt: serverTimestamp(),
                        }).filter(([_, v]) => v !== undefined)
                    )

                    // await setDoc(doc(db, "media", mediaId), cleanedMetadata)

                    resolve(metadata)
                } catch (error) {
                    console.error("Failed to save metadata:", error)
                    reject(error)
                }
            },
        )
    })
}

// Batch upload multiple files
export const batchUploadMedia = async (
    files: File[],
    type: "video" | "image",
    courseId?: string,
    onProgress?: (fileIndex: number, progress: UploadProgress) => void,
): Promise<MediaMetadata[]> => {
    const uploadPromises = files.map((file, index) =>
        uploadMediaFile(file, type, courseId, (progress) => onProgress?.(index, progress)),
    )

    return Promise.all(uploadPromises)
}

// Delete media file
export const deleteMediaFile = async (mediaId: string): Promise<void> => {
    try {
        // Get metadata from Firestore
        // const mediaDoc = doc(db, "media", mediaId)

        // Delete from Storage
        const storageRef = ref(storage, `video/${mediaId}`)
        await deleteObject(storageRef)

        // Delete metadata from Firestore
        // await deleteDoc(mediaDoc)
    } catch (error) {
        console.error("Failed to delete media:", error)
        throw error
    }
}

// Utility functions
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = Math.floor(seconds % 60)

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}
