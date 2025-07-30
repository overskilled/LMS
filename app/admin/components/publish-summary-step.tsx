"use client"

import { useState, useEffect } from "react"
import {
    Clock,
    DollarSign,
    Play,
    FileText,
    HelpCircle,
    CheckCircle,
    AlertCircle,
    Users,
    Award,
    Globe,
    TrendingUp,
    Eye,
    Download,
    Share2,
    Settings,
    BarChart3,
    Target,
    Zap,
    Shield,
    BookOpen,
    MessageSquare,
    Star,
    ChevronRight,
    Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { CourseData } from "@/types/course"

interface PublishSummaryStepProps {
    courseData: CourseData
    onPublishSettingsChange: (settings: CourseData["publishSettings"]) => void
}

interface ValidationIssue {
    type: "error" | "warning" | "info"
    message: string
    field?: string
    action?: string
}

export function PublishSummaryStep({ courseData, onPublishSettingsChange }: PublishSummaryStepProps) {
    const [publishSettings, setPublishSettings] = useState<CourseData["publishSettings"]>(
        courseData.publishSettings || {
            isPublic: true,
            publishDate: new Date(),
            enrollmentLimit: undefined,
            certificateEnabled: true,
            certificateTemplate: "default",
            accessDuration: undefined,
            prerequisites: [],
            courseLevel: "beginner",
            supportEmail: "",
            discussionEnabled: true,
            downloadableResources: false,
        },
    )

    const [activeTab, setActiveTab] = useState("overview")
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        content: true,
        settings: false,
        marketing: false,
        analytics: false,
    })
    const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([])
    const [readinessScore, setReadinessScore] = useState(0)
    const [estimatedRevenue, setEstimatedRevenue] = useState(0)

    const updateSettings = (updates: Partial<CourseData["publishSettings"]>) => {
        const newSettings = { ...publishSettings, ...updates }
        setPublishSettings(newSettings)
        onPublishSettingsChange(newSettings)
    }

    // Calculate course statistics
    const totalVideos = courseData.videos?.length || 0
    const totalQuestions = courseData.quiz?.questions?.length || 0
    const totalQuizPoints = courseData.quiz?.questions?.reduce((sum, q) => sum + q.points, 0) || 0
    const estimatedDuration = courseData.courseDetails?.courseTime || "Not specified"
    const hasPreviewVideo = courseData.videos?.some((v) => v.isPreview) || false
    const totalObjectives = courseData.aboutCourse?.learningObjectives?.length || 0
    const totalPrerequisites = courseData.aboutCourse?.prerequisites?.length || 0

    // Validation logic
    useEffect(() => {
        const issues: ValidationIssue[] = []
        let score = 0
        const maxScore = 100

        // Required fields validation
        if (!courseData.courseDetails?.lessonName) {
            issues.push({ type: "error", message: "Course name is required", field: "courseName" })
        } else {
            score += 15
        }

        if (!courseData.courseDetails?.thumbnailImage) {
            issues.push({ type: "error", message: "Course thumbnail is required", field: "thumbnail" })
        } else {
            score += 10
        }

        if (!courseData.aboutCourse?.title) {
            issues.push({ type: "error", message: "Course title is required", field: "title" })
        } else {
            score += 10
        }

        if (!courseData.aboutCourse?.shortDescription) {
            issues.push({ type: "error", message: "Course description is required", field: "description" })
        } else {
            score += 10
        }

        if (totalVideos === 0) {
            issues.push({ type: "error", message: "At least one video is required", field: "videos" })
        } else {
            score += 20
        }

        // Quality checks
        if (courseData.aboutCourse?.shortDescription && courseData.aboutCourse.shortDescription.length < 50) {
            issues.push({
                type: "warning",
                message: "Course description is quite short. Consider adding more details.",
                field: "description",
            })
        } else if (courseData.aboutCourse?.shortDescription) {
            score += 5
        }

        if (totalObjectives === 0) {
            issues.push({
                type: "warning",
                message: "Adding learning objectives will help students understand what they'll gain",
                field: "objectives",
            })
        } else {
            score += 5
        }

        if (!hasPreviewVideo) {
            issues.push({
                type: "warning",
                message: "A preview video can significantly increase enrollment rates",
                field: "preview",
            })
        } else {
            score += 5
        }

        if (totalQuestions === 0) {
            issues.push({ type: "info", message: "Consider adding a quiz to improve student engagement", field: "quiz" })
        } else {
            score += 5
        }

        if (!courseData.aboutCourse?.pricing?.basePrice || courseData.aboutCourse.pricing.basePrice === 0) {
            issues.push({
                type: "info",
                message: "Free courses can attract more students but may be perceived as lower value",
                field: "pricing",
            })
        } else {
            score += 5
        }

        // SEO and discoverability
        if (!courseData.aboutCourse?.tags || courseData.aboutCourse.tags.length < 3) {
            issues.push({ type: "warning", message: "Add more tags to improve course discoverability", field: "tags" })
        } else {
            score += 5
        }

        // Instructor credibility - COMMENTED OUT
        // if (!courseData.instructor?.bio) {
        //   issues.push({
        //     type: "warning",
        //     message: "Instructor bio helps build trust with potential students",
        //     field: "instructor",
        //   })
        // } else {
        //   score += 5
        // }

        setValidationIssues(issues)
        setReadinessScore(Math.min(score, maxScore))
    }, [courseData, hasPreviewVideo, totalVideos, totalQuestions, totalObjectives])

    // Calculate estimated revenue
    useEffect(() => {
        const basePrice = courseData.aboutCourse?.pricing?.discountPrice || courseData.aboutCourse?.pricing?.basePrice || 0
        const expectedEnrollments = courseData.aboutCourse?.metrics?.expectedEnrollments || 0
        setEstimatedRevenue(basePrice * expectedEnrollments)
    }, [courseData.aboutCourse?.pricing, courseData.aboutCourse?.metrics])

    const toggleSection = (section: string) => {
        setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
    }

    const getCurrencySymbol = (currency: string): string => {
        const symbols: Record<string, string> = {
            USD: "$",
            EUR: "€",
            GBP: "£",
            XAF: "FCFA",
            XOF: "FCFA",
        }
        return symbols[currency] || currency
    }

    const getReadinessColor = (score: number) => {
        if (score >= 90) return "text-green-600 bg-green-50"
        if (score >= 70) return "text-yellow-600 bg-yellow-50"
        return "text-red-600 bg-red-50"
    }

    const getReadinessLabel = (score: number) => {
        if (score >= 90) return "Excellent"
        if (score >= 70) return "Good"
        if (score >= 50) return "Fair"
        return "Needs Work"
    }

    const renderOverviewTab = () => (
        <div className="space-y-6">
            {/* Course Readiness Score */}
            <Card className={cn("border-2", getReadinessColor(readinessScore))}>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold">Course Readiness</h3>
                            <p className="text-sm opacity-80">How ready is your course for publication?</p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold">{readinessScore}%</div>
                            <div className="text-sm font-medium">{getReadinessLabel(readinessScore)}</div>
                        </div>
                    </div>
                    <Progress value={readinessScore} className="h-3 mb-4" />

                    {validationIssues.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">Issues to Address:</h4>
                            {validationIssues.slice(0, 3).map((issue, index) => (
                                <div key={index} className="flex items-start gap-2 text-sm">
                                    {issue.type === "error" && <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />}
                                    {issue.type === "warning" && <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />}
                                    {issue.type === "info" && <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />}
                                    <span>{issue.message}</span>
                                </div>
                            ))}
                            {validationIssues.length > 3 && (
                                <p className="text-sm opacity-70">+{validationIssues.length - 3} more issues</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Course Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="text-center p-4 hover:shadow-md transition-shadow">
                    <Play className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">{totalVideos}</div>
                    <div className="text-sm text-gray-600">Video Lessons</div>
                </Card>
                <Card className="text-center p-4 hover:shadow-md transition-shadow">
                    <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">{estimatedDuration}</div>
                    <div className="text-sm text-gray-600">Duration</div>
                </Card>
                <Card className="text-center p-4 hover:shadow-md transition-shadow">
                    <HelpCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">{totalQuestions}</div>
                    <div className="text-sm text-gray-600">Quiz Questions</div>
                </Card>
                <Card className="text-center p-4 hover:shadow-md transition-shadow">
                    <DollarSign className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-orange-600">
                        {getCurrencySymbol(courseData.aboutCourse?.pricing?.currency || "USD")}
                        {courseData.aboutCourse?.pricing?.discountPrice || courseData.aboutCourse?.pricing?.basePrice || 0}
                    </div>
                    <div className="text-sm text-gray-600">Price</div>
                </Card>
            </div>

            {/* Course Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Course Summary
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-lg mb-2">
                            {courseData.aboutCourse?.title || courseData.courseDetails?.lessonName || "Untitled Course"}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {courseData.aboutCourse?.shortDescription || "No description provided"}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                            <Badge variant="outline">{courseData.courseDetails?.courseLevel || "All Levels"}</Badge>
                            <Badge variant="outline">{courseData.courseDetails?.courseCategory || "General"}</Badge>
                            <Badge variant="outline">{courseData.aboutCourse?.language || "English"}</Badge>
                            {courseData.aboutCourse?.pricing?.pricingTier && (
                                <Badge variant="secondary" className="capitalize">
                                    {courseData.aboutCourse.pricing.pricingTier}
                                </Badge>
                            )}
                        </div>

                        {courseData.aboutCourse?.tags && courseData.aboutCourse.tags.length > 0 && (
                            <div>
                                <p className="text-sm font-medium mb-2">Tags:</p>
                                <div className="flex flex-wrap gap-1">
                                    {courseData.aboutCourse.tags.map((tag, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Revenue Projection */}
            {estimatedRevenue > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Revenue Projection
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">
                                    {courseData.aboutCourse?.metrics?.expectedEnrollments || 0}
                                </div>
                                <div className="text-sm text-gray-600">Expected Students</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                    {getCurrencySymbol(courseData.aboutCourse?.pricing?.currency || "USD")}
                                    {estimatedRevenue.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-600">Projected Revenue</div>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">
                                    {getCurrencySymbol(courseData.aboutCourse?.pricing?.currency || "USD")}
                                    {(courseData.aboutCourse?.metrics?.marketingBudget || 0).toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-600">Marketing Budget</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )

    const renderContentTab = () => (
        <div className="space-y-6">
            {/* Content Summary */}
            <div className="space-y-4">
                {/* Videos Section */}
                <Card>
                    <CardHeader>
                        <button
                            onClick={() => toggleSection("content")}
                            className="flex items-center justify-between w-full text-left"
                        >
                            <CardTitle className="flex items-center gap-2">
                                <Play className="w-5 h-5" />
                                Video Content ({totalVideos} lessons)
                            </CardTitle>
                            <ChevronRight className={cn("w-4 h-4 transition-transform", expandedSections.content && "rotate-90")} />
                        </button>
                    </CardHeader>
                    {expandedSections.content && (
                        <CardContent className="space-y-3">
                            {courseData.videos && courseData.videos.length > 0 ? (
                                courseData.videos.map((video, index) => (
                                    <div key={video.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Play className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{video.title || `Video ${index + 1}`}</div>
                                            <div className="text-sm text-gray-500 truncate">{video.description || "No description"}</div>
                                        </div>
                                        {video.isPreview && (
                                            <Badge variant="secondary" className="text-xs">
                                                Preview
                                            </Badge>
                                        )}
                                        <div className="text-sm text-gray-500">
                                            {video.duration ? `${Math.round(video.duration / 60)}min` : "—"}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No videos uploaded yet</p>
                                </div>
                            )}
                        </CardContent>
                    )}
                </Card>

                {/* Quiz Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HelpCircle className="w-5 h-5" />
                            Assessment ({totalQuestions} questions)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {courseData.quiz && courseData.quiz.questions.length > 0 ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                                        <div className="text-xl font-bold text-purple-600">{totalQuestions}</div>
                                        <div className="text-xs text-gray-600">Questions</div>
                                    </div>
                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                        <div className="text-xl font-bold text-blue-600">{totalQuizPoints}</div>
                                        <div className="text-xs text-gray-600">Total Points</div>
                                    </div>
                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                        <div className="text-xl font-bold text-green-600">{courseData.quiz.passingScore}%</div>
                                        <div className="text-xs text-gray-600">Passing Score</div>
                                    </div>
                                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                                        <div className="text-xl font-bold text-orange-600">{courseData.quiz.timeLimit}</div>
                                        <div className="text-xs text-gray-600">Minutes</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-medium">Quiz Settings:</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle
                                                className={cn("w-4 h-4", courseData.quiz.allowRetakes ? "text-green-500" : "text-gray-400")}
                                            />
                                            <span>Allow Retakes</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle
                                                className={cn(
                                                    "w-4 h-4",
                                                    courseData.quiz.showCorrectAnswers ? "text-green-500" : "text-gray-400",
                                                )}
                                            />
                                            <span>Show Correct Answers</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle
                                                className={cn(
                                                    "w-4 h-4",
                                                    courseData.quiz.randomizeQuestions ? "text-green-500" : "text-gray-400",
                                                )}
                                            />
                                            <span>Randomize Questions</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle
                                                className={cn(
                                                    "w-4 h-4",
                                                    courseData.quiz.certificateRequired ? "text-green-500" : "text-gray-400",
                                                )}
                                            />
                                            <span>Certificate Required</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No quiz created</p>
                                <p className="text-sm">Consider adding a quiz to improve engagement</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Learning Objectives */}
                {courseData.aboutCourse?.learningObjectives && courseData.aboutCourse.learningObjectives.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="w-5 h-5" />
                                Learning Objectives ({totalObjectives})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {courseData.aboutCourse.learningObjectives.map((objective, index) => (
                                    <div key={index} className="flex items-start gap-3 p-2 bg-green-50 rounded">
                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">{objective}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )

    const renderSettingsTab = () => (
        <div className="space-y-6">
            {/* Basic Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Publication Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-sm font-medium">Make Course Public</Label>
                                    <p className="text-xs text-gray-500">Allow anyone to find and enroll in your course</p>
                                </div>
                                <Switch
                                    checked={publishSettings.isPublic}
                                    onCheckedChange={(checked) => updateSettings({ isPublic: checked })}
                                />
                            </div>

                            <div>
                                <Label className="text-sm font-medium">Publish Date & Time</Label>
                                <Input
                                    type="datetime-local"
                                    value={publishSettings.publishDate.toISOString().slice(0, 16)}
                                    onChange={(e) => updateSettings({ publishDate: new Date(e.target.value) })}
                                    className="mt-1"
                                />
                                <p className="text-xs text-gray-500 mt-1">Course will be available from this date</p>
                            </div>

                            <div>
                                <Label className="text-sm font-medium">Course Level</Label>
                                <Select
                                    value={publishSettings.courseLevel}
                                    onValueChange={(value: any) => updateSettings({ courseLevel: value })}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="beginner">🟢 Beginner</SelectItem>
                                        <SelectItem value="intermediate">🟡 Intermediate</SelectItem>
                                        <SelectItem value="advanced">🔴 Advanced</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium">Enrollment Limit</Label>
                                <Input
                                    type="number"
                                    value={publishSettings.enrollmentLimit || ""}
                                    onChange={(e) =>
                                        updateSettings({
                                            enrollmentLimit: e.target.value ? Number.parseInt(e.target.value) : undefined,
                                        })
                                    }
                                    placeholder="No limit"
                                    min="1"
                                    className="mt-1"
                                />
                                <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited enrollment</p>
                            </div>

                            <div>
                                <Label className="text-sm font-medium">Access Duration (Days)</Label>
                                <Input
                                    type="number"
                                    value={publishSettings.accessDuration || ""}
                                    onChange={(e) =>
                                        updateSettings({
                                            accessDuration: e.target.value ? Number.parseInt(e.target.value) : undefined,
                                        })
                                    }
                                    placeholder="Lifetime access"
                                    min="1"
                                    className="mt-1"
                                />
                                <p className="text-xs text-gray-500 mt-1">How long students can access the course</p>
                            </div>

                            <div>
                                <Label className="text-sm font-medium">Support Email</Label>
                                <Input
                                    type="email"
                                    value={publishSettings.supportEmail || ""}
                                    onChange={(e) => updateSettings({ supportEmail: e.target.value })}
                                    placeholder="support@example.com"
                                    className="mt-1"
                                />
                                <p className="text-xs text-gray-500 mt-1">Contact email for student support</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Feature Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Course Features
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <Award className="w-5 h-5 text-yellow-600" />
                                <div>
                                    <Label className="text-sm font-medium">Certificates</Label>
                                    <p className="text-xs text-gray-500">Students receive completion certificates</p>
                                </div>
                            </div>
                            <Switch
                                checked={publishSettings.certificateEnabled}
                                onCheckedChange={(checked) => updateSettings({ certificateEnabled: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="w-5 h-5 text-blue-600" />
                                <div>
                                    <Label className="text-sm font-medium">Discussions</Label>
                                    <p className="text-xs text-gray-500">Enable student discussions</p>
                                </div>
                            </div>
                            <Switch
                                checked={publishSettings.discussionEnabled}
                                onCheckedChange={(checked) => updateSettings({ discussionEnabled: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <Download className="w-5 h-5 text-green-600" />
                                <div>
                                    <Label className="text-sm font-medium">Downloadable Resources</Label>
                                    <p className="text-xs text-gray-500">Allow students to download materials</p>
                                </div>
                            </div>
                            {/* <Switch
                                checked={publishSettings.downloadableResources}
                                onCheckedChange={(checked) => updateSettings({ downloadableResources: checked })}
                            /> */}
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-purple-600" />
                                <div>
                                    <Label className="text-sm font-medium">Content Protection</Label>
                                    <p className="text-xs text-gray-500">Prevent unauthorized sharing</p>
                                </div>
                            </div>
                            <Switch checked={true} onCheckedChange={() => { }} disabled />
                        </div>
                    </div>

                    {/* {publishSettings.certificateEnabled && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <Label className="text-sm font-medium">Certificate Template</Label>
                            <Select
                                value={publishSettings.certificateTemplate || "default"}
                                onValueChange={(value) => updateSettings({ certificateTemplate: value })}
                            >
                                <SelectTrigger className="mt-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="default">Default Template</SelectItem>
                                    <SelectItem value="modern">Modern Template</SelectItem>
                                    <SelectItem value="classic">Classic Template</SelectItem>
                                    <SelectItem value="minimal">Minimal Template</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )} */}
                </CardContent>
            </Card>
        </div>
    )

    const renderMarketingTab = () => (
        <div className="space-y-6">
            {/* SEO & Discoverability */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        SEO & Discoverability
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label className="text-sm font-medium">Course URL Slug</Label>
                        <div className="flex items-center mt-1">
                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-l-md border border-r-0">
                                yoursite.com/courses/
                            </span>
                            <Input
                                value={courseData.courseDetails?.courseSlug || ""}
                                className="rounded-l-none"
                                placeholder="course-slug"
                                disabled
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="text-sm font-medium">Meta Description</Label>
                        <Textarea
                            value={courseData.aboutCourse?.shortDescription || ""}
                            placeholder="This will be used for search engine results"
                            rows={3}
                            disabled
                            className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {courseData.aboutCourse?.shortDescription?.length || 0}/160 characters
                        </p>
                    </div>

                    <div>
                        <Label className="text-sm font-medium">Keywords & Tags</Label>
                        <div className="flex flex-wrap gap-2 mt-2 p-3 bg-gray-50 rounded-lg min-h-[60px]">
                            {courseData.aboutCourse?.tags && courseData.aboutCourse.tags.length > 0 ? (
                                courseData.aboutCourse.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary">
                                        {tag}
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-sm text-gray-500">No tags added</span>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Social Sharing */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Share2 className="w-5 h-5" />
                        Social Media Preview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex gap-4">
                            <div className="w-20 h-20 bg-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
                                {courseData.courseDetails?.thumbnailImage ? (
                                    <img
                                        src={
                                            courseData.courseDetails.thumbnailImage instanceof File
                                                ? URL.createObjectURL(courseData.courseDetails.thumbnailImage)
                                                : "/placeholder.svg?height=80&width=80&text=Course"
                                        }
                                        alt="Course thumbnail"
                                        className="w-full h-full object-cover rounded-lg"
                                        onError={(e) => {
                                            e.currentTarget.src = "/placeholder.svg?height=80&width=80&text=Course"
                                        }}
                                    />
                                ) : (
                                    <BookOpen className="w-8 h-8 text-gray-500" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">{courseData.aboutCourse?.title || "Course Title"}</h4>
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                    {courseData.aboutCourse?.shortDescription || "Course description will appear here"}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline" className="text-xs">
                                        {courseData.courseDetails?.courseCategory || "Category"}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                        {getCurrencySymbol(courseData.aboutCourse?.pricing?.currency || "USD")}
                                        {courseData.aboutCourse?.pricing?.basePrice || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">This is how your course will appear when shared on social media</p>
                </CardContent>
            </Card>

            {/* Launch Strategy */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Launch Strategy
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {courseData.aboutCourse?.pricing?.discountPercentage &&
                        courseData.aboutCourse.pricing.discountPercentage > 0 && (
                            <Alert>
                                <Zap className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Launch Discount Active:</strong> {courseData.aboutCourse.pricing.discountPercentage}% off
                                    {courseData.aboutCourse.pricing.discountEndDate && (
                                        <span> until {new Date(courseData.aboutCourse.pricing.discountEndDate).toLocaleDateString()}</span>
                                    )}
                                </AlertDescription>
                            </Alert>
                        )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-medium text-sm mb-2">Pre-Launch Checklist</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <CheckCircle
                                        className={cn(
                                            "w-4 h-4",
                                            courseData.courseDetails?.thumbnailImage ? "text-green-500" : "text-gray-400",
                                        )}
                                    />
                                    <span>Course thumbnail uploaded</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className={cn("w-4 h-4", hasPreviewVideo ? "text-green-500" : "text-gray-400")} />
                                    <span>Preview video added</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className={cn("w-4 h-4", totalVideos > 0 ? "text-green-500" : "text-gray-400")} />
                                    <span>Course content uploaded</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle
                                        className={cn(
                                            "w-4 h-4",
                                            courseData.aboutCourse?.pricing?.basePrice ? "text-green-500" : "text-gray-400",
                                        )}
                                    />
                                    <span>Pricing configured</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border rounded-lg">
                            <h4 className="font-medium text-sm mb-2">Marketing Channels</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-blue-500" />
                                    <span>Course marketplace</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Share2 className="w-4 h-4 text-green-500" />
                                    <span>Social media sharing</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-purple-500" />
                                    <span>Email marketing</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    <span>Influencer partnerships</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )

    const renderAnalyticsTab = () => (
        <div className="space-y-6">
            {/* Performance Predictions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Performance Predictions
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                                {Math.round((courseData.aboutCourse?.metrics?.expectedEnrollments || 0) * 0.15)}
                            </div>
                            <div className="text-sm text-gray-600">Expected Week 1 Enrollments</div>
                            <div className="text-xs text-gray-500 mt-1">Based on similar courses</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{Math.round(readinessScore * 0.85)}%</div>
                            <div className="text-sm text-gray-600">Predicted Completion Rate</div>
                            <div className="text-xs text-gray-500 mt-1">Based on course quality</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">4.2</div>
                            <div className="text-sm text-gray-600">Expected Rating</div>
                            <div className="text-xs text-gray-500 mt-1">Industry average</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Market Analysis */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Market Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-medium mb-3">Category Performance</h4>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>{courseData.courseDetails?.courseCategory || "Your Category"}</span>
                                        <span>High Demand</span>
                                    </div>
                                    <Progress value={75} className="h-2" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Competition Level</span>
                                        <span>Medium</span>
                                    </div>
                                    <Progress value={60} className="h-2" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Price Competitiveness</span>
                                        <span>Good</span>
                                    </div>
                                    <Progress value={80} className="h-2" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium mb-3">Optimization Suggestions</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>
                                        Your price is competitive for the {courseData.courseDetails?.courseLevel || "beginner"} level
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                    <span>Consider adding more video content to match top performers</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <span>Courses with quizzes have 23% higher completion rates</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Success Metrics */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Success Metrics to Track
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 border rounded-lg">
                            <Eye className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                            <div className="text-sm font-medium">Page Views</div>
                            <div className="text-xs text-gray-500">Course visibility</div>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                            <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
                            <div className="text-sm font-medium">Enrollments</div>
                            <div className="text-xs text-gray-500">Conversion rate</div>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                            <Award className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                            <div className="text-sm font-medium">Completions</div>
                            <div className="text-xs text-gray-500">Student success</div>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                            <Star className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                            <div className="text-sm font-medium">Reviews</div>
                            <div className="text-xs text-gray-500">Course quality</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <h2 className="text-xl font-semibold">Review & Publish Course</h2>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    <TabsTrigger value="marketing">Marketing</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {renderOverviewTab()}
                </TabsContent>

                <TabsContent value="content" className="space-y-6">
                    {renderContentTab()}
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                    {renderSettingsTab()}
                </TabsContent>

                <TabsContent value="marketing" className="space-y-6">
                    {renderMarketingTab()}
                </TabsContent>
            </Tabs>

            {/* Final Publish Section */}
            <Card className="border-2 border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-blue-900 mb-2">Ready to Publish?</h3>
                            <p className="text-blue-700 mb-4">
                                Your course readiness score is <strong>{readinessScore}%</strong>.
                                {readinessScore >= 90 && " Excellent! Your course is ready for publication."}
                                {readinessScore >= 70 &&
                                    readinessScore < 90 &&
                                    " Good! Consider addressing the remaining issues for better performance."}
                                {readinessScore < 70 && " Please address the validation issues before publishing."}
                            </p>

                            {validationIssues.filter((issue) => issue.type === "error").length > 0 && (
                                <Alert className="mb-4">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>Please fix all errors before publishing your course.</AlertDescription>
                                </Alert>
                            )}
                        </div>

                        <div className="text-right">
                            <div className="text-sm text-blue-600 mb-2">
                                Publish Date: {publishSettings.publishDate.toLocaleDateString()}
                            </div>
                            <Button
                                size="lg"
                                className="bg-blue-600 hover:bg-blue-700"
                                disabled={validationIssues.filter((issue) => issue.type === "error").length > 0}
                            >
                                <Globe className="w-4 h-4 mr-2" />
                                Publish Course Now
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
