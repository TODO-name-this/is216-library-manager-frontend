"use client"

import { useState, useEffect } from "react"
import TabNavigation from "@/app/qanda/TabNavigation"
import QuestionForm from "@/app/qanda/QuestionForm"
import QuestionCard from "@/app/qanda/QuestionCard"
import { Question } from "@/lib/api/types"
import {
    getAllQuestions,
    createQuestion,
    updateQuestion,
} from "@/app/actions/questionActions"

export default function QandAPage() {
    const [questions, setQuestions] = useState<Question[]>([])
    const [activeTab, setActiveTab] = useState<"ask" | "view">("view")
    const [expandedCard, setExpandedCard] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Load questions on component mount
    useEffect(() => {
        const loadQuestions = async () => {
            try {
                setLoading(true)
                setError(null)
                const questionsData = await getAllQuestions()
                setQuestions(questionsData)
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load questions"
                )
            } finally {
                setLoading(false)
            }
        }

        loadQuestions()
    }, [])

    const handleTabChange = (tab: "ask" | "view") => {
        setActiveTab(tab)
    }

    const handleQuestionSubmit = async (
        email: string,
        questionText: string
    ) => {
        try {
            const newQuestionData = {
                question: questionText,
                askedBy: email,
            }

            const createdQuestion = await createQuestion(newQuestionData)

            if (createdQuestion) {
                setQuestions([createdQuestion, ...questions])
                alert(`Question submitted: "${questionText}" by ${email}`)
                setActiveTab("view") // Switch to view after submission
            } else {
                throw new Error("Failed to create question")
            }
        } catch (err) {
            console.error("Error submitting question:", err)
            alert("Failed to submit question. Please try again.")
        }
    }

    const handleAnswerSubmit = async (id: string, answerText: string) => {
        try {
            const updateData = {
                answer: answerText,
                answeredBy: "admin@scamlibrary.com",
                answeredDate: new Date().toISOString().split("T")[0],
            }

            const updatedQuestion = await updateQuestion(Number(id), updateData)

            if (updatedQuestion) {
                setQuestions((prevQuestions) =>
                    prevQuestions.map((q) =>
                        q.id === id ? updatedQuestion : q
                    )
                )
                setExpandedCard(null)
                alert(`Answer submitted for question #${id}`)
            } else {
                throw new Error("Failed to update question")
            }
        } catch (err) {
            console.error("Error submitting answer:", err)
            alert("Failed to submit answer. Please try again.")
        }
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
            )}{" "}
            {activeTab === "view" && (
                <div className="space-y-6">
                    {loading && (
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-500 text-white p-4 rounded-lg">
                            Error: {error}
                        </div>
                    )}

                    {!loading && !error && questions.length === 0 && (
                        <div className="text-center text-gray-400">
                            No questions found. Be the first to ask a question!
                        </div>
                    )}

                    {!loading &&
                        !error &&
                        questions.map((q) => (
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
