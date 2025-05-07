"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Defines the current patch version - increment this when adding new patch notes
const CURRENT_PATCH_VERSION = "1.0.1";

export default function PatchNotesPopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already seen this patch version
    const lastSeenPatch = localStorage.getItem("lastSeenPatchVersion");

    if (!lastSeenPatch || lastSeenPatch !== CURRENT_PATCH_VERSION) {
      // Show the popup if user hasn't seen this version
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    // Store the current version in localStorage when user closes the popup
    localStorage.setItem("lastSeenPatchVersion", CURRENT_PATCH_VERSION);
    setIsVisible(false);
  };

  // Get current date in readable format
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={handleClose}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <Card className="border shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                    <CardTitle className="text-xl">Patch Notes</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  Version {CURRENT_PATCH_VERSION} • {currentDate}
                </CardDescription>
              </CardHeader>

              <CardContent className="max-h-[60vh] overflow-y-auto">
                <div className="space-y-6">
                  {/* Latest update */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-red-500">
                      ACTION REQUIRED
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex gap-2">
                        <span className="text-teal-600 dark:text-teal-500 flex-shrink-0">
                          •
                        </span>
                        <span>
                          All users who uploaded their certificates in pdf
                          format are requested to edit them and upload jpeg or
                          png only. We apologize for the inconvenience.
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">
                      Functionality Updates
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex gap-2">
                        <span className="text-teal-600 dark:text-teal-500 flex-shrink-0">
                          •
                        </span>
                        <span>
                          Made credential ID and URL fields optional when adding
                          certifications. Users who don't have them need not
                          fill them in the future
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end border-t pt-3">
                <Button
                  onClick={handleClose}
                  className="bg-slate-800 text-slate-100 hover:bg-slate-700"
                >
                  Got it
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
