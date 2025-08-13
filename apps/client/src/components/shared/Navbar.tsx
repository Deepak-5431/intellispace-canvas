"use client";

import { useUserStore } from "@/lib/userStore";
import { account } from "@/lib/appwrite";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useRef, useEffect } from "react";

const Navbar = () => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currentUser, fetchUser } = useUserStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      console.log("Logged out successfully!");
      await fetchUser(); 
      router.push('/login');
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  
  const getInitials = (user: { name?: string; email?: string } | null) => {
    if (!user) return "";
    if (user.name) {
      return user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase();
    }
    if (user.email) {
      const parts = user.email.split("@")[0].split(".");
      return parts.map((p: string) => p[0]).join("").toUpperCase();
    }
    return "U";
  };

  const [showDropdown, setShowDropdown] = useState(false);
  useEffect(() => {
    if (!showDropdown) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showDropdown]);
  const handleAvatarClick = () => setShowDropdown(v => !v);
  const handleLogoutClick = async () => {
    setShowDropdown(false);
    await handleLogout();
  };

  return (
  <nav className="w-full top-0 z-50 bg-gradient-to-r from-black via-gray-900 to-red-700 text-white shadow-lg border-b border-red-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center py-3">
          <Link href="/" className="text-2xl font-bold tracking-tight text-gray-400 hover:text-red-800 transition-colors duration-200">
            IntelliSpace Canvas
          </Link>
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={handleAvatarClick}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-red-700 to-yellow-300 text-white font-bold text-lg shadow-md border-2 border-white focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-200"
                  aria-label="Profile"
                >
                  {getInitials(currentUser)}
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-36 bg-black rounded-xl shadow-xl border border-gray-800 py-2 z-50 animate-fade-in">
                    <button
                      onClick={handleLogoutClick}
                      className="w-full text-left px-4 py-2 bg-black text-white hover:text-white rounded-lg font-semibold transition-colors duration-150 cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors duration-200">
                  Login
                </Link>
                <Link href="/signup" className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition-all duration-200">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;