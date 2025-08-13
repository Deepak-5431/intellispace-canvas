// path: apps/client/src/app/signup/page.tsx

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ID } from 'appwrite';
import { account } from '@/lib/appwrite';

const SignupPage = () => { // Changed to an arrow function
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await account.create(ID.unique(), email, password);
      console.log("Account created successfully!");
      router.push('/verify-email');
    } catch (error) {
      console.error("Failed to create account:", error);
    }
  };

  return (
   <div className="flex justify-center items-center pt-0 bg-gradient-to-br from-black via-gray-900 to-red-700 text-black min-h-[calc(100vh-65px)]">
      <div className="relative w-full max-w-md p-10 space-y-8 bg-white/90 rounded-2xl shadow-2xl backdrop-blur-md border border-gray-200">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center justify-center w-24 h-24 bg-gradient-to-tr from-indigo-400 via-purple-400 to-pink-400 rounded-full shadow-lg border-4 border-white">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        </div>
        <h1 className="pt-12 text-3xl font-extrabold text-center text-gray-800 tracking-tight drop-shadow-sm">Create an Account</h1>
        
        <form className="space-y-7" onSubmit={handleSubmit}>
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12H8m8 0a4 4 0 11-8 0 4 4 0 018 0zm0 0v1a4 4 0 01-8 0v-1" /></svg>
              </span>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3 3 1.343 3 3 3zm0 0v2m0 4h.01" /></svg>
              </span>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-semibold text-lg text-white bg-gradient-to-r from-black via-gray-800 to-red-700 rounded-lg shadow-md hover:from-red-800 hover:to-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-700 transition"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage; 