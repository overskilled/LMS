"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { ChevronDown, Search, User, Menu } from "lucide-react"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import UserDropdownMenu from "@/app/[locale]/admin/components/UserDropdownMenu"
import LanguageSelector from "./LanguageSelector"
import { useAuth } from "@/context/authContext"

export default function Navbar() {
  const [isClient, setIsClient] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="sticky top-0 z-50 w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 py-2 border-b bg-white shadow-sm">
      {/* Mobile menu button */}
      <div className="flex lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-gray-700"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </div>

      {/* Logo */}
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold" prefetch={false}>
          <Image
            src="/nmd-logo.webp"
            alt="NMD LMS Logo"
            width={100}
            height={24}
          />
          <span className="hidden sm:inline rounded-xl bg-blue-100 px-2 py-1 text-sm font-medium text-neutral-900">
            Courses
          </span>
        </Link>
        <LanguageSelector />
      </div>

      {/* Search bar - hidden on mobile */}
      {/* <div className="relative flex-1 max-w-md mx-4 hidden lg:block">
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
      </div> */}

      {/* Desktop navigation */}
      <nav className="hidden lg:flex items-center gap-4">
        {user ? (
          <div className="flex flex-row gap-2">
            <Link href="/become-affiliate">
              <Button size="sm">
                Become Affiliate
              </Button>
            </Link>
            <UserDropdownMenu />
          </div>
        ) : (
          <div className="flex items-center gap-2 border-l pl-4 ml-4">
            <Link href="/login">
              <Button variant="secondary" size="sm">
                Log In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        )}
      </nav>

      {/* Mobile search button */}
      {/* <div className="flex lg:hidden">
        <Button variant="ghost" size="icon" className="text-gray-700">
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>
      </div> */}

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="absolute lg:hidden top-16 left-0 right-0 bg-white shadow-lg border-t py-4 px-4">
          {/* <div className="mb-4">
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-full pl-4 pr-10 bg-gray-100 border-none"
            />
          </div> */}

          {isClient && user ? (
            <div className="space-y-2">
              <Link href="/earnings" className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded">
                Profile
              </Link>
              <Link href="/my-courses" className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded">
                My Courses
              </Link>
              <Link href="/become-affiliate">
                <Button variant="secondary" size="sm">
                  Become Affiliate
                </Button>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <LanguageSelector />
              <Link href="/login">
                <Button variant="secondary" className="w-full">
                  Log In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="w-full">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}