"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, MessageSquare, LogOut, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { ThemeToggle } from "./theme-toggle";
import { useSession, signOut } from "next-auth/react";
import { ADMIN_EMAILS } from "@/utils/adminEmails";

declare global {
  interface Window {
    lastScrollY: number;
  }
}

interface NavItem {
  name: string;
  link: string;
  icon: React.ReactNode;
}

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [visible, setVisible] = useState(true);
  const { scrollY } = useScroll();

  useEffect(() => {
    window.lastScrollY = 0;
    const handleScroll = () => {
      if (window.scrollY < 50) {
        setVisible(true);
      } else {
        setVisible(window.scrollY < window.lastScrollY);
      }
      window.lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAdmin =
    status === "authenticated" &&
    typeof session?.user?.email === "string" &&
    ADMIN_EMAILS.includes(session.user.email);

  const navItems: NavItem[] = [
    { name: "Home", link: "/", icon: <Home className="h-4 w-4" /> },
    { name: "Profile", link: "/profile", icon: <User className="h-4 w-4" /> },
    {
      name: "Contact",
      link: "/contact",
      icon: <MessageSquare className="h-4 w-4" />,
    },
    ...(isAdmin
      ? [{ name: "Admin", link: "/admin", icon: <User className="h-4 w-4" /> }]
      : []),
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-x-0 top-4 mx-auto flex max-w-fit items-center space-x-4 rounded-full bg-white/90 dark:bg-slate-900/90 border border-transparent dark:border-white/[0.2] py-2 px-8 shadow-lg backdrop-blur-sm z-50"
        >
          {navItems.map((navItem, idx) => {
            const isActive =
              navItem.link === "/"
                ? pathname === "/"
                : pathname.startsWith(navItem.link);

            return (
              <Link
                key={idx}
                href={navItem.link}
                className={cn(
                  "relative flex items-center space-x-1 rounded-full py-2 px-3 transition-colors",
                  isActive
                    ? "text-neutral-900 dark:text-white"
                    : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100"
                )}
              >
                <span
                  className={cn(
                    "block sm:hidden",
                    isActive
                      ? "text-neutral-900 dark:text-white"
                      : "text-neutral-500 dark:text-white"
                  )}
                >
                  {navItem.icon}
                </span>
                <span className="hidden sm:block text-sm font-medium">
                  {navItem.name}
                </span>

                {isActive && (
                  <motion.span
                    layoutId="navbar-active-indicator"
                    className="absolute inset-0 rounded-full bg-cyan-400/80 dark:bg-cyan-400/80 -z-10 shadow-lg shadow-cyan-400/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Link>
            );
          })}

          <div className="flex items-center space-x-2">
            <ThemeToggle />

            {status === "authenticated" ? (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 rounded-full border border-neutral-200 dark:border-white/[0.2] px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800 transition-all"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            ) : (
              <Link href="/auth/signin">
                <button className="relative flex items-center gap-2 rounded-full border border-neutral-200 dark:border-white/[0.2] px-4 py-2 text-sm font-medium text-black dark:text-white hover:shadow-lg transition-shadow">
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                  <span className="absolute inset-x-0 bottom-0 mx-auto h-px w-1/2 bg-gradient-to-r from-transparent via-neutral-900 to-transparent dark:via-white" />
                </button>
              </Link>
            )}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
