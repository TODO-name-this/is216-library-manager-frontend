"use client"

import { useState } from "react"
import { userAPI } from "@/lib/api/userAPI"
import { CreateUserRequest } from "@/lib/api/types"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function CreateUserPage() {
    const [formData, setFormData] = useState<CreateUserRequest>({
        cccd: "",
        name: "",
        password: "",
        role: "USER"
    })
    
    const [additionalInfo, setAdditionalInfo] = useState({
        email: "",
        phoneNumber: "",
        address: "",
        balance: 0
    })
    
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [successMessage, setSuccessMessage] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError("")
        setSuccessMessage("")

        // Validation
        if (!formData.cccd || !formData.name || !formData.password) {
            setError("CCCD, name, and password are required")
            setIsSubmitting(false)
            return
        }

        if (formData.cccd.length !== 12) {
            setError("CCCD must be exactly 12 digits")
            setIsSubmitting(false)
            return
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters")
            setIsSubmitting(false)
            return
        }

        try {
            const response = await userAPI.createUser(formData)
            
            if (response.data) {
                setSuccessMessage(`User created successfully! User ID: ${response.data.id}`)
                // Reset form
                setFormData({
                    cccd: "",
                    name: "",
                    password: "",
                    role: "USER"
                })
                setAdditionalInfo({
                    email: "",
                    phoneNumber: "",
                    address: "",
                    balance: 0
                })
            } else {
                setError(response.error?.error || "Failed to create user")
            }
        } catch (error) {
            setError("Error creating user. Please try again.")        } finally {
            setIsSubmitting(false)
        }
    }
    
    const handleInputChange = (field: keyof CreateUserRequest, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }
    
    const handleAdditionalInfoChange = (field: keyof typeof additionalInfo, value: string | number) => {
        setAdditionalInfo(prev => ({
            ...prev,
            [field]: value
        }))
    }
    
    return (
        <ProtectedRoute requiredRole={["ADMIN"]}>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-100 mb-8">
                        Create New User
                    </h1>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded mb-6">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded mb-6">
                            {successMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 space-y-6">
                        {/* Required Fields */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-100 mb-4">Required Information</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2">
                                        CCCD (Citizen ID) *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.cccd}
                                        onChange={(e) => handleInputChange("cccd", e.target.value)}
                                        maxLength={12}
                                        pattern="[0-9]{12}"
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter 12-digit CCCD"
                                        required
                                    />
                                    <p className="text-gray-400 text-xs mt-1">Must be exactly 12 digits</p>
                                </div>

                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter full name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2">
                                        Password *
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => handleInputChange("password", e.target.value)}
                                        minLength={6}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter password"
                                        required
                                    />
                                    <p className="text-gray-400 text-xs mt-1">Minimum 6 characters</p>
                                </div>

                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2">
                                        Role *
                                    </label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => handleInputChange("role", e.target.value as "ADMIN" | "LIBRARIAN" | "USER")}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="USER">User</option>
                                        <option value="LIBRARIAN">Librarian</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Optional Fields */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-100 mb-4">Additional Information (Optional)</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={additionalInfo.email}
                                        onChange={(e) => handleAdditionalInfoChange("email", e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter email address"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={additionalInfo.phoneNumber}
                                        onChange={(e) => handleAdditionalInfoChange("phoneNumber", e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter phone number"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-gray-300 text-sm font-medium mb-2">
                                        Address
                                    </label>
                                    <textarea
                                        value={additionalInfo.address}
                                        onChange={(e) => handleAdditionalInfoChange("address", e.target.value)}
                                        rows={3}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter full address"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2">
                                        Initial Balance
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={additionalInfo.balance}
                                        onChange={(e) => handleAdditionalInfoChange("balance", parseFloat(e.target.value) || 0)}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0.00"
                                    />
                                    <p className="text-gray-400 text-xs mt-1">Starting balance for deposits</p>
                                </div>
                            </div>
                        </div>

                        {/* Role Information */}
                        <div className="bg-gray-700 rounded-lg p-4">
                            <h3 className="text-lg font-medium text-gray-100 mb-2">Role Permissions</h3>
                            <div className="text-sm text-gray-300 space-y-1">
                                {formData.role === "ADMIN" && (
                                    <>
                                        <p>• Full system access and user management</p>
                                        <p>• Can create/edit/delete all resources</p>
                                        <p>• Can manage other admin and librarian accounts</p>
                                    </>
                                )}
                                {formData.role === "LIBRARIAN" && (
                                    <>
                                        <p>• Manage books, reservations, and transactions</p>
                                        <p>• Process book returns and assess damage</p>
                                        <p>• View user information and manage workflow</p>
                                    </>
                                )}
                                {formData.role === "USER" && (
                                    <>
                                        <p>• Browse books and make reservations</p>
                                        <p>• View own transaction history</p>
                                        <p>• Submit questions and reviews</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setFormData({
                                        cccd: "",
                                        name: "",
                                        password: "",
                                        role: "USER"
                                    })
                                    setAdditionalInfo({
                                        email: "",
                                        phoneNumber: "",
                                        address: "",
                                        balance: 0
                                    })
                                    setError("")
                                    setSuccessMessage("")
                                }}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg transition-colors"
                            >
                                Clear Form
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 px-6 rounded-lg transition-colors"
                            >
                                {isSubmitting ? "Creating User..." : "Create User"}
                            </button>
                        </div>
                    </form>

                    {/* Quick Actions */}
                    <div className="mt-8 bg-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-100 mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={() => {
                                    setFormData(prev => ({ ...prev, role: "LIBRARIAN" }))
                                    handleAdditionalInfoChange("balance", 1000)
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-colors text-sm"
                            >
                                Create Librarian
                                <br />
                                <span className="text-green-200">with $1000 balance</span>
                            </button>
                            <button
                                onClick={() => {
                                    setFormData(prev => ({ ...prev, role: "USER" }))
                                    handleAdditionalInfoChange("balance", 100)
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors text-sm"
                            >
                                Create Student
                                <br />
                                <span className="text-blue-200">with $100 balance</span>
                            </button>
                            <button
                                onClick={() => {
                                    setFormData(prev => ({ ...prev, role: "ADMIN" }))
                                    handleAdditionalInfoChange("balance", 0)
                                }}
                                className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg transition-colors text-sm"
                            >
                                Create Admin
                                <br />
                                <span className="text-purple-200">with full access</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}
