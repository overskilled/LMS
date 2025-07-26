"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Menu, HelpCircle } from "lucide-react";

// Icons
import {
    LayoutDashboard,
    Package,
    HandPlatter,
    Sheet,
    FileChartPie,
    FileDiff,
    Coins,
    ShoppingCartIcon,
    FileUp,
    FileText,
    FileSymlink,
    ReceiptText,
    FileUser,
    ShoppingBag,
    ShoppingBasketIcon,
    UserPlus,
    ChartCandlestick,
    CirclePlus,
    CircleMinus,
} from "lucide-react";
import { useAuth } from "@/context/authContext";
import Image from "next/image";

// Sidebar config
// t: ReturnType<typeof useI18n>
const sidebarData = () => [
    {
        title: "Dashboard",
        icon: LayoutDashboard,
        href: "/admin",
    },
    {
        title: "Courses",
        icon: Package,
        items: [
            { label: "productList", href: "/admin/courses", icon: Package },
        ],
    }
];

export function AppSidebar() {
    const { state, toggleSidebar } = useSidebar();
    const isOpen = state === "expanded";
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading } = useAuth();

    const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);

    const handleToggle = (title: string) => {
        setOpenDropdown((prev) => (prev === title ? null : title));
    };

    const sidebarItems = sidebarData();

    return (
        <Sidebar collapsible="icon" className="border-r bg-white dark:bg-gray-950 shadow-sm">
            <SidebarHeader className="flex items-center justify-between px-4 py-2 border-b">
                <Image src={"/nmd-logo.webp"} alt="nmd logo" width={100} height={100} />
                {/* <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
                    <Menu className="h-5 w-5" />
                </Button> */}
            </SidebarHeader>
            <SidebarContent className="overflow-y-auto px-2 py-4">
                <SidebarGroup className="space-y-2">
                    {sidebarItems.map((section) =>
                        section.items ? (
                            <div key={section.title}>
                                <button
                                    onClick={() => handleToggle(section.title)}
                                    className="w-full flex items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
                                >
                                    <div className="flex items-center gap-2">
                                        <section.icon className="h-4 w-4" />
                                        {isOpen && <span>{section.title}</span>}
                                    </div>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ rotate: 0 }}
                                            animate={{ rotate: openDropdown === section.title ? 90 : 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            ▸
                                        </motion.div>
                                    )}
                                </button>
                                {openDropdown === section.title && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: "auto" }}
                                        transition={{ duration: 0.3 }}
                                        className="ml-4 mt-1 space-y-1"
                                    >
                                        {section.items.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-all hover:bg-gray-100 dark:hover:bg-gray-800 ${pathname === item.href ? "bg-gray-200 dark:bg-gray-800 font-semibold" : ""
                                                    }`}
                                            >
                                                <item.icon className="h-4 w-4" />
                                                {isOpen && <span>{item.label}</span>}
                                            </Link>
                                        ))}
                                    </motion.div>
                                )}
                            </div>
                        ) : (
                            <Link
                                key={section.href}
                                href={section.href}
                                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-gray-100 dark:hover:bg-gray-800 ${pathname === section.href ? "bg-gray-200 dark:bg-gray-800 font-semibold" : ""
                                    }`}
                            >
                                <section.icon className="h-4 w-4" />
                                {isOpen && <span>{section.title}</span>}
                            </Link>
                        )
                    )}
                </SidebarGroup>

                <SidebarGroup className="mt-8">
                    <SidebarMenu>
                        {/* {isOpen && (
                            <SidebarMenuItem>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <SubscriptionCard
                                                subscription={loading ? undefined : user?.subscription}
                                                isLoading={loading}
                                                onManageClick={() => router.push("/profile")}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className={isOpen ? "hidden" : "block"}>
                                            {t("sidebar.help")}
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </SidebarMenuItem>
                        )} */}
                        <SidebarMenuItem>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        >
                                            <HelpCircle className="h-4 w-4 mr-2" />
                                            {isOpen && <span>help</span>}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">help</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <SidebarMenuButton asChild className="w-full justify-start">
                                            {/* <LogoutButton /> */}
                                        </SidebarMenuButton>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">logout</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
