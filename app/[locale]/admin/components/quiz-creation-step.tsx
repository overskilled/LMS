"use client"

import { useState, useEffect, forwardRef, useImperativeHandle, useCallback, useMemo, useRef } from "react"
import { Plus, X, HelpCircle, ChevronDown, ChevronRight, BookOpen } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { AccessibleStepWrapper, type StepRef } from "./accessible-step-wrapper"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/authContext"
import { useParams, useRouter } from "next/navigation"
import { courseApi } from "@/utils/courseApi"

interface QuizQuestion {
    id: string
    question: string
    type: "multiple-choice" | "true-false" | "short-answer" | "essay"
    options: string[]
    correctAnswer: number | string
    explanation?: string
    points: number
    difficulty: "easy" | "medium" | "hard"
    timeLimit?: number
    chapterId: string // Added chapterId to associate questions with chapters
}

interface Chapter {
    id: string
    title: string
    description: string
    createdAt: string
}

interface QuizData {
    questions: QuizQuestion[]
    passingScore: number
    timeLimit: number
    allowRetakes: boolean
    maxAttempts: number
    showCorrectAnswers: boolean
    randomizeQuestions: boolean
    certificateRequired: boolean
}

interface QuizCreationStepProps {
    initialData?: Partial<QuizData>
    onDataChange: (data: QuizData, isValid: boolean) => void
    isEditing?: boolean
    onNext?: () => void
    onPrevious?: () => void
    onCancel?: () => void
}

