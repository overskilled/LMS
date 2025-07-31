"use client"

import type React from "react"

import { forwardRef, useImperativeHandle, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface StepRef {
    validate: () => Promise<boolean>
    getData: () => any
    focus: () => void
    reset: () => void
}

interface AccessibleStepWrapperProps {
    stepNumber: number
    title: string
    description?: string
    isActive: boolean
    isCompleted: boolean
    isValid: boolean
    isLoading?: boolean
    error?: string | null
    children: React.ReactNode
    onNext?: () => void
    onPrevious?: () => void
    onCancel?: () => void
    showNavigation?: boolean
    className?: string
}

export const AccessibleStepWrapper = forwardRef<StepRef, AccessibleStepWrapperProps>(
    (
        {
            stepNumber,
            title,
            description,
            isActive,
            isCompleted,
            isValid,
            isLoading = false,
            error,
            children,
            onNext,
            onPrevious,
            onCancel,
            showNavigation = true,
            className,
        },
        ref,
    ) => {
        const contentRef = useRef<HTMLDivElement>(null)

        useImperativeHandle(ref, () => ({
            validate: async () => isValid,
            getData: () => ({}),
            focus: () => {
                contentRef.current?.focus()
            },
            reset: () => {
                // Override in child components
            },
        }))

        if (!isActive) {
            return null
        }

        return (
            <div
                className={cn("space-y-6", className)}
                role="tabpanel"
                aria-labelledby={`step-${stepNumber}-heading`}
                tabIndex={-1}
                ref={contentRef}
            >
                <Card className="border-2 border-blue-200 bg-blue-50/30">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <div
                                className={cn(
                                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold",
                                    isCompleted
                                        ? "bg-green-600 text-white"
                                        : isActive
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-300 text-gray-600",
                                )}
                                aria-hidden="true"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : isCompleted ? (
                                    <CheckCircle className="w-4 h-4" />
                                ) : (
                                    stepNumber
                                )}
                            </div>
                            <div>
                                <CardTitle id={`step-${stepNumber}-heading`} className="text-xl">
                                    {title}
                                </CardTitle>
                                {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {error && (
                            <Alert variant="destructive" role="alert" aria-live="polite">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-6" aria-live="polite" aria-atomic="false">
                            {children}
                        </div>

                        {showNavigation && (
                            <div className="flex justify-between pt-6 border-t" role="navigation" aria-label="Step navigation">
                                <Button variant="outline" onClick={onCancel} disabled={isLoading} aria-describedby="cancel-help">
                                    Cancel
                                </Button>
                                <div id="cancel-help" className="sr-only">
                                    Cancel course creation and return to dashboard
                                </div>

                                <div className="flex gap-3">
                                    {onPrevious && (
                                        <>
                                            <Button
                                                variant="outline"
                                                onClick={onPrevious}
                                                disabled={isLoading}
                                                aria-describedby="previous-help"
                                            >
                                                Previous
                                            </Button>
                                            <div id="previous-help" className="sr-only">
                                                Go back to the previous step
                                            </div>
                                        </>
                                    )}

                                    {onNext && (
                                        <>
                                            <Button
                                                onClick={onNext}
                                                // disabled={!isValid || isLoading}
                                                aria-describedby="next-help"
                                                className="min-w-[120px]"
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Processing...
                                                    </>
                                                ) : stepNumber === 5 ? (
                                                    "Publish Course"
                                                ) : (
                                                    "Continue"
                                                )}
                                            </Button>
                                            <div id="next-help" className="sr-only">
                                                {stepNumber === 5 ? "Publish your course" : "Continue to the next step"}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        )
    },
)

AccessibleStepWrapper.displayName = "AccessibleStepWrapper"
