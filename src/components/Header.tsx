"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "@/lib/ThemeContext"
import { useAuth } from "@/lib/AuthContext"

export default function Header() {
    const pathname = usePathname()
    const { theme, toggleTheme } = useTheme()
    const { user, isAuthenticated, logout, isLibrarian, isAdmin } = useAuth()

    return (
        <header className="bg-gray-900 border-b border-gray-700 py-4 shadow-lg light-mode:bg-white light-mode:border-gray-200">
            <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center">
                <div className="flex items-center space-x-8">
                    {" "}
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-2xl">📚</span>
                        <h1 className="text-xl font-bold text-white hover:text-gray-300 transition-colors light-mode:text-gray-800 light-mode:hover:text-gray-600">
                            TODO
                        </h1>
                    </Link>
                    <Link
                        href="/books"
                        className={`px-3 py-1 rounded-md transition-colors ${
                            pathname.startsWith("/books")
                                ? "bg-gray-700 text-white font-semibold light-mode:bg-gray-200 light-mode:text-gray-800"
                                : "text-gray-300 hover:bg-gray-800 hover:text-white light-mode:text-gray-600 light-mode:hover:bg-gray-100 light-mode:hover:text-gray-900"
                        }`}
                    >
                        Books
                    </Link>
                    <Link
                        href="/authors"
                        className={`px-3 py-1 rounded-md transition-colors ${
                            pathname.startsWith("/authors")
                                ? "bg-gray-700 text-white font-semibold light-mode:bg-gray-200 light-mode:text-gray-800"
                                : "text-gray-300 hover:bg-gray-800 hover:text-white light-mode:text-gray-600 light-mode:hover:bg-gray-100 light-mode:hover:text-gray-900"
                        }`}
                    >
                        Authors
                    </Link>{" "}
                    {/* Show Reserved and Transactions only to authenticated users */}
                    {isAuthenticated && (
                        <>
                            {/* For regular users, show separate Reserved tab */}
                            {!(isLibrarian() || isAdmin()) && (
                                <Link
                                    href="/reserved"
                                    className={`px-3 py-1 rounded-md transition-colors ${
                                        pathname.startsWith("/reserved")
                                            ? "bg-gray-700 text-white font-semibold light-mode:bg-gray-200 light-mode:text-gray-800"
                                            : "text-gray-300 hover:bg-gray-800 hover:text-white light-mode:text-gray-600 light-mode:hover:bg-gray-100 light-mode:hover:text-gray-900"
                                    }`}
                                >
                                    Reserved
                                </Link>
                            )}{" "}
                            <Link
                                href="/transactions"
                                className={`px-3 py-1 rounded-md transition-colors ${
                                    pathname.startsWith("/transactions")
                                        ? "bg-gray-700 text-white font-semibold light-mode:bg-gray-200 light-mode:text-gray-800"
                                        : "text-gray-300 hover:bg-gray-800 hover:text-white light-mode:text-gray-600 light-mode:hover:bg-gray-100 light-mode:hover:text-gray-900"
                                }`}
                            >
                                Transactions{" "}
                            </Link>
                            {/* Show Account tab only for regular users, not for LIBRARIAN/ADMIN */}
                            {!(isLibrarian() || isAdmin()) && (
                                <Link
                                    href="/account"
                                    className={`px-3 py-1 rounded-md transition-colors ${
                                        pathname.startsWith("/account")
                                            ? "bg-gray-700 text-white font-semibold light-mode:bg-gray-200 light-mode:text-gray-800"
                                            : "text-gray-300 hover:bg-gray-800 hover:text-white light-mode:text-gray-600 light-mode:hover:bg-gray-100 light-mode:hover:text-gray-900"
                                    }`}
                                >
                                    Account
                                </Link>
                            )}
                        </>
                    )}
                    {/* Show Users and Workflow management only to librarians and admins */}
                    {isAuthenticated && (isLibrarian() || isAdmin()) && (
                        <>
                            <Link
                                href="/users"
                                className={`px-3 py-1 rounded-md transition-colors ${
                                    pathname.startsWith("/users")
                                        ? "bg-gray-700 text-white font-semibold light-mode:bg-gray-200 light-mode:text-gray-800"
                                        : "text-gray-300 hover:bg-gray-800 hover:text-white light-mode:text-gray-600 light-mode:hover:bg-gray-100 light-mode:hover:text-gray-900"
                                }`}
                            >
                                Users
                            </Link>{" "}
                            {/* Combined Reservations tab for ADMIN/LIBRARIAN */}
                            <Link
                                href="/workflow"
                                className={`px-3 py-1 rounded-md transition-colors ${
                                    pathname.startsWith("/workflow") ||
                                    pathname.startsWith("/reserved")
                                        ? "bg-gray-700 text-white font-semibold light-mode:bg-gray-200 light-mode:text-gray-800"
                                        : "text-gray-300 hover:bg-gray-800 hover:text-white light-mode:text-gray-600 light-mode:hover:bg-gray-100 light-mode:hover:text-gray-900"
                                }`}
                            >
                                Reservations
                            </Link>
                            <Link
                                href="/inventory"
                                className={`px-3 py-1 rounded-md transition-colors ${
                                    pathname.startsWith("/inventory")
                                        ? "bg-gray-700 text-white font-semibold light-mode:bg-gray-200 light-mode:text-gray-800"
                                        : "text-gray-300 hover:bg-gray-800 hover:text-white light-mode:text-gray-600 light-mode:hover:bg-gray-100 light-mode:hover:text-gray-900"
                                }`}
                            >
                                Inventory
                            </Link>{" "}
                            <Link
                                href="/returns"
                                className={`px-3 py-1 rounded-md transition-colors ${
                                    pathname.startsWith("/returns")
                                        ? "bg-gray-700 text-white font-semibold light-mode:bg-gray-200 light-mode:text-gray-800"
                                        : "text-gray-300 hover:bg-gray-800 hover:text-white light-mode:text-gray-600 light-mode:hover:bg-gray-100 light-mode:hover:text-gray-900"
                                }`}
                            >
                                Returns
                            </Link>
                            <Link
                                href="/borrow"
                                className={`px-3 py-1 rounded-md transition-colors ${
                                    pathname.startsWith("/borrow")
                                        ? "bg-gray-700 text-white font-semibold light-mode:bg-gray-200 light-mode:text-gray-800"
                                        : "text-gray-300 hover:bg-gray-800 hover:text-white light-mode:text-gray-600 light-mode:hover:bg-gray-100 light-mode:hover:text-gray-900"
                                }`}
                            >
                                Borrow
                            </Link>
                            <Link
                                href="/statistics"
                                className={`px-3 py-1 rounded-md transition-colors ${
                                    pathname.startsWith("/statistics")
                                        ? "bg-gray-700 text-white font-semibold light-mode:bg-gray-200 light-mode:text-gray-800"
                                        : "text-gray-300 hover:bg-gray-800 hover:text-white light-mode:text-gray-600 light-mode:hover:bg-gray-100 light-mode:hover:text-gray-900"
                                }`}
                            >
                                Statistics
                            </Link>
                            <Link
                                href="/balance-management"
                                className={`px-3 py-1 rounded-md transition-colors ${
                                    pathname.startsWith("/balance-management")
                                        ? "bg-gray-700 text-white font-semibold light-mode:bg-gray-200 light-mode:text-gray-800"
                                        : "text-gray-300 hover:bg-gray-800 hover:text-white light-mode:text-gray-600 light-mode:hover:bg-gray-100 light-mode:hover:text-gray-900"
                                }`}
                            >
                                Balance
                            </Link>
                        </>
                    )}
                </div>

                <div className="ml-auto flex items-center space-x-4">
                    <button
                        onClick={toggleTheme}
                        className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
                        aria-label={
                            theme === "dark"
                                ? "Switch to light mode"
                                : "Switch to dark mode"
                        }
                    >
                        {theme === "dark" ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="#FFD700"
                                style={{ color: "#FFD700" }}
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="#4169E1"
                                style={{ color: "#4169E1" }}
                            >
                                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                            </svg>
                        )}{" "}
                    </button>

                    {isAuthenticated ? (
                        <div className="flex items-center space-x-4">
                            {" "}
                            <span className="text-gray-300 light-mode:text-gray-600">
                                Welcome, {user?.name || user?.cccd}
                            </span>
                            <button
                                onClick={logout}
                                className="px-3 py-1 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white transition-colors light-mode:text-gray-600 light-mode:hover:bg-gray-100 light-mode:hover:text-gray-900"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="px-3 py-1 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white transition-colors light-mode:text-gray-600 light-mode:hover:bg-gray-100 light-mode:hover:text-gray-900"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </header>
    )
}
