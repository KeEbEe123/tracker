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
  BookOpen,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Badge,
  TrendingUp,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { NoCertifications } from "@/components/ui/NoCertifications";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function TeacherProfilePage({ params }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentCertIndex, setCurrentCertIndex] = useState(0);
  const [showAllCerts, setShowAllCerts] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchTeacher = async () => {
      if (status !== "authenticated") return;

      try {
        const res = await fetch(
          `/api/getTeacherByEmail/${encodeURIComponent(params.email)}`
        );

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

  const nextCertification = () => {
    if (teacher?.certifications?.length > 0) {
      setCurrentCertIndex((prev) =>
        prev === teacher.certifications.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevCertification = () => {
    if (teacher?.certifications?.length > 0) {
      setCurrentCertIndex((prev) =>
        prev === 0 ? teacher.certifications.length - 1 : prev - 1
      );
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <LoadingSpinner />
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
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/")}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const currentCert =
    teacher.certifications && teacher.certifications.length > 0
      ? teacher.certifications[currentCertIndex]
      : null;

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Picture and Stats */}
            <div className="flex flex-col items-center">
              <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-teal-100 dark:border-teal-900 mb-4">
                <Image
                  src={
                    teacher.profilePicture ||
                    "/placeholder.svg?height=192&width=192"
                  }
                  alt={teacher.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Stats Card */}
              <Card className="w-full mt-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">
                        Certifications
                      </dt>
                      <dd className="text-sm font-medium">
                        {teacher.certifications?.length || 0}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">
                        Total Points
                      </dt>
                      <dd className="text-sm font-medium">
                        {teacher.totalPoints || 0}
                      </dd>
                    </div>
                    {teacher.improvementRate && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">
                          Improvement
                        </dt>
                        <dd className="text-sm font-medium text-teal-600">
                          +{teacher.improvementRate}%
                        </dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>

              <Button
                variant="outline"
                className="mt-6 w-full bg-transparent"
                onClick={() => router.push("/")}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>

            {/* Teacher Info */}
            <div className="md:col-span-2">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-semibold mb-1">
                    {teacher.name}
                  </h1>
                  <p className="text-muted-foreground mb-4 flex items-center">
                    <Badge className="h-4 w-4 mr-1" />
                    {teacher.designation || "Faculty Member"}
                  </p>
                </div>

                {teacher.recentAchievement && (
                  <UIBadge
                    variant="outline"
                    className="text-teal-700 dark:text-teal-400"
                    style={{
                      backgroundColor: "var(--teal-bg-color, #f0fdfa)",
                    }}
                  >
                    <Award className="h-3.5 w-3.5 mr-1" />
                    Recent Achievement
                  </UIBadge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-slate-50 dark:bg-slate-800/30 p-4 rounded-lg">
                <div className="space-y-3">
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Email:</span>
                    <span>{teacher.email}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Phone:</span>
                    <span>{teacher.contactNumber}</span>
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Department:</span>
                    <span>{teacher.department}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Position:</span>
                    <span>{teacher.designation || "Not specified"}</span>
                  </p>
                </div>
              </div>

              {/* Recent Achievement */}
              {teacher.recentAchievement && (
                <Card className="mb-6 border-teal-200 dark:border-teal-800">
                  <CardContent className="pt-4 pb-4">
                    <h3 className="text-md font-medium flex items-center gap-2 mb-2">
                      <Award className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                      Latest Achievement
                    </h3>
                    <p className="text-sm text-muted-foreground pl-7">
                      {teacher.recentAchievement}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Featured Certification */}
              {currentCert && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium flex items-center gap-2">
                      <Award className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                      Featured Certification
                    </h2>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={prevCertification}
                        disabled={teacher.certifications.length <= 1}
                      >
                        <ChevronLeft className="h-4 w-4 text-black" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={nextCertification}
                        disabled={teacher.certifications.length <= 1}
                      >
                        <ChevronRight className="h-4 w-4 text-black" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAllCerts(!showAllCerts)}
                        className="text-black"
                      >
                        {showAllCerts ? "Show Featured" : "View All"}
                      </Button>
                    </div>
                  </div>

                  {!showAllCerts ? (
                    <Card className="overflow-hidden">
                      <div className="relative h-60 w-full">
                        <Image
                          src={
                            currentCert.imageUrl ||
                            "/placeholder.svg?height=240&width=400"
                          }
                          alt={currentCert.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="text-lg font-semibold mb-1">
                          {currentCert.name}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-3">
                          {currentCert.issuingOrganization}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-sm mb-4">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            Issued:{" "}
                            {new Date(
                              currentCert.issueDate
                            ).toLocaleDateString()}
                          </div>
                          {currentCert.expiryDate && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              Expires:{" "}
                              {new Date(
                                currentCert.expiryDate
                              ).toLocaleDateString()}
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Badge className="h-3.5 w-3.5" />
                            ID: {currentCert.credentialId}
                          </div>
                          <div>
                            <a
                              href={currentCert.credentialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:underline"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              Verify Certificate
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {teacher.certifications.map((cert, index) => (
                        <Card
                          key={cert._id || index}
                          className="overflow-hidden"
                        >
                          <div className="relative h-40 w-full">
                            <Image
                              src={
                                cert.imageUrl ||
                                "/placeholder.svg?height=160&width=300"
                              }
                              alt={cert.name}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-medium">{cert.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {cert.issuingOrganization}
                            </p>
                            <div className="flex justify-between text-xs">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(cert.issueDate).toLocaleDateString()}
                              </div>
                              <a
                                href={cert.credentialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Verify
                              </a>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* No Certifications */}
              {(!teacher.certifications ||
                teacher.certifications.length === 0) && (
                <div className="mt-6">
                  <NoCertifications />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
