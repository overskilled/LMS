"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CourseCard } from "./course-card";
import { courseApi } from "@/utils/courseApi";
import { CourseData } from "@/types/course";

export default function CourseListing() {
    const [courses, setCourses] = useState<CourseData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                const response = await courseApi.getPublishedCourses();

                if (response) {
                    setCourses(response);
                }
            } catch (err) {
                setError("Failed to fetch courses");
                console.log("Error fetching courses:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    if (loading) {
        return (
            <section className="w-full bg-white font-slab">
                <div className="container mx-auto px-4 py-12 sm:py-16">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-lg shadow-md overflow-hidden h-80 animate-pulse"
                            >
                                <div className="bg-gray-200 h-48 w-full"></div>
                                <div className="p-4 space-y-2">
                                    <div className="bg-gray-200 h-4 w-1/4 rounded"></div>
                                    <div className="bg-gray-200 h-6 w-full rounded"></div>
                                    <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
                                    <div className="flex justify-between pt-4">
                                        <div className="bg-gray-200 h-6 w-1/3 rounded"></div>
                                        <div className="bg-gray-200 h-4 w-1/3 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="w-full bg-white font-slab">
                <div className="container mx-auto px-4 text-center py-20">
                    <p className="text-red-500">{error}</p>
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </Button>
                </div>
            </section>
        );
    }

    return (
        <section className="w-full bg-white font-slab">
            <div className="container mx-auto px-4 py-12 sm:py-16">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold relative inline-block mb-4 md:mb-0">
                        Courses
                        <span className="absolute left-0 right-0 bottom-0 h-1 bg-yellow-400 rounded-full -mb-2" />
                    </h2>
                </div>

                {courses.length === 0 ? (
                    <div className="text-center py-16 sm:py-20">
                        <p className="text-gray-500">No courses found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {courses.map((course, idx) => (
                            <CourseCard key={course.id} course={course} idx={idx} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
