"use client";

import { useUserStore } from "@/lib/userStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const DashboardPage = () => {
  const { currentUser, isLoading } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push('/login');
    }
  }, [isLoading, currentUser, router]);

  
  if (isLoading || !currentUser) {
    return <div>Loading...</div>;
  }

  
  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-bold">
        Welcome to the Dashboard
      </h1>
      {currentUser && (
        <p className="mt-4 text-xl">Hello, {currentUser.email}</p>
      )}
    </div>
  );
};

export default DashboardPage;