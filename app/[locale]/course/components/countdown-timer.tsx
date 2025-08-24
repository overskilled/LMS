"use client"

import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"

export function CountdownTimer({
    targetDate,
    className = ""
}: {
    targetDate: Date
    className?: string
}) {
    const [timeLeft, setTimeLeft] = useState("")

    useEffect(() => {
        const updateTimer = () => {
            const distance = formatDistanceToNow(targetDate, {
                includeSeconds: true
            })
            setTimeLeft(distance)
        }

        updateTimer()
        const interval = setInterval(updateTimer, 1000)

        return () => clearInterval(interval)
    }, [targetDate])

    return (
        <div className={`text-lg font-medium ${className}`}>
            {timeLeft ? `Starts in ${timeLeft}` : "Starting soon"}
        </div>
    )
}