"use client";

import React from "react";
import Image from "next/image";
import { Globe, Laptop, Search, User } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative bg-[#f8f9fd] px-6 md:px-20 py-16 flex flex-col items-center text-center overflow-hidden">
      {/* Left floating images */}
      {/* <div className="absolute left-8 top-12 flex flex-col gap-4">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden w-20 h-20">
          <Image
            src="/images/student1.jpg"
            alt="Student 1"
            width={80}
            height={80}
            className="object-cover"
          />
        </div>
        <div className="bg-white shadow-lg rounded-xl overflow-hidden w-28 h-36">
          <Image
            src="/images/student2.jpg"
            alt="Student 2"
            width={112}
            height={144}
            className="object-cover"
          />
        </div>
      </div> */}

      {/* Right floating image with notification */}
      {/* <div className="absolute right-8 top-16 w-44 h-56 bg-white rounded-xl shadow-lg overflow-hidden">
        <Image
          src="/images/student3.jpg"
          alt="Student 3"
          width={176}
          height={224}
          className="object-cover"
        />
        <div className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-2 w-[220px]">
          <div className="bg-green-500 p-2 rounded-full text-white">
            <i className="lucide lucide-users"></i>
          </div>
          <p className="text-xs text-gray-700 text-left">
            Congratulations to Sophia <span className="font-semibold">for being student</span> of the week this week!
          </p>
        </div>
      </div> */}

      {/* Heading */}
      <h1 className="text-4xl font-bold text-gray-900 leading-tight">
        Learn Something <span className="text-blue-600">New</span> Today
      </h1>

      {/* Search bar */}
      <div className="mt-6 flex items-center bg-white rounded-lg shadow-md w-full max-w-lg px-4 py-3">
        <input
          type="text"
          placeholder="What do you want to learn?"
          className="flex-1 outline-none text-gray-700 text-sm"
        />
        <Search className="text-gray-500 w-5 h-5" />
      </div>

      {/* Features */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
        <div className="flex flex-col items-center">
          <Globe />
          <h3 className="mt-2 font-semibold text-gray-900">Fully Online Courses</h3>
          <p className="text-gray-500 text-sm text-center">Explore wide-range of online courses</p>
        </div>
        <div className="flex flex-col items-center">
          <User />
          <h3 className="mt-2 font-semibold text-gray-900">Tailored-made</h3>
          <p className="text-gray-500 text-sm text-center">Learn from the best experts of the subjects</p>
        </div>
        <div className="flex flex-col items-center">
          <Laptop />
          <h3 className="mt-2 font-semibold text-gray-900">Portable Programs</h3>
          <p className="text-gray-500 text-sm text-center">Allow you to learn anywhere, anytime</p>
        </div>
      </div>
    </section>
  )
}
