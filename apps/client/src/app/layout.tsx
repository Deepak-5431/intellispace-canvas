"use client";

import { useEffect } from "react";
import { useUserStore } from "../lib/userStore"; 
import { Geist, Geist_Mono } from "next/font/google";
import  Navbar  from '@/components/shared/Navbar';
import { ApolloProvider } from "@/lib/apollo-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function UserProvider({ children }: { children: React.ReactNode }) {
  const fetchUser = useUserStore((state) => state.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return <>{children}</>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ApolloProvider>
        <UserProvider>
          <Navbar />
          {children}
          </UserProvider>
          </ApolloProvider>
      </body>
    </html>
  );
}