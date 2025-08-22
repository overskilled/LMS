"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Award, Download } from "lucide-react"

interface CertificateGeneratorProps {
    studentName: string
    courseTitle: string
    completionDate: Date
    instructorName?: string
    onDownload: (certificateData: string) => void
}

export function CertificateGenerator({
    studentName,
    courseTitle,
    completionDate,
    instructorName = "Course Instructor",
    onDownload,
}: CertificateGeneratorProps) {
    const certificateRef = useRef<HTMLDivElement>(null)

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const generateCertificate = async () => {
        if (!certificateRef.current) return

        try {
            // In a real app, you would use html2canvas or similar library
            // For now, we'll create a simple data URL
            const certificateData = `data:text/plain;charset=utf-8,Certificate of Completion
      
Student: ${studentName}
Course: ${courseTitle}
Completion Date: ${formatDate(completionDate)}
Instructor: ${instructorName}

This certifies that the above-named student has successfully completed the course requirements.`

            onDownload(certificateData)
        } catch (error) {
            console.error("Error generating certificate:", error)
        }
    }

    return (
        <div className="space-y-4">
            {/* Certificate Preview */}
            <Card className="w-full max-w-4xl mx-auto">
                <CardContent className="p-8">
                    <div
                        ref={certificateRef}
                        className="bg-gradient-to-br from-primary/5 to-secondary/5 border-4 border-primary/20 rounded-lg p-12 text-center space-y-6"
                    >
                        {/* Header */}
                        <div className="space-y-2">
                            <Award className="h-16 w-16 text-primary mx-auto" />
                            <h1 className="text-4xl font-bold text-primary">Certificate of Completion</h1>
                            <div className="w-32 h-1 bg-primary mx-auto rounded-full" />
                        </div>

                        {/* Content */}
                        <div className="space-y-6">
                            <p className="text-lg text-muted-foreground">This is to certify that</p>

                            <h2 className="text-3xl font-bold text-foreground border-b-2 border-primary/30 pb-2 inline-block">
                                {studentName}
                            </h2>

                            <p className="text-lg text-muted-foreground">has successfully completed the course</p>

                            <h3 className="text-2xl font-semibold text-primary">{courseTitle}</h3>

                            <p className="text-muted-foreground">on {formatDate(completionDate)}</p>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-between items-end pt-8">
                            <div className="text-left">
                                <div className="w-48 h-px bg-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">Date</p>
                            </div>

                            <div className="text-right">
                                <div className="w-48 h-px bg-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">{instructorName}</p>
                                <p className="text-xs text-muted-foreground">Instructor</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Download Button */}
            <div className="text-center">
                <Button onClick={generateCertificate} size="lg">
                    <Download className="h-4 w-4 mr-2" />
                    Download Certificate
                </Button>
            </div>
        </div>
    )
}
