import { Question } from "@/types"

export const mockQuestions: Question[] = [
    {
        id: "1",
        question: "How long can I borrow books?",
        askedBy: "student@example.com",
        askedDate: "2025-03-15",
        answer: "Standard borrowing period is 14 days. You can extend once for another 7 days if no one has reserved the book.",
        answeredBy: "librarian@scamlibrary.com",
        answeredDate: "2025-03-16",
    },
    {
        id: "2",
        question:
            "Do you have any programming books on functional programming?",
        askedBy: "coder@example.com",
        askedDate: "2025-03-20",
        answer: "Yes, we have several books on functional programming including titles on Haskell, Scala, and functional JavaScript. Please check our programming section or search 'functional programming' on our catalog.",
        answeredBy: "librarian@scamlibrary.com",
        answeredDate: "2025-03-21",
    },
    {
        id: "3",
        question:
            "Can I reserve books that are currently borrowed by someone else?",
        askedBy: "reader@example.com",
        askedDate: "2025-04-01",
        answer: "Yes, you can reserve books that are currently checked out. You'll receive an email notification when the book becomes available.",
        answeredBy: "admin@scamlibrary.com",
        answeredDate: "2025-04-02",
    },
    {
        id: "4",
        question: "Are there any late fees for overdue books?",
        askedBy: "curious@example.com",
        askedDate: "2025-04-10",
        // No answer yet
    },
    {
        id: "5",
        question: "How do I donate books to the library?",
        askedBy: "donor@example.com",
        askedDate: "2025-04-15",
        // No answer yet
    },
]
