"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CourseCard } from "./course-card";
import { courseApi } from "@/utils/courseApi";
import { CourseData } from "@/types/course";
import { useAuth } from "@/context/authContext";
import { useI18n } from "@/locales/client";

export default function PublishedCourseListing() {
    const [courses, setCourses] = useState<CourseData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>("all"); // "all", "masterclass", "course", "partner"

    const t = useI18n();
    const { user } = useAuth();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                const response = await courseApi.getPublishedCourses();

                if (response) {
                    // Filter courses where publishSettings.isPublic is true
                    const publicCourses = response.filter(
                        (course: any) => course.publishSettings?.isPublic === true
                    );

                    setCourses(publicCourses);
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

    // Helper function to get display text for course type
    const getCourseTypeDisplay = (courseType: string | undefined) => {
        switch (courseType) {
            case "masterclass":
                return "NMD Masterclass";
            case "partner":
                return "NMD Partner Course";
            case "course":
            default:
                return "NMD Courses";
        }
    };

    // Group courses by type
    const groupedCourses = {
        masterclass: courses.filter(course => {
            const courseType = course.courseDetails?.courseType || "course";
            return courseType === "masterclass";
        }),
        course: courses.filter(course => {
            const courseType = course.courseDetails?.courseType || "course";
            return courseType === "course";
        }),
        partner: courses.filter(course => {
            const courseType = course.courseDetails?.courseType || "course";
            return courseType === "partner";
        })
    };

    // Filter courses based on selected filter
    const filteredCourses = filter === "all"
        ? courses
        : groupedCourses[filter as keyof typeof groupedCourses];

    if (loading) {
        return (
            <section className="w-full bg-white font-slab">
                <div className="container mx-auto px-4 py-6 sm:py-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-lg shadow-md overflow-hidden h-60 animate-pulse"
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
                        {t("course.retry")}
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
                        {t("course.courses")}
                        <span className="absolute left-0 right-0 bottom-0 h-1 bg-yellow-400 rounded-full -mb-2" />
                    </h2>

                    {/* Filter buttons */}
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={filter === "all" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilter("all")}
                        >
                            {t("course.allCourses")}
                        </Button>
                        <Button
                            variant={filter === "masterclass" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilter("masterclass")}
                        >
                            {t("course.masterclasses")}
                        </Button>
                        <Button
                            variant={filter === "course" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilter("course")}
                        >
                            {t("course.courses")}
                        </Button>
                        <Button
                            variant={filter === "partner" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilter("partner")}
                        >
                            {t("course.partnerCourses")}
                        </Button>
                    </div>
                </div>

                {filteredCourses.length === 0 ? (
                    <div className="text-center py-16 sm:py-20">
                        <p className="text-gray-500">
                            {filter === "all"
                                ? t('course.noCourses')
                                : t('course.noFilteredCourses', { type: getCourseTypeDisplay(filter) })
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* Show all courses grouped by type when filter is "all" */}
                        {filter === "all" ? (
                            <>
                            
                                {/* Course Section */}
                                {groupedCourses.course.length > 0 && (
                                    <div className="space-y-6">
                                        <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold relative inline-block">
                                            {getCourseTypeDisplay("course")}
                                            <span className="absolute left-0 right-0 bottom-0 h-1 bg-blue-400 rounded-full -mb-1" />
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                                            {groupedCourses.course.map((course, idx) => {
                                                const courseType = course.courseDetails?.courseType || "course";
                                                return (
                                                    <CourseCard
                                                        key={course.id}
                                                        course={course}
                                                        idx={idx}
                                                        courseType={courseType}
                                                        courseTypeDisplay={getCourseTypeDisplay(courseType)}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}


                                {/* Masterclass Section */}
                                {groupedCourses.masterclass.length > 0 && (
                                    <div className="space-y-6">
                                        <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold relative inline-block">
                                            {getCourseTypeDisplay("masterclass")}
                                            <span className="absolute left-0 right-0 bottom-0 h-1 bg-purple-400 rounded-full -mb-1" />
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                                            {groupedCourses.masterclass.map((course, idx) => {
                                                const courseType = course.courseDetails?.courseType || "course";
                                                return (
                                                    <CourseCard
                                                        key={course.id}
                                                        course={course}
                                                        idx={idx}
                                                        courseType={courseType as any}
                                                        courseTypeDisplay={getCourseTypeDisplay(courseType)}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Partner Course Section */}
                                {groupedCourses.partner.length > 0 && (
                                    <div className="space-y-6">
                                        <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold relative inline-block">
                                            {getCourseTypeDisplay("partner")}
                                            <span className="absolute left-0 right-0 bottom-0 h-1 bg-green-400 rounded-full -mb-1" />
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                                            {groupedCourses.partner.map((course, idx) => {
                                                const courseType = course.courseDetails?.courseType || "course";
                                                return (
                                                    <CourseCard
                                                        key={course.id}
                                                        course={course}
                                                        idx={idx}
                                                        courseType={courseType}
                                                        courseTypeDisplay={getCourseTypeDisplay(courseType)}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            /* Show only filtered courses when a specific filter is selected */
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                                {filteredCourses.map((course, idx) => {
                                    const courseType = course.courseDetails?.courseType || "course";
                                    return (
                                        <CourseCard
                                            key={course.id}
                                            course={course}
                                            idx={idx}
                                            courseType={courseType}
                                            courseTypeDisplay={getCourseTypeDisplay(courseType)}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}