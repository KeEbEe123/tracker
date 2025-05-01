"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Award,
  Calendar,
  Mail,
  Phone,
  Building,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { NoCertifications } from "@/components/ui/NoCertifications";

export default function TeacherProfilePage({ params }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchTeacher = async () => {
      if (status !== "authenticated") return;

      try {
        const res = await fetch(`/api/teacher/${encodeURIComponent(params.email)}`);

        if (!res.ok) {
          if (res.status === 404) {
            console.log("No teacher profile found");
            return;
          }
          throw new Error("Failed to fetch teacher");
        }

        const data = await res.json();
        setTeacher(data);
      } catch (error) {
        console.error("Error fetching teacher:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchTeacher();
    }
  }, [session, params.email]);

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground">
            The requested teacher profile could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Picture */}
            <div className="flex flex-col items-center">
              <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700">
                <Image
                  src={teacher.profilePicture || "/placeholder.svg?height=192&width=192"}
                  alt={teacher.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Teacher Info */}
            <div className="md:col-span-2">
              <h1 className="text-2xl font-semibold mb-2">{teacher.name}</h1>
              <p className="text-muted-foreground mb-4">{teacher.department}</p>

              <div className="space-y-3">
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{teacher.email}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{teacher.contactNumber}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{teacher.department}</span>
                </p>
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  Certifications ({teacher.certifications?.length || 0})
                </h2>

                {teacher.certifications?.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {teacher.certifications.map((cert, index) => (
                      <div
                        key={cert._id || index}
                        className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-border"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{cert.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {cert.issuingOrganization}
                            </p>
                          </div>
                          <div className="text-sm text-right">
                            <p className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(cert.issueDate).toLocaleDateString()}
                            </p>
                            {cert.expiryDate && (
                              <p className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                Expires: {new Date(cert.expiryDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <NoCertifications />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 