export const QuizCreationStep = forwardRef<StepRef, QuizCreationStepProps>(
    ({ onDataChange, onNext, onPrevious, onCancel, isEditing }, ref) => {
        const { user } = useAuth();
        const router = useRouter();
        const params = useParams();

        const [chapters, setChapters] = useState<Chapter[]>([]);
        const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
        const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
        const [questionCounter, setQuestionCounter] = useState(0);
        const QUIZ_STORAGE_KEY = "quizFormData";

        // Default template for formData
        const defaultFormData: QuizData = {
            questions: [],
            passingScore: 70,
            timeLimit: 30,
            allowRetakes: true,
            maxAttempts: 3,
            showCorrectAnswers: true,
            randomizeQuestions: false,
            certificateRequired: false,
        };

        const [initialData, setInitialData] = useState<Partial<QuizData>>({});
        const [loading, setLoading] = useState(false);

        // LocalStorage fallback - only for non-edit mode
        const getInitialData = (): Partial<QuizData> => {
            // If we're editing, don't use localStorage
            if (isEditing) return {};

            try {
                if (typeof window !== "undefined") {
                    const savedData = localStorage.getItem(QUIZ_STORAGE_KEY);
                    if (savedData) {
                        return JSON.parse(savedData);
                    }
                }
            } catch (error) {
                console.error("Failed to parse saved form data:", error);
            }
            return {};
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
                            setInitialData(response.data.quiz || {});
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
        const [formData, setFormData] = useState<QuizData>({
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
        const [editingQuestion, setEditingQuestion] = useState<string | null>(null);

        // Save to localStorage whenever formData changes (but 🚫 not in edit mode)
        useEffect(() => {
            try {
                localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(formData));
            } catch (error) {
                console.error("Failed to save form data:", error);
            }
        }, [formData, isEditing]);

        // Load chapters from video upload data
        useEffect(() => {
            try {
                const videoData = localStorage.getItem("videoUploadFormData");
                if (videoData) {
                    const parsedData = JSON.parse(videoData);
                    if (parsedData.chapters && Array.isArray(parsedData.chapters)) {
                        setChapters(parsedData.chapters);
                        // Auto-expand first chapter if available
                        if (parsedData.chapters.length > 0) {
                            setExpandedChapters(new Set([parsedData.chapters[0].id]));
                        }
                    }
                }

                // Only load existing quiz data from localStorage if not editing
                if (!isEditing) {
                    const quizData = localStorage.getItem(QUIZ_STORAGE_KEY);
                    if (quizData) {
                        const parsedQuizData = JSON.parse(quizData);
                        if (parsedQuizData.questions) {
                            setFormData((prev) => ({ ...prev, questions: parsedQuizData.questions }));
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to load chapter or quiz data:", error);
            }
        }, [isEditing]);

        // Save questions to localStorage whenever they change (but 🚫 not in edit mode)
        useEffect(() => {
            try {
                localStorage.setItem(
                    QUIZ_STORAGE_KEY,
                    JSON.stringify({
                        questions: formData.questions,
                        passingScore: formData.passingScore,
                        timeLimit: formData.timeLimit,
                        allowRetakes: formData.allowRetakes,
                        maxAttempts: formData.maxAttempts,
                        showCorrectAnswers: formData.showCorrectAnswers,
                        randomizeQuestions: formData.randomizeQuestions,
                        certificateRequired: formData.certificateRequired,
                    })
                );
            } catch (error) {
                console.error("Failed to save quiz data:", error);
            }
        }, [formData.questions, isEditing]);

        const validateForm = useCallback((): boolean => {
            const errors: Record<string, string> = {}

            // if (formData.questions.length === 0) {
            //     errors.questions = "At least one question is required"
            // }

            // formData.questions.forEach((question, index) => {
            //     if (!question.question.trim()) {
            //         errors[`question-${index}-text`] = "Question text is required"
            //     }

            //     if (question.type === "multiple-choice" && question.options.length < 2) {
            //         errors[`question-${index}-options`] = "Multiple choice questions need at least 2 options"
            //     }

            //     if (question.type === "multiple-choice" && typeof question.correctAnswer !== "number") {
            //         errors[`question-${index}-answer`] = "Please select the correct answer"
            //     }
            // })

            if (formData.passingScore < 0 || formData.passingScore > 100) {
                errors.passingScore = "Passing score must be between 0 and 100"
            }

            // if (formData.timeLimit < 1) {
            //     errors.timeLimit = "Time limit must be at least 1 minute"
            // }

            setValidationErrors(errors)
            const valid = Object.keys(errors).length === 0
            setIsValid(valid)
            return valid
        }, [formData])

        useEffect(() => {
            validateForm()
        }, [validateForm])

        const onDataChangeRef = useRef(onDataChange)

        useEffect(() => {
            onDataChangeRef.current = onDataChange
        }, [onDataChange])

        const notifyParent = useCallback(() => {
            onDataChangeRef.current(formData, isValid)
        }, [formData, isValid])

        useEffect(() => {
            notifyParent()
        }, [notifyParent])

        // Update form data
        const updateFormData = useCallback((updates: Partial<QuizData>) => {
            setFormData((prev) => ({ ...prev, ...updates }))
        }, [])

        const addQuestion = () => {
            if (!selectedChapterId) {
                alert("Please select a chapter first")
                return
            }

            const newQuestion: QuizQuestion = {
                id: `question-${questionCounter}`,
                type: "multiple-choice",
                question: "",
                options: ["", ""],
                correctAnswer: 0,
                difficulty: "easy",
                points: 1,
                chapterId: selectedChapterId,
            }

            setQuestionCounter((prev) => prev + 1)

            updateFormData({
                questions: [...formData.questions, newQuestion],
            })
            setEditingQuestion(newQuestion.id)
        }

        const updateQuestion = (id: string, updates: Partial<QuizQuestion>) => {
            updateFormData({
                questions: formData.questions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
            })
        }

        const removeQuestion = (id: string) => {
            updateFormData({
                questions: formData.questions.filter((q) => q.id !== id),
            })
            if (editingQuestion === id) {
                setEditingQuestion(null)
            }
        }

        const addOption = (questionId: string) => {
            const question = formData.questions.find((q) => q.id === questionId)
            if (question) {
                updateQuestion(questionId, {
                    options: [...question.options, ""],
                })
            }
        }

        const updateOption = (questionId: string, optionIndex: number, value: string) => {
            const question = formData.questions.find((q) => q.id === questionId)
            if (question) {
                const newOptions = [...question.options]
                newOptions[optionIndex] = value
                updateQuestion(questionId, { options: newOptions })
            }
        }

        const removeOption = (questionId: string, optionIndex: number) => {
            const question = formData.questions.find((q) => q.id === questionId)
            if (question && question.options.length > 2) {
                const newOptions = question.options.filter((_, i) => i !== optionIndex)
                updateQuestion(questionId, {
                    options: newOptions,
                    correctAnswer:
                        typeof question.correctAnswer === "number" && question.correctAnswer >= optionIndex
                            ? Math.max(0, question.correctAnswer - 1)
                            : question.correctAnswer,
                })
            }
        }

        const toggleChapterExpansion = (chapterId: string) => {
            setExpandedChapters((prev) => {
                const newSet = new Set(prev)
                if (newSet.has(chapterId)) {
                    newSet.delete(chapterId)
                } else {
                    newSet.add(chapterId)
                }
                return newSet
            })
        }

        const getQuestionsForChapter = (chapterId: string) => {
            return formData.questions.filter((q) => q.chapterId === chapterId)
        }

        const selectChapter = (chapterId: string) => {
            setSelectedChapterId(chapterId)
            setExpandedChapters((prev) => new Set([...prev, chapterId]))
        }

        useImperativeHandle(ref, () => ({
            validate: async () => validateForm(),
            getData: () => formData,
            focus: () => {
                document.getElementById("add-question-button")?.focus();
            },
            reset: () => {
                setFormData({
                    ...defaultFormData,
                });
                setValidationErrors({});
                setEditingQuestion(null);
                setQuestionCounter(0);
                // Only clear localStorage if not in edit mode
                if (!isEditing) {
                    try {
                        localStorage.removeItem(QUIZ_STORAGE_KEY);
                    } catch (error) {
                        console.error("Failed to clear saved form data:", error);
                    }
                }
            },
        }));

        const passingScoreValue = useMemo(() => [formData.passingScore], [formData.passingScore])

        const handlePassingScoreChange = useCallback(
            (value: number[]) => {
                updateFormData({ passingScore: value[0] })
            },
            [updateFormData],
        )

        return (
            <AccessibleStepWrapper
                stepNumber={4}
                title="Create Quiz"
                description="Add quiz questions to assess student learning per chapter"
                isActive={true}
                isCompleted={false}
                isValid={isValid}
                onNext={onNext}
                onPrevious={onPrevious}
                onCancel={onCancel}
            >
                <div className="space-y-8">
                    {/* Quiz Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HelpCircle className="w-5 h-5" />
                                Quiz Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Passing Score */}
                                <div>
                                    <Label htmlFor="passing-score-slider" className="text-sm font-medium mb-2 block">
                                        Passing Score: {formData.passingScore}%
                                    </Label>
                                    <Slider
                                        id="passing-score-slider"
                                        value={passingScoreValue}
                                        onValueChange={handlePassingScoreChange}
                                        max={100}
                                        min={0}
                                        step={5}
                                        className="w-full"
                                        aria-describedby="passing-score-help"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>0%</span>
                                        <span>100%</span>
                                    </div>
                                    <div id="passing-score-help" className="sr-only">
                                        Set the minimum score students need to pass the quiz.
                                    </div>
                                    {validationErrors.passingScore && (
                                        <p className="text-sm text-red-600 mt-1" role="alert">
                                            {validationErrors.passingScore}
                                        </p>
                                    )}
                                </div>

                                {/* Time Limit */}
                                <div>
                                    <Label htmlFor="time-limit-input" className="text-sm font-medium">
                                        Time Limit (minutes)
                                    </Label>
                                    <Input
                                        id="time-limit-input"
                                        type="number"
                                        min="1"
                                        value={formData.timeLimit}
                                        onChange={(e) => updateFormData({ timeLimit: Number.parseInt(e.target.value) || 1 })}
                                        className={cn(validationErrors.timeLimit && "border-red-500")}
                                        aria-describedby="time-limit-help time-limit-error"
                                        aria-invalid={!!validationErrors.timeLimit}
                                    />
                                    <div id="time-limit-help" className="sr-only">
                                        Set how long students have to complete the quiz.
                                    </div>
                                    {validationErrors.timeLimit && (
                                        <p id="time-limit-error" className="text-sm text-red-600 mt-1" role="alert">
                                            {validationErrors.timeLimit}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Quiz Options */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="allow-retakes-switch" className="text-sm font-medium">
                                            Allow Retakes
                                        </Label>
                                        <p className="text-xs text-gray-500">Let students retake the quiz if they fail</p>
                                    </div>
                                    <Switch
                                        id="allow-retakes-switch"
                                        checked={formData.allowRetakes}
                                        onCheckedChange={(checked) => updateFormData({ allowRetakes: checked })}
                                        aria-describedby="allow-retakes-help"
                                    />
                                    <div id="allow-retakes-help" className="sr-only">
                                        Toggle whether students can retake the quiz if they don't pass.
                                    </div>
                                </div>

                                {formData.allowRetakes && (
                                    <div>
                                        <Label htmlFor="max-attempts-input" className="text-sm font-medium">
                                            Maximum Attempts
                                        </Label>
                                        <Input
                                            id="max-attempts-input"
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={formData.maxAttempts}
                                            onChange={(e) => updateFormData({ maxAttempts: Number.parseInt(e.target.value) || 1 })}
                                            className="w-32"
                                            aria-describedby="max-attempts-help"
                                        />
                                        <div id="max-attempts-help" className="sr-only">
                                            Set the maximum number of times a student can attempt the quiz.
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="show-answers-switch" className="text-sm font-medium">
                                            Show Correct Answers
                                        </Label>
                                        <p className="text-xs text-gray-500">Display correct answers after completion</p>
                                    </div>
                                    <Switch
                                        id="show-answers-switch"
                                        checked={formData.showCorrectAnswers}
                                        onCheckedChange={(checked) => updateFormData({ showCorrectAnswers: checked })}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="randomize-switch" className="text-sm font-medium">
                                            Randomize Questions
                                        </Label>
                                        <p className="text-xs text-gray-500">Show questions in random order</p>
                                    </div>
                                    <Switch
                                        id="randomize-switch"
                                        checked={formData.randomizeQuestions}
                                        onCheckedChange={(checked) => updateFormData({ randomizeQuestions: checked })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5" />
                                Quiz Questions by Chapter
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {chapters.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" aria-hidden="true" />
                                    <p className="text-lg font-medium mb-2">No Chapters Found</p>
                                    <p>Please create chapters in the video upload step first before adding quiz questions.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {chapters.map((chapter) => {
                                        const chapterQuestions = getQuestionsForChapter(chapter.id)
                                        const isExpanded = expandedChapters.has(chapter.id)
                                        const isSelected = selectedChapterId === chapter.id

                                        return (
                                            <Card
                                                key={chapter.id}
                                                className={cn(
                                                    "border-l-4 transition-all",
                                                    isSelected ? "border-l-blue-500 bg-blue-50/50" : "border-l-gray-300",
                                                )}
                                            >
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-center justify-between">
                                                        <button
                                                            onClick={() => toggleChapterExpansion(chapter.id)}
                                                            className="flex items-center gap-2 text-left flex-1 hover:text-blue-600 transition-colors"
                                                        >
                                                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                            <div>
                                                                <h3 className="font-medium">{chapter.title}</h3>
                                                                <p className="text-sm text-gray-500">{chapter.description}</p>
                                                            </div>
                                                        </button>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline">
                                                                {chapterQuestions.length} question{chapterQuestions.length !== 1 ? "s" : ""}
                                                            </Badge>
                                                            <Button
                                                                variant={isSelected ? "default" : "outline"}
                                                                size="sm"
                                                                onClick={() => selectChapter(chapter.id)}
                                                            >
                                                                {isSelected ? "Selected" : "Select"}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardHeader>

                                                {isExpanded && (
                                                    <CardContent className="pt-0">
                                                        {chapterQuestions.length === 0 ? (
                                                            <div className="text-center py-6 text-gray-500">
                                                                <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                                <p className="text-sm">No questions added to this chapter yet.</p>
                                                                {isSelected && (
                                                                    <p className="text-xs mt-1">
                                                                        Click "Add Question" below to create questions for this chapter.
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-4">
                                                                {chapterQuestions.map((question, index) => (
                                                                    <Card key={question.id} className="bg-white">
                                                                        <CardHeader className="pb-3">
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="flex items-center gap-2">
                                                                                    <Badge variant="outline">Question {index + 1}</Badge>
                                                                                    <Badge variant="secondary">{question.type.replace("-", " ")}</Badge>
                                                                                </div>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    onClick={() => removeQuestion(question.id)}
                                                                                    className="text-red-500 hover:text-red-700"
                                                                                    aria-label={`Remove question ${index + 1}`}
                                                                                >
                                                                                    <X className="w-4 h-4" />
                                                                                </Button>
                                                                            </div>
                                                                        </CardHeader>
                                                                        <CardContent className="space-y-4">
                                                                            {/* Question Type */}
                                                                            <div>
                                                                                <Label htmlFor={`question-type-${question.id}`} className="text-sm font-medium">
                                                                                    Question Type
                                                                                </Label>
                                                                                <Select
                                                                                    value={question.type}
                                                                                    onValueChange={(value: any) => updateQuestion(question.id, { type: value })}
                                                                                >
                                                                                    <SelectTrigger id={`question-type-${question.id}`}>
                                                                                        <SelectValue />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                                                                                        <SelectItem value="true-false">True/False</SelectItem>
                                                                                        <SelectItem value="short-answer">Short Answer</SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                            </div>

                                                                            {/* Question Text */}
                                                                            <div>
                                                                                <Label htmlFor={`question-text-${question.id}`} className="text-sm font-medium">
                                                                                    Question{" "}
                                                                                    <span className="text-red-500" aria-label="required">
                                                                                        *
                                                                                    </span>
                                                                                </Label>
                                                                                <Textarea
                                                                                    id={`question-text-${question.id}`}
                                                                                    placeholder="Enter your question here..."
                                                                                    value={question.question}
                                                                                    onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                                                                                    className={cn(validationErrors[`question-${index}-text`] && "border-red-500")}
                                                                                    rows={2}
                                                                                />
                                                                                {validationErrors[`question-${index}-text`] && (
                                                                                    <p className="text-sm text-red-600 mt-1" role="alert">
                                                                                        {validationErrors[`question-${index}-text`]}
                                                                                    </p>
                                                                                )}
                                                                            </div>

                                                                            {/* Options for Multiple Choice */}
                                                                            {question.type === "multiple-choice" && (
                                                                                <div>
                                                                                    <div className="flex items-center justify-between mb-2">
                                                                                        <Label className="text-sm font-medium">Answer Options</Label>
                                                                                        <Button
                                                                                            type="button"
                                                                                            variant="outline"
                                                                                            size="sm"
                                                                                            onClick={() => addOption(question.id)}
                                                                                            disabled={question.options.length >= 6}
                                                                                        >
                                                                                            <Plus className="w-4 h-4 mr-1" />
                                                                                            Add Option
                                                                                        </Button>
                                                                                    </div>

                                                                                    <div className="space-y-2">
                                                                                        {question.options.map((option, optionIndex) => (
                                                                                            <div key={optionIndex} className="flex items-center gap-2">
                                                                                                <input
                                                                                                    type="radio"
                                                                                                    name={`correct-${question.id}`}
                                                                                                    checked={question.correctAnswer === optionIndex}
                                                                                                    onChange={() =>
                                                                                                        updateQuestion(question.id, { correctAnswer: optionIndex })
                                                                                                    }
                                                                                                    className="mt-1"
                                                                                                />
                                                                                                <Input
                                                                                                    placeholder={`Option ${optionIndex + 1}`}
                                                                                                    value={option}
                                                                                                    onChange={(e) =>
                                                                                                        updateOption(question.id, optionIndex, e.target.value)
                                                                                                    }
                                                                                                    className="flex-1"
                                                                                                />
                                                                                                {question.options.length > 2 && (
                                                                                                    <Button
                                                                                                        type="button"
                                                                                                        variant="ghost"
                                                                                                        size="sm"
                                                                                                        onClick={() => removeOption(question.id, optionIndex)}
                                                                                                    >
                                                                                                        <X className="w-4 h-4" />
                                                                                                    </Button>
                                                                                                )}
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>

                                                                                    {validationErrors[`question-${index}-options`] && (
                                                                                        <p className="text-sm text-red-600 mt-1" role="alert">
                                                                                            {validationErrors[`question-${index}-options`]}
                                                                                        </p>
                                                                                    )}

                                                                                    {validationErrors[`question-${index}-answer`] && (
                                                                                        <p className="text-sm text-red-600 mt-1" role="alert">
                                                                                            {validationErrors[`question-${index}-answer`]}
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            )}

                                                                            {/* True/False Options */}
                                                                            {question.type === "true-false" && (
                                                                                <div>
                                                                                    <Label className="text-sm font-medium mb-2 block">Correct Answer</Label>
                                                                                    <div className="flex gap-4">
                                                                                        <label className="flex items-center gap-2">
                                                                                            <input
                                                                                                type="radio"
                                                                                                name={`tf-${question.id}`}
                                                                                                checked={question.correctAnswer === "true"}
                                                                                                onChange={() => updateQuestion(question.id, { correctAnswer: "true" })}
                                                                                            />
                                                                                            <span>True</span>
                                                                                        </label>
                                                                                        <label className="flex items-center gap-2">
                                                                                            <input
                                                                                                type="radio"
                                                                                                name={`tf-${question.id}`}
                                                                                                checked={question.correctAnswer === "false"}
                                                                                                onChange={() => updateQuestion(question.id, { correctAnswer: "false" })}
                                                                                            />
                                                                                            <span>False</span>
                                                                                        </label>
                                                                                    </div>
                                                                                </div>
                                                                            )}

                                                                            {/* Short Answer */}
                                                                            {question.type === "short-answer" && (
                                                                                <div>
                                                                                    <Label htmlFor={`answer-${question.id}`} className="text-sm font-medium">
                                                                                        Expected Answer
                                                                                    </Label>
                                                                                    <Input
                                                                                        id={`answer-${question.id}`}
                                                                                        placeholder="Enter the expected answer or keywords..."
                                                                                        value={question.correctAnswer as string}
                                                                                        onChange={(e) =>
                                                                                            updateQuestion(question.id, { correctAnswer: e.target.value })
                                                                                        }
                                                                                    />
                                                                                </div>
                                                                            )}

                                                                            {/* Points */}
                                                                            <div>
                                                                                <Label htmlFor={`points-${question.id}`} className="text-sm font-medium">
                                                                                    Points
                                                                                </Label>
                                                                                <Input
                                                                                    id={`points-${question.id}`}
                                                                                    type="number"
                                                                                    min="1"
                                                                                    max="10"
                                                                                    value={question.points}
                                                                                    onChange={(e) =>
                                                                                        updateQuestion(question.id, {
                                                                                            points: Number.parseInt(e.target.value) || 1,
                                                                                        })
                                                                                    }
                                                                                    className="w-24"
                                                                                />
                                                                            </div>
                                                                        </CardContent>
                                                                    </Card>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                )}
                                            </Card>
                                        )
                                    })}

                                    {/* Add Question Button */}
                                    {selectedChapterId && (
                                        <div className="flex justify-center pt-4">
                                            <Button onClick={addQuestion} size="lg" id="add-question-button">
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Question to Selected Chapter
                                            </Button>
                                        </div>
                                    )}

                                    {!selectedChapterId && chapters.length > 0 && (
                                        <div className="text-center py-4 text-gray-500">
                                            <p className="text-sm">Select a chapter above to start adding quiz questions.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {validationErrors.questions && (
                                <p className="text-sm text-red-600 mt-4" role="alert">
                                    {validationErrors.questions}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </AccessibleStepWrapper>
        )
    },
)

QuizCreationStep.displayName = "QuizCreationStep"
