"use client"

import { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from "react"
import { Plus, X, DollarSign, Target, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { AccessibleStepWrapper, type StepRef } from "./accessible-step-wrapper"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { useAuth } from "@/context/authContext"
import { useParams, useRouter } from "next/navigation"
import { courseApi } from "@/utils/courseApi"

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
    pricing: {
        xafPrice: number
        euroPrice: number
        usdPrice: number
        currency: string
        discountPrice?: number
        discountPercentage?: number
        discountEndDate?: Date | string
        pricingTier: "free" | "basic" | "premium" | "enterprise"
        paymentOptions: ("one-time" | "subscription" | "installments")[]
    }
    metrics: {
        expectedEnrollments?: number
        targetRevenue?: number
        marketingBudget?: number
    },
    isUpcoming: boolean
    availabilityDate?: Date | string
    earlyAccessEnabled: boolean
    earlyAccessPrice?: number

}

interface AboutCourseStepProps {
    onDataChange: (data: AboutCourseData, isValid: boolean) => void
    isEditing?: boolean
    onNext?: () => void
    onPrevious?: () => void
    onCancel?: () => void
}

const LOCAL_STORAGE_KEY = 'aboutCourseFormData';

export const AboutCourseStep = forwardRef<StepRef, AboutCourseStepProps>(
    ({ onDataChange, onNext, onPrevious, onCancel, isEditing }, ref) => {
        const { user } = useAuth();
        const router = useRouter();
        const params = useParams();

        const [initialData, setInitialData] = useState<Partial<AboutCourseData>>({});

        // Default template for formData
        const defaultFormData: AboutCourseData = {
            title: "",
            shortDescription: "",
            fullDescription: "",
            learningObjectives: [],
            prerequisites: [],
            targetAudience: "",
            language: "English",
            subtitles: [],
            tags: [],
            pricing: {
                xafPrice: 0,
                euroPrice: 0,
                usdPrice: 0,
                currency: "XAF",
                discountPrice: 0,
                discountPercentage: 0,
                pricingTier: "basic",
                paymentOptions: ["one-time"],
            },
            metrics: {
                expectedEnrollments: 100,
                targetRevenue: 0,
                marketingBudget: 0,
            },
            isUpcoming: false,
            availabilityDate: undefined,
            earlyAccessEnabled: false,
            earlyAccessPrice: undefined,
        };

        const [loading, setLoading] = useState(false);

        // LocalStorage fallback - only for non-edit mode
        const getInitialData = (): Partial<AboutCourseData> => {
            // If we're editing, don't use localStorage
            if (isEditing) return {};

            try {
                if (typeof window !== "undefined") {
                    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
                    if (savedData) {
                        return JSON.parse(savedData);
                    }
                }
            } catch (error) {
                console.error("Failed to parse saved form data:", error);
            }
            return initialData || {};
        };

        // Fetch course if editing
        useEffect(() => {
            const fetchCourse = async () => {
                if (isEditing) {
                    setLoading(true);
                    try {
                        const idFromUrl = params?.id as string | undefined;
                        const idToUse = idFromUrl;

                        if (!idToUse) return;

                        const response = await courseApi.getCourseById(idToUse);
                        if (response.success && response.data) {
                            setInitialData(response.data.aboutCourse || {});
                        } else {
                            console.error("Failed to fetch course:", response.message);
                        }
                    } catch (err) {
                        console.error("Error while fetching course:", err);
                    } finally {
                        setLoading(false);
                    }
                } else {
                    setInitialData(getInitialData());
                }
            };

            fetchCourse();
        }, [isEditing, params?.id]);

        // 🔑 Sync formData with defaults + initialData
        const [formData, setFormData] = useState<AboutCourseData>({
            ...defaultFormData,
            ...getInitialData(),
        });

        useEffect(() => {
            setFormData({
                ...defaultFormData,
                ...initialData,
            });
        }, [initialData]);

        const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
        const [isValid, setIsValid] = useState(false);
        const [newObjective, setNewObjective] = useState("");
        const [newPrerequisite, setNewPrerequisite] = useState("");
        const [newTag, setNewTag] = useState("");

        // Save to localStorage whenever formData changes 
        useEffect(() => {
            try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));
            } catch (error) {
                console.error("Failed to save form data:", error);
            }
        }, [formData, isEditing]);

        // Validation function
        const validateForm = (): boolean => {
            const errors: Record<string, string> = {};

            if (!formData.title.trim()) {
                errors.title = "Course title is required";
            } else if (formData.title.length < 10) {
                errors.title = "Course title must be at least 10 characters";
            }

            if (!formData.shortDescription.trim()) {
                errors.shortDescription = "Short description is required";
            } else if (formData.shortDescription.length < 10) {
                errors.shortDescription = "Short description must be at least 10 characters";
            }

            if (!formData.fullDescription.trim()) {
                errors.fullDescription = "Full description is required";
            } else if (formData.fullDescription.length < 25) {
                errors.fullDescription = "Full description must be at least 25 characters";
            }

            if (formData.learningObjectives.length === 0) {
                errors.learningObjectives = "At least one learning objective is required";
            }

            if (!formData.targetAudience.trim()) {
                errors.targetAudience = "Target audience is required";
            }

            if (formData.pricing.xafPrice <= 0) {
                errors.xafPrice = "Course price must be greater than 0";
            }

            if (formData.pricing.euroPrice <= 0) {
                errors.xafPrice = "Course price must be greater than 0";
            }

            if (formData.pricing.usdPrice <= 0) {
                errors.xafPrice = "Course price must be greater than 0";
            }

            // Additional validation for upcoming courses
            if (formData.isUpcoming && !formData.availabilityDate) {
                errors.availabilityDate = "Availability date is required for upcoming courses";
            }

            if (formData.isUpcoming && formData.earlyAccessEnabled && !formData.earlyAccessPrice) {
                errors.earlyAccessPrice = "Early access price is required when early access is enabled";
            }

            setValidationErrors(errors);
            const valid = Object.keys(errors).length === 0;
            setIsValid(valid);
            return valid;
        };

        // Update form data
        const updateFormData = useCallback((updates: Partial<AboutCourseData>) => {
            setFormData(prev => {
                const newData = { ...prev, ...updates };

                // Auto-calculate target revenue
                if (updates.pricing || updates.metrics) {
                    newData.metrics.targetRevenue = newData.pricing.xafPrice * (newData.metrics.expectedEnrollments || 0);
                }

                // If turning off upcoming status, clear related fields
                if (updates.isUpcoming === false) {
                    newData.availabilityDate = undefined;
                    newData.earlyAccessEnabled = false;
                    newData.earlyAccessPrice = undefined;
                }

                // If turning off early access, clear early access price
                if (updates.earlyAccessEnabled === false) {
                    newData.earlyAccessPrice = undefined;
                }

                return newData;
            });
        }, []);

        // Array management functions
        const addObjective = () => {
            if (newObjective.trim()) {
                updateFormData({
                    learningObjectives: [...formData.learningObjectives, newObjective.trim()],
                });
                setNewObjective("");
            }
        };

        const removeObjective = (index: number) => {
            updateFormData({
                learningObjectives: formData.learningObjectives.filter((_, i) => i !== index),
            });
        };

        const addPrerequisite = () => {
            if (newPrerequisite.trim()) {
                updateFormData({
                    prerequisites: [...formData.prerequisites, newPrerequisite.trim()],
                });
                setNewPrerequisite("");
            }
        };

        const removePrerequisite = (index: number) => {
            updateFormData({
                prerequisites: formData.prerequisites.filter((_, i) => i !== index),
            });
        };

        const addTag = () => {
            if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
                updateFormData({
                    tags: [...formData.tags, newTag.trim()],
                });
                setNewTag("");
            }
        };

        const removeTag = (index: number) => {
            updateFormData({
                tags: formData.tags.filter((_, i) => i !== index),
            });
        };

        const handleNext = () => {
            const isValid = validateForm();
            if (isValid && onNext) {
                onNext();
            }
        };

        const handleDateSelect = (date: Date | undefined) => {
            updateFormData({ availabilityDate: date });
        };


        useImperativeHandle(ref, () => ({
            validate: async () => validateForm(),
            getData: () => formData,
            focus: () => {
                document.getElementById("course-title-input")?.focus();
            },
            reset: () => {
                setFormData({
                    ...defaultFormData,
                });
                setValidationErrors({});
                // Only clear localStorage if not in edit mode
                if (!isEditing) {
                    try {
                        localStorage.removeItem(LOCAL_STORAGE_KEY);
                    } catch (error) {
                        console.error("Failed to clear saved form data:", error);
                    }
                }
            },
        }));

        return (
            <AccessibleStepWrapper
                stepNumber={3}
                title="About Course"
                description="Provide detailed information about your course content and pricing"
                isActive={true}
                isCompleted={false}
                isValid={isValid}
                onNext={onNext}
                onPrevious={onPrevious}
                onCancel={onCancel}
            >
                <div className="space-y-8">
                    {/* Course Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="w-5 h-5" />
                                Course Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Course Title */}
                            <div>
                                <Label htmlFor="course-title-input" className="text-sm font-medium">
                                    Course Title{" "}
                                    <span className="text-red-500" aria-label="required">
                                        *
                                    </span>
                                </Label>
                                <div className="relative mt-2">
                                    <Input
                                        id="course-title-input"
                                        placeholder="e.g., Master React Development: From Beginner to Expert"
                                        value={formData.title}
                                        onChange={(e) => updateFormData({ title: e.target.value })}
                                        className={cn("pr-16", validationErrors.title && "border-red-500")}
                                        aria-describedby="course-title-help course-title-error"
                                        aria-invalid={!!validationErrors.title}
                                        maxLength={100}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400" aria-live="polite">
                                        {formData.title.length} / 100
                                    </span>
                                </div>
                                <div id="course-title-help" className="sr-only">
                                    Enter a compelling title that clearly describes what students will learn.
                                </div>
                                {validationErrors.title && (
                                    <p id="course-title-error" className="text-sm text-red-600 mt-1" role="alert">
                                        {validationErrors.title}
                                    </p>
                                )}
                            </div>

                            {/* Short Description */}
                            <div>
                                <Label htmlFor="short-description-input" className="text-sm font-medium">
                                    Short Description{" "}
                                    <span className="text-red-500" aria-label="required">
                                        *
                                    </span>
                                </Label>
                                <div className="relative mt-2">
                                    <Textarea
                                        id="short-description-input"
                                        placeholder="A brief, compelling description that will appear in course listings..."
                                        value={formData.shortDescription}
                                        onChange={(e) => updateFormData({ shortDescription: e.target.value })}
                                        className={cn("pr-16", validationErrors.shortDescription && "border-red-500")}
                                        aria-describedby="short-description-help short-description-error"
                                        aria-invalid={!!validationErrors.shortDescription}
                                        rows={3}
                                        maxLength={300}
                                    />
                                    <span className="absolute right-3 bottom-3 text-sm text-gray-400" aria-live="polite">
                                        {formData.shortDescription.length} / 300
                                    </span>
                                </div>
                                <div id="short-description-help" className="sr-only">
                                    Write a brief description that will attract students to your course.
                                </div>
                                {validationErrors.shortDescription && (
                                    <p id="short-description-error" className="text-sm text-red-600 mt-1" role="alert">
                                        {validationErrors.shortDescription}
                                    </p>
                                )}
                            </div>

                            {/* Full Description */}
                            <div>
                                <Label htmlFor="full-description-input" className="text-sm font-medium">
                                    Full Description{" "}
                                    <span className="text-red-500" aria-label="required">
                                        *
                                    </span>
                                </Label>
                                <div className="relative mt-2">
                                    <Textarea
                                        id="full-description-input"
                                        placeholder="Provide a detailed description of your course, including what students will learn, how the course is structured, and what makes it unique..."
                                        value={formData.fullDescription}
                                        onChange={(e) => updateFormData({ fullDescription: e.target.value })}
                                        className={cn("pr-16", validationErrors.fullDescription && "border-red-500")}
                                        aria-describedby="full-description-help full-description-error"
                                        aria-invalid={!!validationErrors.fullDescription}
                                        rows={6}
                                        maxLength={2000}
                                    />
                                    <span className="absolute right-3 bottom-3 text-sm text-gray-400" aria-live="polite">
                                        {formData.fullDescription.length} / 2000
                                    </span>
                                </div>
                                <div id="full-description-help" className="sr-only">
                                    Provide a comprehensive description of your course content and structure.
                                </div>
                                {validationErrors.fullDescription && (
                                    <p id="full-description-error" className="text-sm text-red-600 mt-1" role="alert">
                                        {validationErrors.fullDescription}
                                    </p>
                                )}
                            </div>

                            {/* Learning Objectives */}
                            <div>
                                <Label className="text-sm font-medium">
                                    Learning Objectives{" "}
                                    <span className="text-red-500" aria-label="required">
                                        *
                                    </span>
                                </Label>
                                <p className="text-xs text-gray-500 mb-2">
                                    What will students be able to do after completing this course?
                                </p>

                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="e.g., Build responsive web applications using React"
                                            value={newObjective}
                                            onChange={(e) => setNewObjective(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault()
                                                    addObjective()
                                                }
                                            }}
                                            aria-describedby="objectives-help"
                                        />
                                        <Button type="button" onClick={addObjective} disabled={!newObjective.trim()}>
                                            <Plus className="w-4 h-4" />
                                            <span className="sr-only">Add learning objective</span>
                                        </Button>
                                    </div>

                                    <div id="objectives-help" className="sr-only">
                                        Add specific, measurable learning outcomes for your course.
                                    </div>

                                    {formData.learningObjectives.length > 0 && (
                                        <div className="space-y-2" role="list" aria-label="Learning objectives">
                                            {formData.learningObjectives.map((objective, index) => (
                                                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded" role="listitem">
                                                    <span className="flex-1">{objective}</span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeObjective(index)}
                                                        aria-label={`Remove objective: ${objective}`}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {validationErrors.learningObjectives && (
                                        <p className="text-sm text-red-600" role="alert">
                                            {validationErrors.learningObjectives}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Target Audience */}
                            <div>
                                <Label htmlFor="target-audience-input" className="text-sm font-medium">
                                    Target Audience{" "}
                                    <span className="text-red-500" aria-label="required">
                                        *
                                    </span>
                                </Label>
                                <Textarea
                                    id="target-audience-input"
                                    placeholder="e.g., Beginner developers who want to learn React, professionals looking to upgrade their skills..."
                                    value={formData.targetAudience}
                                    onChange={(e) => updateFormData({ targetAudience: e.target.value })}
                                    className={cn(validationErrors.targetAudience && "border-red-500")}
                                    aria-describedby="target-audience-help target-audience-error"
                                    aria-invalid={!!validationErrors.targetAudience}
                                    rows={3}
                                />
                                <div id="target-audience-help" className="sr-only">
                                    Describe who this course is designed for and their skill level.
                                </div>
                                {validationErrors.targetAudience && (
                                    <p id="target-audience-error" className="text-sm text-red-600 mt-1" role="alert">
                                        {validationErrors.targetAudience}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>


                    {/* Course Availability */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Course Availability
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-sm font-medium">
                                        Is this an upcoming course?
                                    </Label>
                                    <p className="text-xs text-gray-500">
                                        Enable this if your course isn't ready yet but you want to start promoting it
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant={formData.isUpcoming ? "default" : "outline"}
                                    onClick={() => updateFormData({ isUpcoming: !formData.isUpcoming })}
                                >
                                    {formData.isUpcoming ? "Upcoming Course" : "Available Now"}
                                </Button>
                            </div>

                            {formData.isUpcoming && (
                                <>
                                    <div>
                                        <Label htmlFor="availability-date" className="text-sm font-medium">
                                            Availability Date{" "}
                                            <span className="text-red-500" aria-label="required">
                                                *
                                            </span>
                                        </Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !formData.availabilityDate && "text-muted-foreground",
                                                        validationErrors.availabilityDate && "border-red-500"
                                                    )}
                                                >
                                                    <Calendar className="mr-2 h-4 w-4" />
                                                    {formData.availabilityDate ? (
                                                        format(new Date(formData.availabilityDate), "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <CalendarComponent
                                                    mode="single"
                                                    selected={formData.availabilityDate ? new Date(formData.availabilityDate) : undefined}
                                                    onSelect={handleDateSelect}
                                                    initialFocus
                                                    fromDate={new Date()}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {validationErrors.availabilityDate && (
                                            <p className="text-sm text-red-600 mt-1" role="alert">
                                                {validationErrors.availabilityDate}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label className="text-sm font-medium">
                                                Enable Early Access?
                                            </Label>
                                            <p className="text-xs text-gray-500">
                                                Allow students to purchase before official release at a special price
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant={formData.earlyAccessEnabled ? "default" : "outline"}
                                            onClick={() => updateFormData({ earlyAccessEnabled: !formData.earlyAccessEnabled })}
                                        >
                                            {formData.earlyAccessEnabled ? "Enabled" : "Disabled"}
                                        </Button>
                                    </div>

                                    {formData.earlyAccessEnabled && (
                                        <div>
                                            <Label htmlFor="early-access-price" className="text-sm font-medium">
                                                Early Access Price{" "}
                                                <span className="text-red-500" aria-label="required">
                                                    *
                                                </span>
                                            </Label>
                                            <div className="flex mt-2">
                                                <Select
                                                    value={formData.pricing.currency}
                                                    onValueChange={(value) => {
                                                        if (value !== formData.pricing.currency) {
                                                            updateFormData({
                                                                pricing: { ...formData.pricing, currency: value }
                                                            });
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger className="w-20">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="XAF">XAF</SelectItem>
                                                        <SelectItem value="XOF">XOF</SelectItem>
                                                        <SelectItem value="USD">$</SelectItem>
                                                        <SelectItem value="EUR">€</SelectItem>
                                                        <SelectItem value="GBP">£</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Input
                                                    id="early-access-price"
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="79.00"
                                                    value={formData.earlyAccessPrice || ""}
                                                    onChange={(e) =>
                                                        updateFormData({
                                                            earlyAccessPrice: Number.parseFloat(e.target.value) || undefined,
                                                        })
                                                    }
                                                    className={cn("rounded-l-none", validationErrors.earlyAccessPrice && "border-red-500")}
                                                    aria-describedby="early-access-price-help early-access-price-error"
                                                    aria-invalid={!!validationErrors.earlyAccessPrice}
                                                />
                                            </div>
                                            <div id="early-access-price-help" className="text-xs text-gray-500 mt-1">
                                                Set a special price for students who purchase before the official release date
                                            </div>
                                            {validationErrors.earlyAccessPrice && (
                                                <p id="early-access-price-error" className="text-sm text-red-600 mt-1" role="alert">
                                                    {validationErrors.earlyAccessPrice}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pricing */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5" />
                                Pricing & Metrics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex flex-col">

                                    <Label htmlFor="base-price-input" className="text-sm font-medium">
                                        Course Price{" "} in XAF
                                        <span className="text-red-500" aria-label="required">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="base-price-input"
                                        type="number"
                                        min="0"
                                        step="1"
                                        placeholder="10000.00"
                                        value={formData.pricing.xafPrice || ""}
                                        onChange={(e) =>
                                            updateFormData({
                                                pricing: { ...formData.pricing, xafPrice: Number.parseFloat(e.target.value) || 0 },
                                            })
                                        }
                                        className={cn("rounded-l-none", validationErrors.xafPrice && "border-red-500")}
                                        aria-describedby="base-price-help base-price-error"
                                        aria-invalid={!!validationErrors.xafPrice}
                                    />
                                </div>
                                <div className="flex flex-col">

                                    <Label htmlFor="base-price-input" className="text-sm font-medium">
                                        Course Price{" "} in Euro
                                        <span className="text-red-500" aria-label="required">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="base-price-input"
                                        type="number"
                                        min="0"
                                        step="1"
                                        placeholder="99.00"
                                        value={formData.pricing.euroPrice || ""}
                                        onChange={(e) =>
                                            updateFormData({
                                                pricing: { ...formData.pricing, euroPrice: Number.parseFloat(e.target.value) || 0 },
                                            })
                                        }
                                        className={cn("rounded-l-none", validationErrors.euroPrice && "border-red-500")}
                                        aria-describedby="base-price-help base-price-error"
                                        aria-invalid={!!validationErrors.euroPrice}
                                    />
                                </div>
                                <div className="flex flex-col">

                                    <Label htmlFor="base-price-input" className="text-sm font-medium">
                                        Course Price{" "} in USD
                                        <span className="text-red-500" aria-label="required">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="base-price-input"
                                        type="number"
                                        min="0"
                                        step="1"
                                        placeholder="99.00"
                                        value={formData.pricing.usdPrice || ""}
                                        onChange={(e) =>
                                            updateFormData({
                                                pricing: { ...formData.pricing, usdPrice: Number.parseFloat(e.target.value) || 0 },
                                            })
                                        }
                                        className={cn("rounded-l-none", validationErrors.usdPrice && "border-red-500")}
                                        aria-describedby="base-price-help base-price-error"
                                        aria-invalid={!!validationErrors.usdPrice}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">


                                {/* Expected Enrollments */}
                                <div>
                                    <Label htmlFor="expected-enrollments-slider" className="text-sm font-medium mb-2 block">
                                        Expected Enrollments: {formData?.metrics?.expectedEnrollments}
                                    </Label>
                                    <Slider
                                        id="expected-enrollments-slider"
                                        value={[formData.metrics?.expectedEnrollments || 0]}
                                        onValueChange={(value) =>
                                            updateFormData({
                                                metrics: { ...formData.metrics, expectedEnrollments: value[0] },
                                            })
                                        }
                                        max={10000}
                                        min={10}
                                        step={10}
                                        className="w-full"
                                        aria-describedby="expected-enrollments-help"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>10</span>
                                        <span>10,000+</span>
                                    </div>
                                    <div id="expected-enrollments-help" className="sr-only">
                                        Estimate how many students you expect to enroll in your course.
                                    </div>
                                </div>
                            </div>

                            {/* Target Revenue Display */}
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-blue-900">Projected Revenue:</span>
                                    <span className="text-lg font-bold text-blue-900">
                                        {formData.pricing.currency === "XAF" && "XAF"}
                                        {formData.pricing.currency === "XOF" && "XOF"}
                                        {formData.pricing.currency === "USD" && "$"}
                                        {formData.pricing.currency === "EUR" && "€"}
                                        {formData.pricing.currency === "GBP" && "£"}
                                        {formData.metrics?.targetRevenue?.toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-xs text-blue-700 mt-1">
                                    Based on {formData.metrics.expectedEnrollments} enrollments at{" "}
                                    {formData.pricing.currency === "XAF" && "XAF"}
                                    {formData.pricing.currency === "XOF" && "XOF"}
                                    {formData.pricing.currency === "USD" && "$"}
                                    {formData.pricing.currency === "EUR" && "€"}
                                    {formData.pricing.currency === "GBP" && "£"}
                                    {formData.pricing.xafPrice} each
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AccessibleStepWrapper>
        )
    },
)

AboutCourseStep.displayName = "AboutCourseStep"