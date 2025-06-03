"use client"

import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { ThemeProvider } from "@/lib/ThemeContext"
import { AuthProvider } from "@/lib/AuthContext"

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
})

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
})

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <AuthProvider>
                    <ThemeProvider>
                        {" "}
                        <Header />
                        <main className="min-h-screen p-4">{children}</main>
                        <Footer />
                    </ThemeProvider>
                </AuthProvider>
            </body>
        </html>
    )
}
