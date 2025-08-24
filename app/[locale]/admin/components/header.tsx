import {
    Package,
    Search,
    Bell,
    Mail,
    Menu,
    ShoppingCartIcon,
    User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";
import UserDropdownMenu from "./UserDropdownMenu";


const Header = () => {



    return (
        <header className="bg-white shadow-sm z-10 dark:bg-[#141E2D]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    <div className="flex items-center space-x-4 flex-1">
                        {/* <div
                            className="relative flex-1  max-w-xl"
                        >
                            <Input
                                type="search"
                                placeholder=""
                                className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div> */}
                    </div>
                    <div className="flex items-center space-x-4">
                        
                        {/* <DarkModeSelector /> */}
                        {/* <LanguageSelector /> */}
                        {/* <Button variant="outline" size="icon" className="relative">
                            <Mail className="h-5 w-5" />
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
                        </Button> */}
                        {/* <Button variant="outline" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">0</span>
                        </Button> */}
                        <User />
                        <UserDropdownMenu />
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header