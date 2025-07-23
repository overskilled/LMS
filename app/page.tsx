import HeroSection from "../components/hero-section"
import TopCategories from "@/components/top-categories"
import CourseListing from "@/components/course-list"
import TestimonialsSection from "@/components/testimonials"
import Cta from "@/components/cta"

export default function Page() {
  return (
    <>
      <HeroSection />
      <TopCategories />
      <CourseListing />
      <TestimonialsSection />
      <Cta />
    </>
  )
}
