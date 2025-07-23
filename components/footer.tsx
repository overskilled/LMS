"use client"

import { Button } from "./ui/button";

const Footer = () => {
    const footerNavs = [
        {
            label: "Company",
            items: [
                {
                    href: "javascript:void()",
                    name: "Partners",
                },
                {
                    href: "javascript:void()",
                    name: "Blog",
                },
                {
                    href: "javascript:void()",
                    name: "Team",
                },
                {
                    href: "javascript:void()",
                    name: "Careers",
                },
            ],
        },
        {
            label: "Resources",
            items: [
                {
                    href: "javascript:void()",
                    name: "contact",
                },
                {
                    href: "javascript:void()",
                    name: "Support",
                },
                {
                    href: "javascript:void()",
                    name: "Docs",
                },
                {
                    href: "javascript:void()",
                    name: "Pricing",
                },
            ],
        },
        {
            label: "About",
            items: [
                {
                    href: "javascript:void()",
                    name: "Terms",
                },
                {
                    href: "javascript:void()",
                    name: "License",
                },
                {
                    href: "javascript:void()",
                    name: "Privacy",
                },
                {
                    href: "javascript:void()",
                    name: "About US",
                },
            ],
        },
    ];

    return (
        <footer className="text-gray-500 bg-white px-4 py-5 mt-5 max-w-screen-xl mx-auto md:px-8">
            <div className="gap-6 justify-between md:flex">
                <div className="flex-1">
                    <div className="max-w-xs">
                        <img src="" className="w-32" />
                        <p className="leading-relaxed mt-2 text-[15px]">
                            Lorem Ipsum has been the industry's standard dummy text ever since
                            the 1500s.
                        </p>
                    </div>
                    <form onSubmit={(e) => e.preventDefault()}>
                        <label className="block pt-4 pb-2">Stay up to date</label>
                        <div className="max-w-sm flex items-center border rounded-md p-1">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full p-2.5 outline-none"
                            />
                            <Button size="lg">
                                Subscribe
                            </Button>
                        </div>
                    </form>
                </div>
                <div className="flex-1 mt-10 space-y-6 items-center justify-between sm:flex md:space-y-0 md:mt-0">
                    {footerNavs.map((item, idx) => (
                        <ul className="space-y-4" key={idx}>
                            <h4 className="text-gray-800 font-medium">{item.label}</h4>
                            {item.items.map((el, idx) => (
                                <li key={idx}>
                                    <a
                                        href={el.href}
                                        className="hover:underline hover:text-indigo-600"
                                    >
                                        {el.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    ))}
                </div>
            </div>
            <div className="mt-8 py-6 border-t items-center justify-between sm:flex">
                <div className="mt-4 sm:mt-0">
                    &copy; 2025 Nanosatallite Missions Design All rights reserved.
                </div>
                <div className="mt-6 sm:mt-0">
                    <ul className="flex items-center space-x-4">
                        <li className="w-10 h-10 border rounded-full flex items-center justify-center">
                            <a href="javascript:void()">
                                <svg
                                    className="w-6 h-6 text-green-500"
                                    fill="currentColor"
                                    viewBox="0 0 32 32"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.517.746 4.85 2.034 6.801L4 29l7.35-1.967A11.938 11.938 0 0016 27c6.627 0 12-5.373 12-12S22.627 3 16.001 3zm0 21.917c-1.99 0-3.835-.582-5.385-1.575l-.385-.243-4.363 1.17 1.162-4.246-.251-.394A9.941 9.941 0 016.05 15c0-5.507 4.444-9.95 9.95-9.95 5.507 0 9.951 4.443 9.951 9.95s-4.444 9.917-9.951 9.917zm5.572-7.457c-.305-.152-1.803-.89-2.083-.99-.279-.102-.48-.152-.68.152-.198.304-.78.99-.957 1.192-.178.203-.353.229-.658.076-.305-.152-1.289-.474-2.456-1.513-.907-.806-1.52-1.803-1.697-2.107-.177-.304-.019-.468.133-.62.137-.137.305-.355.457-.533.152-.178.203-.305.305-.508.102-.203.051-.38-.025-.533-.076-.152-.68-1.637-.932-2.243-.244-.58-.492-.501-.68-.511l-.58-.01c-.203 0-.533.076-.812.38-.279.305-1.065 1.04-1.065 2.534 0 1.493 1.09 2.938 1.242 3.142.152.203 2.144 3.28 5.2 4.596.727.313 1.294.5 1.735.639.729.231 1.393.199 1.918.121.585-.087 1.803-.738 2.058-1.45.254-.711.254-1.32.177-1.45-.076-.127-.279-.203-.584-.355z" />
                                </svg>

                            </a>
                        </li>

                        <li className="w-10 h-10 border rounded-full flex items-center justify-center">
                            <a href="javascript:void()">
                                <svg className="svg-icon w-6 h-6 text-blue-700" viewBox="0 0 20 20">
                                    <path
                                        fill="none"
                                        d="M11.344,5.71c0-0.73,0.074-1.122,1.199-1.122h1.502V1.871h-2.404c-2.886,0-3.903,1.36-3.903,3.646v1.765h-1.8V10h1.8v8.128h3.601V10h2.403l0.32-2.718h-2.724L11.344,5.71z"
                                    ></path>
                                </svg>
                            </a>
                        </li>

                        <li className="w-10 h-10 border rounded-full flex items-center justify-center">
                            <a href="javascript:void()">
                                <svg
                                    className="w-6 h-6 text-blue-600"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 
    0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 
    0-1.75-.79-1.75-1.764s.784-1.764 
    1.75-1.764c.966 0 1.75.79 1.75 
    1.764s-.784 1.764-1.75 1.764zm13.5 11.268h-3v-5.604c0-1.337-.026-3.063-1.867-3.063-1.868 
    0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.762 
    1.379-1.562 2.837-1.562 3.032 0 3.592 1.995 3.592 
    4.59v5.605z" />
                                </svg>

                            </a>
                        </li>

                        <li className="w-10 h-10 border rounded-full flex items-center justify-center">
                            <a href="javascript:void()">
                                <svg
                                    className="w-6 h-6 text-pink-600"
                                    fill="black"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M12.75 0h3.375a4.125 4.125 0 004.125 4.125v3.375a7.5 7.5 0 01-4.125-1.252v7.184a6.75 
    6.75 0 11-6.75-6.75h.75v3.375h-.75a3.375 3.375 0 103.375 3.375V0z" />
                                </svg>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            <style jsx>{`
        .svg-icon path,
        .svg-icon polygon,
        .svg-icon rect {
          fill: currentColor;
        }
      `}</style>
        </footer>
    );
}

export default Footer