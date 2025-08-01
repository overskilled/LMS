"use client"

import {
    PenTool,
    Code,
    Waves,
    Lightbulb,
    Briefcase,
    LineChart,
    Megaphone,
    Camera,
    Database,
    HammerIcon as Mortar,
    Music,
    GraduationCap,
    ChevronRight,
    type LucideIcon,
} from "lucide-react"
import { motion } from "framer-motion"

interface Category {
    name: string
    icon: LucideIcon
}

const categories: Category[] = [
    { name: "Art & Design", icon: PenTool },
    { name: "Development", icon: Code },
    { name: "Lifestyle", icon: Waves },
    { name: "Personal Development", icon: Lightbulb },
    { name: "Business", icon: Briefcase },
    { name: "Finance", icon: LineChart },
    { name: "Marketing", icon: Megaphone },
    { name: "Photography", icon: Camera },
    { name: "Data Science", icon: Database },
    { name: "Health & Fitness", icon: Mortar },
    { name: "Music", icon: Music },
    { name: "Teaching & Academics", icon: GraduationCap },
]

export default function TopCategories() {
    return (
        <section className="flex  w-[92%]  ml-10 mr-10 py-0 my-0 h-[70vh] items-center justify-center md:py-2 lg:py-0 bg-white font-poppins">
            <div className="w-full px-4 md:px-6 ">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-10 relative inline-block">
                    Top Categories
                    <span className="absolute left-0 right-0 bottom-0 h-1 bg-yellow-400 rounded-full -mb-4"></span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 py-4 gap-4 md:gap-6">
                    {categories.map((category, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ backgroundColor: "#EFF6FF" }} // blue-50
                            transition={{ duration: 0.3 }}
                            className="flex items-center justify-between p-4 md:p-6 rounded-lg border border-gray-200 cursor-pointer group transition-colors duration-300"
                        >
                            <div className="flex items-center gap-4">
                                <category.icon className="h-6 w-6 text-gray-400 group-hover:text-blue-600 transition-colors duration-300" />
                                <span className="text-md font-light text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                                    {category.name}
                                </span>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:text-blue-600 transition-all duration-300" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
