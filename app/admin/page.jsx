"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import FacultyLeaderboard from "@/components/faculty-leaderboard";
import * as XLSX from "xlsx";
import { toast } from "sonner";

const TABS = [
  { label: "Faculty Leaderboard", value: "leaderboard" },
  { label: "All Certificates", value: "certificates" },
  { label: "Create Certification Link", value: "create" },
];

const ADMIN_EMAILS = [
  "siddhartht4206@gmail.com",
  "23r21a12b3@mlrit.ac.in",
  "23r21a1285@mlrit.ac.in",
  "drrajasekhar@mlrinstitutions.ac.in",
];

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState("leaderboard");
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [certLink, setCertLink] = useState("");
  const [certLinkDesc, setCertLinkDesc] = useState("");
  const [certLinkDept, setCertLinkDept] = useState("All Departments");
  const [certLinkLastDate, setCertLinkLastDate] = useState("");
  const [certLinkList, setCertLinkList] = useState([]);
  const [storedCertLinks, setStoredCertLinks] = useState([]);
  const [savingLink, setSavingLink] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchData = async () => {
      try {
        // Fetch teachers
        const teachersRes = await fetch("/api/teachers");
        if (!teachersRes.ok) throw new Error("Failed to fetch teachers");
        const teachersData = await teachersRes.json();
        setTeachers(teachersData);

        // Fetch stored certification links
        const linksRes = await fetch("/api/certification-links");
        if (linksRes.ok) {
          const linksData = await linksRes.json();
          setStoredCertLinks(linksData);
        }
      } catch (e) {
        console.error("Error fetching data:", e);
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [status]);

  const handleCreateCertLink = async (e) => {
    e.preventDefault();

    if (!certLink || !certLinkDesc || !certLinkLastDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSavingLink(true);

      const response = await fetch("/api/certification-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: certLink,
          description: certLinkDesc,
          department: certLinkDept,
          lastDateToApply: certLinkLastDate,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create certification link");
      }

      const newLink = await response.json();

      // Add to local state
      setCertLinkList((prev) => [
        ...prev,
        {
          url: certLink,
          description: certLinkDesc,
          department: certLinkDept,
          lastDateToApply: certLinkLastDate,
        },
      ]);

      // Add to stored links from API
      setStoredCertLinks((prev) => [...prev, newLink]);

      // Reset form
      setCertLink("");
      setCertLinkDesc("");
      setCertLinkDept("All Departments");
      setCertLinkLastDate("");

      toast.success("Certification link created successfully");
    } catch (error) {
      console.error("Error creating certification link:", error);
      toast.error(error.message || "Failed to create certification link");
    } finally {
      setSavingLink(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">Loading...</div>
    );
  }

  if (!session || !ADMIN_EMAILS.includes(session.user?.email)) {
    if (status === "authenticated") {
      return (
        <div className="container mx-auto py-8 px-4 text-center text-red-500">
          Access Denied
        </div>
      );
    }
    router.push("/auth/signin");
    return null;
  }

  // Excel export for leaderboard
  const handleExportExcel = () => {
    const rows = teachers.map((t) => ({
      Name: t.name,
      Email: t.email,
      Department: t.department,
      "Contact Number": t.contactNumber,
      "Total Points": t.totalPoints,
      Certifications: t.certifications?.map((c) => c.name).join(", ") || "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Faculty");
    XLSX.writeFile(wb, "faculty_leaderboard.xlsx");
  };

  // All certificates (flattened)
  const allCertificates = teachers.flatMap((t) =>
    (t.certifications || []).map((c) => ({
      facultyName: t.name,
      facultyEmail: t.email,
      department: t.department,
      ...c,
    }))
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-light text-center mb-8">Admin Dashboard</h1>
      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex justify-center mb-8">
          <TabsList>
            {TABS.map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                active={tab === t.value}
                onClick={() => setTab(t.value)}
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <Card>
          <CardContent className="p-6 min-h-[400px]">
            <TabsContent value="leaderboard" active={tab === "leaderboard"}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Faculty Leaderboard
                </h2>
                <Button onClick={handleExportExcel} className="flex gap-2">
                  Download Excel
                </Button>
              </div>
              <FacultyLeaderboard adminMode teachers={teachers} />
            </TabsContent>
            <TabsContent value="certificates" active={tab === "certificates"}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  All Certificates
                </h2>
                <Button
                  onClick={() => {
                    const rows = allCertificates.map((cert) => ({
                      Faculty: cert.facultyName,
                      Email: cert.facultyEmail,
                      Department: cert.department,
                      Certificate: cert.name,
                      Issuer: cert.issuingOrganization,
                      "Issue Date": cert.issueDate
                        ? new Date(cert.issueDate).toLocaleDateString()
                        : "",
                      "Expiry Date": cert.expiryDate
                        ? new Date(cert.expiryDate).toLocaleDateString()
                        : "",
                      "Credential ID": cert.credentialId,
                      "Credential URL": cert.credentialUrl,
                    }));
                    const ws = XLSX.utils.json_to_sheet(rows);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, "Certificates");
                    XLSX.writeFile(wb, "all_certificates.xlsx");
                  }}
                  className="flex gap-2"
                >
                  Download Excel
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border rounded-lg overflow-hidden">
                  <thead className="bg-muted dark:bg-muted/40">
                    <tr>
                      <th className="px-3 py-2">Faculty</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Department</th>
                      <th className="px-3 py-2">Certificate</th>
                      <th className="px-3 py-2">Issuer</th>
                      <th className="px-3 py-2">Issue Date</th>
                      <th className="px-3 py-2">Expiry Date</th>
                      <th className="px-3 py-2">Credential ID</th>
                      <th className="px-3 py-2">Credential URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allCertificates.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No certificates found
                        </td>
                      </tr>
                    ) : (
                      allCertificates.map((cert, idx) => (
                        <tr key={idx} className="border-b last:border-b-0">
                          <td className="px-3 py-2">{cert.facultyName}</td>
                          <td className="px-3 py-2">{cert.facultyEmail}</td>
                          <td className="px-3 py-2">{cert.department}</td>
                          <td className="px-3 py-2">{cert.name}</td>
                          <td className="px-3 py-2">
                            {cert.issuingOrganization}
                          </td>
                          <td className="px-3 py-2">
                            {cert.issueDate
                              ? new Date(cert.issueDate).toLocaleDateString()
                              : ""}
                          </td>
                          <td className="px-3 py-2">
                            {cert.expiryDate
                              ? new Date(cert.expiryDate).toLocaleDateString()
                              : ""}
                          </td>
                          <td className="px-3 py-2">{cert.credentialId}</td>
                          <td className="px-3 py-2">
                            {cert.credentialUrl ? (
                              <a
                                href={cert.credentialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 underline"
                              >
                                Link
                              </a>
                            ) : (
                              ""
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            <TabsContent value="create" active={tab === "create"}>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Create Certification Link
              </h2>
              <form
                onSubmit={handleCreateCertLink}
                className="space-y-4 max-w-lg"
              >
                <input
                  placeholder="Certification Link (URL)"
                  type="url"
                  value={certLink}
                  onChange={(e) => setCertLink(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground dark:bg-background dark:text-foreground"
                />
                <input
                  placeholder="Description"
                  value={certLinkDesc}
                  onChange={(e) => setCertLinkDesc(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground dark:bg-background dark:text-foreground"
                />
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={certLinkDept}
                    onChange={(e) => setCertLinkDept(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-background text-foreground dark:bg-background dark:text-foreground"
                  >
                    <option value="All Departments">All Departments</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Research Faculty">Research Faculty</option>
                    <option value="Department Chairs">Department Chairs</option>
                  </select>
                  <input
                    type="date"
                    placeholder="Last Date to Apply"
                    value={certLinkLastDate}
                    onChange={(e) => setCertLinkLastDate(e.target.value)}
                    required
                    className="px-3 py-2 border rounded-md bg-background text-foreground dark:bg-background dark:text-foreground"
                  />
                </div>
                <Button type="submit" disabled={savingLink}>
                  {savingLink ? "Saving..." : "Add Link"}
                </Button>
              </form>

              {/* Display stored certification links */}
              {(certLinkList.length > 0 || storedCertLinks.length > 0) && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">
                    Created Certification Links
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-muted dark:bg-muted/40">
                        <tr>
                          <th className="px-4 py-2 text-left">Description</th>
                          <th className="px-4 py-2 text-left">Department</th>
                          <th className="px-4 py-2 text-left">
                            Last Date to Apply
                          </th>
                          <th className="px-4 py-2 text-left">Link</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {/* Show stored links from API */}
                        {storedCertLinks.map((link, idx) => (
                          <tr key={`stored-${idx}`}>
                            <td className="px-4 py-2">{link.description}</td>
                            <td className="px-4 py-2">{link.department}</td>
                            <td className="px-4 py-2">
                              {formatDate(link.lastDateToApply)}
                            </td>
                            <td className="px-4 py-2">
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 underline"
                              >
                                View
                              </a>
                            </td>
                          </tr>
                        ))}

                        {/* Show links just added in this session (before page refresh) */}
                        {certLinkList.map((link, idx) => (
                          <tr key={`new-${idx}`}>
                            <td className="px-4 py-2">{link.description}</td>
                            <td className="px-4 py-2">{link.department}</td>
                            <td className="px-4 py-2">
                              {formatDate(link.lastDateToApply)}
                            </td>
                            <td className="px-4 py-2">
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 underline"
                              >
                                View
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
