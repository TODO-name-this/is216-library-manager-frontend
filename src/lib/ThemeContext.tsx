"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

type Theme = "dark" | "light"

interface ThemeContextType {
    theme: Theme
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("dark")

    useEffect(() => {
        // Check if user has a preferred theme stored
        const savedTheme = localStorage.getItem("theme") as Theme
        if (savedTheme) {
            setTheme(savedTheme)
            document.documentElement.classList.toggle(
                "light-mode",
                savedTheme === "light"
            )
        }

        // Apply button-text-white class to maintain contrast for specific action buttons
        ensureButtonTextContrast()
    }, [])

    // Function to ensure buttons maintain proper text contrast in both themes
    const ensureButtonTextContrast = () => {
        // Find all elements that should maintain white text in both themes
        const reserveButtons = document.querySelectorAll(
            "a.bg-blue-500, a.rounded.bg-blue-500"
        )
        const detailLinks = document.querySelectorAll(
            "a.inline-flex.items-center"
        )
        const actionButtons = document.querySelectorAll(
            ".bg-blue-500.px-10, .bg-blue-500.px-4"
        )

        // Apply the ensure-white-text class to these elements
        const elementsToFix = [
            ...reserveButtons,
            ...detailLinks,
            ...actionButtons,
        ]
        elementsToFix.forEach((element) => {
            element.classList.add("ensure-white-text")
            // Also ensure any SVGs inside these elements maintain white color
            const svgs = element.querySelectorAll("svg")
            svgs.forEach((svg) => svg.classList.add("ensure-white-text"))
        })
    }

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark"
        setTheme(newTheme)
        localStorage.setItem("theme", newTheme)
        document.documentElement.classList.toggle(
            "light-mode",
            newTheme === "light"
        )

        // Re-apply button text contrast after theme change
        setTimeout(ensureButtonTextContrast, 50)
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider")
    }
    return context
}
