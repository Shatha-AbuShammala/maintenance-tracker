"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../providers/Providers";

const baseLinkClass =
  "px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded transition-colors";

const ctaLinkClass =
  "px-3 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm transition-colors";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
        <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600">
          Maintenance Tracker
        </Link>

        <div className="hidden md:flex items-center space-x-1">
          <Link href="/" className={baseLinkClass}>
            Home
          </Link>
          {user && (
            <Link href="/my-issues" className={baseLinkClass}>
              My Issues
            </Link>
          )}
          {user && (
            <Link href="/issues/new" className={ctaLinkClass}>
              Add Issue
            </Link>
          )}
          {user?.role === "admin" && (
            <Link href="/admin" className={baseLinkClass}>
              Admin
            </Link>
          )}

          {user ? (
            <div className="flex items-center space-x-2 ml-3 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                {(user.name || user.email)?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-700">{user.name || user.email}</span>
              <button
                onClick={logout}
                className="px-3 py-1 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex space-x-2 ml-3 pl-3 border-l border-gray-200">
              <Link href="/auth/login" className={baseLinkClass}>
                Login
              </Link>
              <Link href="/auth/register" className={ctaLinkClass}>
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Menu
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            <Link href="/" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </Link>
            {user && (
              <Link
                href="/my-issues"
                className="block text-sm font-medium text-gray-700 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Issues
              </Link>
            )}
            {user && (
              <Link
                href="/issues/new"
                className="block text-sm font-semibold text-blue-600 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Add Issue
              </Link>
            )}
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="block text-sm font-medium text-gray-700 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Admin
              </Link>
            )}

            <div className="pt-2 border-t border-gray-100">
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left text-sm font-medium text-red-600 py-2"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="block text-sm font-medium text-gray-700 py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block text-sm font-semibold text-blue-600 py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
