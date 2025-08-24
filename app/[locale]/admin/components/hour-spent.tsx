"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const monthlyData = [
    { month: "Jan", study: 25, exam: 18 },
    { month: "Feb", study: 22, exam: 32 },
    { month: "Mar", study: 20, exam: 18 },
    { month: "Apr", study: 35, exam: 15 },
    { month: "May", study: 28, exam: 8 },
    { month: "Jun", study: 25, exam: 15 },
    { month: "Jul", study: 30, exam: 20 },
    { month: "Aug", study: 25, exam: 18 },
    { month: "Sep", study: 22, exam: 30 },
    { month: "Oct", study: 18, exam: 20 },
    { month: "Nov", study: 35, exam: 15 },
    { month: "Dec", study: 28, exam: 8 },
]

export default function HourSpent() {
    const [selectedPeriod, setSelectedPeriod] = useState("Yearly")

    const maxValue = 100
    const yAxisLabels = ["0Hr", "20Hr", "40Hr", "60Hr", "80Hr", "100Hr"]

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-gray-50 rounded-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-semibold text-gray-900">Hour Spent</h1>
                <div className="flex items-center gap-6">
                    {/* Legend */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-teal-400"></div>
                            <span className="text-sm text-gray-600">Study</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-teal-600"></div>
                            <span className="text-sm text-gray-600">Exam</span>
                        </div>
                    </div>

                    {/* Period Selector */}
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger className="w-24 h-8 text-sm border-gray-300">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Yearly">Yearly</SelectItem>
                            <SelectItem value="Monthly">Monthly</SelectItem>
                            <SelectItem value="Weekly">Weekly</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Chart */}
            <div className="relative">
                {/* Chart Container */}
                <div className="flex">
                    {/* Y-Axis */}
                    <div className="flex flex-col justify-between h-80 pr-4 py-2">
                        {yAxisLabels.reverse().map((label, index) => (
                            <div key={index} className="text-sm text-gray-500 text-right">
                                {label}
                            </div>
                        ))}
                    </div>

                    {/* Chart Area */}
                    <div className="flex-1 relative">
                        {/* Grid Lines */}
                        <div className="absolute inset-0">
                            {[0, 1, 2, 3, 4, 5].map((line) => (
                                <div key={line} className="absolute w-full border-t border-gray-200" style={{ top: `${line * 20}%` }} />
                            ))}
                        </div>

                        {/* Bars */}
                        <div className="flex items-end justify-between h-80 px-2">
                            {monthlyData.map((data, index) => {
                                const totalHeight = ((data.study + data.exam) / maxValue) * 100
                                const examHeight = (data.exam / maxValue) * 100
                                const studyHeight = (data.study / maxValue) * 100

                                return (
                                    <div key={index} className="flex flex-col items-center gap-3">
                                        {/* Bar */}
                                        <div className="relative w-8 flex flex-col justify-end">
                                            <div className="w-full bg-teal-400 rounded-t-sm" style={{ height: `${studyHeight * 3.2}px` }} />
                                            <div className="w-full bg-teal-600 rounded-b-sm" style={{ height: `${examHeight * 3.2}px` }} />
                                        </div>

                                        {/* Month Label */}
                                        <span className="text-sm text-gray-500 font-medium">{data.month}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
