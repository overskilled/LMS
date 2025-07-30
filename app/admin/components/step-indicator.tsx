"use client"

import { Check, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Step {
    id: string
    title: string
    description?: string
    isCompleted?: boolean
    isActive?: boolean
    isDisabled?: boolean
}

interface StepIndicatorProps {
    steps: Step[]
    currentStep: number
    onStepClick?: (stepIndex: number) => void
    className?: string
}

export function StepIndicator({ steps, currentStep, onStepClick, className }: StepIndicatorProps) {
    return (
        <div className={cn("w-full", className)}>
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const isActive = index === currentStep
                    const isCompleted = index < currentStep
                    const isDisabled = step.isDisabled || index > currentStep

                    return (
                        <div key={step.id} className="flex items-center flex-1">
                            <div className="flex flex-col items-center">
                                <button
                                    onClick={() => !isDisabled && onStepClick?.(index)}
                                    disabled={isDisabled}
                                    className={cn(
                                        "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200",
                                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                                        {
                                            "bg-blue-500 border-blue-500 text-white": isActive,
                                            "bg-green-500 border-green-500 text-white": isCompleted,
                                            "bg-white border-gray-300 text-gray-500": !isActive && !isCompleted,
                                            "cursor-pointer hover:border-blue-400": !isDisabled && !isActive && !isCompleted,
                                            "cursor-not-allowed opacity-50": isDisabled,
                                        },
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="w-4 h-4" />
                                    ) : (
                                        <Circle
                                            className={cn("w-3 h-3", {
                                                "fill-current": isActive,
                                            })}
                                        />
                                    )}
                                </button>
                                <span
                                    className={cn("mt-2 text-sm font-medium text-center max-w-[100px]", {
                                        "text-blue-600": isActive,
                                        "text-green-600": isCompleted,
                                        "text-gray-500": !isActive && !isCompleted,
                                    })}
                                >
                                    {step.title}
                                </span>
                            </div>

                            {index < steps.length - 1 && (
                                <div
                                    className={cn("flex-1 h-0.5 mx-4 transition-colors duration-200", {
                                        "bg-green-500": index < currentStep,
                                        "bg-gray-300": index >= currentStep,
                                    })}
                                />
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
