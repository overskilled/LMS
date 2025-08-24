import HeroSection from "../../components/hero-section"

import MainLayout from "./main-layout"
import { useAuth } from "@/context/authContext"
import WhatsAppFloating from "@/components/custom/WhatappButton"
import PublishedCourseListing from "@/components/published-courses"

export default function Page() {


  return (
    <MainLayout>
      
      <HeroSection />

      <PublishedCourseListing />

      <WhatsAppFloating />

    </MainLayout>
  )
}
