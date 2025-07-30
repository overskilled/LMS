"use client"

import { useState } from "react"
import { Plus, Trash2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

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
    data: QuizData
    onDataChange: (data: QuizData) => void
}

export function QuizCreationStep({ data, onDataChange }: QuizCreationStepProps) {
    const [editingQuestion, setEditingQuestion] = useState<string | null>(null)

    const updateData = (updates: Partial<QuizData>) => {
        onDataChange({ ...data, ...updates })
    }

    const addQuestion = () => {
        const newQuestion: QuizQuestion = {
            id: Math.random().toString(36).substr(2, 9),
            question: "",
            type: "multiple-choice",
            options: ["", "", "", ""],
            correctAnswer: 0,
            explanation: "",
            points: 1,
            difficulty: "easy"
        }

        updateData({ questions: [...data.questions, newQuestion] })
        setEditingQuestion(newQuestion.id)
    }

    const updateQuestion = (id: string, updates: Partial<QuizQuestion>) => {
        updateData({
            questions: data.questions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
        })
    }

    const removeQuestion = (id: string) => {
        updateData({ questions: data.questions.filter((q) => q.id !== id) })
    }

    const updateOption = (questionId: string, optionIndex: number, value: string) => {
        const question = data.questions.find((q) => q.id === questionId)
        if (question) {
            const newOptions = [...question.options]
            newOptions[optionIndex] = value
            updateQuestion(questionId, { options: newOptions })
        }
    }

    const addOption = (questionId: string) => {
        const question = data.questions.find((q) => q.id === questionId)
        if (question && question.options.length < 6) {
            updateQuestion(questionId, { options: [...question.options, ""] })
        }
    }

    const removeOption = (questionId: string, optionIndex: number) => {
        const question = data.questions.find((q) => q.id === questionId)
        if (question && question.options.length > 2) {
            const newOptions = question.options.filter((_, i) => i !== optionIndex)
            const correctAnswer =
                typeof question.correctAnswer === "number"
                    ? question.correctAnswer >= optionIndex
                        ? Math.max(0, question.correctAnswer - 1)
                        : question.correctAnswer
                    : question.correctAnswer

            updateQuestion(questionId, {
                options: newOptions,
                correctAnswer,
            })
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <h2 className="text-xl font-semibold">Create Quiz</h2>
            </div>

            {/* Quiz Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Quiz Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label className="text-sm font-medium">Passing Score (%)</Label>
                            <Input
                                type="number"
                                value={data.passingScore}
                                onChange={(e) => updateData({ passingScore: Number.parseInt(e.target.value) || 70 })}
                                min="0"
                                max="100"
                            />
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Time Limit (minutes)</Label>
                            <Input
                                type="number"
                                value={data.timeLimit}
                                onChange={(e) => updateData({ timeLimit: Number.parseInt(e.target.value) || 30 })}
                                min="1"
                            />
                        </div>
                        <div className="flex items-center space-x-2 pt-6">
                            <Switch
                                checked={data.allowRetakes}
                                onCheckedChange={(checked) => updateData({ allowRetakes: checked })}
                            />
                            <Label className="text-sm font-medium">Allow Retakes</Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Questions */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Questions ({data.questions.length})</h3>
                    <Button onClick={addQuestion}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Question
                    </Button>
                </div>

                {data.questions.map((question, index) => (
                    <Card key={question.id} className="p-4">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium">Question {index + 1}</h4>
                                <div className="flex items-center gap-2">
                                    <Select
                                        value={question.type}
                                        onValueChange={(value: any) => updateQuestion(question.id, { type: value })}
                                    >
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                                            <SelectItem value="true-false">True/False</SelectItem>
                                            <SelectItem value="short-answer">Short Answer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeQuestion(question.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <Label className="text-sm font-medium">Question</Label>
                                <Textarea
                                    value={question.question}
                                    onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                                    placeholder="Enter your question here..."
                                    rows={2}
                                />
                            </div>

                            {question.type === "multiple-choice" && (
                                <div>
                                    <Label className="text-sm font-medium">Answer Options</Label>
                                    <RadioGroup
                                        value={question.correctAnswer.toString()}
                                        onValueChange={(value: any) => updateQuestion(question.id, { correctAnswer: Number.parseInt(value) })}
                                    >
                                        <div className="space-y-2">
                                            {question.options.map((option, optionIndex) => (
                                                <div key={optionIndex} className="flex items-center gap-2">
                                                    <RadioGroupItem value={optionIndex.toString()} />
                                                    <Input
                                                        value={option}
                                                        onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                                                        placeholder={`Option ${optionIndex + 1}`}
                                                        className="flex-1"
                                                    />
                                                    {question.correctAnswer === optionIndex && <Check className="w-4 h-4 text-green-500" />}
                                                    {question.options.length > 2 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeOption(question.id, optionIndex)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </RadioGroup>

                                    {question.options.length < 6 && (
                                        <Button variant="outline" size="sm" onClick={() => addOption(question.id)} className="mt-2">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Option
                                        </Button>
                                    )}
                                </div>
                            )}

                            {question.type === "true-false" && (
                                <div>
                                    <Label className="text-sm font-medium">Correct Answer</Label>
                                    <RadioGroup
                                        value={question.correctAnswer.toString()}
                                        onValueChange={(value: any) => updateQuestion(question.id, { correctAnswer: value })}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="true" />
                                            <Label>True</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="false" />
                                            <Label>False</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            )}

                            {question.type === "short-answer" && (
                                <div>
                                    <Label className="text-sm font-medium">Sample Answer</Label>
                                    <Input
                                        value={question.correctAnswer as string}
                                        onChange={(e) => updateQuestion(question.id, { correctAnswer: e.target.value })}
                                        placeholder="Enter a sample correct answer"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium">Points</Label>
                                    <Input
                                        type="number"
                                        value={question.points}
                                        onChange={(e) => updateQuestion(question.id, { points: Number.parseInt(e.target.value) || 1 })}
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Explanation (Optional)</Label>
                                    <Input
                                        value={question.explanation || ""}
                                        onChange={(e) => updateQuestion(question.id, { explanation: e.target.value })}
                                        placeholder="Explain the correct answer"
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}

                {data.questions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <p>No questions added yet. Create your first question to get started.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
