"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Plus, X, Globe, Linkedin, Twitter, Github, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface InstructorData {
    name: string
    bio: string
    avatar?: File
    title: string
    experience: string
    expertise: string[]
    socialLinks: {
        website?: string
        linkedin?: string
        twitter?: string
        github?: string
    }
    credentials: string[]
    teachingExperience: number
    totalStudents?: number
    averageRating?: number
    totalCourses?: number
}

interface InstructorInfoStepProps {
    data: InstructorData
    onDataChange: (data: InstructorData) => void
}

export function InstructorInfoStep({ data, onDataChange }: InstructorInfoStepProps) {
    const [dragActive, setDragActive] = useState(false)
    const [newExpertise, setNewExpertise] = useState("")
    const [newCredential, setNewCredential] = useState("")

    const updateData = (updates: Partial<InstructorData>) => {
        onDataChange({ ...data, ...updates })
    }

    const updateSocialLinks = (updates: Partial<InstructorData["socialLinks"]>) => {
        updateData({ socialLinks: { ...data.socialLinks, ...updates } })
    }

    const handleFileUpload = (file: File) => {
        if (file && (file.type === "image/png" || file.type === "image/jpeg") && file.size <= 5 * 1024 * 1024) {
            updateData({ avatar: file })
        }
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0])
        }
    }

    const addExpertise = () => {
        if (newExpertise.trim() && !data.expertise.includes(newExpertise.trim())) {
            updateData({ expertise: [...data.expertise, newExpertise.trim()] })
            setNewExpertise("")
        }
    }

    const addCredential = () => {
        if (newCredential.trim()) {
            updateData({ credentials: [...data.credentials, newCredential.trim()] })
            setNewCredential("")
        }
    }

    const removeExpertise = (expertise: string) => {
        updateData({ expertise: data.expertise.filter((e) => e !== expertise) })
    }

    const removeCredential = (index: number) => {
        updateData({ credentials: data.credentials.filter((_, i) => i !== index) })
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-2 mb-6">
                <h2 className="text-xl font-semibold">Instructor Information</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Basic Info */}
                <div className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <Avatar className="w-20 h-20">
                                {data?.avatar ? (
                                    <AvatarImage src={URL.createObjectURL(data.avatar) || "/placeholder.svg"} />
                                ) : (
                                    <AvatarFallback className="text-lg">
                                        {data?.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .toUpperCase() || "IN"}
                                    </AvatarFallback>
                                )}
                            </Avatar>
                        </div>

                        <div className="flex-1">
                            <Label className="text-sm font-medium">Profile Photo</Label>
                            <Card
                                className={cn(
                                    "border-2 border-dashed transition-colors cursor-pointer mt-2",
                                    dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300",
                                    "hover:border-blue-400 hover:bg-gray-50",
                                )}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById("avatar-upload")?.click()}
                            >
                                <CardContent className="p-4 text-center">
                                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm">
                                        Drop photo or <span className="text-blue-500 underline">browse</span>
                                    </p>
                                    <p className="text-xs text-gray-500">PNG, JPEG (max 5mb)</p>
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/png,image/jpeg"
                                        className="hidden"
                                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Basic Information */}
                    <div className="space-y-4">
                        <div>
                            <Label className="text-sm font-medium">Full Name</Label>
                            <Input
                                value={data?.name || ""}
                                onChange={(e) => updateData({ name: e.target.value })}
                                placeholder="e.g., John Doe"
                            />
                        </div>

                        <div>
                            <Label className="text-sm font-medium">Professional Title</Label>
                            <Input
                                value={data?.title || ""}
                                onChange={(e) => updateData({ title: e.target.value })}
                                placeholder="e.g., Senior Software Engineer & Course Creator"
                            />
                        </div>

                        <div>
                            <Label className="text-sm font-medium">Bio</Label>
                            <Textarea
                                value={data?.bio || ""}
                                onChange={(e) => updateData({ bio: e.target.value })}
                                placeholder="Tell students about your background, experience, and teaching philosophy..."
                                rows={4}
                            />
                        </div>

                        <div>
                            <Label className="text-sm font-medium">Professional Experience</Label>
                            <Textarea
                                value={data?.experience || ""}
                                onChange={(e) => updateData({ experience: e.target.value })}
                                placeholder="Describe your work experience, companies you've worked for, projects you've led..."
                                rows={3}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column - Professional Details */}
                <div className="space-y-6">
                    {/* Teaching Experience */}
                    <div>
                        <Label className="text-sm font-medium mb-2 block">
                            Years of Teaching Experience: {data?.teachingExperience || 0} years
                        </Label>
                        <Slider
                            value={[data?.teachingExperience || 0]}
                            onValueChange={(value) => updateData({ teachingExperience: value[0] })}
                            max={30}
                            min={0}
                            step={1}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>New to teaching</span>
                            <span>30+ years</span>
                        </div>
                    </div>

                    {/* Current Stats (Optional) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm font-medium">Total Students Taught</Label>
                            <Input
                                type="number"
                                value={data?.totalStudents || ""}
                                onChange={(e) => updateData({ totalStudents: Number.parseInt(e.target.value) || undefined })}
                                placeholder="e.g., 12450"
                                min="0"
                            />
                            <p className="text-xs text-gray-500 mt-1">Across all platforms</p>
                        </div>

                        <div>
                            <Label className="text-sm font-medium">Courses Created</Label>
                            <Input
                                type="number"
                                value={data?.totalCourses || ""}
                                onChange={(e) => updateData({ totalCourses: Number.parseInt(e.target.value) || undefined })}
                                placeholder="e.g., 15"
                                min="0"
                            />
                            <p className="text-xs text-gray-500 mt-1">Including this one</p>
                        </div>
                    </div>

                    {/* Areas of Expertise */}
                    <div>
                        <Label className="text-sm font-medium">Areas of Expertise</Label>
                        <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                                {data?.expertise.map((skill) => (
                                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                                        {skill}
                                        <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => removeExpertise(skill)} />
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    value={newExpertise}
                                    onChange={(e) => setNewExpertise(e.target.value)}
                                    placeholder="Add expertise area"
                                    onKeyPress={(e) => e.key === "Enter" && addExpertise()}
                                />
                                <Button onClick={addExpertise} size="sm">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Credentials */}
                    <div>
                        <Label className="text-sm font-medium">Credentials & Certifications</Label>
                        <div className="space-y-2">
                            {data?.credentials.map((credential, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                    <Award className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                                    <span className="flex-1 text-sm">{credential}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeCredential(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            <div className="flex gap-2">
                                <Input
                                    value={newCredential}
                                    onChange={(e) => setNewCredential(e.target.value)}
                                    placeholder="Add credential or certification"
                                    onKeyPress={(e) => e.key === "Enter" && addCredential()}
                                />
                                <Button onClick={addCredential} size="sm">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Social Links */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        Social Links & Online Presence
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                Website
                            </Label>
                            <Input
                                value={data?.socialLinks.website || ""}
                                onChange={(e) => updateSocialLinks({ website: e.target.value })}
                                placeholder="https://yourwebsite.com"
                                type="url"
                            />
                        </div>

                        <div>
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <Linkedin className="w-4 h-4" />
                                LinkedIn
                            </Label>
                            <Input
                                value={data?.socialLinks.linkedin || ""}
                                onChange={(e) => updateSocialLinks({ linkedin: e.target.value })}
                                placeholder="https://linkedin.com/in/yourprofile"
                                type="url"
                            />
                        </div>

                        <div>
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <Twitter className="w-4 h-4" />
                                Twitter
                            </Label>
                            <Input
                                value={data?.socialLinks.twitter || ""}
                                onChange={(e) => updateSocialLinks({ twitter: e.target.value })}
                                placeholder="https://twitter.com/yourusername"
                                type="url"
                            />
                        </div>

                        <div>
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <Github className="w-4 h-4" />
                                GitHub
                            </Label>
                            <Input
                                value={data?.socialLinks.github || ""}
                                onChange={(e) => updateSocialLinks({ github: e.target.value })}
                                placeholder="https://github.com/yourusername"
                                type="url"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
