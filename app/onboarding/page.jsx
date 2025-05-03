"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  User,
  Mail,
  Phone,
  Building,
  AlertCircle,
  Loader2,
  BookOpen,
} from "lucide-react";

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const redirectedRef = useRef(false);
  const [formData, setFormData] = useState({
    name: "",
    contactNumber: "",
    department: "",
    designation: "",
  });

  useEffect(() => {
    let ignore = false;

    const checkUserProfile = async () => {
      if (status !== "authenticated" || !session?.user || redirectedRef.current)
        return;

      // Set initial form data with available session info
      if (!ignore) {
        setFormData((prev) => ({
          ...prev,
          name: session.user.name || "",
          email: session.user.email || "",
        }));
      }

      setLoadingMessage("Checking if you've already completed onboarding...");
      try {
        const response = await fetch(
          `/api/teacher/${encodeURIComponent(session.user.email)}`
        );

        if (ignore) return; // Don't continue if already redirected

        if (response.ok) {
          // Profile exists, redirect
          setLoadingMessage("Redirecting to your profile...");
          redirectedRef.current = true;

          // Add a timeout to prevent immediate redirect
          setTimeout(() => {
            if (!ignore) {
              router.push("/profile");
            }
          }, 500);
        } else if (response.status === 404) {
          // No profile exists, show onboarding form
          setIsLoading(false);
        } else {
          console.error("Error response:", await response.text());
          setError(
            "Something went wrong when checking your profile. Please try again."
          );
          setIsLoading(false);
        }
      } catch (error) {
        if (ignore) return;
        console.error("Error checking user profile:", error);
        setError(
          "Error checking if you've already completed onboarding. Please try again."
        );
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      checkUserProfile();
    } else if (status === "unauthenticated") {
      router.push("/auth/signin");
    }

    return () => {
      ignore = true; // When component unmounts or status changes, stop pending fetches
    };
  }, [status, session, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.contactNumber || !formData.department) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: session.user.email,
          contactNumber: formData.contactNumber,
          department: formData.department,
          designation: formData.designation,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create profile");
      }

      // Redirect to profile page after successful onboarding
      router.push("/profile");
    } catch (error) {
      console.error("Error creating profile:", error);
      setError(error.message || "Failed to create profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div
          style={{
            backgroundColor: "hsl(var(--card))",
            color: "hsl(var(--card-foreground))",
          }}
          className="rounded-lg shadow-sm p-6 border border-border"
        >
          <div
            className="text-center flex flex-col items-center justify-center p-8"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>{loadingMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <div
        style={{
          backgroundColor: "hsl(var(--card))",
          color: "hsl(var(--card-foreground))",
        }}
        className="rounded-lg shadow-sm p-8 border border-border"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold mb-2">Complete Your Profile</h1>
          <p style={{ color: "hsl(var(--muted-foreground))" }}>
            Let's set up your teacher profile to get started
          </p>
        </div>

        {error && (
          <div
            className="mb-6 p-4 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-900"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-1"
              style={{ color: "hsl(var(--foreground))" }}
            >
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User
                  className="h-5 w-5"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                />
              </div>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="pl-10 w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent"
                style={{
                  backgroundColor: "hsl(var(--background))",
                  borderColor: "hsl(var(--input))",
                  color: "hsl(var(--foreground))",
                }}
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="contactNumber"
              className="block text-sm font-medium mb-1"
              style={{ color: "hsl(var(--foreground))" }}
            >
              Contact Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone
                  className="h-5 w-5"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                />
              </div>
              <input
                id="contactNumber"
                type="tel"
                value={formData.contactNumber}
                onChange={(e) =>
                  setFormData({ ...formData, contactNumber: e.target.value })
                }
                className="pl-10 w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent"
                style={{
                  backgroundColor: "hsl(var(--background))",
                  borderColor: "hsl(var(--input))",
                  color: "hsl(var(--foreground))",
                }}
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="department"
              className="block text-sm font-medium mb-1"
              style={{ color: "hsl(var(--foreground))" }}
            >
              Department
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building
                  className="h-5 w-5"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                />
              </div>
              <input
                id="department"
                type="text"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                className="pl-10 w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent"
                style={{
                  backgroundColor: "hsl(var(--background))",
                  borderColor: "hsl(var(--input))",
                  color: "hsl(var(--foreground))",
                }}
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="designation"
              className="block text-sm font-medium mb-1"
              style={{ color: "hsl(var(--foreground))" }}
            >
              Designation
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BookOpen
                  className="h-5 w-5"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                />
              </div>
              <select
                id="designation"
                value={formData.designation}
                onChange={(e) =>
                  setFormData({ ...formData, designation: e.target.value })
                }
                className="pl-10 w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent"
                style={{
                  backgroundColor: "hsl(var(--background))",
                  borderColor: "hsl(var(--input))",
                  color: "hsl(var(--foreground))",
                }}
              >
                <option value="">Select Designation</option>
                <option value="Professor">Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Head of Department">Head of Department</option>
              </select>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-70"
            >
              {isSubmitting ? "Creating Profile..." : "Complete Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
