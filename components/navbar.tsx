"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { ChevronDown, Search, User } from "lucide-react"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import UserDropdownMenu from "@/app/admin/components/UserDropdownMenu"

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const userInfo = localStorage.getItem('user-info')
    if (userInfo) {
      try {
        setUser(JSON.parse(userInfo))
      } catch (e) {
        console.error("Error parsing user info", e)
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user-info')
    setUser(null)
    // Optional: Redirect to login page
    window.location.href = '/login'
  }

  return (
    <header className="sticky top-0 z-50 flex h-20 items-center justify-between px-12 md:px-8 py-6 border-b bg-white shadow-sm">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold" prefetch={false}>
          <Image src="/nmd-logo.webp" alt="NMD LMS Logo" width={150} height={24} />
          <span className="rounded-xl bg-blue-100 px-2 py-1 text-sm font-medium text-neutral-900">
            Courses
          </span>
        </Link>
      </div>

      <div className="relative flex-1 max-w-md mx-4 hidden lg:block">
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-full pl-4 pr-10 bg-gray-100 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full"
        >
          <Search className="h-5 w-5 text-gray-500" />
          <span className="sr-only">Search</span>
        </Button>
      </div>

      <nav className="flex items-center gap-4">
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-1 text-gray-700 hover:text-blue-600">
              Course
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Free course</DropdownMenuItem>
            <DropdownMenuItem>Premium course</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}

        {/* <Link
          href="#"
          className="text-sm font-medium text-gray-700 hover:text-blue-600 hidden md:block"
          prefetch={false}
        >
          Become an Instructor
        </Link> */}

        {isClient && user ? (
          // <Popover>
          //   <PopoverTrigger asChild>
          //     <Button variant="ghost" className="flex items-center gap-2">
          //       <Avatar className="h-8 w-8">
          //         <AvatarImage src={user.avatar || undefined} />
          //         <AvatarFallback>
          //           {user.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
          //         </AvatarFallback>
          //       </Avatar>
          //       <span className="hidden md:inline">{user.name || user.email}</span>
          //     </Button>
          //   </PopoverTrigger>
          //   <PopoverContent className="w-48 p-2">
          //     <DropdownMenuItem>
          //       <Link href="/profile" className="w-full">
          //         Profile
          //       </Link>
          //     </DropdownMenuItem>
          //     <DropdownMenuItem>
          //       <Link href="/my-courses" className="w-full">
          //         My Courses
          //       </Link>
          //     </DropdownMenuItem>
          //     <DropdownMenuItem onClick={handleLogout}>
          //       Logout
          //     </DropdownMenuItem>
          //   </PopoverContent>
          // </Popover>
          <UserDropdownMenu />
        ) : (
          <div className="hidden md:flex items-center gap-2 border-l pl-4 ml-4">
            <Link href="/login">
              <Button variant="secondary">
                Log In
              </Button>
            </Link>
            <Link href="/register">
              <Button>Sign Up</Button>
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}