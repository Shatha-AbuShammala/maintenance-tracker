"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../providers/Providers";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
        <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600">Maintenance Tracker</Link>

        <div className="hidden md:flex items-center space-x-4">
          <Link href="/">Home</Link>
          {user && <Link href="/issues/my">My Issues</Link>}
          <Link href="/issues/add">Add Issue</Link>
          {user?.role === "admin" && <Link href="/admin">Admin</Link>}

          {user ? (
            <div className="flex items-center space-x-2 ml-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                {(user.name || user.email)?.charAt(0).toUpperCase()}
              </div>
              <span>{user.name || user.email}</span>
              <button onClick={logout} className="bg-red-600 text-white px-3 py-1 rounded">Logout</button>
            </div>
          ) : (
            <div className="flex space-x-2 ml-4">
              <Link href="/auth/login" className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">Login</Link>
              <Link href="/auth/register" className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Register</Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button onClick={toggleMobileMenu}>Menu</button>
        </div>
      </div>
    </nav>
  );
}
