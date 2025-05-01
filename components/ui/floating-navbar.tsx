"use client";
import React, { useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  name: string;
  link: string;
  icon?: React.ReactNode;
}

interface FloatingNavProps {
  navItems: NavItem[];
  className?: string;
}

export const FloatingNav: React.FC<FloatingNavProps> = ({
  navItems,
  className,
}) => {
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    // Check if current is not undefined and is a number
    if (typeof current === "number") {
      let direction = current! - scrollYProgress.getPrevious()!;

      if (scrollYProgress.get() < 0.05) {
        setVisible(false);
      } else {
        if (direction < 0) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      }
    }
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{
          opacity: 1,
          y: -100,
        }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
        }}
        className={cn(
          "flex max-w-fit fixed top-10 inset-x-0 mx-auto border border-transparent dark:border-white/[0.2] rounded-full dark:bg-black/90 bg-white/90 shadow-[0px_2px_15px_-3px_rgba(0,0,0,0.1),0px_1px_5px_0px_rgba(25,28,33,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_15px_3px_rgba(100,150,255,0.15)] dark:shadow-[0px_2px_15px_-3px_rgba(0,0,0,0.2),0px_1px_5px_0px_rgba(25,28,33,0.1),0px_0px_20px_5px_rgba(100,150,255,0.15)] z-[5000] pr-2 pl-8 py-2 items-center justify-center space-x-4 backdrop-blur-sm",
          className
        )}
      >
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
                  layoutId="floating-nav-active-indicator"
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
          <motion.button
            whileHover={{ scale: 1.03 }}
            className="border text-sm font-medium relative border-neutral-200 dark:border-white/[0.2] text-black dark:text-white px-4 py-2 rounded-full hover:shadow-[0px_0px_10px_2px_rgba(96,165,250,0.3)] dark:hover:shadow-[0px_0px_10px_2px_rgba(96,165,250,0.25)] transition-shadow"
          >
            <span>Login</span>
            <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-blue-500 to-transparent h-px" />
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
