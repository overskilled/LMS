"use client";

import { useEffect, useState } from 'react';
import { ChevronDown, Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { LogoutButton } from '@/components/custom/logoutButton';
import { useAuth } from '@/context/authContext';

const UserDropdownMenu = () => {
    const { user } = useAuth()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                    {/* <img
                        src={userData?.photoURL || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                        alt={userData?.name || t("userDropdown.userProfile")} // Translated alt text
                        className="h-8 w-8 rounded-full"
                    /> */}

                    <div className="text-left">
                        {user?.name ? (
                            <div className="text-sm font-medium">{user.name}</div>
                        ) : (
                            <Skeleton className="h-5 w-24 rounded" />
                        )}
                    </div>
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem>
                    <Link href="/earnings">
                        <Button variant="ghost" className="w-full justify-start">
                            <Users className="mr-2 h-4 w-4" />
                            <span>My Profile</span> {/* Translated text */}
                        </Button>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    {/* <Link href="/dashboard/settings"> */}
                        <Button variant="ghost" className="w-full justify-start">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span> {/* Translated text */}
                        </Button>
                    {/* </Link> */}
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <LogoutButton />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UserDropdownMenu;