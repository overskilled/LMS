"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, Trophy, RotateCcw, Clock, AlertCircle, Target, BookOpen, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Question {
    id: string
    question: string
    type: "multiple-choice" | "true-false"
    options?: string[]
    correctAnswer: number | string
    points: number
    difficulty?: "easy" | "medium" | "hard"
    explanation?: string
}

interface QuizModalProps {
    chapterId: string
    questions: any[]
    onPass: () => void
    onClose: () => void
}

export function QuizModal({ chapterId, questions, onPass, onClose }: QuizModalProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [answers, setAnswers] = useState<Record<string, number | string>>({})
    const [showResults, setShowResults] = useState(false)
    const [showReview, setShowReview] = useState(false)
    const [score, setScore] = useState(0)
    const [timeRemaining, setTimeRemaining] = useState(300) // 5 minutes
    const [quizStarted, setQuizStarted] = useState(false)
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, boolean>>({})

    useEffect(() => {
        if (!quizStarted || showResults || timeRemaining <= 0) return

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    handleSubmit()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [quizStarted, showResults, timeRemaining])

    const handleAnswer = (questionId: string, answer: number | string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: answer }))
        setSelectedAnswers((prev) => ({ ...prev, [questionId]: true }))
    }

    const handleSubmit = () => {
        let correctCount = 0
        let totalPoints = 0
        let earnedPoints = 0

        questions.forEach((question) => {
            totalPoints += question.points
            if (answers[question.id] === question.correctAnswer) {
                correctCount++
                earnedPoints += question.points
            }
        })

        const finalScore = (earnedPoints / totalPoints) * 100
        setScore(finalScore)
        setShowResults(true)

        // Pass if score >= 70%
        if (finalScore >= 70) {
            setTimeout(() => onPass(), 3000)
        }
    }

    const handleRetry = () => {
        setCurrentQuestion(0)
        setAnswers({})
        setSelectedAnswers({})
        setShowResults(false)
        setShowReview(false)
        setScore(0)
        setTimeRemaining(300)
        setQuizStarted(false)
    }

    const handleReview = () => {
        setShowReview(true)
        setShowResults(false)
    }

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
    }

    const getQuestionStatus = (questionId: string) => {
        const isAnswered = answers[questionId] !== undefined
        const isCorrect = answers[questionId] === questions.find((q) => q.id === questionId)?.correctAnswer

        if (!isAnswered) return "unanswered"
        return isCorrect ? "correct" : "incorrect"
    }

    const getDifficultyColor = (difficulty?: string) => {
        switch (difficulty) {
            case "easy":
                return "text-green-600"
            case "medium":
                return "text-yellow-600"
            case "hard":
                return "text-red-600"
            default:
                return "text-muted-foreground"
        }
    }

    const currentQ = questions[currentQuestion]
    const isLastQuestion = currentQuestion === questions.length - 1
    const hasAnswered = answers[currentQ?.id] !== undefined
    const progress = ((currentQuestion + 1) / questions.length) * 100
    const correctAnswers = questions.filter((q) => answers[q.id] === q.correctAnswer).length

    // Quiz Start Screen
    if (!quizStarted) {
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-lg">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <BookOpen className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Chapter Quiz</CardTitle>
                        <p className="text-muted-foreground">Test your knowledge of this chapter before proceeding</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <p className="text-2xl font-bold text-primary">{questions.length}</p>
                                <p className="text-sm text-muted-foreground">Questions</p>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <p className="text-2xl font-bold text-primary">5:00</p>
                                <p className="text-sm text-muted-foreground">Time Limit</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <Target className="h-4 w-4 text-primary" />
                                <span>You need 70% to pass and unlock the next chapter</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-primary" />
                                <span>Quiz will auto-submit when time runs out</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <RotateCcw className="h-4 w-4 text-primary" />
                                <span>You can retake the quiz if you don't pass</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                                Cancel
                            </Button>
                            <Button onClick={() => setQuizStarted(true)} className="flex-1">
                                Start Quiz
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Quiz Review Screen
    if (showReview) {
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Quiz Review</CardTitle>
                            <Button variant="ghost" size="sm" onClick={onClose}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="overflow-y-auto max-h-[70vh] space-y-6">
                        {questions.map((question, index) => {
                            const userAnswer = answers[question.id]
                            const isCorrect = userAnswer === question.correctAnswer
                            const status = getQuestionStatus(question.id)

                            return (
                                <div key={question.id} className="border rounded-lg p-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="outline">Question {index + 1}</Badge>
                                                {question.difficulty && (
                                                    <Badge variant="secondary" className={getDifficultyColor(question.difficulty)}>
                                                        {question.difficulty}
                                                    </Badge>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    {status === "correct" ? (
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                    ) : status === "incorrect" ? (
                                                        <XCircle className="h-4 w-4 text-red-600" />
                                                    ) : (
                                                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                                                    )}
                                                    <span
                                                        className={cn(
                                                            "text-sm font-medium",
                                                            status === "correct" && "text-green-600",
                                                            status === "incorrect" && "text-red-600",
                                                            status === "unanswered" && "text-yellow-600",
                                                        )}
                                                    >
                                                        {status === "correct" ? "Correct" : status === "incorrect" ? "Incorrect" : "Not Answered"}
                                                    </span>
                                                </div>
                                            </div>
                                            <h4 className="font-medium mb-3">{question.question}</h4>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {question.type === "multiple-choice" &&
                                            question.options?.map((option: any, optionIndex: number) => {
                                                const isUserAnswer = userAnswer === optionIndex
                                                const isCorrectAnswer = question.correctAnswer === optionIndex

                                                return (
                                                    <div
                                                        key={optionIndex}
                                                        className={cn(
                                                            "p-3 rounded-lg border-2 transition-colors",
                                                            isCorrectAnswer && "border-green-500 bg-green-50",
                                                            isUserAnswer && !isCorrectAnswer && "border-red-500 bg-red-50",
                                                            !isUserAnswer && !isCorrectAnswer && "border-border",
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {isCorrectAnswer && <CheckCircle className="h-4 w-4 text-green-600" />}
                                                            {isUserAnswer && !isCorrectAnswer && <XCircle className="h-4 w-4 text-red-600" />}
                                                            <span>{option}</span>
                                                        </div>
                                                    </div>
                                                )
                                            })}

                                        {question.type === "true-false" && (
                                            <div className="space-y-2">
                                                {["true", "false"].map((option) => {
                                                    const isUserAnswer = userAnswer === option
                                                    const isCorrectAnswer = question.correctAnswer === option

                                                    return (
                                                        <div
                                                            key={option}
                                                            className={cn(
                                                                "p-3 rounded-lg border-2 transition-colors",
                                                                isCorrectAnswer && "border-green-500 bg-green-50",
                                                                isUserAnswer && !isCorrectAnswer && "border-red-500 bg-red-50",
                                                                !isUserAnswer && !isCorrectAnswer && "border-border",
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                {isCorrectAnswer && <CheckCircle className="h-4 w-4 text-green-600" />}
                                                                {isUserAnswer && !isCorrectAnswer && <XCircle className="h-4 w-4 text-red-600" />}
                                                                <span className="capitalize">{option}</span>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {question.explanation && (
                                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-sm text-blue-800">
                                                <strong>Explanation:</strong> {question.explanation}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Quiz Results Screen
    if (showResults) {
        const passed = score >= 70
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4">
                            {passed ? (
                                <Trophy className="h-16 w-16 text-primary" />
                            ) : (
                                <XCircle className="h-16 w-16 text-destructive" />
                            )}
                        </div>
                        <CardTitle className="text-2xl">{passed ? "Congratulations!" : "Try Again"}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <div>
                            <p className="text-3xl font-bold text-primary">{Math.round(score)}%</p>
                            <p className="text-muted-foreground">
                                You got {correctAnswers} out of {questions.length} questions correct
                            </p>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-center">
                                <p className="font-medium">Time Used</p>
                                <p className="text-muted-foreground">{formatTime(300 - timeRemaining)}</p>
                            </div>
                            <div className="text-center">
                                <p className="font-medium">Points Earned</p>
                                <p className="text-muted-foreground">
                                    {Math.round((score / 100) * questions.reduce((sum, q) => sum + q.points, 0))} /{" "}
                                    {questions.reduce((sum, q) => sum + q.points, 0)}
                                </p>
                            </div>
                        </div>

                        <Badge variant={passed ? "default" : "destructive"} className="text-sm">
                            {passed ? "Chapter Unlocked!" : "Need 70% to pass"}
                        </Badge>

                        <div className="flex flex-col gap-2">
                            <Button onClick={handleReview} variant="outline" className="w-full bg-transparent">
                                Review Answers
                            </Button>
                            <div className="flex gap-2">
                                {!passed && (
                                    <Button onClick={handleRetry} variant="outline" className="flex-1 bg-transparent">
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Retry Quiz
                                    </Button>
                                )}
                                <Button onClick={onClose} className="flex-1">
                                    {passed ? "Continue" : "Close"}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Quiz Question Screen
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Chapter Quiz</CardTitle>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4" />
                                <span className={cn("font-mono", timeRemaining <= 60 && "text-destructive font-bold")}>
                                    {formatTime(timeRemaining)}
                                </span>
                            </div>
                            <Badge variant="outline">
                                Question {currentQuestion + 1} of {questions.length}
                            </Badge>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{Math.round(progress)}% Complete</span>
                            <span>{questions.length - currentQuestion - 1} remaining</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {currentQ && (
                        <>
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    {currentQ.difficulty && (
                                        <Badge variant="secondary" className={getDifficultyColor(currentQ.difficulty)}>
                                            {currentQ.difficulty}
                                        </Badge>
                                    )}
                                    <Badge variant="outline">
                                        {currentQ.points} point{currentQ.points !== 1 ? "s" : ""}
                                    </Badge>
                                </div>
                                <h3 className="text-lg font-semibold mb-4">{currentQ.question}</h3>

                                <div className="space-y-2">
                                    {currentQ.type === "multiple-choice" &&
                                        currentQ.options?.map((option: any, index: any) => (
                                            <Button
                                                key={index}
                                                variant={answers[currentQ.id] === index ? "default" : "outline"}
                                                className="w-full justify-start text-left h-auto p-4 transition-all hover:scale-[1.02]"
                                                onClick={() => handleAnswer(currentQ.id, index)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center">
                                                        {answers[currentQ.id] === index && <CheckCircle className="h-4 w-4" />}
                                                    </div>
                                                    <span>{option}</span>
                                                </div>
                                            </Button>
                                        ))}

                                    {currentQ.type === "true-false" && (
                                        <>
                                            <Button
                                                variant={answers[currentQ.id] === "true" ? "default" : "outline"}
                                                className="w-full justify-start text-left h-auto p-4 transition-all hover:scale-[1.02]"
                                                onClick={() => handleAnswer(currentQ.id, "true")}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center">
                                                        {answers[currentQ.id] === "true" && <CheckCircle className="h-4 w-4" />}
                                                    </div>
                                                    <span>True</span>
                                                </div>
                                            </Button>
                                            <Button
                                                variant={answers[currentQ.id] === "false" ? "default" : "outline"}
                                                className="w-full justify-start text-left h-auto p-4 transition-all hover:scale-[1.02]"
                                                onClick={() => handleAnswer(currentQ.id, "false")}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center">
                                                        {answers[currentQ.id] === "false" && <CheckCircle className="h-4 w-4" />}
                                                    </div>
                                                    <span>False</span>
                                                </div>
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                                    disabled={currentQuestion === 0}
                                >
                                    Previous
                                </Button>

                                {isLastQuestion ? (
                                    <Button onClick={handleSubmit} disabled={!hasAnswered} className="bg-primary hover:bg-primary/90">
                                        Submit Quiz
                                    </Button>
                                ) : (
                                    <Button onClick={() => setCurrentQuestion(currentQuestion + 1)} disabled={!hasAnswered}>
                                        Next Question
                                    </Button>
                                )}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
