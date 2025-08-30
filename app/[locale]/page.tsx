import HeroSection from "../../components/hero-section"

import MainLayout from "./main-layout"
import { useAuth } from "@/context/authContext"
import WhatsAppFloating from "@/components/custom/WhatappButton"
import PublishedCourseListing from "@/components/published-courses"
import PartnerSection from "@/components/partner-section"
import TestimonialsSection from "@/components/testimonials"

export default function Page() {


  return (
    <MainLayout>
      
      <HeroSection />

      <PublishedCourseListing />

      <PartnerSection />

      <TestimonialsSection />

      <WhatsAppFloating />

    </MainLayout>
  )
}
