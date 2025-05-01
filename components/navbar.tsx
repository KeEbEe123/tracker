"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, MessageSquare, LogOut, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ThemeToggle } from "./theme-toggle";
import { useSession, signOut } from "next-auth/react";

interface NavItem {
  name: string;
  link: string;
  icon: React.ReactNode;
}

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const navItems: NavItem[] = [
    {
      name: "Home",
      link: "/",
      icon: <Home className="h-4 w-4" />,
    },
    {
      name: "Profile",
      link: "/profile",
      icon: <User className="h-4 w-4" />,
    },
    {
      name: "Contact",
      link: "/contact",
      icon: <MessageSquare className="h-4 w-4" />,
    },
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" });
  };

  return (
    <div className="flex max-w-fit fixed top-4 inset-x-0 mx-auto border border-transparent dark:border-white/[0.2] rounded-full dark:bg-black bg-white shadow-[0px_2px_15px_-3px_rgba(0,0,0,0.1),0px_1px_5px_0px_rgba(25,28,33,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_15px_2px_rgba(100,150,255,0.1)] dark:shadow-[0px_2px_15px_-3px_rgba(0,0,0,0.2),0px_1px_5px_0px_rgba(25,28,33,0.1),0px_0px_20px_5px_rgba(100,150,255,0.1)] z-50 pr-2 pl-8 py-2 items-center justify-center space-x-4 backdrop-blur-sm bg-white/90 dark:bg-black/90">
      {navItems.map((navItem, idx) => {
        const isActive =
          navItem.link === "/"
            ? pathname === "/"
            : pathname.startsWith(navItem.link);

        return (
          <Link
            key={`link-${idx}`}
            href={navItem.link}
            className={cn(
              "relative py-2 px-3 rounded-full transition-colors items-center flex space-x-1",
              isActive
                ? "text-blue-600 dark:text-blue-400"
                : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100"
            )}
          >
            <span
              className={cn(
                "block sm:hidden",
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-neutral-500 dark:text-white"
              )}
            >
              {navItem.icon}
            </span>
            <span className="hidden sm:block text-sm font-medium">
              {navItem.name}
            </span>

            {isActive && (
              <motion.div
                layoutId="navbar-active-indicator"
                className="absolute inset-0 bg-slate-100/80 dark:bg-slate-800/80 rounded-full -z-10 shadow-[0px_0px_10px_2px_rgba(96,165,250,0.3)] dark:shadow-[0px_0px_15px_3px_rgba(96,165,250,0.25)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
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
            className="border text-sm font-medium relative border-neutral-200 dark:border-white/[0.2] text-red-600 dark:text-red-400 px-4 py-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800 transition-all flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        ) : (
          <Link href="/auth/signin">
            <button className="border text-sm font-medium relative border-neutral-200 dark:border-white/[0.2] text-black dark:text-white px-4 py-2 rounded-full hover:shadow-[0px_0px_10px_2px_rgba(96,165,250,0.3)] dark:hover:shadow-[0px_0px_10px_2px_rgba(96,165,250,0.25)] transition-shadow flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              <span>Login</span>
              <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-blue-500 to-transparent h-px" />
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
