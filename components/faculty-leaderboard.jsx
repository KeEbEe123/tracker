"use client";

import Image from "next/image";
import {
  Medal,
  Trophy,
  Award,
  Search,
  ArrowUpDown,
  BarChart3,
  TrendingUp,
  Calendar,
  BookOpen,
  Users,
  School,
  Zap,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingSpinner } from "@/components/LoadingSpinner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function FacultyLeaderboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [upcomingCertifications, setUpcomingCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("totalPoints");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isFiltering, setIsFiltering] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  // ❌ Emails to exclude from leaderboard
  const exemptedEmails = [
    "23r21a1285@mlrit.ac.in",
    "drrajasekhar@mlrinstitutions.ac.in",
    "23r21a12b3@mlrit.ac.in",
  ];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && session.user?.email) {
      setCurrentUserEmail(session.user.email);
    }
  }, [status, session]);

  useEffect(() => {
    const fetchData = async () => {
      if (status !== "authenticated") return;

      try {
        setLoading(true);

        // Fetch teachers
        const teachersRes = await fetch("/api/teachers");
        if (!teachersRes.ok) {
          throw new Error("Failed to fetch teachers");
        }
        const teachersList = await teachersRes.json();

        const teachersNeedingUpdate = teachersList.filter(
          (teacher) => !teacher.improvementRate || !teacher.recentAchievement
        );

        const updatedTeachers = [];
        for (const teacher of teachersNeedingUpdate) {
          let needsUpdate = false;
          const updates = { ...teacher };

          if (!teacher.improvementRate) {
            updates.improvementRate = Math.floor(Math.random() * 20) + 1;
            needsUpdate = true;
          }

          if (
            !teacher.recentAchievement &&
            teacher.certifications &&
            teacher.certifications.length > 0
          ) {
            const latestCert = teacher.certifications.reduce((latest, cert) => {
              const certDate = new Date(cert.issueDate);
              return !latest || certDate > new Date(latest.issueDate)
                ? cert
                : latest;
            }, null);
            if (latestCert) {
              updates.recentAchievement = latestCert.name;
              needsUpdate = true;
            }
          }

          if (needsUpdate) {
            try {
              const updateRes = await fetch(
                `/api/teacher/${teacher._id}/update`,
                {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    improvementRate: updates.improvementRate,
                    recentAchievement: updates.recentAchievement,
                  }),
                }
              );

              if (updateRes.ok) {
                const updatedTeacher = await updateRes.json();
                updatedTeachers.push(updatedTeacher);
              }
            } catch {
              updatedTeachers.push(updates);
            }
          }
        }

        const mergedTeachers = teachersList.map((teacher) => {
          const updated = updatedTeachers.find((u) => u._id === teacher._id);
          return updated || teacher;
        });

        const filteredTeachers = mergedTeachers.filter(
          (teacher) => !exemptedEmails.includes(teacher.email)
        );

        setTeachers(filteredTeachers);

        // Fetch departments
        const deptsRes = await fetch("/api/departments");
        if (deptsRes.ok) {
          const deptsData = await deptsRes.json();
          setDepartments(deptsData);
        }

        // Fetch certifications
        const certsRes = await fetch("/api/certification-links");
        if (certsRes.ok) {
          const certsData = await certsRes.json();
          setUpcomingCertifications(certsData);
        } else {
          setUpcomingCertifications([
            {
              name: "Advanced Teaching Methods",
              date: "June 15, 2025",
              department: "All Departments",
            },
            {
              name: "Research Grant Writing",
              date: "July 2, 2025",
              department: "Research Faculty",
            },
            {
              name: "Digital Learning Technologies",
              date: "July 18, 2025",
              department: "All Departments",
            },
            {
              name: "Academic Leadership",
              date: "August 5, 2025",
              department: "Department Chairs",
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <LoadingSpinner />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  const topThree = [...teachers]
    .sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999))
    .slice(0, 3);

  while (topThree.length < 3) {
    topThree.push({
      _id: `placeholder-${topThree.length}`,
      name: "N/A",
      department: "N/A",
      totalPoints: 0,
      certifications: [],
      profilePicture: null,
    });
  }

  const mostImproved = [...teachers]
    .sort((a, b) => b.improvementRate - a.improvementRate)
    .slice(0, 3);

  const remainingFaculty = [...teachers]
    .sort((a, b) => {
      if (sortBy === "totalPoints") {
        return sortOrder === "desc"
          ? b.totalPoints - a.totalPoints
          : a.totalPoints - b.totalPoints;
      } else if (sortBy === "certifications") {
        return sortOrder === "desc"
          ? b.certifications.length - a.certifications.length
          : a.certifications.length - b.certifications.length;
      } else if (sortBy === "name") {
        return sortOrder === "desc"
          ? b.name.localeCompare(a.name)
          : a.name.localeCompare(b.name);
      } else if (sortBy === "department") {
        return sortOrder === "desc"
          ? b.department.localeCompare(a.department)
          : a.department.localeCompare(b.department);
      }
      return 0;
    })
    .filter((_, index) => index > 3)
    .filter(
      (faculty) =>
        faculty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faculty.department.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleSort = (column) => {
    setIsFiltering(true);
    setTimeout(() => setIsFiltering(false), 300);
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const totalCertifications = teachers.reduce(
    (sum, teacher) =>
      sum + (teacher.certifications ? teacher.certifications.length : 0),
    0
  );

  const averageScore = Math.round(
    teachers.reduce((sum, teacher) => sum + (teacher.totalPoints || 0), 0) /
      (teachers.length || 1)
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">
          Faculty Certification Leaderboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Recognizing excellence in professional development
        </p>
      </div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Faculty Members
                </p>
                <h3 className="text-2xl font-bold">{teachers.length}</h3>
              </div>
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: "var(--teal-bg-color, #f0fdfa)",
                }}
              >
                <User className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Total Certifications
                </p>
                <h3 className="text-2xl font-bold">{totalCertifications}</h3>
              </div>
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: "var(--indigo-bg-color, #eef2ff)",
                }}
              >
                <Award className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Average Score
                </p>
                <h3 className="text-2xl font-bold">{averageScore / 10}</h3>
              </div>
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: "var(--amber-bg-color, #eef2ff)",
                }}
              >
                <BarChart3 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Departments
                </p>
                <h3 className="text-2xl font-bold">{departments.length}</h3>
              </div>
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: "var(--blue-bg-color, #eff6ff)",
                }}
              >
                <School className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 pt-20">
        {/* Podium Section */}
        <motion.div
          className="lg:col-span-2 relative h-[340px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Second Place - Left */}
          <motion.div
            className="absolute left-0 bottom-0 w-1/3 flex flex-col items-center"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative mb-3">
              <div
                className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-gray-500 dark:border-gray-600 cursor-pointer"
                onClick={() =>
                  topThree[1].email &&
                  router.push(
                    `/profile/${encodeURIComponent(topThree[1].email)}`
                  )
                }
              >
                <Image
                  src={
                    topThree[1].profilePicture ||
                    "/placeholder.svg?height=150&width=150"
                  }
                  alt={topThree[1].name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <h3 className="font-semibold">{topThree[1].name}</h3>
            <p className="text-sm">{topThree[1].department}</p>
            <p className="text-sm font-medium text-teal-600 dark:text-teal-400">
              {topThree[1].totalPoints} points
            </p>
            <motion.div
              className="bg-gray-500 dark:bg-gray-600 h-32 w-full max-w-[180px] rounded-t-lg mt-3 flex items-end justify-center shadow-md"
              initial={{ height: 0 }}
              animate={{ height: 128 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <p className="mb-2 text-2xl font-bold text-white">2</p>
            </motion.div>
          </motion.div>

          {/* First Place - Center */}
          <motion.div
            className="absolute left-1/3 right-1/3 bottom-0 flex flex-col items-center"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative mb-3">
              <div
                className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-500 dark:border-yellow-600 cursor-pointer"
                onClick={() =>
                  topThree[0].email &&
                  router.push(
                    `/profile/${encodeURIComponent(topThree[0].email)}`
                  )
                }
              >
                <Image
                  src={
                    topThree[0].profilePicture ||
                    "/placeholder.svg?height=150&width=150"
                  }
                  alt={topThree[0].name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <h3 className="font-semibold text-ld">{topThree[0].name}</h3>
            <p className="">{topThree[0].department}</p>
            <p className="text-md font-medium text-teal-600 dark:text-teal-400">
              {topThree[0].totalPoints} points
            </p>
            <motion.div
              className="bg-yellow-500 dark:bg-yellow-600 w-full max-w-[180px] rounded-t-lg mt-3 flex items-end justify-center shadow-md"
              initial={{ height: 0 }}
              animate={{ height: 160 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <p className="mb-2 text-3xl font-bold text-white">1</p>
            </motion.div>
          </motion.div>

          {/* Third Place - Right */}
          <motion.div
            className="absolute right-0 bottom-0 w-1/3 flex flex-col items-center"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="relative mb-3">
              <div
                className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500 dark:border-blue-600 cursor-pointer"
                onClick={() =>
                  topThree[2].email &&
                  router.push(
                    `/profile/${encodeURIComponent(topThree[2].email)}`
                  )
                }
              >
                <Image
                  src={
                    topThree[2].profilePicture ||
                    "/placeholder.svg?height=150&width=150"
                  }
                  alt={topThree[2].name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <h3 className="font-semibold">{topThree[2].name}</h3>
            <p className="text-sm">{topThree[2].department}</p>
            <p className="text-sm font-medium text-teal-600 dark:text-teal-400">
              {topThree[2].totalPoints} points
            </p>
            <motion.div
              className="bg-blue-500 dark:bg-blue-600 w-full max-w-[180px] rounded-t-lg mt-3 flex items-end justify-center shadow-md"
              initial={{ height: 0 }}
              animate={{ height: 96 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <p className="mb-2 text-2xl font-bold text-white">3</p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Most Improved Faculty */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                Most Improved Faculty
              </CardTitle>
              <CardDescription>
                Faculty with the highest improvement rate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mostImproved.map((faculty, index) => (
                  <div
                    key={faculty._id}
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() =>
                      faculty.email &&
                      router.push(
                        `/profile/${encodeURIComponent(faculty.email)}`
                      )
                    }
                  >
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-slate-100 dark:border-slate-700">
                      <Image
                        src={
                          faculty.profilePicture ||
                          "/placeholder.svg?height=150&width=150"
                        }
                        alt={faculty.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{faculty.name}</h4>
                        <Badge
                          variant="outline"
                          className="text-teal-700 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/30"
                          style={{
                            backgroundColor: "var(--teal-bg-color, #f0fdfa)",
                          }}
                        >
                          +{faculty.improvementRate}%
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {faculty.department}
                      </p>
                      <div className="mt-1">
                        <Progress
                          value={faculty.improvementRate * 5}
                          className="h-1.5"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Department Performance and Upcoming Certifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 pt-20">
        {/* Department Performance */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Department Performance
              </CardTitle>
              <CardDescription>
                Average scores and certification counts by department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departments.slice(0, 5).map((dept, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{dept.name}</h4>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {dept.totalCerts} certifications
                        </span>
                        <span className="font-medium text-teal-600 dark:text-teal-400">
                          {dept.avgScore} avg
                        </span>
                      </div>
                    </div>
                    <Progress value={dept.avgScore} className="h-2" />
                  </div>
                ))}

                {departments.length === 0 && (
                  <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                    No department data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements - Moved here */}
          <motion.div
            className="mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  Recent Faculty Achievements
                </CardTitle>
                <CardDescription>
                  Latest certification accomplishments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teachers
                    .filter((faculty) => faculty.recentAchievement)
                    .slice(0, 6)
                    .map((faculty) => (
                      <div
                        key={faculty._id}
                        className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                        onClick={() =>
                          faculty.email &&
                          router.push(
                            `/profile/${encodeURIComponent(faculty.email)}`
                          )
                        }
                      >
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-red-100/50 dark:border-slate-700 flex-shrink-0">
                          <Image
                            src={
                              faculty.profilePicture ||
                              "/placeholder.svg?height=150&width=150"
                            }
                            alt={faculty.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium">{faculty.name}</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {faculty.department}
                          </p>
                          <p className="text-sm text-teal-600 dark:text-teal-400 mt-1">
                            <BookOpen className="h-3.5 w-3.5 inline mr-1" />
                            {faculty.recentAchievement}
                          </p>
                        </div>
                      </div>
                    ))}

                  {teachers.filter((faculty) => faculty.recentAchievement)
                    .length === 0 && (
                    <div className="col-span-full text-center py-4 text-slate-500 dark:text-slate-400">
                      No recent achievements available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Upcoming Certification Opportunities */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Upcoming Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingCertifications.slice(0, 4).map((cert, index) => (
                  <div
                    key={index}
                    className="border-l-2 border-indigo-200 dark:border-indigo-800 pl-3 py-1"
                  >
                    <h4 className="font-medium">
                      {cert.description || cert.name}
                    </h4>
                    <div className="flex justify-between items-center text-sm">
                      <p className="text-slate-500 dark:text-slate-400">
                        {cert.department}
                      </p>
                      <p className="text-red-600 dark:text-red-400">
                        {cert.lastDateToApply
                          ? formatDate(cert.lastDateToApply)
                          : cert.date}
                      </p>
                    </div>
                    {cert.url && (
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
                      >
                        View Details →
                      </a>
                    )}
                  </div>
                ))}

                {upcomingCertifications.length === 0 && (
                  <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                    No upcoming certifications available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Table Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">All Faculty Rankings</h2>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <Input
                  placeholder="Search faculty..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => {
                    setIsFiltering(true);
                    setSearchQuery(e.target.value);
                    setTimeout(() => setIsFiltering(false), 300);
                  }}
                />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Rank</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("name")}
                      className="flex items-center gap-1 font-medium"
                    >
                      Name
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("department")}
                      className="flex items-center gap-1 font-medium"
                    >
                      Department
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("certifications")}
                      className="flex items-center gap-1 font-medium ml-auto"
                    >
                      Certifications
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("totalPoints")}
                      className="flex items-center gap-1 font-medium ml-auto"
                    >
                      Score
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Top Three Faculty Members */}
                <AnimatePresence>
                  {!isFiltering &&
                    topThree.map((faculty, index) => (
                      <motion.tr
                        key={faculty._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.05,
                          ease: "easeOut",
                        }}
                        className={`cursor-pointer hover:bg-muted/50 data-[state=selected]:bg-muted ${
                          faculty.email === currentUserEmail
                            ? "bg-teal-50 dark:bg-teal-950/20 border-l-4 border-teal-500"
                            : ""
                        }`}
                        onClick={() =>
                          faculty.email &&
                          router.push(
                            `/profile/${encodeURIComponent(faculty.email)}`
                          )
                        }
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {index === 0 && (
                              <Trophy className="h-5 w-5 text-yellow-500" />
                            )}
                            {index === 1 && (
                              <Medal className="h-5 w-5 text-gray-500" />
                            )}
                            {index === 2 && (
                              <Award className="h-5 w-5 text-blue-500" />
                            )}
                            {index + 1}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border">
                              <Image
                                src={
                                  faculty.profilePicture ||
                                  "/placeholder.svg?height=150&width=150"
                                }
                                alt={faculty.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              {faculty.name}
                              {faculty.email === currentUserEmail && (
                                <Badge variant="outline" className="text-xs">
                                  You
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{faculty.department}</TableCell>
                        <TableCell className="text-right">
                          {faculty.certifications?.length || 0}
                        </TableCell>
                        <TableCell className="text-right font-medium text-teal-600 dark:text-teal-400">
                          {faculty.totalPoints}
                        </TableCell>
                      </motion.tr>
                    ))}

                  {/* Remaining Faculty Members */}
                  {!isFiltering &&
                  
                    remainingFaculty.map((faculty, index) => (
                      <motion.tr
                        key={faculty._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.05,
                          ease: "easeOut",
                        }}
                        className="cursor-pointer hover:bg-muted/50 data-[state=selected]:bg-muted"
                        onClick={() =>
                          faculty.email &&
                          router.push(
                            `/profile/${encodeURIComponent(faculty.email)}`
                          )
                        }
                      >
                        <TableCell className="font-medium">
                          {faculty.rank ?? index + 4}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border">
                              <Image
                                src={
                                  faculty.profilePicture ||
                                  "/placeholder.svg?height=150&width=150"
                                }
                                alt={faculty.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            {faculty.name}
                          </div>
                        </TableCell>
                        <TableCell>{faculty.department}</TableCell>
                        <TableCell className="text-right">
                          {faculty.certifications?.length || 0}
                        </TableCell>
                        <TableCell className="text-right font-medium text-teal-600 dark:text-teal-400">
                          {faculty.totalPoints}
                        </TableCell>
                      </motion.tr>
                    ))}
                </AnimatePresence>

                {remainingFaculty.length === 0 && topThree.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {searchQuery
                        ? "No faculty members found matching your search"
                        : "No faculty members found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
