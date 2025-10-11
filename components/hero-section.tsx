"use client";

import React from "react";
import { ExternalLink } from "lucide-react";
import { useI18n } from "@/locales/client";
import { Button } from "./ui/button";
import Link from "next/link";

export default function HeroSection() {
  const t = useI18n();

  return (
    <section className="relative h-[50vh] w-full overflow-hidden py-8"> 
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
        <div className="mx-auto flex w-full max-w-screen-xl flex-col items-center gap-4 text-center px-4"> {/* Reduced gap from gap-6 to gap-4 */}
          <div className="rounded-xl bg-background/30 p-4 shadow-sm backdrop-blur-sm">
            <img
              src="/spaceship.webp"
              alt="logo"
              className="h-12 w-12 rounded-full object-cover"
            />
          </div>

          <h1 className="mb-4 text-2xl font-extrabold leading-tight tracking-tight lg:text-4xl"> {/* Reduced text size and margins */}
            {t("hero.title")} <span className="text-primary">NMD</span> & Partners
          </h1>

          <p className="mx-auto max-w-3xl text-muted-foreground lg:text-lg"> {/* Reduced text size */}
            {t("hero.subtitle")}
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-3"> {/* Reduced top margin */}
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