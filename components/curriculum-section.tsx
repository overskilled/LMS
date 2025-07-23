import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { FileText, HelpCircle } from "lucide-react"

export default function CurriculumSection() {
    return (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white text-gray-800">
            <div className="container px-4 md:px-6 mx-auto max-w-8xl">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold">Curriculum</h2>
                    <div className="flex items-center gap-4 text-gray-800 text-lg">
                        <span>4 Lessons</span>
                        <span>15h 15m</span>
                    </div>
                </div>

                <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                    {/* IT background module */}
                    <AccordionItem value="item-1" className="border rounded-lg mb-4 bg-gray-50">
                        <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-blue-600 hover:no-underline">
                            IT background
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4">
                            <div className="space-y-3 pl-4">
                                <div className="flex items-center gap-3 text-gray-700">
                                    <FileText className="w-5 h-5 flex-shrink-0" />
                                    <span>The importance of data nowadays</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <FileText className="w-5 h-5 flex-shrink-0" />
                                    <span>Why my organization should know about data</span>
                                </div>
                                <h3 className="text-md font-semibold mt-4 mb-2 text-gray-600">Assignments</h3>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <HelpCircle className="w-5 h-5 flex-shrink-0" />
                                    <span>First quiz</span>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Key concepts module */}
                    <AccordionItem value="item-2" className="border rounded-lg mb-4">
                        <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-gray-800 hover:no-underline">
                            Key concepts
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4">
                            <div className="space-y-3 pl-4 text-gray-700">
                                <p>Content for Key concepts module...</p>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Apply the principles module */}
                    <AccordionItem value="item-3" className="border rounded-lg">
                        <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-gray-800 hover:no-underline">
                            Apply the principles
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4">
                            <div className="space-y-3 pl-4 text-gray-700">
                                <p>Content for Apply the principles module...</p>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </section>
    )
}
