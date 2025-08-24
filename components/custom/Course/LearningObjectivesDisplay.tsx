"use client";

import { useI18n } from "@/locales/client";
import { CheckCircle2 } from "lucide-react";

type Props = {
    objectives: string[];
};

export default function LearningObjectivesDisplay({ objectives }: Props) {
    const t = useI18n();
    
    if (!objectives || objectives.length === 0) return null;
    return (
        <section className="mt-8">
            <h2 className="text-2xl font-bold mb-4">{t("course.learn.title")}</h2>
            <ul className="space-y-3">
                {objectives.map((obj, i) => (
                    <li
                        key={i}
                        className="flex items-start gap-3 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg p-4 shadow-sm hover:shadow-md transition"
                    >
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                        <span className="text-gray-800 dark:text-gray-200 leading-relaxed">{obj}</span>
                    </li>
                ))}
            </ul>
        </section>
    );
}
