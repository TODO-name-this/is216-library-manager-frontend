import { Transaction, TransactionDetail } from "./api/types"

export const mockActiveTransactions: Transaction[] = [
    {
        id: "1",
        userId: "1",
        bookCopyId: "BCP001",
        borrowDate: "2024-12-01T10:00:00Z",
        dueDate: "2024-12-15T23:59:59Z",
        returnedDate: null,
        status: "BORROWED",
        totalFee: 0,
        penaltyFee: 0,
        note: null,
        bookTitle: "The Great Gatsby",
        userName: "John Doe",
    },
    {
        id: "2",
        userId: "2",
        bookCopyId: "BCP002",
        borrowDate: "2024-11-28T14:30:00Z",
        dueDate: "2024-12-12T23:59:59Z",
        returnedDate: null,
        status: "OVERDUE",
        totalFee: 15000,
        penaltyFee: 15000, // Late fee
        note: "Late return - 3 days overdue",
        bookTitle: "To Kill a Mockingbird",
        userName: "Jane Smith",
    },
    {
        id: "3",
        userId: "3",
        bookCopyId: "BCP003",
        borrowDate: "2024-12-03T09:15:00Z",
        dueDate: "2024-12-17T23:59:59Z",
        returnedDate: null,
        status: "BORROWED",
        totalFee: 0,
        penaltyFee: 0,
        note: null,
        bookTitle: "1984",
        userName: "Bob Johnson",
    },
    {
        id: "4",
        userId: "4",
        bookCopyId: "BCP004",
        borrowDate: "2024-11-25T16:45:00Z",
        dueDate: "2024-12-09T23:59:59Z",
        returnedDate: null,
        status: "OVERDUE",
        totalFee: 25000,
        penaltyFee: 25000, // Late fee
        note: "Late return - 5 days overdue",
        bookTitle: "Pride and Prejudice",
        userName: "Alice Brown",
    },
    {
        id: "5",
        userId: "5",
        bookCopyId: "BCP005",
        borrowDate: "2024-12-05T11:20:00Z",
        dueDate: "2024-12-19T23:59:59Z",
        returnedDate: null,
        status: "BORROWED",
        totalFee: 0,
        penaltyFee: 0,
        note: null,
        bookTitle: "The Catcher in the Rye",
        userName: "Charlie Wilson",
    },
]

export const mockTransactionDetails: {
    [transactionId: string]: TransactionDetail[]
} = {
    "1": [
        {
            transactionId: "1",
            penaltyFee: 0,
            description: "",
        },
    ],
    "2": [
        {
            transactionId: "2",
            penaltyFee: 15000,
            description: "Late return - 3 days overdue",
        },
    ],
    "3": [
        {
            transactionId: "3",
            penaltyFee: 0,
            description: "",
        },
    ],
    "4": [
        {
            transactionId: "4",
            penaltyFee: 25000,
            description: "Late return - 5 days overdue",
        },
    ],
    "5": [
        {
            transactionId: "5",
            penaltyFee: 0,
            description: "",
        },
    ],
}

// Mock function to simulate API delay
export const mockDelay = (ms: number = 500) =>
    new Promise((resolve) => setTimeout(resolve, ms))
