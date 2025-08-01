"use client"

import { Button } from "./ui/button"

const Footer = () => {
    const footerNavs = [
        {
            label: "Company",
            items: [
                { href: "#", name: "Partners" },
                { href: "#", name: "Blog" },
                { href: "#", name: "Team" },
                { href: "#", name: "Careers" },
            ],
        },
        {
            label: "Resources",
            items: [
                { href: "#", name: "Contact" },
                { href: "#", name: "Support" },
                { href: "#", name: "Docs" },
                { href: "#", name: "Pricing" },
            ],
        },
        {
            label: "About",
            items: [
                { href: "#", name: "Terms" },
                { href: "#", name: "License" },
                { href: "#", name: "Privacy" },
                { href: "#", name: "About Us" },
            ],
        },
    ];

    return (
        <footer className="text-gray-500 bg-white px-4 py-8 sm:px-6 md:px-8 lg:px-12 max-w-screen-xl mx-auto w-full">
            <div className="flex flex-col lg:flex-row gap-10 justify-between">
                {/* Left Section */}
                <div className="flex-1 max-w-md">
                    <div className="max-w-xs">
                        <img
                            src="/nmd-logo.webp"
                            alt="Logo"
                            className="w-32 md:w-40 mb-3"
                        />
                        <p className="leading-relaxed text-sm sm:text-base">
                            NMD Courses online portal
                        </p>
                    </div>

                    <form onSubmit={(e) => e.preventDefault()} className="mt-5">
                        <label className="block pb-2 text-sm font-medium text-gray-700">
                            Stay up to date
                        </label>
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full flex-1 p-2.5 border rounded-md outline-none text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                            <Button
                                size="lg"
                                className="w-full sm:w-auto whitespace-nowrap"
                            >
                                Subscribe
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-6">
                    {footerNavs.map((item, idx) => (
                        <div key={idx} className="space-y-3">
                            <h4 className="text-gray-800 font-semibold text-base sm:text-lg">
                                {item.label}
                            </h4>
                            <ul className="space-y-2 text-sm sm:text-base">
                                {item.items.map((el, idx2) => (
                                    <li key={idx2}>
                                        <a
                                            href={el.href}
                                            className="hover:underline hover:text-indigo-600 transition-colors"
                                        >
                                            {el.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
                <div className="text-center sm:text-left text-gray-600">
                    &copy; {new Date().getFullYear()} Nanosatellite Missions Design. All rights reserved.
                </div>

                <div className="flex items-center justify-center sm:justify-end space-x-3 sm:space-x-4">
                    {[
                        {
                            name: "WhatsApp",
                            color: "text-green-500",
                            path: "M16.001 3C9.373 3 4 8.373..."
                        },
                        {
                            name: "Facebook",
                            color: "text-blue-700",
                            path: "M11.344,5.71c0-0.73,0.074-1.122..."
                        },
                        {
                            name: "LinkedIn",
                            color: "text-blue-600",
                            path: "M19 0h-14c-2.761 0-5 2.239..."
                        },
                        {
                            name: "Instagram",
                            color: "text-pink-600",
                            path: "M12.75 0h3.375a4.125 4.125..."
                        },
                    ].map((icon, index) => (
                        <a
                            key={index}
                            href="#"
                            className="w-8 h-8 sm:w-10 sm:h-10 border rounded-full flex items-center justify-center hover:bg-gray-100 transition"
                            aria-label={icon.name}
                        >
                            <svg
                                className={`w-5 h-5 sm:w-6 sm:h-6 ${icon.color}`}
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path d={icon.path} />
                            </svg>
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    );
}

export default Footer;