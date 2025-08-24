"use client";

import React from "react";
import { Globe, Laptop, Search, User } from "lucide-react";
import { useI18n } from "@/locales/client";

export default function HeroSection() {
  const t = useI18n();

  return (
    <section className="relative bg-[#f8f9fd] px-6 md:px-20 w-full py-16 flex flex-col items-center text-center overflow-hidden">
      {/* Heading */}
      <h1 className="text-4xl font-bold text-gray-900 leading-tight">
        {t("hero.title")}{" "}
        <span className="text-blue-600">{t("hero.highlight")}</span>{" "}
        {t("hero.subtitle")}
      </h1>

      {/* Search bar */}
      <div className="mt-6 flex items-center bg-white rounded-lg shadow-md w-full max-w-lg px-4 py-3">
        <input
          type="text"
          placeholder={t("hero.searchPlaceholder")}
          className="flex-1 outline-none text-gray-700 text-sm"
        />
        <Search className="text-gray-500 w-5 h-5" />
      </div>

      {/* Features */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
        <div className="flex flex-col items-center">
          <Globe />
          <h3 className="mt-2 font-semibold text-gray-900">
            {t("hero.features.online.title")}
          </h3>
          <p className="text-gray-500 text-sm text-center">
            {t("hero.features.online.description")}
          </p>
        </div>
        <div className="flex flex-col items-center">
          <User />
          <h3 className="mt-2 font-semibold text-gray-900">
            {t("hero.features.tailored.title")}
          </h3>
          <p className="text-gray-500 text-sm text-center">
            {t("hero.features.tailored.description")}
          </p>
        </div>
        <div className="flex flex-col items-center">
          <Laptop />
          <h3 className="mt-2 font-semibold text-gray-900">
            {t("hero.features.portable.title")}
          </h3>
          <p className="text-gray-500 text-sm text-center">
            {t("hero.features.portable.description")}
          </p>
        </div>
      </div>
    </section>
  );
}
