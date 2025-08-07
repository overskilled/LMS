"use client"

import { Button } from "@/components/ui/button"
import {
    Share2,
    Facebook,
    Twitter,
    Linkedin,
    Link as LinkIcon,
    Mail
} from "lucide-react"
import { toast } from "sonner"

export function ShareCourseButton({
    courseId,
    title,
    className = ""
}: {
    courseId: string
    title: string
    className?: string
}) {
    const url = `${window.location.origin}/course/${courseId}`

    const share = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: title,
                    text: `Check out this course: ${title}`,
                    url: url
                })
            } else {
                copyToClipboard()
            }
        } catch (err) {
            // User cancelled share
        }
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(url)
        toast.success("Course link has been copied to your clipboard")
    }

    const shareOn = (platform: string) => {
        let shareUrl = ""

        switch (platform) {
            case "facebook":
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
                break
            case "twitter":
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this course: ${title}`)}&url=${encodeURIComponent(url)}`
                break
            case "linkedin":
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
                break
            case "email":
                shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this course: ${url}`)}`
                break
        }

        window.open(shareUrl, "_blank")
    }

    return (
        <div className={`space-y-2 ${className}`}>
            <Button
                variant="outline"
                onClick={share}
                className="w-full flex items-center gap-2"
            >
                <Share2 className="h-4 w-4" />
                Share Course
            </Button>

            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => shareOn("facebook")}
                    aria-label="Share on Facebook"
                >
                    <Facebook className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => shareOn("twitter")}
                    aria-label="Share on Twitter"
                >
                    <Twitter className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => shareOn("linkedin")}
                    aria-label="Share on LinkedIn"
                >
                    <Linkedin className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => shareOn("email")}
                    aria-label="Share via Email"
                >
                    <Mail className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={copyToClipboard}
                    aria-label="Copy link"
                >
                    <LinkIcon className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}