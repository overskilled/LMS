"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import Image from "next/image"
import { db } from "@/firebase/config"
import { Progress } from "@/components/ui/progress"
import { Trash2, Edit, Plus, GripVertical, ChevronUp, ChevronDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useMediaUpload } from "@/hooks/useMediaUpload"
import { CourseFormSkeleton } from "../../components/course-skeleton"
import LearningObjectives from "@/components/custom/learningObjectifs"

export default function UpdateCoursePage() {
    const router = useRouter()
    const params = useParams<{ id: string }>()
    const courseId = params.id
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [course, setCourse] = useState<any>(null)
    const [videoToEdit, setVideoToEdit] = useState<number | null>(null)
    const [reorderMode, setReorderMode] = useState(false)

    const { uploadFile, deleteFile, uploading, progress, error, clearError } = useMediaUpload()

    // ✅ Fetch course data
    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const ref = doc(db, "courses", courseId)
                const snap = await getDoc(ref)
                if (snap.exists()) {
                    setCourse(snap.data())
                } else {
                    toast.error("Course not found")
                    router.push("/admin/courses")
                }
            } catch (err: any) {
                toast.error("Failed to load course")
            } finally {
                setLoading(false)
            }
        }
        fetchCourse()
    }, [courseId, router])

    // ✅ Handle field updates
    const handleChange = (path: string, value: any) => {
        setCourse((prev: any) => {
            const updated = { ...prev }
            const keys = path.split(".")
            let obj = updated
            for (let i = 0; i < keys.length - 1; i++) {
                if (!obj[keys[i]]) obj[keys[i]] = {}
                obj = obj[keys[i]]
            }
            obj[keys[keys.length - 1]] = value
            return updated
        })
    }

    // ✅ Save updates
    const handleUpdate = async () => {
        if (!course) return
        setSaving(true)
        try {
            const ref = doc(db, "courses", courseId)

            console.log("data sublitted: ", course)
            await updateDoc(ref, {
                ...course,
                updatedAt: Date.now(),
                lastEdited: serverTimestamp(),
            })
            toast.success("Course updated successfully!")
            router.push("/admin/courses")
        } catch (err: any) {
            console.log("An error occcured: ", err)
            toast.error("Failed to update course with error: ", err)
        } finally {
            setSaving(false)
        }
    }

    // ✅ Handle thumbnail upload
    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        try {
            const file = e.target.files[0]
            const metadata = await uploadFile(file, "thumbnail", courseId)

            handleChange("courseDetails.thumbnailImage", {
                ...metadata,
                dimensions: {
                    width: metadata.width,
                    height: metadata.height,
                },
            })

            toast.success("Thumbnail uploaded successfully")
        } catch (err) {
            toast.error("Failed to upload thumbnail")
        }
    }

    // ✅ Handle preview video upload
    const handlePreviewUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        try {
            const file = e.target.files[0]
            const metadata = await uploadFile(file, "preview", courseId)

            handleChange("courseDetails.previewVideo", metadata)
            toast.success("Preview video uploaded successfully")
        } catch (err) {
            toast.error("Failed to upload preview video")
        }
    }

    // ✅ Handle video upload
    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        try {
            const file = e.target.files[0]
            const metadata = await uploadFile(file, "video", courseId)

            // Ensure all fields have defined values
            const newVideo = {
                id: metadata.id || "",
                title: file.name.split(".")[0] || "Untitled Video",
                description: "",
                metadata: {
                    courseId: courseId,
                    downloadURL: metadata.downloadURL || "",
                    duration: metadata.duration || 0,
                    fileName: metadata.fileName || "",
                    fileSize: metadata.fileSize || 0,
                    frameRate: metadata.frameRate || 30, // Default to 30fps if undefined
                    height: metadata.height || 0,
                    mimeType: metadata.mimeType || "video/mp4",
                    originalName: metadata.originalName || file.name,
                    storagePath: metadata.storagePath || "",
                    type: "video",
                    uploadedAt: metadata.uploadedAt || new Date(),
                    width: metadata.width || 0,
                },
                order: course.videos ? course.videos.length : 0,
                isPreview: false,
            }

            const updatedVideos = course.videos ? [...course.videos, newVideo] : [newVideo]
            handleChange("videos", updatedVideos)
            toast.success("Video uploaded successfully")
        } catch (err) {
            toast.error("Failed to upload video")
        }
    }

    // ✅ Handle video deletion
    const handleDeleteVideo = async (index: number) => {
        if (!course.videos || !course.videos[index]) return

        const video = course.videos[index]

        if (window.confirm(`Are you sure you want to delete "${video.title}"?`)) {
            try {
                // Extract the full file ID (numbers_letters) from the filename
                const fileName = video.metadata.fileName // "video/1754942291190_iebb7ugvls.mp4"
                const fileParts = fileName.split("/")[1] // "1754942291190_iebb7ugvl
                console.log("fileter id: ", fileParts)

                // Delete the file from storage
                await deleteFile(fileParts)

                // Create a new array without the deleted video
                const updatedVideos = course.videos.filter((_: any, i: number) => i !== index)

                // Update order for remaining videos
                const videosWithUpdatedOrder = updatedVideos.map((v: any, i: number) => ({
                    ...v,
                    order: i,
                }))

                // Prepare the complete update object
                const updateData = {
                    videos: videosWithUpdatedOrder,
                    updatedAt: Date.now(),
                    lastEdited: serverTimestamp(),
                }

                // Update Firestore document
                const ref = doc(db, "courses", courseId)
                await updateDoc(ref, updateData)

                // Update local state
                setCourse((prev: any) => ({
                    ...prev,
                    videos: videosWithUpdatedOrder,
                }))

                toast.success("Video deleted successfully")
            } catch (err) {
                console.error("Delete error:", err)
                toast.error("Failed to delete video")
            }
        }
    }

    // ✅ Handle video reordering
    const handleMoveVideo = (index: number, direction: "up" | "down") => {
        if (!course.videos) return

        const newIndex = direction === "up" ? index - 1 : index + 1

        if (newIndex < 0 || newIndex >= course.videos.length) return

        const updatedVideos = [...course.videos]
        const temp = updatedVideos[index]
        updatedVideos[index] = updatedVideos[newIndex]
        updatedVideos[newIndex] = temp

        // Update order values
        updatedVideos.forEach((video, i) => {
            video.order = i
        })

        handleChange("videos", updatedVideos)
    }

    // ✅ Handle thumbnail deletion
    const handleDeleteThumbnail = async () => {
        if (!course.courseDetails?.thumbnailImage?.id) return

        if (window.confirm("Are you sure you want to delete the thumbnail?")) {
            try {
                await deleteFile(course.courseDetails.thumbnailImage.id)
                handleChange("courseDetails.thumbnailImage", null)
                toast.success("Thumbnail deleted successfully")
            } catch (err) {
                toast.error("Failed to delete thumbnail")
            }
        }
    }

    // ✅ Handle preview video deletion
    const handleDeletePreview = async () => {
        if (!course.courseDetails?.previewVideo?.id) return

        if (window.confirm("Are you sure you want to delete the preview video?")) {
            try {
                await deleteFile(course.courseDetails.previewVideo.id)
                handleChange("courseDetails.previewVideo", null)
                toast.success("Preview video deleted successfully")
            } catch (err) {
                toast.error("Failed to delete preview video")
            }
        }
    }

    if (loading) return <CourseFormSkeleton />

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Update Course</h1>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4 flex justify-between">
                    <span>{error}</span>
                    <button onClick={clearError} className="text-red-700">
                        ×
                    </button>
                </div>
            )}

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-5 h-auto">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="pricing">Pricing</TabsTrigger>
                    <TabsTrigger value="media">Media</TabsTrigger>
                    <TabsTrigger value="videos">Videos</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                {/* General Info */}
                <TabsContent value="general">
                    <Card>
                        <CardHeader className="font-semibold text-lg">General Information</CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="title" className="mb-2">
                                    Course Title
                                </Label>
                                <Input
                                    id="title"
                                    value={course?.title || ""}
                                    onChange={(e) => handleChange("title", e.target.value)}
                                    placeholder="Course Title"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="shortDescription" className="mb-2">
                                    Short Description
                                </Label>
                                <Textarea
                                    id="shortDescription"
                                    value={course?.aboutCourse?.shortDescription || ""}
                                    onChange={(e) => handleChange("aboutCourse.shortDescription", e.target.value)}
                                    placeholder="Short Description"
                                    rows={3}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="fullDescription" className="mb-2">
                                    Full Description
                                </Label>
                                <Textarea
                                    id="fullDescription"
                                    value={course?.aboutCourse?.fullDescription || ""}
                                    onChange={(e) => handleChange("aboutCourse.fullDescription", e.target.value)}
                                    placeholder="Full description"
                                    rows={5}
                                    className="mt-1"
                                />
                            </div>

                            {/* <div>
                                <Label htmlFor="slug" className="mb-2">
                                    Course Slug
                                </Label>
                                <Input
                                    id="slug"
                                    value={course?.courseDetails?.courseSlug || ""}
                                    onChange={(e) => handleChange("courseDetails.courseSlug", e.target.value)}
                                    placeholder="Slug"
                                    className="mt-1"
                                />
                            </div> */}

                            <LearningObjectives
                                value={course?.aboutCourse?.learningObjectives || []}
                                onChange={(newObjectives) => handleChange("aboutCourse.learningObjectives", newObjectives)}
                            />

                            <div>
                                <Label htmlFor="courseCategory" className="mb-2">
                                    Category
                                </Label>
                                <Select
                                    value={course?.courseDetails?.courseCategory || ""}
                                    onValueChange={(value) => handleChange("courseDetails.courseCategory", value)}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="satallite-engineering">Satellite Engineering</SelectItem>
                                        <SelectItem value="geomatics">Geomatics</SelectItem>
                                        <SelectItem value="Articicial-intelligence">Artificial Intelligence</SelectItem>
                                        <SelectItem value="mission-operations">Mission Operations</SelectItem>
                                        <SelectItem value="space-science">Space Science</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="difficulty" className="mb-2">
                                    Difficulty Level
                                </Label>
                                <Select
                                    value={course?.courseDetails?.difficulty || ""}
                                    onValueChange={(value) => handleChange("courseDetails.difficulty", value)}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select difficulty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="beginner">Beginner</SelectItem>
                                        <SelectItem value="intermediate">Intermediate</SelectItem>
                                        <SelectItem value="advanced">Advanced</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="estimatedHours" className="mb-2">
                                    Estimated Hours
                                </Label>
                                <Input
                                    id="estimatedHours"
                                    type="number"
                                    value={course?.courseDetails?.estimatedHours || 0}
                                    onChange={(e) => handleChange("courseDetails.estimatedHours", Number(e.target.value))}
                                    placeholder="Estimated Hours"
                                    className="mt-1"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Pricing */}
                <TabsContent value="pricing">
                    <Card>
                        <CardHeader className="font-semibold text-lg">Pricing</CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="basePrice" className="mb-2">
                                    Base Price
                                </Label>
                                <Input
                                    id="basePrice"
                                    type="number"
                                    value={course?.aboutCourse?.pricing?.basePrice || 0}
                                    onChange={(e) => handleChange("aboutCourse.pricing.basePrice", Number(e.target.value))}
                                    placeholder="Base Price"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="currency" className="mb-2">
                                    Currency
                                </Label>
                                <Select
                                    value={course?.aboutCourse?.pricing?.currency || ""}
                                    onValueChange={(value) => handleChange("aboutCourse.pricing.currency", value)}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select currency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="XAF">XAF</SelectItem>
                                        <SelectItem value="XOF">XOF</SelectItem>
                                        <SelectItem value="USD">USD</SelectItem>
                                        <SelectItem value="EUR">EUR</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="pricingTier" className="mb-2">
                                    Pricing Tier
                                </Label>
                                <Select
                                    value={course?.aboutCourse?.pricing?.pricingTier || ""}
                                    onValueChange={(value) => handleChange("pricing.pricingTier", value)}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select pricing tier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="basic">Basic</SelectItem>
                                        <SelectItem value="premium">Premium</SelectItem>
                                        <SelectItem value="enterprise">Enterprise</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Media */}
                <TabsContent value="media">
                    <Card className="mb-4">
                        <CardHeader className="font-semibold text-lg">Thumbnail</CardHeader>
                        <CardContent className="space-y-4">
                            {course?.courseDetails?.thumbnailImage?.downloadURL ? (
                                <div className="space-y-2">
                                    <div className="relative w-[200px] h-[100px] overflow-hidden rounded border border-gray-200">
                                        <Image
                                            src={course.courseDetails.thumbnailImage.downloadURL || "/placeholder.svg"}
                                            alt="Thumbnail"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={handleDeleteThumbnail} disabled={uploading}>
                                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                                    <p className="text-gr   ay-500 mb-2">No thumbnail uploaded</p>
                                    <p className="text-sm text-gray-400">Upload an image to represent your course.</p>
                                </div>
                            )}
                            <div>
                                <Label htmlFor="thumbnailUpload" className="mb-2">
                                    Upload New Thumbnail
                                </Label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Input
                                        id="thumbnailUpload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleThumbnailUpload}
                                        disabled={uploading}
                                        className="hidden"
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={() => document.getElementById("thumbnailUpload")?.click()}
                                        disabled={uploading}
                                        className="w-full"
                                    >
                                        {uploading ? `Uploading... ${progress?.progress}%` : "Choose File"}
                                    </Button>
                                </div>
                                {uploading && <Progress value={progress?.progress} className="w-full mt-2" />}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="font-semibold text-lg">Preview Video</CardHeader>
                        <CardContent className="space-y-4">
                            {course?.courseDetails?.previewVideo?.downloadURL ? (
                                <div className="space-y-2">
                                    <video
                                        src={course.courseDetails.previewVideo.downloadURL}
                                        controls
                                        className="w-full max-w-md rounded border border-gray-200"
                                    />
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={handleDeletePreview} disabled={uploading}>
                                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                                    <p className="text-gray-500 mb-2">No preview video uploaded</p>
                                    <p className="text-sm text-gray-400">Add a short video to showcase your course content.</p>
                                </div>
                            )}
                            <div>
                                <Label htmlFor="previewUpload" className="mb-2">
                                    Upload New Preview Video
                                </Label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Input
                                        id="previewUpload"
                                        type="file"
                                        accept="video/*"
                                        onChange={handlePreviewUpload}
                                        disabled={uploading}
                                        className="hidden"
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={() => document.getElementById("previewUpload")?.click()}
                                        disabled={uploading}
                                        className="w-full"
                                    >
                                        {uploading ? `Uploading... ${progress?.progress}%` : "Choose File"}
                                    </Button>
                                </div>
                                {uploading && <Progress value={progress?.progress} className="w-full mt-2" />}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Videos */}
                <TabsContent value="videos">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between font-semibold text-lg">
                            <div>Course Videos</div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setReorderMode(!reorderMode)}>
                                    {reorderMode ? "Done Reordering" : "Reorder Videos"}
                                </Button>
                                <div className="relative">
                                    <Input
                                        type="file"
                                        accept="video/*"
                                        onChange={handleVideoUpload}
                                        disabled={uploading}
                                        className="hidden"
                                        id="videoUpload"
                                    />
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => document.getElementById("videoUpload")?.click()}
                                        disabled={uploading}
                                    >
                                        <Plus className="h-4 w-4 mr-1" /> Add Video
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {uploading && (
                                <div className="mb-4 p-3 border rounded-lg bg-blue-50">
                                    <p className="text-sm mb-1 text-blue-700">Uploading video: {progress?.progress}</p>
                                    <Progress value={progress?.progress} className="w-full" />
                                </div>
                            )}
                            {course?.videos?.length > 0 ? (
                                <div className="space-y-3">
                                    {course.videos.map((vid: any, i: number) => (
                                        <div key={vid.id} className="border rounded-lg overflow-hidden shadow-sm">
                                            <div className="p-3 bg-gray-50 flex justify-between items-center">
                                                <div className="font-medium text-gray-800 flex items-center gap-2">
                                                    {reorderMode && <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />}
                                                    <span>
                                                        {i + 1}. {vid.title}
                                                    </span>
                                                </div>
                                                <div className="flex gap-1">
                                                    {reorderMode ? (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleMoveVideo(i, "up")}
                                                                disabled={i === 0}
                                                                className="hover:bg-gray-200"
                                                            >
                                                                <ChevronUp className="h-5 w-5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleMoveVideo(i, "down")}
                                                                disabled={i === course.videos.length - 1}
                                                                className="hover:bg-gray-200"
                                                            >
                                                                <ChevronDown className="h-5 w-5" />
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => setVideoToEdit(videoToEdit === i ? null : i)}
                                                                className="hover:bg-gray-200"
                                                            >
                                                                <Edit className="h-5 w-5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDeleteVideo(i)}
                                                                className="hover:bg-red-100 text-red-500"
                                                            >
                                                                <Trash2 className="h-5 w-5" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            {videoToEdit === i && (
                                                <div className="p-4 space-y-4 border-t bg-white">
                                                    <div>
                                                        <Label htmlFor={`video-title-${i}`} className="mb-2">
                                                            Title
                                                        </Label>
                                                        <Input
                                                            id={`video-title-${i}`}
                                                            value={vid.title}
                                                            onChange={(e) => {
                                                                const updatedVideos = [...course.videos]
                                                                updatedVideos[i].title = e.target.value
                                                                handleChange("videos", updatedVideos)
                                                            }}
                                                            placeholder="Video Title"
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={`video-desc-${i}`} className="mb-2">
                                                            Description
                                                        </Label>
                                                        <Textarea
                                                            id={`video-desc-${i}`}
                                                            value={vid.description || ""}
                                                            onChange={(e) => {
                                                                const updatedVideos = [...course.videos]
                                                                updatedVideos[i].description = e.target.value
                                                                handleChange("videos", updatedVideos)
                                                            }}
                                                            placeholder="Video Description"
                                                            rows={3}
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Switch
                                                            id={`video-isPreview-${i}`}
                                                            checked={vid.isPreview || false}
                                                            onCheckedChange={(checked) => {
                                                                const updatedVideos = [...course.videos]
                                                                updatedVideos[i].isPreview = checked
                                                                handleChange("videos", updatedVideos)
                                                            }}
                                                        />
                                                        <Label htmlFor={`video-isPreview-${i}`}>Available as preview</Label>
                                                    </div>
                                                    {vid.metadata?.downloadURL && (
                                                        <div>
                                                            <Label className="mb-2">Video Preview</Label>
                                                            <video
                                                                src={vid.metadata.downloadURL}
                                                                controls
                                                                className="w-full rounded-lg mt-1 border border-gray-200"
                                                                height={200}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                                    <p className="text-gray-500 mb-2">No videos uploaded yet</p>
                                    <p className="text-sm text-gray-400">Click "Add Video" to upload your first video lesson.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Settings */}
                <TabsContent value="settings">
                    <Card>
                        <CardHeader className="font-semibold text-lg">Settings</CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="isPublic"
                                    checked={course?.publishSettings?.isPublic || false}
                                    onCheckedChange={(checked) => handleChange("publishSettings.isPublic", checked)}
                                />
                                <Label htmlFor="isPublic">Public Course</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="certificateEnabled"
                                    checked={course?.publishSettings?.certificateEnabled || false}
                                    onCheckedChange={(checked) => handleChange("publishSettings.certificateEnabled", checked)}
                                />
                                <Label htmlFor="certificateEnabled">Certificate Enabled</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="discussionEnabled"
                                    checked={course?.publishSettings?.discussionEnabled || false}
                                    onCheckedChange={(checked) => handleChange("publishSettings.discussionEnabled", checked)}
                                />
                                <Label htmlFor="discussionEnabled">Discussion Enabled</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="downloadableResources"
                                    checked={course?.publishSettings?.downloadableResources || false}
                                    onCheckedChange={(checked) => handleChange("publishSettings.downloadableResources", checked)}
                                />
                                <Label htmlFor="downloadableResources">Downloadable Resources</Label>
                            </div>

                            <div>
                                <Label htmlFor="supportEmail" className="mb-2">
                                    Support Email
                                </Label>
                                <Input
                                    id="supportEmail"
                                    type="email"
                                    value={course?.publishSettings?.supportEmail || ""}
                                    onChange={(e) => handleChange("publishSettings.supportEmail", e.target.value)}
                                    placeholder="Support Email"
                                    className="mt-1"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="mt-6 flex gap-3">
                <Button onClick={handleUpdate} disabled={saving || uploading}>
                    {saving ? "Saving..." : "Update Course"}
                </Button>
                <Button variant="outline" onClick={() => router.push("/admin/courses")} disabled={saving || uploading}>
                    Cancel
                </Button>
            </div>
        </div>
    )
}
