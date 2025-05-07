"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";

// Component to handle search params (wrapped in Suspense)
function SignInContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/profile";
  const error = searchParams.get("error");

  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn("google", { callbackUrl });
  };

  return (
    <div className="container max-w-md mx-auto py-16 px-4">
      <div
        style={{
          backgroundColor: "hsl(var(--card))",
          color: "hsl(var(--card-foreground))",
        }}
        className="rounded-lg shadow-sm p-8 border border-border"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold mb-2">Welcome Back</h1>
          <p style={{ color: "hsl(var(--muted-foreground))" }}>
            Sign in to access your teacher dashboard
          </p>
        </div>

        {error && (
          <div
            className="mb-4 p-4 rounded-lg text-red-800 bg-red-100 dark:bg-red-900/30 dark:text-red-300"
            role="alert"
          >
            {error === "AccessDenied"
              ? "You do not have permission to access this resource."
              : error === "Use college email for login."
              ? "Please use your official college/institute email address (ending with @mlrit.ac.in or @mlrinstitutions.ac.in) to sign in."
              : error === "Student roll number emails are not allowed."
              ? "Student roll number emails are not allowed. Please use your faculty email."
              : "An error occurred while signing in. Please try again."}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-70"
          style={{
            backgroundColor: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
          }}
        >
          <Image
            src="/google-logo.svg"
            alt="Google logo"
            width={20}
            height={20}
            className="dark:invert"
            onError={(e) => {
              // Fallback if image doesn't exist yet
              e.target.onerror = null;
              e.target.style.display = "none";
            }}
          />
          <span className="font-medium">
            {isLoading ? "Signing in..." : "Sign in with Google"}
          </span>
        </button>

        <div
          className="mt-8 pt-6 text-center text-sm"
          style={{
            borderTop: "1px solid hsl(var(--border))",
            color: "hsl(var(--muted-foreground))",
          }}
        >
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}

// Loading fallback for Suspense
function SignInFallback() {
  return (
    <div className="container max-w-md mx-auto py-16 px-4">
      <div
        style={{
          backgroundColor: "hsl(var(--card))",
          color: "hsl(var(--card-foreground))",
        }}
        className="rounded-lg shadow-sm p-8 border border-border"
      >
        <div className="text-center">
          <p style={{ color: "hsl(var(--muted-foreground))" }}>Loading...</p>
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense
export default function SignInPage() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInContent />
    </Suspense>
  );
}
