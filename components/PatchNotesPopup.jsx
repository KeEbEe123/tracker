"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Patch version identifier
const CURRENT_PATCH_VERSION = "1.0.1";

export default function PatchNotesPopup({ alwaysShow = false }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (alwaysShow) {
      setIsVisible(true);
    } else {
      const lastSeenPatch = localStorage.getItem("lastSeenPatchVersion");
      if (!lastSeenPatch || lastSeenPatch !== CURRENT_PATCH_VERSION) {
        setIsVisible(true);
      }
    }
  }, [alwaysShow]);

  const handleClose = () => {
    if (!alwaysShow) {
      localStorage.setItem("lastSeenPatchVersion", CURRENT_PATCH_VERSION);
    }
    setIsVisible(false);
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={handleClose}
          />
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
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-red-500">
                      ACTION REQUIRED
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex gap-2">
                        <span className="text-red-500 flex-shrink-0">⚠️</span>
                        <span>
                          All users who uploaded their certificates in pdf
                          format are requested to edit them and upload jpeg or
                          png only. We apologize for the inconvenience.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-red-500 flex-shrink-0">⚠️</span>
                        <div className="space-y-2">
                          <span>
                            All faculty are requested to edit their
                            certification type and choose from one of the
                            options as soon as possible:
                          </span>
                          <ul className="ml-4 space-y-1 text-sm">
                            <li className="flex items-center gap-2">
                              <span className="text-amber-600 dark:text-amber-500">
                                •
                              </span>
                              <span>
                                FDP (Faculty Development Program) -{" "}
                                <span className="font-medium text-teal-600 dark:text-teal-500">
                                  5 points
                                </span>
                              </span>
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-amber-600 dark:text-amber-500">
                                •
                              </span>
                              <span>
                                Global Certification -{" "}
                                <span className="font-medium text-teal-600 dark:text-teal-500">
                                  10 points
                                </span>
                              </span>
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-amber-600 dark:text-amber-500">
                                •
                              </span>
                              <span>
                                Webinars/Workshops -{" "}
                                <span className="font-medium text-teal-600 dark:text-teal-500">
                                  3 points
                                </span>
                              </span>
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-amber-600 dark:text-amber-500">
                                •
                              </span>
                              <span>
                                Online Courses -{" "}
                                <span className="font-medium text-teal-600 dark:text-teal-500">
                                  8 points
                                </span>
                              </span>
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-amber-600 dark:text-amber-500">
                                •
                              </span>
                              <span>
                                Others -{" "}
                                <span className="font-medium text-teal-600 dark:text-teal-500">
                                  2 points
                                </span>
                              </span>
                            </li>
                          </ul>
                        </div>
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
