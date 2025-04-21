"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Auth0Provider } from "@auth0/auth0-react";
import Header from "@/components/Header"; 
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const auth0Domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
  const auth0ClientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
  if (!auth0Domain || !auth0ClientId) {
    throw new Error(
      "Missing Auth0 environment variable (NEXT_PUBLIC_AUTH0_DOMAIN and/or NEXT_PUBLIC_AUTH0_CLIENT_ID)"
    );
  }
  return (
    <Auth0Provider
      domain={auth0Domain}
      clientId={auth0ClientId}
      useRefreshTokens={true}
      cacheLocation="localstorage"
      authorizationParams={{
        redirect_uri: globalThis?.window?.location?.origin,
      }}
    >
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Header /> 
          <main className="min-h-screen p-4">{children}</main>
          <Footer /> 
        </body>
      </html>
    </Auth0Provider>
  );
}
