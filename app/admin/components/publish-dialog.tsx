"use client"

import { useState, useEffect } from "react"
import {
    CheckCircle,
    AlertCircle,
    ExternalLink,
    Copy,
    Loader2,
    ArrowLeft,
    RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ApiResponse, PublishedCourse } from "@/utils/courseApi"
// import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface PublishDialogProps {
    isOpen: boolean
    onClose: () => void
    publishResult: ApiResponse<PublishedCourse> | null
    isPublishing: boolean
    onPublish: () => Promise<void>
    onRetry?: () => void
    courseTitle?: string
}

export function PublishDialog({
    isOpen,
    onClose,
    publishResult,
    isPublishing,
    onPublish,
    onRetry,
    courseTitle
}: PublishDialogProps) {
    const [copied, setCopied] = useState(false)
    const [progress, setProgress] = useState(0)

    const handlePublish = async () => {
        try {
            await onPublish()
        } catch (error) {
            console.error("Publishing error:", error)
        }
    }

    // Simulate progress during publishing
    useEffect(() => {
        let interval: NodeJS.Timeout

        if (isPublishing) {
            setProgress(0)
            interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(interval)
                        return prev
                    }
                    return prev + 10
                })
            }, 500)
        }

        return () => clearInterval(interval)
    }, [isPublishing])

    // Reset progress when done
    useEffect(() => {
        if (!isPublishing) {
            setProgress(100)
            setTimeout(() => setProgress(0), 1000)
        }
    }, [isPublishing])

    const handleCopyUrl = async () => {
        if (publishResult?.data) {
            const url = getCourseUrl(publishResult.data.slug)
            try {
                await navigator.clipboard.writeText(url)
                setCopied(true)
                toast("Course URL has been copied.")
                setTimeout(() => setCopied(false), 2000)
            } catch (err) {
                toast("Couldn't copy URL to clipboard.")
            }
        }
    }

    const getCourseUrl = (slug: string) => {
        return `${window.location.origin}/courses/${slug}`
    }

    const handleViewCourse = () => {
        if (publishResult?.data) {
            window.open(getCourseUrl(publishResult.data.slug), "_blank")
        }
    }

    const renderPublishingState = () => (
        <>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Publishing {courseTitle || "your course"}
                </DialogTitle>
                <DialogDescription>
                    We're preparing your course for students. This usually takes less than a minute.
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Uploading content...</span>
                        <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="space-y-1">
                        <div className="font-medium">Content</div>
                        <Badge variant={progress > 20 ? "default" : "secondary"}>
                            {progress > 20 ? "Ready" : "Processing"}
                        </Badge>
                    </div>
                    <div className="space-y-1">
                        <div className="font-medium">Media</div>
                        <Badge variant={progress > 50 ? "default" : "secondary"}>
                            {progress > 50 ? "Ready" : "Processing"}
                        </Badge>
                    </div>
                    <div className="space-y-1">
                        <div className="font-medium">Publishing</div>
                        <Badge variant={progress > 80 ? "default" : "secondary"}>
                            {progress > 80 ? "Ready" : "Pending"}
                        </Badge>
                    </div>
                </div>

                <Alert className="text-left">
                    <AlertDescription>
                        You can safely close this window - we'll notify you when publishing is complete.
                    </AlertDescription>
                </Alert>
            </div>
        </>
    )

    const renderSuccessState = () => (
        <>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Ready for Students!
                </DialogTitle>
                <DialogDescription>
                    Your course is now live and available to students.
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
                <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <div className="ml-2">
                        <AlertTitle className="font-semibold">
                            {publishResult?.data?.title || "Your course"}
                        </AlertTitle>
                        <AlertDescription>
                            has been successfully published and is now available for enrollment.
                        </AlertDescription>
                    </div>
                </Alert>

                <div className="space-y-2">
                    <Label htmlFor="course-url">Course URL</Label>
                    <div className="flex gap-2">
                        <Input
                            id="course-url"
                            value={publishResult?.data ? getCourseUrl(publishResult.data.slug) : ""}
                            readOnly
                            className="flex-1 font-mono text-sm"
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyUrl}
                            className={cn(
                                "transition-colors",
                                copied ? "bg-green-100 hover:bg-green-100" : ""
                            )}
                        >
                            {copied ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                                <Copy className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button onClick={handleViewCourse} className="flex-1">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Course
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                    >
                        Continue Editing
                    </Button>
                </div>
            </div>
        </>
    )

    const renderErrorState = () => (
        <>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    Publishing Failed
                </DialogTitle>
                <DialogDescription>
                    We encountered an issue publishing your course.
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <div className="ml-2">
                        <AlertTitle>Error: {publishResult?.errors}</AlertTitle>
                        {publishResult?.errors && (
                            <AlertDescription>
                                {publishResult.errors.length > 1 ? "Multiple issues need attention" : "An issue needs attention"}
                            </AlertDescription>
                        )}
                    </div>
                </Alert>

                {publishResult?.errors && publishResult.errors.length > 0 && (
                    <div className="space-y-3">
                        <Label>Required fixes:</Label>
                        <ul className="space-y-2">
                            {publishResult.errors.map((error, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <div className="flex-shrink-0 mt-1">
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                    </div>
                                    <span className="text-sm">{error}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Editing
                    </Button>
                    {onRetry && (
                        <Button
                            onClick={onRetry}
                            className="flex-1"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>
                    )}
                </DialogFooter>
            </div>
        </>
    )

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                {isPublishing
                    ? renderPublishingState()
                    : publishResult?.success
                        ? renderSuccessState()
                        : renderErrorState()}
            </DialogContent>
        </Dialog>
    )
}