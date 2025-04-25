"use client"

type TabType = "ask" | "view"

interface TabNavigationProps {
    activeTab: TabType
    onTabChange: (tab: TabType) => void
}

export default function TabNavigation({
    activeTab,
    onTabChange,
}: TabNavigationProps) {
    return (
        <div className="flex border-b border-gray-700 mb-6 light-mode:border-gray-300">
            <button
                className={`py-2 px-4 no-white-text ${
                    activeTab === "view"
                        ? "border-b-2 border-blue-500 text-blue-500"
                        : "text-gray-400 hover:text-white light-mode:text-gray-700 light-mode:hover:text-blue-700"
                }`}
                onClick={() => onTabChange("view")}
            >
                Browse Questions
            </button>
            <button
                className={`py-2 px-4 no-white-text ${
                    activeTab === "ask"
                        ? "border-b-2 border-blue-500 text-blue-500"
                        : "text-gray-400 hover:text-white light-mode:text-gray-700 light-mode:hover:text-blue-700"
                }`}
                onClick={() => onTabChange("ask")}
            >
                Ask a Question
            </button>
        </div>
    )
}
