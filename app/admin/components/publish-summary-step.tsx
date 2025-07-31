"use client"

import { useState, useEffect, forwardRef, useImperativeHandle } from "react"
import { CheckCircle, AlertCircle, Calendar, Clock, Play, HelpCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { AccessibleStepWrapper, type StepRef } from "./accessible-step-wrapper"
import { cn } from "@/lib/utils"

interface PublishSettings {
    isPublic: boolean
    publishDate: Date
    enrollmentLimit?: number
    certificateEnabled: boolean
    certificateTemplate: string
    accessDuration?: number
    prerequisites: string[]
    courseLevel: "beginner" | "intermediate" | "advanced" | "expert"
    supportEmail: string
    discussionEnabled: boolean
    downloadableResources: boolean
}

interface PublishSummaryStepProps {
    courseData: any
    initialSettings?: Partial<PublishSettings>
    onDataChange: (data: PublishSettings, isValid: boolean) => void
    onNext?: () => void
    onPrevious?: () => void
    onCancel?: () => void
}

export const PublishSummaryStep = forwardRef<StepRef, PublishSummaryStepProps>(
    ({ courseData, initialSettings, onDataChange, onNext, onPrevious, onCancel }, ref) => {
        const [publishSettings, setPublishSettings] = useState<PublishSettings>({
            isPublic: true,
            publishDate: new Date(),
            certificateEnabled: true,
            certificateTemplate: "default",
            prerequisites: [],
            courseLevel: "beginner",
            supportEmail: "",
            discussionEnabled: true,
            downloadableResources: false,
            ...initialSettings,
        })

        const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
        const [isValid, setIsValid] = useState(false)

        // Validation function
        const validateForm = (): boolean => {
            const errors: Record<string, string> = {}

            if (publishSettings.supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(publishSettings.supportEmail)) {
                errors.supportEmail = "Please enter a valid email address"
            }

            if (publishSettings.enrollmentLimit && publishSettings.enrollmentLimit < 1) {
                errors.enrollmentLimit = "Enrollment limit must be at least 1"
            }

            if (publishSettings.accessDuration && publishSettings.accessDuration < 1) {
                errors.accessDuration = "Access duration must be at least 1 day"
            }

            setValidationErrors(errors)
            const valid = Object.keys(errors).length === 0
            setIsValid(valid)
            return valid
        }

        // Update settings
        const updateSettings = (updates: Partial<PublishSettings>) => {
            setPublishSettings((prev) => ({ ...prev, ...updates }))
        }

        // Effect to validate and notify parent
        // useEffect(() => {
        //     const valid = validateForm()
        //     onDataChange(publishSettings, valid)
        // }, [publishSettings, onDataChange])

        // Calculate course statistics
        const courseStats = {
            totalVideos: courseData.videos?.length || 0,
            totalDuration:
                courseData.videos?.reduce((acc: number, video: any) => acc + (video.metadata?.duration || 0), 0) || 0,
            totalQuestions: courseData.quiz?.questions?.length || 0,
            estimatedRevenue:
                (courseData.aboutCourse?.pricing?.basePrice || 0) * (courseData.aboutCourse?.metrics?.expectedEnrollments || 0),
        }

        const formatDuration = (seconds: number) => {
            const hours = Math.floor(seconds / 3600)
            const minutes = Math.floor((seconds % 3600) / 60)
            return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
        }

        useImperativeHandle(ref, () => ({
            validate: async () => validateForm(),
            getData: () => publishSettings,
            focus: () => {
                document.getElementById("course-summary-card")?.focus()
            },
            reset: () => {
                setPublishSettings({
                    isPublic: true,
                    publishDate: new Date(),
                    certificateEnabled: true,
                    certificateTemplate: "default",
                    prerequisites: [],
                    courseLevel: "beginner",
                    supportEmail: "",
                    discussionEnabled: true,
                    downloadableResources: false,
                })
                setValidationErrors({})
            },
        }))

        return (
            <AccessibleStepWrapper
                stepNumber={5}
                title="Publish Course"
                description="Review your course and configure publishing settings"
                isActive={true}
                isCompleted={false}
                isValid={isValid}
                onNext={onNext}
                onPrevious={onPrevious}
                onCancel={onCancel}
            >
                <div className="space-y-8">
                    {/* Course Summary */}
                    <Card id="course-summary-card" tabIndex={-1}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                Course Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Course Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">{courseData.aboutCourse?.title || "Untitled Course"}</h3>
                                    <p className="text-gray-600 text-sm mb-4">
                                        {courseData.aboutCourse?.shortDescription || "No description provided"}
                                    </p>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Badge variant="outline">{courseData.courseDetails?.courseCategory || "Uncategorized"}</Badge>
                                            <Badge variant="outline">{courseData.courseDetails?.difficulty || "Beginner"}</Badge>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Play className="w-4 h-4" />
                                                <span>{courseStats.totalVideos} videos</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                <span>{formatDuration(courseStats.totalDuration)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <HelpCircle className="w-4 h-4" />
                                                <span>{courseStats.totalQuestions} questions</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Pricing Info */}
                                    <div className="p-4 bg-green-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-green-900">Course Price:</span>
                                            <span className="text-lg font-bold text-green-900">
                                                ${courseData.aboutCourse?.pricing?.basePrice || 0}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-green-700">Projected Revenue:</span>
                                            <span className="text-sm font-semibold text-green-700">
                                                ${courseStats.estimatedRevenue.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Completion Status */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Course Details</span>
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Videos Uploaded</span>
                                            {courseStats.totalVideos > 0 ? (
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <AlertCircle className="w-4 h-4 text-red-600" />
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Course Information</span>
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Quiz Created</span>
                                            {courseStats.totalQuestions > 0 ? (
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <AlertCircle className="w-4 h-4 text-amber-600" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Publishing Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Publishing Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Visibility Settings */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="public-switch" className="text-sm font-medium">
                                            Make Course Public
                                        </Label>
                                        <p className="text-xs text-gray-500">Allow anyone to discover and enroll in your course</p>
                                    </div>
                                    <Switch
                                        id="public-switch"
                                        checked={publishSettings.isPublic}
                                        onCheckedChange={(checked) => updateSettings({ isPublic: checked })}
                                        aria-describedby="public-help"
                                    />
                                    <div id="public-help" className="sr-only">
                                        Toggle whether your course is publicly visible and searchable.
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="discussion-switch" className="text-sm font-medium">
                                            Enable Discussions
                                        </Label>
                                        <p className="text-xs text-gray-500">Allow students to ask questions and discuss course content</p>
                                    </div>
                                    <Switch
                                        id="discussion-switch"
                                        checked={publishSettings.discussionEnabled}
                                        onCheckedChange={(checked) => updateSettings({ discussionEnabled: checked })}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="certificate-switch" className="text-sm font-medium">
                                            Enable Certificates
                                        </Label>
                                        <p className="text-xs text-gray-500">Award completion certificates to students</p>
                                    </div>
                                    <Switch
                                        id="certificate-switch"
                                        checked={publishSettings.certificateEnabled}
                                        onCheckedChange={(checked) => updateSettings({ certificateEnabled: checked })}
                                    />
                                </div>
                            </div>

                            {/* Advanced Settings */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="enrollment-limit-input" className="text-sm font-medium">
                                        Enrollment Limit <span className="text-gray-500">(Optional)</span>
                                    </Label>
                                    <Input
                                        id="enrollment-limit-input"
                                        type="number"
                                        min="1"
                                        placeholder="Unlimited"
                                        value={publishSettings.enrollmentLimit || ""}
                                        onChange={(e) =>
                                            updateSettings({
                                                enrollmentLimit: e.target.value ? Number.parseInt(e.target.value) : undefined,
                                            })
                                        }
                                        className={cn(validationErrors.enrollmentLimit && "border-red-500")}
                                        aria-describedby="enrollment-limit-help enrollment-limit-error"
                                        aria-invalid={!!validationErrors.enrollmentLimit}
                                    />
                                    <div id="enrollment-limit-help" className="sr-only">
                                        Set a maximum number of students who can enroll in your course.
                                    </div>
                                    {validationErrors.enrollmentLimit && (
                                        <p id="enrollment-limit-error" className="text-sm text-red-600 mt-1" role="alert">
                                            {validationErrors.enrollmentLimit}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="access-duration-input" className="text-sm font-medium">
                                        Access Duration (Days) <span className="text-gray-500">(Optional)</span>
                                    </Label>
                                    <Input
                                        id="access-duration-input"
                                        type="number"
                                        min="1"
                                        placeholder="Lifetime access"
                                        value={publishSettings.accessDuration || ""}
                                        onChange={(e) =>
                                            updateSettings({
                                                accessDuration: e.target.value ? Number.parseInt(e.target.value) : undefined,
                                            })
                                        }
                                        className={cn(validationErrors.accessDuration && "border-red-500")}
                                        aria-describedby="access-duration-help access-duration-error"
                                        aria-invalid={!!validationErrors.accessDuration}
                                    />
                                    <div id="access-duration-help" className="sr-only">
                                        Set how many days students will have access to your course after enrollment.
                                    </div>
                                    {validationErrors.accessDuration && (
                                        <p id="access-duration-error" className="text-sm text-red-600 mt-1" role="alert">
                                            {validationErrors.accessDuration}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Support Email */}
                            <div>
                                <Label htmlFor="support-email-input" className="text-sm font-medium">
                                    Support Email <span className="text-gray-500">(Optional)</span>
                                </Label>
                                <Input
                                    id="support-email-input"
                                    type="email"
                                    placeholder="support@yoursite.com"
                                    value={publishSettings.supportEmail}
                                    onChange={(e) => updateSettings({ supportEmail: e.target.value })}
                                    className={cn(validationErrors.supportEmail && "border-red-500")}
                                    aria-describedby="support-email-help support-email-error"
                                    aria-invalid={!!validationErrors.supportEmail}
                                />
                                <div id="support-email-help" className="sr-only">
                                    Provide an email address where students can contact you for support.
                                </div>
                                {validationErrors.supportEmail && (
                                    <p id="support-email-error" className="text-sm text-red-600 mt-1" role="alert">
                                        {validationErrors.supportEmail}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Final Review */}
                    <Card className="border-2 border-blue-200 bg-blue-50/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-900">
                                <AlertCircle className="w-5 h-5" />
                                Ready to Publish?
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <p className="text-sm text-blue-800">
                                    Once you publish your course, it will be available to students based on your visibility settings. You
                                    can always update your course content and settings after publishing.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span>Course content ready</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span>Pricing configured</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span>Settings validated</span>
                                    </div>
                                </div>

                                <div className="p-4 bg-white rounded-lg border">
                                    <h4 className="font-medium text-sm mb-2">What happens next?</h4>
                                    <ul className="text-xs text-gray-600 space-y-1">
                                        <li>• Your course will be processed and made available</li>
                                        <li>• Students can discover and enroll in your course</li>
                                        <li>• You'll receive notifications about enrollments</li>
                                        <li>• Analytics and earnings will be tracked in your dashboard</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AccessibleStepWrapper>
        )
    },
)

PublishSummaryStep.displayName = "PublishSummaryStep"
