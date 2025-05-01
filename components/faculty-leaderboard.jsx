"use client";

import Image from "next/image";
import { Medal, Trophy, Award, Search, ArrowUpDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

export default function FacultyLeaderboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("totalPoints");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchTeachers = async () => {
      if (status !== "authenticated") return;

      try {
        const res = await fetch("/api/teachers");
        if (!res.ok) {
          throw new Error("Failed to fetch teachers");
        }
        const teachersList = await res.json();
        setTeachers(teachersList);
      } catch (error) {
        console.error("Error fetching teachers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  // Get top 3 faculty members
  const topThree = [...teachers]
    .sort((a, b) => b.totalPoints - a.totalPoints)
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

  // Get the rest of the faculty members (4th place and below)
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
    .slice(3)
    .filter(
      (faculty) =>
        faculty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faculty.department.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Faculty Certification Leaderboard</h1>
        <p className="text-muted-foreground mt-2">
          Recognizing excellence in professional development
        </p>
      </div>

      {/* Podium Section */}
      <div className="relative h-[340px] mb-16">
        {/* Second Place - Left */}
        <div className="absolute left-0 bottom-0 w-1/3 flex flex-col items-center">
          <div className="relative mb-3">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
              <Medal className="h-10 w-10 text-gray-500 dark:text-gray-400" />
            </div>
            <div 
              className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-gray-300 dark:border-gray-700 cursor-pointer transition-transform hover:scale-105"
              onClick={() => router.push(`/profile/${encodeURIComponent(topThree[1].email)}`)}
            >
              <Image
                src={topThree[1].profilePicture || "/placeholder.svg?height=150&width=150"}
                alt={topThree[1].name}
                fill
                className="object-cover"
              />
            </div>
          </div>
          <h3 className="font-semibold text-gray-900">{topThree[1].name}</h3>
          <p className="text-sm text-gray-600 dark:text-muted-foreground">{topThree[1].department}</p>
          <p className="text-sm font-medium text-teal-700 dark:text-teal-400">
            {topThree[1].totalPoints} points
          </p>
          <div className="bg-gray-300 dark:bg-gray-700 h-32 w-full max-w-[180px] rounded-t-lg mt-3 flex items-end justify-center">
            <p className="mb-2 text-xl font-bold text-gray-800 dark:text-gray-300">2</p>
          </div>
        </div>

        {/* First Place - Center */}
        <div className="absolute left-1/3 right-1/3 bottom-0 flex flex-col items-center">
          <div className="relative mb-3">
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10">
              <Trophy className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div 
              className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-300 dark:border-yellow-900 cursor-pointer transition-transform hover:scale-105"
              onClick={() => router.push(`/profile/${encodeURIComponent(topThree[0].email)}`)}
            >
              <Image
                src={topThree[0].profilePicture || "/placeholder.svg?height=150&width=150"}
                alt={topThree[0].name}
                fill
                className="object-cover"
              />
            </div>
          </div>
          <h3 className="font-semibold text-lg text-gray-900">{topThree[0].name}</h3>
          <p className="text-gray-600 dark:text-muted-foreground">{topThree[0].department}</p>
          <p className="text-md font-medium text-teal-700 dark:text-teal-400">
            {topThree[0].totalPoints} points
          </p>
          <div className="bg-yellow-200 dark:bg-yellow-900/30 h-40 w-full max-w-[180px] rounded-t-lg mt-3 flex items-end justify-center border-t-4 border-yellow-400 dark:border-yellow-600">
            <p className="mb-2 text-2xl font-bold text-yellow-800 dark:text-yellow-400">1</p>
          </div>
        </div>

        {/* Third Place - Right */}
        <div className="absolute right-0 bottom-0 w-1/3 flex flex-col items-center">
          <div className="relative mb-3">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
              <Award className="h-10 w-10 text-amber-800 dark:text-amber-600" />
            </div>
            <div 
              className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-amber-200 dark:border-amber-900 cursor-pointer transition-transform hover:scale-105"
              onClick={() => router.push(`/profile/${encodeURIComponent(topThree[2].email)}`)}
            >
              <Image
                src={topThree[2].profilePicture || "/placeholder.svg?height=150&width=150"}
                alt={topThree[2].name}
                fill
                className="object-cover"
              />
            </div>
          </div>
          <h3 className="font-semibold text-gray-900">{topThree[2].name}</h3>
          <p className="text-sm text-gray-600 dark:text-muted-foreground">{topThree[2].department}</p>
          <p className="text-sm font-medium text-teal-700 dark:text-teal-400">
            {topThree[2].totalPoints} points
          </p>
          <div className="bg-amber-100 dark:bg-amber-900/20 h-24 w-full max-w-[180px] rounded-t-lg mt-3 flex items-end justify-center">
            <p className="mb-2 text-xl font-bold text-amber-800 dark:text-amber-400">3</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">All Faculty Rankings</h2>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-600 dark:text-muted-foreground" />
              <Input
                placeholder="Search faculty..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                <TableHead>Email</TableHead>
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
              {remainingFaculty.map((faculty, index) => (
                <TableRow
                  key={faculty._id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/profile/${encodeURIComponent(faculty.email)}`)}
                >
                  <TableCell className="font-medium">{index + 4}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border">
                        <Image
                          src={faculty.profilePicture || "/placeholder.svg?height=150&width=150"}
                          alt={faculty.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{faculty.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {faculty.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{faculty.department}</span>
                      <span className="text-sm text-muted-foreground">
                        {faculty.contactNumber}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{faculty.email}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span>{faculty.certifications?.length || 0}</span>
                      <span className="text-sm text-muted-foreground">
                        {faculty.certifications?.length === 1
                          ? "certification"
                          : "certifications"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-medium text-teal-600 dark:text-teal-400">
                        {faculty.totalPoints}
                      </span>
                      <span className="text-sm text-muted-foreground">points</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {remainingFaculty.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No faculty members found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
