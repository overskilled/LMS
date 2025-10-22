"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function AffiliateForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fileName, setFileName] = useState<string>("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    otherCountry: "",
    company: "",
    website: "",
    documentType: "",
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"]
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a JPG, PNG, or PDF file.")
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Please upload a file smaller than 5MB.")

        return
      }

      setFileName(file.name)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    toast.success("We'll review your application and get back to you within 2-3 business days.")


    setIsSubmitting(false)

    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      country: "",
      otherCountry: "",
      company: "",
      website: "",
      documentType: "",
    })
    setFileName("")
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-2xl">Application Form</CardTitle>
        <CardDescription>Please provide accurate information. All fields marked with * are required.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                1
              </span>
              <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john.doe@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+237680463509"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">
                Country <span className="text-destructive">*</span>
              </Label>
              <Select
                required
                value={formData.country}
                onValueChange={(value) => setFormData({ ...formData, country: value, otherCountry: "" })}
              >
                <SelectTrigger id="country">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dz">Algeria</SelectItem>
                  <SelectItem value="ao">Angola</SelectItem>
                  <SelectItem value="bj">Benin</SelectItem>
                  <SelectItem value="bw">Botswana</SelectItem>
                  <SelectItem value="bf">Burkina Faso</SelectItem>
                  <SelectItem value="bi">Burundi</SelectItem>
                  <SelectItem value="cm">Cameroon</SelectItem>
                  <SelectItem value="cv">Cape Verde</SelectItem>
                  <SelectItem value="cf">Central African Republic</SelectItem>
                  <SelectItem value="td">Chad</SelectItem>
                  <SelectItem value="km">Comoros</SelectItem>
                  <SelectItem value="cg">Congo</SelectItem>
                  <SelectItem value="cd">Democratic Republic of the Congo</SelectItem>
                  <SelectItem value="ci">Côte d'Ivoire</SelectItem>
                  <SelectItem value="dj">Djibouti</SelectItem>
                  <SelectItem value="eg">Egypt</SelectItem>
                  <SelectItem value="gq">Equatorial Guinea</SelectItem>
                  <SelectItem value="er">Eritrea</SelectItem>
                  <SelectItem value="sz">Eswatini</SelectItem>
                  <SelectItem value="et">Ethiopia</SelectItem>
                  <SelectItem value="ga">Gabon</SelectItem>
                  <SelectItem value="gm">Gambia</SelectItem>
                  <SelectItem value="gh">Ghana</SelectItem>
                  <SelectItem value="gn">Guinea</SelectItem>
                  <SelectItem value="gw">Guinea-Bissau</SelectItem>
                  <SelectItem value="ke">Kenya</SelectItem>
                  <SelectItem value="ls">Lesotho</SelectItem>
                  <SelectItem value="lr">Liberia</SelectItem>
                  <SelectItem value="ly">Libya</SelectItem>
                  <SelectItem value="mg">Madagascar</SelectItem>
                  <SelectItem value="mw">Malawi</SelectItem>
                  <SelectItem value="ml">Mali</SelectItem>
                  <SelectItem value="mr">Mauritania</SelectItem>
                  <SelectItem value="mu">Mauritius</SelectItem>
                  <SelectItem value="ma">Morocco</SelectItem>
                  <SelectItem value="mz">Mozambique</SelectItem>
                  <SelectItem value="na">Namibia</SelectItem>
                  <SelectItem value="ne">Niger</SelectItem>
                  <SelectItem value="ng">Nigeria</SelectItem>
                  <SelectItem value="rw">Rwanda</SelectItem>
                  <SelectItem value="st">São Tomé and Príncipe</SelectItem>
                  <SelectItem value="sn">Senegal</SelectItem>
                  <SelectItem value="sc">Seychelles</SelectItem>
                  <SelectItem value="sl">Sierra Leone</SelectItem>
                  <SelectItem value="so">Somalia</SelectItem>
                  <SelectItem value="za">South Africa</SelectItem>
                  <SelectItem value="ss">South Sudan</SelectItem>
                  <SelectItem value="sd">Sudan</SelectItem>
                  <SelectItem value="tz">Tanzania</SelectItem>
                  <SelectItem value="tg">Togo</SelectItem>
                  <SelectItem value="tn">Tunisia</SelectItem>
                  <SelectItem value="ug">Uganda</SelectItem>
                  <SelectItem value="zm">Zambia</SelectItem>
                  <SelectItem value="zw">Zimbabwe</SelectItem>
                  <SelectItem value="other">Other (Please specify)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.country === "other" && (
              <div className="space-y-2">
                <Label htmlFor="otherCountry">
                  Please specify your country <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="otherCountry"
                  required
                  value={formData.otherCountry}
                  onChange={(e) => setFormData({ ...formData, otherCountry: e.target.value })}
                  placeholder="Enter your country"
                />
              </div>
            )}
          </div>


          {/* Identity Verification Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                2
              </span>
              <h3 className="text-lg font-semibold text-foreground">Identity Verification</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentType">
                Document Type <span className="text-destructive">*</span>
              </Label>
              <Select
                required
                value={formData.documentType}
                onValueChange={(value) => setFormData({ ...formData, documentType: value })}
              >
                <SelectTrigger id="documentType">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="national-id">National ID Card</SelectItem>
                  <SelectItem value="drivers-license">Driver&apos;s License</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="document">
                Upload Document <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-4">
                <label
                  htmlFor="document"
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Upload className="h-4 w-4" />
                  Choose File
                </label>
                <input
                  id="document"
                  type="file"
                  required
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  className="sr-only"
                />
                {fileName && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>{fileName}</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Accepted formats: JPG, PNG, PDF (max 5MB)</p>
            </div>
          </div>

          {/* Terms and Submit */}
          <div className="space-y-4 border-t border-border pt-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              By submitting this form, you acknowledge that you have read and agree to our{" "}
              <Link
                href="/terms"
                target="_blank"
                className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                target="_blank"
                className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </Link>
              .
            </p>

            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
