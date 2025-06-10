"use client"

import { useState } from "react"
import { userAPI } from "@/lib/api/userAPI"
import { reservationAPI } from "@/lib/api/reservationAPI"
import { transactionAPI } from "@/lib/api/transactionAPI"
import { bookCopyAPI } from "@/lib/api/bookCopyAPI"
import { bookTitleAPI } from "@/lib/api/bookTitleAPI"
import { User, Reservation, Transaction, BookCopy } from "@/lib/api/types"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Search, Play, CheckCircle, AlertCircle, Clock, Book, User as UserIcon, Globe, Database, Key, RefreshCw } from "lucide-react"

export default function WorkflowTestPage() {
    const [testResults, setTestResults] = useState<Array<{
        step: string
        status: "pending" | "success" | "error"
        message: string
        data?: any
    }>>([])
    
    const [isRunning, setIsRunning] = useState(false)
    const [testData, setTestData] = useState({
        cccd: "012345678901",
        bookTitleId: "",
        bookCopyId: ""
    })

    // Add backend status tracking
    const [backendStatus, setBackendStatus] = useState<{
        connectivity: "unknown" | "connected" | "disconnected"
        authentication: "unknown" | "valid" | "invalid"
        database: "unknown" | "connected" | "error"
        lastChecked?: Date
    }>({
        connectivity: "unknown",
        authentication: "unknown", 
        database: "unknown"
    })

    const addResult = (step: string, status: "pending" | "success" | "error", message: string, data?: any) => {
        setTestResults(prev => [...prev, { step, status, message, data }])
    }

    const clearResults = () => {
        setTestResults([])
    }

    // Enhanced backend connectivity test
    const testBackendConnectivity = async () => {
        setIsRunning(true)
        clearResults()
        
        addResult("Backend Test", "pending", "Testing backend connectivity...")
        
        try {
            // Test 1: Basic connectivity (public endpoint)
            addResult("1. Connectivity", "pending", "Testing basic connectivity...")
            const booksResponse = await bookTitleAPI.getBookTitles()
            
            if (booksResponse.data) {
                addResult("1. Connectivity", "success", "Backend is reachable")
                setBackendStatus(prev => ({ ...prev, connectivity: "connected" }))
                
                // Test 2: Authentication status
                addResult("2. Authentication", "pending", "Checking authentication status...")
                const token = localStorage.getItem("access_token")
                
                if (token) {
                    // Try an authenticated endpoint
                    const usersResponse = await userAPI.getUsers()
                    if (usersResponse.data) {
                        addResult("2. Authentication", "success", "Authentication valid")
                        setBackendStatus(prev => ({ ...prev, authentication: "valid" }))
                        
                        // Test 3: Database operations
                        addResult("3. Database", "pending", "Testing database operations...")
                        
                        const dbTestCount = usersResponse.data.length
                        addResult("3. Database", "success", 
                            `Database operational - ${dbTestCount} users found`)
                        setBackendStatus(prev => ({ ...prev, database: "connected", lastChecked: new Date() }))
                    } else {
                        addResult("2. Authentication", "error", "Authentication failed - token may be expired")
                        setBackendStatus(prev => ({ ...prev, authentication: "invalid" }))
                    }
                } else {
                    addResult("2. Authentication", "error", "No authentication token found")
                    setBackendStatus(prev => ({ ...prev, authentication: "invalid" }))
                }
            } else {
                addResult("1. Connectivity", "error", "Cannot reach backend server")
                setBackendStatus(prev => ({ ...prev, connectivity: "disconnected" }))
            }
        } catch (error) {
            addResult("Backend Test", "error", `Backend test failed: ${error}`)
            setBackendStatus(prev => ({ ...prev, connectivity: "disconnected" }))
        }
        
        setIsRunning(false)
    }

    const runCompleteWorkflowTest = async () => {
        if (!testData.cccd) {
            alert("Please enter a CCCD to test with")
            return
        }

        setIsRunning(true)
        clearResults()

        try {
            // Step 1: Search user by CCCD
            addResult("1. User Search", "pending", "Searching for user by CCCD...")
            const userSearchResult = await userAPI.searchUserByCCCD(testData.cccd)
            
            if (userSearchResult.data && userSearchResult.data.length > 0) {
                const user = userSearchResult.data[0]
                addResult("1. User Search", "success", `Found user: ${user.name}`, user)
                
                // Step 2: Get user's reservations
                addResult("2. User Reservations", "pending", "Loading user reservations...")
                const reservationsResult = await reservationAPI.getReservationsByUserId(user.id)
                
                if (Array.isArray(reservationsResult)) {
                    addResult("2. User Reservations", "success", `Found ${reservationsResult.length} reservations`, reservationsResult)
                    
                    if (reservationsResult.length > 0) {
                        const activeReservation = reservationsResult.find(r => r.status === "PENDING" || r.status === "READY_FOR_PICKUP")
                        
                        if (activeReservation) {
                            // Step 3: Get available book copies
                            addResult("3. Book Copies", "pending", "Getting available book copies...")
                            const bookCopiesResult = await bookCopyAPI.getBookCopies()
                            
                            if (bookCopiesResult.data) {
                                const availableCopies = bookCopiesResult.data.filter(copy => 
                                    copy.bookTitleId === activeReservation.bookTitleId && 
                                    copy.status === "AVAILABLE"
                                )
                                
                                addResult("3. Book Copies", "success", `Found ${availableCopies.length} available copies`, availableCopies)
                                
                                if (availableCopies.length > 0) {
                                    const selectedCopy = availableCopies[0]
                                    
                                    // Step 4: Assign copy to reservation
                                    addResult("4. Assign Copy", "pending", "Assigning book copy to reservation...")
                                    const assignResult = await reservationAPI.assignCopy(activeReservation.id, selectedCopy.id)
                                    
                                    if ("error" in assignResult) {
                                        addResult("4. Assign Copy", "error", assignResult.error || "Failed to assign copy")
                                    } else {
                                        addResult("4. Assign Copy", "success", "Book copy assigned successfully", assignResult)
                                        
                                        // Step 5: Convert to transaction
                                        addResult("5. Create Transaction", "pending", "Converting reservation to transaction...")
                                        const transactionResult = await transactionAPI.createTransaction({
                                            userId: user.id,
                                            bookCopyIds: [selectedCopy.id],
                                            note: "Created from workflow test",
                                            bookCopyId: ""
                                        })
                                        
                                        if (transactionResult.data) {
                                            addResult("5. Create Transaction", "success", "Transaction created successfully", transactionResult.data)
                                            
                                            // Step 6: Test return workflow
                                            addResult("6. Return Workflow", "pending", "Testing return approval...")
                                            const returnResult = await transactionAPI.approveReturn(
                                                transactionResult.data.id,
                                                selectedCopy.id,
                                                {
                                                    penaltyFee: 5,
                                                    description: "Test return - minor wear noted during workflow test"
                                                } 
                                            )
                                            
                                            if (returnResult.data) {
                                                addResult("6. Return Workflow", "success", "Return approved successfully", returnResult.data)
                                                addResult("✅ Complete Test", "success", "All workflow steps completed successfully!")
                                            } else {
                                                addResult("6. Return Workflow", "error", returnResult.error?.error || "Failed to approve return")
                                            }
                                        } else {
                                            addResult("5. Create Transaction", "error", transactionResult.error?.error || "Failed to create transaction")
                                        }
                                    }
                                } else {
                                    addResult("4. Assign Copy", "error", "No available book copies found for this title")
                                }
                            } else {
                                addResult("3. Book Copies", "error", bookCopiesResult.error?.error || "Failed to fetch book copies")
                            }
                        } else {
                            addResult("3. Reservation Status", "error", "No active reservations found to process")
                        }
                    } else {
                        addResult("3. Reservation Status", "error", "User has no reservations to test with")
                    }
                } else {
                    addResult("2. User Reservations", "error", (reservationsResult as any).error || "Failed to load reservations")
                }
            } else {
                addResult("1. User Search", "error", "No user found with this CCCD")
            }
        } catch (error) {
            addResult("❌ Test Failed", "error", `Unexpected error: ${error}`)
        } finally {
            setIsRunning(false)
        }
    }

    const runQuickTests = async () => {
        setIsRunning(true)
        clearResults()

        // Test 1: API connectivity
        addResult("API Test", "pending", "Testing API connectivity...")
        try {
            const usersResult = await userAPI.getUsers()
            if (usersResult.data) {
                addResult("API Test", "success", `API connected - found ${usersResult.data.length} users`)
            } else {
                addResult("API Test", "error", "API connection failed")
            }
        } catch (error) {
            addResult("API Test", "error", `API error: ${error}`)
        }

        // Test 2: Book copy API
        addResult("Book Copy API", "pending", "Testing book copy operations...")
        try {
            const copiesResult = await bookCopyAPI.getBookCopies()
            if (copiesResult.data) {
                addResult("Book Copy API", "success", `Found ${copiesResult.data.length} book copies`)
            } else {
                addResult("Book Copy API", "error", "Failed to fetch book copies")
            }
        } catch (error) {
            addResult("Book Copy API", "error", `Book copy API error: ${error}`)
        }

        setIsRunning(false)
    }

    const getStatusIcon = (status: "pending" | "success" | "error") => {
        switch (status) {
            case "pending": return <Clock className="w-4 h-4 text-yellow-400 animate-spin" />
            case "success": return <CheckCircle className="w-4 h-4 text-green-400" />
            case "error": return <AlertCircle className="w-4 h-4 text-red-400" />
        }
    }

    return (
        <ProtectedRoute requiredRole={["ADMIN", "LIBRARIAN"]}>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-100 mb-8 flex items-center gap-3">
                        <Database className="w-8 h-8" />
                        Workflow Testing Dashboard
                    </h1>

                    {/* Backend Status Panel */}
                    <div className="bg-gray-800 rounded-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-2">
                            <Globe className="w-5 h-5" />
                            Backend Status
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Globe className="w-4 h-4" />
                                    <span className="font-medium text-gray-100">Connectivity</span>
                                </div>
                                <div className={`text-sm px-2 py-1 rounded ${
                                    backendStatus.connectivity === "connected" ? "bg-green-600 text-green-100" :
                                    backendStatus.connectivity === "disconnected" ? "bg-red-600 text-red-100" :
                                    "bg-gray-600 text-gray-300"
                                }`}>
                                    {backendStatus.connectivity === "connected" ? "Connected" :
                                     backendStatus.connectivity === "disconnected" ? "Disconnected" : "Unknown"}
                                </div>
                            </div>
                            
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Key className="w-4 h-4" />
                                    <span className="font-medium text-gray-100">Authentication</span>
                                </div>
                                <div className={`text-sm px-2 py-1 rounded ${
                                    backendStatus.authentication === "valid" ? "bg-green-600 text-green-100" :
                                    backendStatus.authentication === "invalid" ? "bg-red-600 text-red-100" :
                                    "bg-gray-600 text-gray-300"
                                }`}>
                                    {backendStatus.authentication === "valid" ? "Valid" :
                                     backendStatus.authentication === "invalid" ? "Invalid" : "Unknown"}
                                </div>
                            </div>
                            
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Database className="w-4 h-4" />
                                    <span className="font-medium text-gray-100">Database</span>
                                </div>
                                <div className={`text-sm px-2 py-1 rounded ${
                                    backendStatus.database === "connected" ? "bg-green-600 text-green-100" :
                                    backendStatus.database === "error" ? "bg-red-600 text-red-100" :
                                    "bg-gray-600 text-gray-300"
                                }`}>
                                    {backendStatus.database === "connected" ? "Connected" :
                                     backendStatus.database === "error" ? "Error" : "Unknown"}
                                </div>
                            </div>
                        </div>
                        
                        {backendStatus.lastChecked && (
                            <p className="text-xs text-gray-400">
                                Last checked: {backendStatus.lastChecked.toLocaleString()}
                            </p>
                        )}
                    </div>

                    {/* Test Configuration */}
                    <div className="bg-gray-800 rounded-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold text-gray-100 mb-4">Test Configuration</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    Test User CCCD
                                </label>
                                <input
                                    type="text"
                                    value={testData.cccd}
                                    onChange={(e) => setTestData(prev => ({ ...prev, cccd: e.target.value }))}
                                    placeholder="Enter CCCD to test with..."
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    Book Title ID (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={testData.bookTitleId}
                                    onChange={(e) => setTestData(prev => ({ ...prev, bookTitleId: e.target.value }))}
                                    placeholder="Specific book to test..."
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    Book Copy ID (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={testData.bookCopyId}
                                    onChange={(e) => setTestData(prev => ({ ...prev, bookCopyId: e.target.value }))}
                                    placeholder="Specific copy to test..."
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={testBackendConnectivity}
                                disabled={isRunning}
                                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Test Backend
                            </button>
                            
                            <button
                                onClick={runCompleteWorkflowTest}
                                disabled={isRunning}
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <Play className="w-4 h-4" />
                                Run Complete Workflow Test
                            </button>
                            
                            <button
                                onClick={runQuickTests}
                                disabled={isRunning}
                                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <Search className="w-4 h-4" />
                                Quick API Tests
                            </button>
                            
                            <button
                                onClick={clearResults}
                                disabled={isRunning}
                                className="bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-colors"
                            >
                                Clear Results
                            </button>
                        </div>
                    </div>

                    {/* Test Results */}
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-100 mb-4">Test Results</h2>
                        
                        {testResults.length === 0 ? (
                            <p className="text-gray-400">No tests run yet. Click a test button above to start.</p>
                        ) : (
                            <div className="space-y-3">
                                {testResults.map((result, index) => (
                                    <div key={index} className="bg-gray-700 rounded-lg p-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            {getStatusIcon(result.status)}
                                            <span className="font-medium text-gray-100">{result.step}</span>
                                        </div>
                                        <p className={`text-sm ${
                                            result.status === "success" ? "text-green-300" :
                                            result.status === "error" ? "text-red-300" :
                                            "text-yellow-300"
                                        }`}>
                                            {result.message}
                                        </p>
                                        
                                        {result.data && (
                                            <details className="mt-3">
                                                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                                                    Show Details
                                                </summary>
                                                <pre className="mt-2 text-xs bg-gray-600 p-3 rounded overflow-x-auto text-gray-300">
                                                    {JSON.stringify(result.data, null, 2)}
                                                </pre>
                                            </details>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Workflow Overview */}
                    <div className="bg-gray-800 rounded-lg p-6 mt-8">
                        <h2 className="text-xl font-semibold text-gray-100 mb-4">Workflow Overview</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <h3 className="font-medium text-gray-100 mb-2 flex items-center gap-2">
                                    <UserIcon className="w-4 h-4" />
                                    User Management
                                </h3>
                                <ul className="text-sm text-gray-300 space-y-1">
                                    <li>• Search by CCCD</li>
                                    <li>• View reservations</li>
                                    <li>• Check balance</li>
                                    <li>• Create new users</li>
                                </ul>
                            </div>
                            
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <h3 className="font-medium text-gray-100 mb-2 flex items-center gap-2">
                                    <Book className="w-4 h-4" />
                                    Reservation Flow
                                </h3>
                                <ul className="text-sm text-gray-300 space-y-1">
                                    <li>• Assign book copies</li>
                                    <li>• Convert to transactions</li>
                                    <li>• Track status</li>
                                    <li>• Manage workflow</li>
                                </ul>
                            </div>
                            
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <h3 className="font-medium text-gray-100 mb-2 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Return Process
                                </h3>
                                <ul className="text-sm text-gray-300 space-y-1">
                                    <li>• Approve returns</li>
                                    <li>• Assess damage</li>
                                    <li>• Apply penalties</li>
                                    <li>• Update inventory</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Backend Configuration Info */}
                    <div className="bg-gray-800 rounded-lg p-6 mt-8">
                        <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-2">
                            <Database className="w-5 h-5" />
                            Backend Configuration
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-medium text-gray-100 mb-2">API Endpoint</h3>
                                <code className="text-sm bg-gray-700 px-3 py-2 rounded text-green-400">
                                    {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}
                                </code>
                            </div>
                            
                            <div>
                                <h3 className="font-medium text-gray-100 mb-2">Authentication</h3>
                                <code className="text-sm bg-gray-700 px-3 py-2 rounded text-blue-400">
                                    {typeof window !== "undefined" && localStorage.getItem("access_token") ? "Token Present" : "No Token"}
                                </code>
                            </div>
                        </div>
                        
                        <div className="mt-4 p-4 bg-blue-600/20 border border-blue-600/30 rounded-lg">
                            <h4 className="font-medium text-blue-100 mb-2">Setup Instructions</h4>
                            <ol className="text-sm text-blue-200 space-y-1">
                                <li>1. Ensure your Spring Boot backend is running on localhost:8080</li>
                                <li>2. Login through the login page to get an authentication token</li>
                                <li>3. Use the "Test Backend" button to verify connectivity</li>
                                <li>4. Run workflow tests to verify end-to-end functionality</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}
