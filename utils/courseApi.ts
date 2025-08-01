import {
    collection,
    doc,
    setDoc,
    getDocs,
    serverTimestamp,
    updateDoc,
    deleteDoc,
    getDoc,
} from "firebase/firestore";
import type { CourseData } from "../types/course";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/firebase/config";

// API responses interface remains the same
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message: string;
    errors?: string[];
}

export interface PublishedCourse {
    id: string;
    title: string;
    slug: string;
    publishedAt: Date;
    status: "published" | "draft" | "pending";
    enrollmentCount: number;
    revenue: number;
    createdAt: any,
    updatedAt: any,
}

export const courseApi = {
    // Publish course to Firestore
    publishCourse: async (courseData: CourseData): Promise<ApiResponse<PublishedCourse>> => {
        try {
            // Validate course data first
            const validationErrors = validateCourseForPublishing(courseData);
            if (validationErrors.length > 0) {
                return {
                    success: false,
                    message: "Course validation failed",
                    errors: validationErrors,
                };
            }

            // Generate course ID (or let Firestore auto-generate)
            const courseId = `course_${Date.now()}`;
            const slug = generateSlug(courseData.aboutCourse?.title || "untitled-course");

            const publishedCourse: PublishedCourse = {
                id: courseId,
                title: courseData.aboutCourse?.title || "Untitled Course",
                slug,
                publishedAt: new Date(),
                status: "published",
                enrollmentCount: 0,
                revenue: 0,
                ...courseData,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            // Save to Firestore
            const courseRef = doc(db, "courses", courseId);
            await setDoc(courseRef, publishedCourse);

            return {
                success: true,
                message: "Course published successfully!",
                data: publishedCourse,
            };
        } catch (error) {
            console.error("Error publishing course:", error);
            return {
                success: false,
                message: "Failed to publish course",
                errors: ["FIRESTORE_ERROR"],
            };
        }
    },


    // Add this to your courseApi object
    getCourseById: async (courseId: string): Promise<ApiResponse<CourseData & PublishedCourse>> => {
        try {
            const courseRef = doc(db, "courses", courseId);
            const courseSnap = await getDoc(courseRef); // Make sure to import getDoc from firebase/firestore

            if (!courseSnap.exists()) {
                return {
                    success: false,
                    message: "Course not found",
                    errors: ["NOT_FOUND"]
                };
            }

            const courseData = courseSnap.data() as CourseData & PublishedCourse;

            // Convert Firestore timestamps to Date objects if needed
            const processedData = {
                ...courseData,
                // publishedAt: courseData.publishedAt?.toDateString?.() || courseData.publishedAt,
                createdAt: courseData.createdAt?.toDate?.() || courseData.createdAt,
                updatedAt: courseData.updatedAt?.toDate?.() || courseData.updatedAt
            };

            return {
                success: true,
                message: "Course retrieved successfully",
                data: processedData
            };
        } catch (error) {
            console.error("Error fetching course:", error);
            return {
                success: false,
                message: "Failed to fetch course",
                errors: ["FIRESTORE_ERROR"]
            };
        }
    },


    // Get all published courses from Firestore
    getPublishedCourses: async (): Promise<any[]> => {
        try {
            const querySnapshot = await getDocs(collection(db, "courses"));
            const courses: PublishedCourse[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Convert Firestore timestamps to Date objects
                courses.push({
                    ...data,
                    // publishedAt: data.publishedAt.toDate(),
                    // createdAt: data.createdAt?.toDate(),
                    // updatedAt: data.updatedAt?.toDate(),
                } as PublishedCourse);
            });

            return courses;
        } catch (error) {
            console.error("Error fetching courses:", error);
            return [];
        }
    },

    // Upload file to Firebase Storage
    uploadFile: async (file: File, type: "video" | "image"): Promise<ApiResponse<{ url: string; id: string }>> => {
        try {
            // Create storage reference
            const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const filePath = `${type}s/${fileId}_${file.name}`;
            const storageRef = ref(storage, filePath);

            // Upload file
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            return {
                success: true,
                message: "File uploaded successfully",
                data: {
                    id: fileId,
                    url: downloadURL,
                },
            };
        } catch (error) {
            console.error("Error uploading file:", error);
            return {
                success: false,
                message: "File upload failed. Please try again.",
            };
        }
    },

    // Additional Firestore operations you might need
    updateCourse: async (courseId: string, updates: Partial<CourseData>): Promise<ApiResponse> => {
        try {
            const courseRef = doc(db, "courses", courseId);
            await updateDoc(courseRef, {
                ...updates,
                updatedAt: serverTimestamp(),
            });

            return {
                success: true,
                message: "Course updated successfully",
            };
        } catch (error) {
            console.error("Error updating course:", error);
            return {
                success: false,
                message: "Failed to update course",
            };
        }
    },

    deleteCourse: async (courseId: string): Promise<ApiResponse> => {
        try {
            const courseRef = doc(db, "courses", courseId);
            await deleteDoc(courseRef);

            return {
                success: true,
                message: "Course deleted successfully",
            };
        } catch (error) {
            console.error("Error deleting course:", error);
            return {
                success: false,
                message: "Failed to delete course",
            };
        }
    },
};

// Validation and helper functions remain the same
function validateCourseForPublishing(courseData: CourseData): string[] {
    const errors: string[] = [];

    if (!courseData.courseDetails?.lessonName) {
        errors.push("Course name is required");
    }

    if (!courseData.courseDetails?.courseCategory) {
        errors.push("Course category is required");
    }

    if (!courseData.aboutCourse?.title) {
        errors.push("Course title is required");
    }

    if (!courseData.aboutCourse?.shortDescription) {
        errors.push("Course description is required");
    }

    if (!courseData.videos || courseData.videos.length === 0) {
        errors.push("At least one video is required");
    }

    if (!courseData.courseDetails?.thumbnailImage) {
        errors.push("Course thumbnail is required");
    }

    return errors;
}

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}