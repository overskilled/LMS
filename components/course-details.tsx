import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tag, CheckCircle2, Check } from "lucide-react"

export default function CourseDetails() {
    return (
        <section className="w-full py-10 md:py-10 lg:py-10 bg-white text-gray-800">
            <div className="container px-4 md:px-6 mx-auto max-w-8xl">
                {/* Tags Section */}
                <div className="flex items-center gap-2 mb-8 text-gray-600">
                    <Tag className="w-5 h-5 text-black font-bold" />
                    <span className="text-lg font-bold">big data, data, data analysis, data modeling</span>
                </div>

                {/* Learning Objectives Card */}
                <Card className="mb-12 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Learning Objectives</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                                <p className="text-lg">Ready to begin working on real-world data modeling projects,</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                                <p className="text-lg">Expanded responsibilities as part of an existing role</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                                <p className="text-lg">Find a new position involving data modeling.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Requirements Section */}
                <h2 className="text-3xl font-bold mb-6">Requirements</h2>
                <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                        <p className="text-lg">
                            Basic understanding of data management concepts and constructs such as relational database tables
                        </p>
                    </div>
                    <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                        <p className="text-lg">Know how different pieces of data logically relate to one another.</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
