"use client"

import { useState, useEffect } from "react"
import { Clock, Trash2, FileText, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { draftStorage, type CourseDraft } from "../utils/localStorage"

interface DraftManagerProps {
    onLoadDraft: (draft: CourseDraft) => void
    onNewCourse: () => void
    currentDraftId?: string
}

export function DraftManager({ onLoadDraft, onNewCourse, currentDraftId }: DraftManagerProps) {
    const [drafts, setDrafts] = useState<CourseDraft[]>([])

    useEffect(() => {
        loadDrafts()
    }, [])

    const loadDrafts = () => {
        const draftsList = draftStorage.getDraftsList()
        setDrafts(draftsList)
    }

    const handleDeleteDraft = (draftId: string) => {
        if (confirm("Are you sure you want to delete this draft?")) {
            draftStorage.deleteDraft(draftId)
            loadDrafts()
        }
    }

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Course Drafts</h3>
                <Button onClick={onNewCourse}>New Course</Button>
            </div>

            {drafts.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                        <FileText className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-gray-500 text-center">No drafts found</p>
                        <p className="text-sm text-gray-400 text-center mt-1">Start creating a course to see your drafts here</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {drafts.map((draft) => (
                        <Card key={draft.id} className={currentDraftId === draft.id ? "ring-2 ring-blue-500" : ""}>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-base">{draft.title}</CardTitle>
                                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                            <Clock className="w-4 h-4" />
                                            <span>Last modified {formatDate(draft.lastModified)}</span>
                                            {currentDraftId === draft.id && (
                                                <Badge variant="secondary" className="ml-2">
                                                    Current
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onLoadDraft(draft)}>Load Draft</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDeleteDraft(draft.id)} className="text-red-600">
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span>Progress</span>
                                            <span>{draft.progress.percentage}%</span>
                                        </div>
                                        <Progress value={draft.progress.percentage} className="h-2" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-600">
                                            {draft.progress.completedSteps} of {draft.progress.totalSteps} steps completed
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => onLoadDraft(draft)}>
                                            Continue
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
