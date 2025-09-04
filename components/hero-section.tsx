"use client";

import React from "react";
import { ExternalLink } from "lucide-react";
import { useI18n } from "@/locales/client";
import { Button } from "./ui/button";
import Link from "next/link";

export default function HeroSection() {
  const t = useI18n();

  return (
    <section className="relative h-screen w-full overflow-hidden py-16">
      {/* Background pattern */}
      <div className="absolute inset-0 flex items-center justify-center opacity-100">
        <img
          alt="background"
          src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/patterns/square-alt-grid.svg"
          className="[mask-image:radial-gradient(75%_75%_at_center,white,transparent)] opacity-90 w-full h-full object-cover"
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex h-full w-full items-center justify-center">
        <div className="mx-auto flex w-full max-w-screen-xl flex-col items-center gap-6 text-center px-4">
          <div className="rounded-xl bg-background/30 p-4 shadow-sm backdrop-blur-sm">
            <img
              src="/spaceship.webp"
              alt="logo"
              className="h-16 w-16 rounded-full object-cover"
            />
          </div>

          <h1 className="mb-6 text-3xl font-extrabold leading-tight tracking-tight lg:text-6xl">
            {t("hero.title")} <span className="text-primary">NMD</span> & Partners
          </h1>

          <p className="mx-auto max-w-3xl text-muted-foreground lg:text-xl">
            {t("hero.subtitle")}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href={"/register"}>
              <Button className="shadow-sm transition-shadow hover:shadow">
                {t("hero.getStarted")}
              </Button>
            </Link>
            <Link href={"/login"}>
              <Button variant="outline" className="group">
                {t("hero.login")}{" "}
                <ExternalLink className="ml-2 h-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
