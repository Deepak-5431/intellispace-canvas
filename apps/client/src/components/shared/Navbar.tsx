"use client";

import { useUserStore } from "@/lib/userStore";
import { account } from "@/lib/appwrite";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

const Navbar = () => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currentUser, fetchUser } = useUserStore();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

const handleLogout = async () => {
  console.log("1. Logout process started...");
  try {
    await account.deleteSession('current');
    console.log("2. Appwrite session deleted successfully.");

    await fetchUser();
    console.log("3. Global user state has been updated.");

    router.push('/login');
    console.log("4. Redirecting to /login page.");
  } catch (error){
    console.error("5. FAILED to log out:", error);
  }
};

  const getInitials = (user: { name?: string; email?: string } | null) => {
    if (!user) return "";
    if (user.name) {
      return user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase();
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

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
    <nav className="w-full top-0 relative z-50 bg-gradient-to-r from-black via-gray-900 to-red-700 text-white shadow-lg border-b border-red-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center py-3">
          <Link href="/" className="text-2xl font-bold tracking-tight text-white hover:text-red-500 transition-colors duration-200">
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
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-xl shadow-xl border border-gray-700 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-700">
                      <p className="text-sm text-gray-400">Signed in as</p>
                      <p className="text-sm font-medium text-white truncate">{currentUser.email}</p>
                    </div>
                    <button
                      onClick={handleLogoutClick}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-600 hover:text-white transition-colors duration-150"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 rounded-lg text-white font-semibold hover:bg-gray-700 transition-colors duration-200">
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