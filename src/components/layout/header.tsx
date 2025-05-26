'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search, ShoppingCart, User, Heart, Menu, LogOut, Package, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/contexts/auth-context'

export function Header() {
  const { totalItems } = useCart()
  const { user, userData, logout } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  return (
    <header className="bg-flipkart-blue text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="hidden lg:flex items-center justify-between py-2 text-xs">
          <div className="flex items-center space-x-4">
            <span>Download App</span>
            <span>Sell</span>
            <span>Customer Care</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Become a Seller</span>
            <span>More</span>
          </div>
        </div>
        
        {/* Main Header */}
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-xl font-bold">
              Flipkart
            </div>
            <div className="text-xs">
              <span className="italic">Explore</span>
              <span className="text-flipkart-yellow ml-1">Plus</span>
            </div>
          </Link>
          
          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Input
                type="text"
                placeholder="Search for products, brands and more"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white text-black pr-12 border-0"
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                className="absolute right-0 top-0 h-full px-3 text-flipkart-blue hover:bg-gray-100"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
          
          {/* Right Menu */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Mobile Search */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>
            
            {/* Authentication */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden md:flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{userData?.displayName || user.email?.split('@')[0] || 'User'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/profile?tab=orders')}>
                    <Package className="mr-2 h-4 w-4" />
                    <span>Orders</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/profile?tab=settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  {userData?.isAdmin && (
                    <DropdownMenuItem onClick={() => router.push('/admin')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button variant="ghost" className="hidden md:flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>Login</span>
                </Button>
              </Link>
            )}
            
            {/* Wishlist */}
            <Button variant="ghost" className="hidden md:flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span>Wishlist</span>
            </Button>
            
            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" className="flex items-center space-x-1 relative">
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden md:inline">Cart</span>
                {/* Cart Count Badge */}
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-flipkart-yellow text-flipkart-blue text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
        
        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for products, brands and more"
              className="w-full bg-white text-black pr-12 border-0"
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-0 top-0 h-full px-3 text-flipkart-blue hover:bg-gray-100"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
