"use client";

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/Providers";

type NavLink = {
  href: string;
  label: string;
};

const VISITOR_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/#how-it-works", label: "How it works" },
];

const CITIZEN_LINKS: NavLink[] = [
  { href: "/issues/new", label: "Report Issue" },
  { href: "/my-issues", label: "My Issues" },
];

const ADMIN_LINKS: NavLink[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/issues", label: "All Issues" },
  { href: "/admin/users", label: "Users" },
];

function NavLinks({
  links,
  onNavigate,
  isActive,
  variant,
}: {
  links: NavLink[];
  onNavigate: (event: MouseEvent, href: string) => void;
  isActive: (href: string) => boolean;
  variant: "desktop" | "mobile";
}) {
  return (
    <>
      {links.map((link) => {
        const active = isActive(link.href);
        const baseClasses =
          variant === "desktop"
            ? "px-3 py-2 text-sm font-semibold transition"
            : "block rounded-md px-3 py-2 text-sm font-semibold";

        const stateClasses =
          variant === "desktop"
            ? active
              ? "text-slate-900"
              : "text-slate-600 hover:text-slate-900"
            : active
              ? "bg-slate-100 text-slate-900"
              : "text-slate-700 hover:bg-slate-50";

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={(event) => onNavigate(event, link.href)}
            className={`${baseClasses} ${stateClasses}`}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}

type AuthUser = ReturnType<typeof useAuth>["user"];

function UserActions({
  user,
  onLogout,
  variant,
  onNavigate,
}: {
  user: AuthUser;
  onLogout: () => void;
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  if (variant === "desktop") {
    return (
      <div className="hidden items-center space-x-3 md:flex">
        {user ? (
          <>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {user.name || user.email || "Account"}
            </span>
            <button
              onClick={onLogout}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/auth/login"
              className="text-sm font-semibold text-slate-700 transition hover:text-slate-900"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Register
            </Link>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4 border-t border-slate-100 pt-4 md:hidden">
      {user ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">{user.name || user.email || "Account"}</p>
          <button
            onClick={onLogout}
            className="w-full rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex flex-col space-y-2">
          <Link
            href="/auth/login"
            onClick={onNavigate}
            className="w-full rounded-md border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            onClick={onNavigate}
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Register
          </Link>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const authProtectedPaths = ["/issues/new", "/my-issues"];
  const navLinks = !user
    ? VISITOR_LINKS
    : user.role === "admin"
      ? ADMIN_LINKS
      : CITIZEN_LINKS;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleNavigate = (event: MouseEvent, href: string) => {
    if (!user && authProtectedPaths.some((path) => href.startsWith(path))) {
      event.preventDefault();
      setIsOpen(false);
      router.push(`/auth/login?redirect=${encodeURIComponent(href)}`);
      return;
    }

    if (href.startsWith("/#")) {
      const [, hash] = href.split("#");
      if (pathname === "/") {
        event.preventDefault();
        setIsOpen(false);
        const target = document.getElementById(hash);
        target?.scrollIntoView({ behavior: "smooth" });
        return;
      }

      event.preventDefault();
      setIsOpen(false);
      router.push(`/#${hash}`);
      return;
    }

    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center space-x-3"
          onClick={(event) => {
            event.preventDefault();
            setIsOpen(false);
          }}
        >
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-500 via-cyan-400 to-emerald-400 shadow-lg shadow-sky-200" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">City Ops</p>
            <p className="text-lg font-semibold text-slate-900">Maintenance Tracker</p>
          </div>
        </Link>

        <nav className="hidden items-center space-x-8 text-sm font-medium text-slate-700 md:flex">
          <NavLinks links={navLinks} onNavigate={handleNavigate} isActive={isActive} variant="desktop" />
        </nav>

        <UserActions user={user} onLogout={handleLogout} variant="desktop" />

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span className="sr-only">Toggle navigation</span>
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
            <div className="space-y-2">
              <NavLinks links={navLinks} onNavigate={handleNavigate} isActive={isActive} variant="mobile" />
            </div>
            <UserActions user={user} onLogout={handleLogout} variant="mobile" onNavigate={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}
