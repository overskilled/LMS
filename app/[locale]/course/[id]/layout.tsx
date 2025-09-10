import { ReactNode } from "react";
import { Metadata, ResolvingMetadata } from "next";
import { courseApi } from "@/utils/courseApi";

interface LayoutProps {
    children: ReactNode;
    params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata(
    { params }: { params: Promise<{ id: string; locale: string }> },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const resolvedParams = await params;

    try {
        const response = await courseApi.getCourseById(resolvedParams.id);
        const course = response.data;

        if (!course) {
            return {
                title: "Cours non trouvé | NMD LMS",
                description: "Le cours demandé n'a pas pu être trouvé.",
            };
        }

        const courseTitle = course?.aboutCourse?.title || "Cours";
        const courseDescription = course?.aboutCourse?.shortDescription || course?.aboutCourse?.fullDescription || "Découvrez ce cours sur NMD LMS.";

        const courseThumbnail = course?.courseDetails?.thumbnailImage?.downloadURL || "/nmd-logo.png";

        return {
            title: `${courseTitle} | NMD LMS`,
            description: courseDescription,
            keywords: [
                courseTitle,
                "nanosatellites",
                "formation",
                "cours en ligne",
                "NMD LMS",
                "technologie spatiale",
                ...(course?.aboutCourse?.tags || [])
            ],
            icons: {
                icon: [
                    { url: courseThumbnail },
                    new URL(courseThumbnail, courseThumbnail),
                    { url: courseThumbnail, media: '(prefers-color-scheme: dark)' },
                ],
            },
            openGraph: {
                title: `${courseTitle} | NMD LMS`,
                description: courseDescription,
                images: [
                    {
                        url: courseThumbnail,
                        width: 1200,
                        height: 630,
                        alt: courseTitle,
                    }
                ],
            },
        };

    } catch (error) {
        return {
            title: "Cours | NMD LMS",
            description: "Découvrez ce cours sur la plateforme NMD LMS.",
        };
    }
}

export default async function CourseLayout({ children, params }: LayoutProps) {
    const resolvedParams = await params;
    return <>{children}</>;
}