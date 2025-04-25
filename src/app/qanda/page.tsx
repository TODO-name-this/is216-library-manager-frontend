"use client"

import { useState } from "react"
import { mockQuestions } from "@/lib/mockQuestions"
import TabNavigation from "@/app/qanda/TabNavigation"
import QuestionForm from "@/app/qanda/QuestionForm"
import QuestionCard from "@/app/qanda/QuestionCard"
import { Question } from "@/types"

export default function QandAPage() {
    const [questions, setQuestions] = useState<Question[]>(mockQuestions)
    const [activeTab, setActiveTab] = useState<"ask" | "view">("view")
    const [expandedCard, setExpandedCard] = useState<string | null>(null)

    const handleTabChange = (tab: "ask" | "view") => {
        setActiveTab(tab)
    }

    const handleQuestionSubmit = (email: string, questionText: string) => {
        const newQuestion: Question = {
            id: `${questions.length + 1}`,
            question: questionText,
            askedBy: email,
            askedDate: new Date().toISOString().split("T")[0],
        }

        setQuestions([newQuestion, ...questions])
        alert(`Question submitted: "${questionText}" by ${email}`)
        setActiveTab("view") // Switch to view after submission
    }

    const handleAnswerSubmit = (id: string, answerText: string) => {
        setQuestions((prevQuestions) =>
            prevQuestions.map((q) =>
                q.id === id
                    ? {
                          ...q,
                          answer: answerText,
                          answeredBy: "admin@scamlibrary.com",
                          answeredDate: new Date().toISOString().split("T")[0],
                      }
                    : q
            )
        )
        setExpandedCard(null)
        alert(`Answer submitted for question #${id}`)
    }

    const toggleCardExpansion = (id: string) => {
        setExpandedCard(expandedCard === id ? null : id)
    }

    return (
        <main className="p-4 text-white bg-gray-900 min-h-screen light-mode:bg-white light-mode:text-gray-900">
            <h1 className="text-3xl font-bold mb-6 light-mode:text-gray-900">
                Q&A Forum
            </h1>

            <TabNavigation
                activeTab={activeTab}
                onTabChange={handleTabChange}
            />

            {activeTab === "ask" && (
                <QuestionForm onSubmit={handleQuestionSubmit} />
            )}

            {activeTab === "view" && (
                <div className="space-y-6">
                    {questions.map((q) => (
                        <QuestionCard
                            key={q.id}
                            question={q}
                            expanded={expandedCard === q.id}
                            onToggle={() => toggleCardExpansion(q.id)}
                            onAnswerSubmit={handleAnswerSubmit}
                        />
                    ))}
                </div>
            )}
        </main>
    )
}
