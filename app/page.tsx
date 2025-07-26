import HeroSection from "../components/hero-section"
import TopCategories from "@/components/top-categories"
import CourseListing from "@/components/course-list"
import TestimonialsSection from "@/components/testimonials"
import Cta from "@/components/cta"
import MainLayout from "./main-layout"

export default function Page() {
  return (
    <MainLayout>
      <HeroSection />
      <TopCategories />
      <CourseListing />
      <TestimonialsSection />
      <Cta />
    </MainLayout>
  )
}
