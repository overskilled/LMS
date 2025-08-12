// components/LearningObjectives.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Check, X, Plus } from "lucide-react";
import { useState } from "react";

type Props = {
    value: string[];
    onChange: (objectives: string[]) => void;
};

export default function LearningObjectives({ value, onChange }: Props) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [draft, setDraft] = useState("");

    const startEditing = (index: number) => {
        setEditingIndex(index);
        setDraft(value[index]);
    };

    const saveEdit = () => {
        if (editingIndex !== null) {
            const updated = [...value];
            updated[editingIndex] = draft.trim();
            onChange(updated);
            setEditingIndex(null);
            setDraft("");
        }
    };

    const cancelEdit = () => {
        setEditingIndex(null);
        setDraft("");
    };

    const addObjective = () => {
        const updated = [...value, "Nouvel objectif..."];
        onChange(updated);
        setEditingIndex(updated.length - 1);
        setDraft("Nouvel objectif...");
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Learning Objectifs</h3>
                <Button variant="outline" onClick={addObjective}>
                    <Plus className="w-4 h-4 mr-2" /> Add
                </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {value.map((objective, index) => (
                    <Card key={index} className="group relative hover:shadow-md transition">
                        <CardHeader className="flex justify-between">
                            <CardTitle className="text-base font-medium">
                                Objectif {index + 1}
                            </CardTitle>
                            {editingIndex !== index && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="opacity-0 group-hover:opacity-100 transition"
                                    onClick={() => startEditing(index)}
                                >
                                    <Pencil className="w-4 h-4" />
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            {editingIndex === index ? (
                                <div className="space-y-2">
                                    <Textarea
                                        value={draft}
                                        onChange={(e) => setDraft(e.target.value)}
                                        rows={3}
                                    />
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={saveEdit}>
                                            <Check className="w-4 h-4 mr-1" /> Save
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={cancelEdit}
                                        >
                                            <X className="w-4 h-4 mr-1" /> Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted-foreground">{objective}</p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
