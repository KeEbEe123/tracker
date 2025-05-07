// app/page.jsx or app/page.tsx
'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import FacultyLeaderboard from '@/components/faculty-leaderboard';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 p-4 bg-transparent dark:bg-blue-900 text-black dark:text-white border-l-4 border-blue-400 dark:border-blue-300 rounded">
        Note: The leaderboard is updated every day at 12 midnight. If your name isn't visible here, it will be updated by the next day.
      </div>
      <FacultyLeaderboard />
    </div>
  );
}
