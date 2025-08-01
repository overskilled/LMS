"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Check } from "lucide-react"
import { CourseData } from "@/types/course"

interface CourseDetailsProps {
    course: CourseData
}

export function CourseDetails({ course }: CourseDetailsProps) {
    return (
        <section className="py-12 md:py-16 bg-gray-50">
            <div className="container mx-auto px-4 md:px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">What You'll Learn</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                        {course.aboutCourse.learningObjectives?.slice(0, 4).map((objective, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <p className="text-gray-700">{objective}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="requirements">
                                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                    <h3 className="text-lg font-semibold text-left">Requirements</h3>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-4">
                                    <ul className="space-y-2 text-gray-700">
                                        {course.aboutCourse.prerequisites?.length > 0 ? (
                                            course.aboutCourse.prerequisites.map((req, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="text-gray-500">•</span>
                                                    <span>{req}</span>
                                                </li>
                                            ))
                                        ) : (
                                            <li>No specific requirements</li>
                                        )}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="audience">
                                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                    <h3 className="text-lg font-semibold text-left">Who this course is for</h3>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-4">
                                    <p className="text-gray-700">{course.aboutCourse.targetAudience || "Anyone interested in learning this topic"}</p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="certification">
                                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                    <h3 className="text-lg font-semibold text-left">Certification</h3>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-4">
                                    <div className="flex items-start gap-4">
                                        {course.publishSettings.certificateEnabled ? (
                                            <>
                                                <div className="bg-green-100 p-3 rounded-full">
                                                    <Check className="h-6 w-6 text-green-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">Certificate of Completion</h4>
                                                    <p className="text-gray-600 mt-1">
                                                        Get certified upon completing this course and passing all assessments
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-gray-700">This course does not offer a certificate</p>
                                        )}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>
            </div>
        </section>
    )
}