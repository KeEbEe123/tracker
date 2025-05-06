"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MigratePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  const handleMigration = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/migrate-certifications", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Migration failed");
      }

      setResult(data);
    } catch (error) {
      setError(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Certification Schema Migration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This utility will standardize credential fields for all existing
            certifications in the database. It will convert empty credential ID
            and URL strings to null values.
          </p>

          <div className="space-y-4">
            <Button
              onClick={handleMigration}
              disabled={loading}
              className="bg-slate-800 text-slate-100 hover:bg-slate-700"
            >
              {loading ? "Running Migration..." : "Run Migration"}
            </Button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
                <p className="font-medium">Error:</p>
                <p>{error}</p>
              </div>
            )}

            {result && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="font-medium text-green-600">{result.message}</p>
                <div className="mt-2 space-y-1">
                  <p>Teachers processed: {result.stats.teachersProcessed}</p>
                  <p>
                    Certifications processed:{" "}
                    {result.stats.certificationsProcessed}
                  </p>
                  <p>Teachers updated: {result.stats.teachersUpdated}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
