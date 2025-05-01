"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Award,
  BarChart3,
  BookOpen,
  FileText,
  Mail,
  Phone,
  Calendar,
  PenLine,
  Building,
  Bookmark,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [currentCertIndex, setCurrentCertIndex] = useState(0);
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contactNumber: "",
    department: "",
  });
  const [newCertification, setNewCertification] = useState({
    name: "",
    issuingOrganization: "",
    issueDate: "",
    expiryDate: "",
    credentialId: "",
    credentialUrl: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await fetch("/api/teacher");

        if (!res.ok) {
          console.error(
            "Error fetching teacher profile:",
            res.status,
            res.statusText
          );

          // Only redirect to onboarding if it's specifically a 404 (not found)
          // This prevents redirect loops in case of other errors
          if (res.status === 404) {
            console.log("No teacher profile found, redirecting to onboarding");
            router.push("/onboarding");
            return;
          }

          setLoading(false);
          return;
        }

        const data = await res.json();

        if (!data) {
          console.log("No teacher data in response, redirecting to onboarding");
          router.push("/onboarding");
          return;
        }

        setTeacher(data);
        setFormData({
          name: data.name,
          contactNumber: data.contactNumber,
          department: data.department,
        });
      } catch (error) {
        console.error("Error fetching teacher:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchTeacher();
    }
  }, [session, router]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/teacher", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const updated = await res.json();
      setTeacher(updated);
      setEditing(false);
    } catch (error) {
      console.error("Error updating teacher:", error);
    }
  };

  const handleAddCertification = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/teacher/certifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCertification),
      });
      const updated = await res.json();
      setTeacher(updated);
      setNewCertification({
        name: "",
        issuingOrganization: "",
        issueDate: "",
        expiryDate: "",
        credentialId: "",
        credentialUrl: "",
      });
    } catch (error) {
      console.error("Error adding certification:", error);
    }
  };

  const nextCertification = () => {
    if (
      teacher &&
      teacher.certifications &&
      teacher.certifications.length > 0
    ) {
      setCurrentCertIndex((prev) =>
        prev === teacher.certifications.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevCertification = () => {
    if (
      teacher &&
      teacher.certifications &&
      teacher.certifications.length > 0
    ) {
      setCurrentCertIndex((prev) =>
        prev === 0 ? teacher.certifications.length - 1 : prev - 1
      );
    }
  };

  if (status === "loading" || loading) {
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
            className="text-center"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!teacher) {
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
            className="text-center"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            No teacher data found.
          </div>
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
      <div
        style={{
          backgroundColor: "hsl(var(--card))",
          color: "hsl(var(--card-foreground))",
        }}
        className="rounded-lg shadow-sm p-6 border border-border"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* User Info - Left Side */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-semibold">{teacher.name}</h1>
                  <p style={{ color: "hsl(var(--muted-foreground))" }}>
                    {teacher.department}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setEditing(!editing)}
                  className="flex items-center gap-2"
                >
                  <PenLine className="h-4 w-4" />
                  {editing ? "Cancel" : "Edit Profile"}
                </Button>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <Mail
                    style={{ color: "hsl(var(--muted-foreground))" }}
                    className="h-4 w-4"
                  />
                  <span className="font-medium">Email:</span> {teacher.email}
                </p>
                <p className="flex items-center gap-2">
                  <Phone
                    style={{ color: "hsl(var(--muted-foreground))" }}
                    className="h-4 w-4"
                  />
                  <span className="font-medium">Phone:</span>{" "}
                  {teacher.contactNumber}
                </p>
                <p className="flex items-center gap-2">
                  <Building
                    style={{ color: "hsl(var(--muted-foreground))" }}
                    className="h-4 w-4"
                  />
                  <span className="font-medium">Department:</span>{" "}
                  {teacher.department}
                </p>
              </div>
            </div>

            {editing ? (
              <form
                onSubmit={handleUpdateProfile}
                className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-border"
              >
                <Input
                  label="Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <Input
                  label="Contact Number"
                  value={formData.contactNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, contactNumber: e.target.value })
                  }
                />
                <Input
                  label="Department"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                />
                <Button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white"
                >
                  Save Changes
                </Button>
              </form>
            ) : null}

            {/* Add New Certification Form */}
            <div className="mt-8">
              <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                Add New Certification
              </h2>

              <form
                onSubmit={handleAddCertification}
                className="space-y-4 mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-border"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Certification Name"
                    value={newCertification.name}
                    onChange={(e) =>
                      setNewCertification({
                        ...newCertification,
                        name: e.target.value,
                      })
                    }
                  />
                  <Input
                    label="Issuing Organization"
                    value={newCertification.issuingOrganization}
                    onChange={(e) =>
                      setNewCertification({
                        ...newCertification,
                        issuingOrganization: e.target.value,
                      })
                    }
                  />
                  <Input
                    label="Issue Date"
                    type="date"
                    value={newCertification.issueDate}
                    onChange={(e) =>
                      setNewCertification({
                        ...newCertification,
                        issueDate: e.target.value,
                      })
                    }
                  />
                  <Input
                    label="Expiry Date"
                    type="date"
                    value={newCertification.expiryDate}
                    onChange={(e) =>
                      setNewCertification({
                        ...newCertification,
                        expiryDate: e.target.value,
                      })
                    }
                  />
                  <Input
                    label="Credential ID"
                    value={newCertification.credentialId}
                    onChange={(e) =>
                      setNewCertification({
                        ...newCertification,
                        credentialId: e.target.value,
                      })
                    }
                  />
                  <Input
                    label="Credential URL"
                    type="url"
                    value={newCertification.credentialUrl}
                    onChange={(e) =>
                      setNewCertification({
                        ...newCertification,
                        credentialUrl: e.target.value,
                      })
                    }
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white"
                >
                  Add Certification
                </Button>
              </form>
            </div>

            {/* Certifications Carousel */}
            <div className="mt-6">
              <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                Your Certifications
              </h2>

              {teacher.certifications && teacher.certifications.length > 0 ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={prevCertification}
                        className="h-8 w-8 rounded-full"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Previous certification</span>
                      </Button>

                      <div className="text-center">
                        <span
                          style={{ color: "hsl(var(--muted-foreground))" }}
                          className="text-sm"
                        >
                          {currentCertIndex + 1} of{" "}
                          {teacher.certifications.length}
                        </span>
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={nextCertification}
                        className="h-8 w-8 rounded-full"
                      >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Next certification</span>
                      </Button>
                    </div>

                    <div className="text-center space-y-4">
                      <div
                        className="relative h-48 w-full mx-auto mb-4 rounded-md overflow-hidden border"
                        style={{ borderColor: "hsl(var(--border))" }}
                      >
                        <Image
                          src="/placeholder.svg?height=200&width=300"
                          alt={`${currentCert.name} Certificate`}
                          fill
                          className="object-cover dark:invert"
                        />
                      </div>

                      <h3 className="font-medium">{currentCert.name}</h3>
                      <p
                        style={{ color: "hsl(var(--muted-foreground))" }}
                        className="text-sm"
                      >
                        {currentCert.issuingOrganization}
                      </p>
                      <p
                        style={{ color: "hsl(var(--muted-foreground))" }}
                        className="text-sm flex items-center justify-center gap-1"
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        Issued:{" "}
                        {new Date(currentCert.issueDate).toLocaleDateString()}
                      </p>
                      {currentCert.expiryDate && (
                        <p
                          style={{ color: "hsl(var(--muted-foreground))" }}
                          className="text-sm flex items-center justify-center gap-1"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          Expires:{" "}
                          {new Date(
                            currentCert.expiryDate
                          ).toLocaleDateString()}
                        </p>
                      )}
                      {currentCert.credentialId && (
                        <p
                          style={{ color: "hsl(var(--muted-foreground))" }}
                          className="text-sm flex items-center justify-center gap-1"
                        >
                          <Bookmark className="h-3.5 w-3.5" />
                          ID: {currentCert.credentialId}
                        </p>
                      )}
                      {currentCert.credentialUrl && (
                        <div className="mt-2">
                          <a
                            href={currentCert.credentialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            View Certificate
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div
                  className="text-center p-6 border border-dashed rounded-lg"
                  style={{
                    color: "hsl(var(--muted-foreground))",
                    borderColor: "hsl(var(--border))",
                  }}
                >
                  No certifications added yet. Add your first certification
                  above.
                </div>
              )}
            </div>
          </div>

          {/* Profile Picture - Right Side */}
          <div className="md:col-span-1 flex flex-col items-center">
            <div
              style={{
                borderColor: "hsl(var(--muted))",
                backgroundColor: "hsl(var(--muted))",
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
              }}
              className="relative w-48 h-48 rounded-full overflow-hidden border-4"
            >
              <Image
                src="/placeholder.svg?height=192&width=192"
                alt="Profile picture"
                fill
                className="object-cover dark:invert"
                priority
              />
            </div>

            <div className="mt-4 text-center">
              <Button variant="outline" size="sm" className="text-sm">
                Update Photo
              </Button>
            </div>

            <div className="mt-8 w-full">
              <div
                style={{
                  backgroundColor: "hsl(var(--muted))",
                  color: "hsl(var(--muted-foreground))",
                }}
                className="rounded-lg p-4 border border-border"
              >
                <h3
                  className="text-sm font-medium mb-4"
                  style={{ color: "hsl(var(--foreground))" }}
                >
                  Statistics
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                        Total Points
                      </span>
                      <span
                        className="font-medium"
                        style={{ color: "hsl(var(--foreground))" }}
                      >
                        {teacher.totalPoints || 0}
                      </span>
                    </div>
                    <Progress
                      value={teacher.totalPoints || 0}
                      className="h-2"
                      indicatorClassName="bg-teal-500 dark:bg-teal-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-1">
                        <Bookmark className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                        Certifications
                      </span>
                      <span
                        className="font-medium"
                        style={{ color: "hsl(var(--foreground))" }}
                      >
                        {teacher.certifications
                          ? teacher.certifications.length
                          : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label
        className="block text-sm font-medium mb-1"
        style={{ color: "hsl(var(--foreground))" }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent"
        style={{
          backgroundColor: "hsl(var(--background))",
          borderColor: "hsl(var(--input))",
          color: "hsl(var(--foreground))",
        }}
        required
      />
    </div>
  );
}
