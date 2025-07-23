import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import {  ChevronDown, Search } from "lucide-react"

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 flex h-20 items-center justify-between px-12 md:px-8 py-6 border-b bg-white shadow-sm">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold" prefetch={false}>
          <Image src="/images/edumall-logo.png" alt="NMD LMS Logo" width={200} height={24} />
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-1 text-gray-700 hover:text-blue-600">
              Course
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Free course</DropdownMenuItem>
            <DropdownMenuItem>Premuim course</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Link
          href="#"
          className="text-sm font-medium text-gray-700 hover:text-blue-600 hidden md:block"
          prefetch={false}
        >
          Become an Instructor
        </Link>
        {/* <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5 text-gray-700" />
          <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs bg-blue-600 text-white">
            3
          </Badge>
          <span className="sr-only">Shopping Cart</span>
        </Button> */}
        <div className="hidden md:flex items-center gap-2 border-l pl-4 ml-4">
          <Button variant="secondary">
            Log In
          </Button>
          <Button>Sign Up</Button>
        </div>
      </nav>
    </header>
  )
}
