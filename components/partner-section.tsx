import React from "react";
import { Marquee, MarqueeContent, MarqueeItem } from "./ui/shadcn-io/marquee";
import { getI18n } from "@/locales/server";

export default async function PartnerSection() {
    const t = await getI18n()

    const partner = [
        { title: "AAC", image: "/partner-logos/logo AAC.webp" },
        // {title: "Eureka", image: "/partner-logos/logo Eureka.webp"},
        { title: "Geo", image: "/partner-logos/logo geo.webp" },
        { title: "Astro logo", image: "/partner-logos/logo-astro-logo.webp" },
        { title: "logo cndt", image: "/partner-logos/logo-cndt.webp" },
        { title: "logo jfn", image: "/partner-logos/logo-jfn.webp" },
        { title: "lacuna", image: "/partner-logos/logo-lacuna.webp" },
        { title: "turtle", image: "/partner-logos/logo-turtle.webp" },
        { title: "logo", image: "/partner-logos/logo1.webp" },

    ]

    return (
        <div className="flex flex-col py-16">
            <div className="flex flex-col px-16 py-10 md:flex-row md:items-center md:justify-between mb-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold relative inline-block mb-4 md:mb-0">
                    {t("partners")}
                    <span className="absolute left-0 right-0 bottom-0 h-1 bg-yellow-400 rounded-full -mb-2" />
                </h2>
            </div>

            <div className="flex py-8">
                <Marquee>
                    <MarqueeContent>
                        {partner.map((item, index) => (
                            <MarqueeItem className="h-36 w-36 ml-10" key={index}>
                                <img
                                    alt={`Placeholder ${index}`}
                                    className="overflow-hidden rounded-full h-36 w-36"
                                    src={item.image}
                                />
                            </MarqueeItem>
                        ))}
                    </MarqueeContent>
                </Marquee>
            </div>
        </div>
    )
}