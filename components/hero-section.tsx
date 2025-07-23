import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="flex  w-full py-4 md:py-8 lg:py-5 bg-white overflow-hidden">
      <div className="grid mx-10 lg:grid-cols-2 gap-4 px-8 md:px-8">
        {/* Left Content */}
        <div className="flex flex-col justify-center space-y-6">
          <p className="text-sm font-semibold uppercase text-blue-600 tracking-wider">START TO SUCCESS</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
            Access To{" "}
            <span className="text-blue-600 relative inline-block">
              5500+
              <span className="absolute left-0 right-0 bottom-0 h-1 bg-yellow-400 rounded-full -mb-1"></span>
            </span>{" "}
            Courses from{" "}
            <span className="text-blue-600 relative inline-block">
              480
              <span className="absolute left-0 right-0 bottom-0 h-1 bg-yellow-400 rounded-full -mb-1"></span>
            </span>{" "}
            Instructors & Institutions
          </h1>
          <p className="max-w-[600px] text-lg text-gray-600 md:text-xl">
            Take your learning organisation to the next level.
          </p>
          <div className="relative w-full max-w-md">
            <Input
              type="search"
              placeholder="What do you want to learn?"
              className="w-full rounded-full pl-6 pr-12 py-6 text-lg shadow-md border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          </div>
        </div>

        {/* Right Images */}
        <div className="relative flex items-center justify-center lg:justify-end min-h-[400px] lg:min-h-[500px]">
          {/* Background patterns - simplified */}
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-50 opacity-50 rounded-full blur-3xl hidden lg:block"></div>
          <div className="absolute -top-10 -right-10 w-60 h-60 bg-yellow-50 opacity-50 rounded-full blur-3xl hidden lg:block"></div>
          <div className="absolute bottom-10 left-1/4 w-20 h-20 bg-blue-100 opacity-50 rounded-full blur-2xl hidden lg:block"></div>

          <Image
            src="/banner.png"
            width={500}
            height={300}
            alt="Woman smiling working on laptop"
            className="rounded-lg object-cover w-full h-auto"
          />
        </div>
      </div>

      {/* Floating side buttons */}
      {/* <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-50">
        <Button variant="outline" size="icon" className="rounded-full shadow-md bg-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-x"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
          <span className="sr-only">Close</span>
        </Button>
        <Button variant="outline" size="icon" className="rounded-full shadow-md bg-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-globe"
          >
            <circle cx="12" cy="12" r="10" />
          </svg>
          <span className="sr-only">Globe</span>
        </Button>
      </div> */}
    </section>
  )
}
