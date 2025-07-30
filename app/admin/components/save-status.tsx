"use client"

import { useState, useEffect } from "react"
import { Check, Clock, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type SaveStatus = "idle" | "saving" | "saved" | "error"

interface SaveStatusProps {
    status: SaveStatus
    lastSaved?: Date
    className?: string
}

export function SaveStatus({ status, lastSaved, className }: SaveStatusProps) {
    const [showSaved, setShowSaved] = useState(false)

    useEffect(() => {
        if (status === "saved") {
            setShowSaved(true)
            const timer = setTimeout(() => setShowSaved(false), 3000)
            return () => clearTimeout(timer)
        }
    }, [status])

    const getStatusIcon = () => {
        switch (status) {
            case "saving":
                return <Loader2 className="w-4 h-4 animate-spin" />
            case "saved":
                return <Check className="w-4 h-4" />
            case "error":
                return <AlertCircle className="w-4 h-4" />
            default:
                return <Clock className="w-4 h-4" />
        }
    }

    const getStatusText = () => {
        switch (status) {
            case "saving":
                return "Saving..."
            case "saved":
                return showSaved ? "Saved!" : lastSaved ? `Saved ${formatTime(lastSaved)}` : "Saved"
            case "error":
                return "Save failed"
            default:
                return lastSaved ? `Last saved ${formatTime(lastSaved)}` : "Not saved"
        }
    }

    const getStatusColor = () => {
        switch (status) {
            case "saving":
                return "text-blue-600"
            case "saved":
                return "text-green-600"
            case "error":
                return "text-red-600"
            default:
                return "text-gray-500"
        }
    }

    const formatTime = (date: Date) => {
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / 60000)

        if (minutes < 1) return "just now"
        if (minutes < 60) return `${minutes}m ago`
        if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
        return date.toLocaleDateString()
    }

    return (
        <div className={cn("flex items-center gap-2 text-sm", getStatusColor(), className)}>
            {getStatusIcon()}
            <span>{getStatusText()}</span>
        </div>
    )
}
