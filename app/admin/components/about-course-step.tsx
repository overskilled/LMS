"use client"

import { useState } from "react"
import { Plus, X, DollarSign, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"

interface PricingData {
    basePrice: number
    currency: string
    discountPrice?: number
    discountPercentage?: number
    discountEndDate?: Date | string
    pricingTier: "free" | "basic" | "premium" | "enterprise"
    paymentOptions: ("one-time" | "subscription" | "installments")[]
}

interface MetricsData {
    expectedEnrollments?: number
    targetRevenue?: number
    marketingBudget?: number
}

interface AboutCourseData {
    title: string
    shortDescription: string
    fullDescription: string
    learningObjectives: string[]
    prerequisites: string[]
    targetAudience: string
    language: string
    subtitles: string[]
    tags: string[]
    pricing: PricingData
    metrics: MetricsData
}

interface AboutCourseStepProps {
    data: AboutCourseData
    onDataChange: (data: AboutCourseData) => void
}

// Default data structure to prevent undefined errors
const getDefaultData = (data?: Partial<AboutCourseData>): AboutCourseData => ({
    title: "",
    shortDescription: "",
    fullDescription: "",
    learningObjectives: [],
    prerequisites: [],
    targetAudience: "",
    language: "",
    subtitles: [],
    tags: [],
    pricing: {
        basePrice: 0,
        currency: "USD",
        discountPrice: 0,
        discountPercentage: 0,
        discountEndDate: undefined,
        pricingTier: "basic" as const,
        paymentOptions: ["one-time" as const],
    },
    metrics: {
        expectedEnrollments: 0,
        targetRevenue: 0,
        marketingBudget: 0,
    },
    ...data,
})

export function AboutCourseStep({ data: rawData, onDataChange }: AboutCourseStepProps) {
    // Ensure data has proper structure
    const data = getDefaultData(rawData)

    const [newObjective, setNewObjective] = useState("")
    const [newPrerequisite, setNewPrerequisite] = useState("")
    const [newTag, setNewTag] = useState("")
    const [newSubtitle, setNewSubtitle] = useState("")

    const updateData = (updates: Partial<AboutCourseData>) => {
        const updatedData = { ...data, ...updates }
        onDataChange(updatedData)
    }

    const updatePricing = (updates: Partial<PricingData>) => {
        const updatedPricing = { ...data.pricing, ...updates }
        updateData({ pricing: updatedPricing })
    }

    const updateMetrics = (updates: Partial<MetricsData>) => {
        const updatedMetrics = { ...data.metrics, ...updates }
        updateData({ metrics: updatedMetrics })
    }

    const calculateDiscountPrice = (basePrice: number, percentage: number): number => {
        return Math.round((basePrice - (basePrice * percentage) / 100) * 100) / 100
    }

    const handleDiscountPercentageChange = (percentage: number) => {
        const discountPrice = calculateDiscountPrice(data.pricing.basePrice, percentage)
        updatePricing({
            discountPercentage: percentage,
            discountPrice: discountPrice,
        })
    }

    const addObjective = () => {
        if (newObjective.trim()) {
            updateData({
                learningObjectives: [...data.learningObjectives, newObjective.trim()],
            })
            setNewObjective("")
        }
    }

    const addPrerequisite = () => {
        if (newPrerequisite.trim()) {
            updateData({
                prerequisites: [...data.prerequisites, newPrerequisite.trim()],
            })
            setNewPrerequisite("")
        }
    }

    const addTag = () => {
        if (newTag.trim() && !data.tags.includes(newTag.trim())) {
            updateData({
                tags: [...data.tags, newTag.trim()],
            })
            setNewTag("")
        }
    }

    const addSubtitle = () => {
        if (newSubtitle.trim() && !data.subtitles.includes(newSubtitle.trim())) {
            updateData({
                subtitles: [...data.subtitles, newSubtitle.trim()],
            })
            setNewSubtitle("")
        }
    }

    const removeObjective = (index: number) => {
        updateData({
            learningObjectives: data.learningObjectives.filter((_, i) => i !== index),
        })
    }

    const removePrerequisite = (index: number) => {
        updateData({
            prerequisites: data.prerequisites.filter((_, i) => i !== index),
        })
    }

    const removeTag = (index: number) => {
        updateData({
            tags: data.tags.filter((_, i) => i !== index),
        })
    }

    const removeSubtitle = (index: number) => {
        updateData({
            subtitles: data.subtitles.filter((_, i) => i !== index),
        })
    }

    const togglePaymentOption = (option: "one-time" | "subscription" | "installments") => {
        const currentOptions = data.pricing.paymentOptions || []
        const newOptions = currentOptions.includes(option)
            ? currentOptions.filter((o) => o !== option)
            : [...currentOptions, option]
        updatePricing({ paymentOptions: newOptions })
    }

    const handleDiscountEndDateChange = (dateString: string) => {
        const date = dateString ? new Date(dateString) : undefined
        updatePricing({ discountEndDate: date })
    }

    const formatDateForInput = (date?: Date | string): string => {
        if (!date) return ""
        try {
            const dateObj = typeof date === "string" ? new Date(date) : date
            return dateObj.toISOString().split("T")[0]
        } catch {
            return ""
        }
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

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-2 mb-6">
                <h2 className="text-xl font-semibold">About Course</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Course Information */}
                <div className="space-y-6">
                    <div>
                        <Label className="text-sm font-medium">Course Title</Label>
                        <Input
                            value={data.title}
                            onChange={(e) => updateData({ title: e.target.value })}
                            placeholder="Enter course title"
                        />
                    </div>

                    <div>
                        <Label className="text-sm font-medium">Short Description</Label>
                        <Textarea
                            value={data.shortDescription}
                            onChange={(e) => updateData({ shortDescription: e.target.value })}
                            placeholder="Brief description for course preview (max 160 characters)"
                            rows={3}
                            maxLength={160}
                        />
                        <p className="text-sm text-gray-500 mt-1">{data.shortDescription.length}/160</p>
                    </div>

                    <div>
                        <Label className="text-sm font-medium">Full Description</Label>
                        <Textarea
                            value={data.fullDescription}
                            onChange={(e) => updateData({ fullDescription: e.target.value })}
                            placeholder="Detailed course description, what students will learn, course structure..."
                            rows={6}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm font-medium">Target Audience</Label>
                            <Select value={data.targetAudience} onValueChange={(value) => updateData({ targetAudience: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select audience" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="beginners">Beginners</SelectItem>
                                    <SelectItem value="intermediate">Intermediate</SelectItem>
                                    <SelectItem value="advanced">Advanced</SelectItem>
                                    <SelectItem value="professionals">Professionals</SelectItem>
                                    <SelectItem value="students">Students</SelectItem>
                                    <SelectItem value="entrepreneurs">Entrepreneurs</SelectItem>
                                    <SelectItem value="career-changers">Career Changers</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="text-sm font-medium">Primary Language</Label>
                            <Select value={data.language} onValueChange={(value) => updateData({ language: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="english">🇺🇸 English</SelectItem>
                                    <SelectItem value="spanish">🇪🇸 Spanish</SelectItem>
                                    <SelectItem value="french">🇫🇷 French</SelectItem>
                                    <SelectItem value="german">🇩🇪 German</SelectItem>
                                    <SelectItem value="chinese">🇨🇳 Chinese</SelectItem>
                                    <SelectItem value="japanese">🇯🇵 Japanese</SelectItem>
                                    <SelectItem value="portuguese">🇵🇹 Portuguese</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Subtitles */}
                    <div>
                        <Label className="text-sm font-medium">Available Subtitles</Label>
                        <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                                {data.subtitles.map((subtitle, index) => (
                                    <Badge key={`subtitle-${index}`} variant="secondary" className="flex items-center gap-1">
                                        {subtitle}
                                        <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => removeSubtitle(index)} />
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Select value={newSubtitle} onValueChange={setNewSubtitle}>
                                    <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Add subtitle language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="english">English</SelectItem>
                                        <SelectItem value="spanish">Spanish</SelectItem>
                                        <SelectItem value="french">French</SelectItem>
                                        <SelectItem value="german">German</SelectItem>
                                        <SelectItem value="chinese">Chinese</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button onClick={addSubtitle} size="sm" disabled={!newSubtitle}>
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Learning Details */}
                <div className="space-y-6">
                    <div>
                        <Label className="text-sm font-medium">Learning Objectives</Label>
                        <div className="space-y-2">
                            {data.learningObjectives.map((objective, index) => (
                                <div key={`objective-${index}`} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                    <span className="flex-1 text-sm">{objective}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeObjective(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            <div className="flex gap-2">
                                <Input
                                    value={newObjective}
                                    onChange={(e) => setNewObjective(e.target.value)}
                                    placeholder="Add learning objective"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault()
                                            addObjective()
                                        }
                                    }}
                                />
                                <Button onClick={addObjective} size="sm" disabled={!newObjective.trim()}>
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label className="text-sm font-medium">Prerequisites</Label>
                        <div className="space-y-2">
                            {data.prerequisites.map((prerequisite, index) => (
                                <div key={`prerequisite-${index}`} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                    <span className="flex-1 text-sm">{prerequisite}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removePrerequisite(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            <div className="flex gap-2">
                                <Input
                                    value={newPrerequisite}
                                    onChange={(e) => setNewPrerequisite(e.target.value)}
                                    placeholder="Add prerequisite"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault()
                                            addPrerequisite()
                                        }
                                    }}
                                />
                                <Button onClick={addPrerequisite} size="sm" disabled={!newPrerequisite.trim()}>
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label className="text-sm font-medium">Tags</Label>
                        <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                                {data.tags.map((tag, index) => (
                                    <Badge key={`tag-${index}`} variant="secondary" className="flex items-center gap-1">
                                        {tag}
                                        <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => removeTag(index)} />
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    placeholder="Add tag"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault()
                                            addTag()
                                        }
                                    }}
                                />
                                <Button onClick={addTag} size="sm" disabled={!newTag.trim()}>
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pricing Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {/* <DollarSign className="w-5 h-5" /> */}
                        Course Pricing
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label className="text-sm font-medium">Base Price</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <Select value={data.pricing.currency} onValueChange={(value) => updatePricing({ currency: value })}>
                                    <SelectTrigger className="w-24">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="XAF">XAF</SelectItem>
                                        <SelectItem value="XOF">XOF</SelectItem>
                                        <SelectItem value="USD">USD</SelectItem>
                                        <SelectItem value="EUR">EUR</SelectItem>
                                        <SelectItem value="GBP">GBP</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="number"
                                    value={data.pricing.basePrice || ""}
                                    onChange={(e) =>
                                        updatePricing({
                                            basePrice: Number.parseFloat(e.target.value) || 0,
                                        })
                                    }
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    className="flex-1"
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="text-sm font-medium">Pricing Tier</Label>
                            <Select
                                value={data.pricing.pricingTier}
                                onValueChange={(value: any) => updatePricing({ pricingTier: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="free">🆓 Free</SelectItem>
                                    <SelectItem value="basic">💰 Basic (500-10,000 FCFA)</SelectItem>
                                    <SelectItem value="premium">💎 Premium (10,000-100,000 FCFA)</SelectItem>
                                    <SelectItem value="enterprise">🏢 Enterprise (100,000+ FCFA)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="text-sm font-medium">Payment Options</Label>
                            <div className="space-y-2 mt-1">
                                {(["one-time", "subscription", "installments"] as const).map((option) => (
                                    <div key={option} className="flex items-center space-x-2">
                                        <Switch
                                            checked={data.pricing?.paymentOptions?.includes(option)}
                                            onCheckedChange={() => togglePaymentOption(option)}
                                        />
                                        <Label className="text-sm capitalize">{option.replace("-", " ")}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Discount Settings */}
                    <div className="border-t pt-4">
                        <h4 className="font-medium mb-3">Launch Discount (Optional)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label className="text-sm font-medium">
                                    Discount Percentage: {data.pricing.discountPercentage || 0}%
                                </Label>
                                <Slider
                                    value={[data.pricing.discountPercentage || 0]}
                                    onValueChange={(value) => handleDiscountPercentageChange(value[0])}
                                    max={90}
                                    min={0}
                                    step={5}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <Label className="text-sm font-medium">Discounted Price</Label>
                                <Input
                                    type="number"
                                    value={data.pricing.discountPrice || ""}
                                    onChange={(e) =>
                                        updatePricing({
                                            discountPrice: Number.parseFloat(e.target.value) || 0,
                                        })
                                    }
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            <div>
                                <Label className="text-sm font-medium">Discount End Date</Label>
                                <Input
                                    type="date"
                                    value={formatDateForInput(data.pricing.discountEndDate)}
                                    onChange={(e) => handleDiscountEndDateChange(e.target.value)}
                                />
                            </div>
                        </div>

                        {data.pricing.discountPercentage && data.pricing.discountPercentage > 0 && (
                            <div className="mt-3 p-3 bg-green-50 rounded-lg">
                                <p className="text-sm text-green-800">
                                    Students will pay{" "}
                                    <strong>
                                        {getCurrencySymbol(data.pricing.currency)} {data.pricing.discountPrice?.toFixed(2)}
                                    </strong>{" "}
                                    instead of{" "}
                                    <span className="line-through">
                                        {getCurrencySymbol(data.pricing.currency)} {data.pricing.basePrice?.toFixed(2)}
                                    </span>{" "}
                                    (Save {data.pricing.discountPercentage}%)
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Course Metrics */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Course Goals & Metrics
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label className="text-sm font-medium">Expected Enrollments</Label>
                            <Input
                                type="number"
                                value={data.metrics.expectedEnrollments || ""}
                                onChange={(e) =>
                                    updateMetrics({
                                        expectedEnrollments: Number.parseInt(e.target.value) || 0,
                                    })
                                }
                                placeholder="e.g., 1000"
                                min="0"
                            />
                            <p className="text-xs text-gray-500 mt-1">How many students do you expect?</p>
                        </div>

                        <div>
                            <Label className="text-sm font-medium">Target Revenue</Label>
                            <Input
                                type="number"
                                value={data.metrics.targetRevenue || ""}
                                onChange={(e) =>
                                    updateMetrics({
                                        targetRevenue: Number.parseFloat(e.target.value) || 0,
                                    })
                                }
                                placeholder="e.g., 50000"
                                min="0"
                                step="100"
                            />
                            <p className="text-xs text-gray-500 mt-1">Revenue goal for this course</p>
                        </div>

                        <div>
                            <Label className="text-sm font-medium">Marketing Budget</Label>
                            <Input
                                type="number"
                                value={data.metrics.marketingBudget || ""}
                                onChange={(e) =>
                                    updateMetrics({
                                        marketingBudget: Number.parseFloat(e.target.value) || 0,
                                    })
                                }
                                placeholder="e.g., 5000"
                                min="0"
                                step="100"
                            />
                            <p className="text-xs text-gray-500 mt-1">Budget for promoting this course</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
