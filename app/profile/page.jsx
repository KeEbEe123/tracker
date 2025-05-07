"use client";

import { useState, useEffect, useRef } from "react";
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
  Upload,
  Loader2,
  Edit,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { NoCertifications } from "@/components/ui/NoCertifications";
import { LoadingSpinner } from "@/components/LoadingSpinner";

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
    designation: "",
  });
  const [newCertification, setNewCertification] = useState({
    name: "",
    issuingOrganization: "",
    issueDate: "",
    credentialId: "",
    credentialUrl: "",
    imageUrl: "",
    type: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [activeTab, setActiveTab] = useState("view");
  const [editingCert, setEditingCert] = useState(null);
  const [uploadingProfilePicture, setUploadingProfilePicture] = useState(false);
  const [profileImageError, setProfileImageError] = useState("");
  const fileInputRef = useRef(null);
  const [patchNoteBanner, setPatchNoteBanner] = useState(null);

  // Add certification types constant
  const CERTIFICATION_TYPES = [
    { value: "fdp", label: "FDP (Faculty Development Program)", points: 5 },
    { value: "global", label: "Global Certification", points: 10 },
    { value: "webinar", label: "Webinars/Workshops", points: 3 },
    { value: "online", label: "Online Courses", points: 8 },
    { value: "other", label: "Others", points: 2 },
  ];

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

        // If patchNotes is present, alert and redirect to profile (only once)
        if (data.patchNotes && !window.sessionStorage.getItem("patchNotesShown")) {
          window.sessionStorage.setItem("patchNotesShown", "true");
          alert(data.patchNotes);
          router.push("/profile");
        }

        setTeacher(data);
        setFormData({
          name: data.name,
          contactNumber: data.contactNumber,
          department: data.department,
          designation: data.designation || "",
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

  useEffect(() => {
    const note = typeof window !== 'undefined' ? window.sessionStorage.getItem("patchNotes") : null;
    if (note) {
      setPatchNoteBanner(note);
      window.sessionStorage.removeItem("patchNotes");
    }
  }, []);

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
        credentialId: "",
        credentialUrl: "",
        imageUrl: "",
        type: "",
      });
    } catch (error) {
      console.error("Error adding certification:", error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      // Validate file type first
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];

      if (!validTypes.includes(file.type)) {
        throw new Error("Please upload a valid image (JPEG, JPG, or PNG only)");
      }

      // Create FormData
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to upload image");
      }

      const data = await res.json();
      setNewCertification((prev) => ({ ...prev, imageUrl: data.url }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      // Display error to the user
      alert(error.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset error state
    setProfileImageError("");

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setProfileImageError("File size exceeds 5MB limit");
      return;
    }

    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setProfileImageError(
        "Please upload a valid image (JPEG, JPG, or PNG only)"
      );
      return;
    }

    setUploadingProfilePicture(true);
    try {
      // Create FormData
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/profile-picture", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to upload profile picture");
      }

      const data = await res.json();

      // Update the teacher state with the new profile picture URL
      setTeacher({
        ...teacher,
        profilePicture: data.url,
      });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      setProfileImageError(error.message || "Failed to upload profile picture");
    } finally {
      setUploadingProfilePicture(false);
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

  const handleEditCertification = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `/api/teacher/certifications/${editingCert._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCertification),
        }
      );
      const updated = await res.json();
      setTeacher(updated);
      setEditingCert(null);
      setNewCertification({
        name: "",
        issuingOrganization: "",
        issueDate: "",
        credentialId: "",
        credentialUrl: "",
        imageUrl: "",
        type: "",
      });
      setImagePreview(null);
    } catch (error) {
      console.error("Error updating certification:", error);
    }
  };

  const handleDeleteCertification = async (certId) => {
    if (!confirm("Are you sure you want to delete this certification?")) return;

    try {
      const res = await fetch(`/api/teacher/certifications/${certId}`, {
        method: "DELETE",
      });
      const updated = await res.json();
      setTeacher(updated);
    } catch (error) {
      console.error("Error deleting certification:", error);
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
          <LoadingSpinner />
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
      {patchNoteBanner && (
        <div className="mb-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded">
          {patchNoteBanner}
        </div>
      )}
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
                    {teacher.designation} - {teacher.department}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setEditing(!editing)}
                  className="flex items-center gap-2 bg-slate-800 text-slate-100 hover:text-black"
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
                <p className="flex items-center gap-2">
                  <BookOpen
                    style={{ color: "hsl(var(--muted-foreground))" }}
                    className="h-4 w-4"
                  />
                  <span className="font-medium">Designation:</span>{" "}
                  {teacher.designation || "Not specified"}
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
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    style={{ color: "hsl(var(--foreground))" }}
                  >
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent"
                    style={{
                      backgroundColor: "hsl(var(--background))",
                      borderColor: "hsl(var(--input))",
                      color: "hsl(var(--foreground))",
                    }}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="IT">IT</option>
                    <option value="CSE">CSE</option>
                    <option value="CSE-AIML">CSE-AIML</option>
                    <option value="CSDS">CSDS</option>
                    <option value="CSE-Cyber Security">
                      CSE-Cyber Security
                    </option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="MECH">MECH</option>
                    <option value="AERO">AERO</option>
                    <option value="CSIT">CSIT</option>
                    <option value="MBA">MBA</option>
                    <option value="H&S">H&S</option>
                  </select>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    style={{ color: "hsl(var(--foreground))" }}
                  >
                    Designation
                  </label>
                  <select
                    value={formData.designation}
                    onChange={(e) =>
                      setFormData({ ...formData, designation: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent"
                    style={{
                      backgroundColor: "hsl(var(--background))",
                      borderColor: "hsl(var(--input))",
                      color: "hsl(var(--foreground))",
                    }}
                  >
                    <option value="">Select Designation</option>
                    <option value="Professor">Professor</option>
                    <option value="Assistant Professor">
                      Assistant Professor
                    </option>
                    <option value="Head of Department">
                      Head of Department
                    </option>
                  </select>
                </div>
                <Button
                  type="submit"
                  className="bg-slate-800 text-slate-100 hover:bg-slate-700 w-full"
                >
                  Save Changes
                </Button>
              </form>
            ) : null}

            {/* Certifications Section */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium flex items-center gap-2">
                  <Award className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  Certifications
                </h2>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setActiveTab("view")}
                    variant={activeTab === "view" ? "default" : "outline"}
                    className={
                      activeTab === "view"
                        ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                        : "text-slate-800 hover:bg-slate-100"
                    }
                  >
                    View All
                  </Button>
                  <Button
                    onClick={() => {
                      setActiveTab("edit");
                      setEditingCert(null);
                    }}
                    variant={activeTab === "edit" ? "default" : "outline"}
                    className={
                      activeTab === "edit"
                        ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                        : "text-slate-800 hover:bg-slate-100"
                    }
                  >
                    {editingCert ? "Edit" : "Add New"}
                  </Button>
                </div>
              </div>

              {activeTab === "edit" ? (
                <form
                  onSubmit={
                    editingCert
                      ? handleEditCertification
                      : handleAddCertification
                  }
                  className="space-y-4 mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-border"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Certification Name *"
                      value={newCertification.name}
                      onChange={(e) =>
                        setNewCertification({
                          ...newCertification,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                    <Input
                      label="Issuing Organization *"
                      value={newCertification.issuingOrganization}
                      onChange={(e) =>
                        setNewCertification({
                          ...newCertification,
                          issuingOrganization: e.target.value,
                        })
                      }
                      required
                    />
                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        style={{ color: "hsl(var(--foreground))" }}
                      >
                        Certification Type *
                      </label>
                      <select
                        value={newCertification.type}
                        onChange={(e) =>
                          setNewCertification({
                            ...newCertification,
                            type: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent"
                        style={{
                          backgroundColor: "hsl(var(--background))",
                          borderColor: "hsl(var(--input))",
                          color: "hsl(var(--foreground))",
                        }}
                        required
                      >
                        <option value="">Select Type</option>
                        {CERTIFICATION_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label} ({type.points} points)
                          </option>
                        ))}
                      </select>
                    </div>
                    <Input
                      label="Issue Date *"
                      type="date"
                      value={newCertification.issueDate}
                      onChange={(e) =>
                        setNewCertification({
                          ...newCertification,
                          issueDate: e.target.value,
                        })
                      }
                      required
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
                      required={false}
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
                      required={false}
                    />
                  </div>

                  {/* Image Upload Section */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Certification Image *
                    </label>
                    <div className="mt-1 flex items-center gap-4">
                      <label className="cursor-pointer">
                        <div className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                          <Upload className="h-4 w-4" />
                          <span>
                            {uploadingImage ? "Uploading..." : "Upload Image"}
                          </span>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/png,image/jpeg,image/jpg"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          required={!newCertification.imageUrl}
                        />
                      </label>
                      {(imagePreview || newCertification.imageUrl) && (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border">
                          <Image
                            src={imagePreview || newCertification.imageUrl}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={uploadingImage || !newCertification.imageUrl}
                    className="w-full bg-slate-800 text-slate-100 hover:bg-slate-700 disabled:bg-slate-300 disabled:text-slate-500"
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        {editingCert ? (
                          <>
                            <Edit className="mr-2 h-4 w-4" />
                            Update Certification
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Certification
                          </>
                        )}
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teacher.certifications?.length > 0 ? (
                    teacher.certifications.map((cert, index) => (
                      <Card key={cert._id || index} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="relative h-40 w-full">
                            <Image
                              src={cert.imageUrl || "/placeholder.svg?height=200&width=300"}
                              alt={cert.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{cert.name}</h3>
                                <p className="text-sm text-muted-foreground">{cert.issuingOrganization}</p>
                                <p className="text-sm text-teal-600 dark:text-teal-400 mt-1">
                                  {(!cert.type || cert.type === "")
                                    ? "No type"
                                    : `${CERTIFICATION_TYPES.find((t) => t.value === cert.type)?.label || "Other"} (${CERTIFICATION_TYPES.find((t) => t.value === cert.type)?.points || 2} points)`}
                                </p>
                                {/* If type is missing, show dropdown and save button */}
                                {(!cert.type || cert.type === "") && (
                                  <div className="mt-2">
                                    <form
                                      onSubmit={async (e) => {
                                        e.preventDefault();
                                        setTeacher((prev) => ({
                                          ...prev,
                                          certifications: prev.certifications.map((c, i) =>
                                            i === index ? { ...c, _updatingType: true } : c
                                          ),
                                        }));
                                        const form = e.target;
                                        const newType = form.elements["certType"].value;
                                        try {
                                          const res = await fetch(`/api/teacher/certifications/${cert._id}`, {
                                            method: "PATCH",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ type: newType }),
                                          });
                                          const updated = await res.json();
                                          setTeacher(updated);
                                        } catch (err) {
                                          alert("Failed to update certification type");
                                          setTeacher((prev) => ({
                                            ...prev,
                                            certifications: prev.certifications.map((c, i) =>
                                              i === index ? { ...c, _updatingType: false } : c
                                            ),
                                          }));
                                        }
                                      }}
                                    >
                                      <select
                                        name="certType"
                                        defaultValue=""
                                        className="px-2 py-1 rounded border mr-2"
                                        required
                                      >
                                        <option value="" disabled>
                                          Select Type
                                        </option>
                                        {CERTIFICATION_TYPES.map((type) => (
                                          <option key={type.value} value={type.value}>
                                            {type.label} ({type.points} points)
                                          </option>
                                        ))}
                                      </select>
                                      <Button
                                        type="submit"
                                        size="sm"
                                        className="bg-teal-600 text-white hover:bg-teal-700"
                                        disabled={!!cert._updatingType}
                                      >
                                        {cert._updatingType ? "Saving..." : "Save Type"}
                                      </Button>
                                    </form>
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    setActiveTab("edit");
                                    setEditingCert(cert);
                                    setNewCertification({
                                      name: cert.name,
                                      issuingOrganization: cert.issuingOrganization,
                                      issueDate: cert.issueDate.split("T")[0],
                                      credentialId: cert.credentialId,
                                      credentialUrl: cert.credentialUrl,
                                      imageUrl: cert.imageUrl,
                                      type: cert.type,
                                    });
                                  }}
                                  className="h-8 w-8 text-slate-800 hover:bg-slate-100"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleDeleteCertification(cert._id)}
                                  className="h-8 w-8 text-red-500 hover:bg-red-50 border-red-200 hover:border-red-300"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                              <p className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                Issued: {new Date(cert.issueDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <NoCertifications
                      showAddButton
                      onAddClick={() => {
                        setActiveTab("edit");
                        setEditingCert(null);
                      }}
                    />
                  )}
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
                src={
                  teacher.profilePicture ||
                  "/placeholder.svg?height=192&width=192"
                }
                alt="Profile picture"
                fill
                className="object-cover"
              />
            </div>

            <div className="mt-4 text-center">
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={handleProfilePictureUpload}
                ref={fileInputRef}
              />
              <Button
                variant="outline"
                size="sm"
                className="text-sm bg-slate-800 text-slate-100 hover:text-black"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingProfilePicture}
              >
                {uploadingProfilePicture ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Update Photo
                  </>
                )}
              </Button>
              {profileImageError && (
                <p className="text-xs text-red-500 mt-2">{profileImageError}</p>
              )}
            </div>

            <div className="mt-8 w-full">
              <div
                style={{
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
                    {/* <Progress
                      value={(teacher.totalPoints || 0) / 2}
                      className="h-2"
                      indicatorClassName="bg-teal-500 dark:bg-teal-400"
                    /> */}
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
                        {teacher.certifications?.length || 0}
                      </span>
                    </div>
                    {/* <Progress
                      value={(teacher.certifications?.length || 0) * 10}
                      className="h-2"
                      indicatorClassName="bg-teal-500 dark:bg-teal-400"
                    /> */}
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

function Input({ label, value, onChange, type = "text", required = false }) {
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
        required={required}
      />
    </div>
  );
}
