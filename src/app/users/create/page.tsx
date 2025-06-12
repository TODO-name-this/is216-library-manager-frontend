"use client";

import { useState } from "react";
import { userAPI } from "@/lib/api/userAPI";
import { CreateUserRequest } from "@/lib/api/types";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/AuthContext";

export default function CreateUserPage() {
  const { user, isAdmin } = useAuth();
  const [formData, setFormData] = useState<CreateUserRequest>({
    cccd: "",
    name: "",
    email: "",
    password: "",
    role: "USER",
    dob: "",
    phone: "",
    avatarUrl: "",
    balance: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    // Validation
    if (!formData.cccd || !formData.name || !formData.email || !formData.password) {
      setError("CCCD, name, email, and password are required");
      setIsSubmitting(false);
      return;
    }

    if (formData.cccd.length !== 12) {
      setError("CCCD must be exactly 12 digits");
      setIsSubmitting(false);
      return;
    }

    if (!/^\d{12}$/.test(formData.cccd)) {
      setError("CCCD must contain only digits");
      setIsSubmitting(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsSubmitting(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      setIsSubmitting(false);
      return;
    }

    if (formData.phone && (formData.phone.length < 10 || formData.phone.length > 15)) {
      setError("Phone number must be between 10 and 15 digits");
      setIsSubmitting(false);
      return;
    }

    if (formData.phone && !/^\d+$/.test(formData.phone)) {
      setError("Phone number must contain only digits");
      setIsSubmitting(false);
      return;
    }

    if (formData.dob) {
      const dobDate = new Date(formData.dob);
      const today = new Date();
      if (dobDate >= today) {
        setError("Date of birth must be in the past");
        setIsSubmitting(false);
        return;
      }
    }

    if (formData.balance < 0) {
      setError("Balance must be positive or zero");
      setIsSubmitting(false);
      return;
    }

    // Role-based validation
    if (!user) {
      setError("Authentication required");
      setIsSubmitting(false);
      return;
    }

    // Check if current user has permission to create the requested role
    if (formData.role === "ADMIN") {
      setError("Creating admin accounts is not allowed");
      setIsSubmitting(false);
      return;
    }

    if (formData.role === "LIBRARIAN" && !isAdmin()) {
      setError("Only admins can create librarian accounts");
      setIsSubmitting(false);
      return;
    }

    if (formData.role === "USER" && !isAdmin() && user.role !== "LIBRARIAN") {
      setError("Only admins and librarians can create user accounts");
      setIsSubmitting(false);
      return;
    }

    try {
      // Filter out empty/blank optional fields to avoid server validation issues
      const requestData: Partial<CreateUserRequest> = {
        cccd: formData.cccd,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        balance: formData.balance,
      };

      // Only include optional fields if they have values
      if (formData.dob && formData.dob.trim() !== "") {
        requestData.dob = formData.dob;
      }
      
      if (formData.phone && formData.phone.trim() !== "") {
        requestData.phone = formData.phone;
      }
      
      if (formData.avatarUrl && formData.avatarUrl.trim() !== "") {
        requestData.avatarUrl = formData.avatarUrl;
      }

      const response = await userAPI.createUser(requestData as CreateUserRequest);

      if (response.data) {
        setSuccessMessage(
          `User created successfully! User ID: ${response.data.id}`
        );
        // Reset form
        setFormData({
          cccd: "",
          name: "",
          email: "",
          password: "",
          role: "USER",
          dob: "",
          phone: "",
          avatarUrl: "",
          balance: 0,
        });
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(response.error?.error || "Failed to create user");
      }
    } catch (error) {
      setError("Error creating user. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreateUserRequest, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Get available roles based on current user's role
  const getAvailableRoles = () => {
    if (!user) return [];
    
    const roles = [];
    
    // Everyone can create USER accounts (if they have access to this page)
    roles.push({ value: "USER", label: "User" });
    
    // Only admins can create LIBRARIAN accounts
    if (isAdmin()) {
      roles.push({ value: "LIBRARIAN", label: "Librarian" });
    }
    
    // ADMIN accounts cannot be created through this interface
    return roles;
  };

  // Check if current user can create accounts
  const canCreateAccounts = () => {
    return user && (isAdmin() || user.role === "LIBRARIAN");
  };

  return (
    <ProtectedRoute requiredRole={["ADMIN", "LIBRARIAN"]}>
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

          <form
            onSubmit={handleSubmit}
            className="bg-gray-800 rounded-lg p-6 space-y-6"
          >
            {/* Required Fields */}
            <div>
              <h2 className="text-xl font-semibold text-gray-100 mb-4">
                Required Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    CCCD (Citizen ID) *
                  </label>
                  <input
                    type="text"
                    value={formData.cccd}
                    onChange={(e) => handleInputChange("cccd", e.target.value)}
                    maxLength={15}
                    pattern="[0-9]{12,15}"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter 12-digit CCCD"
                    required
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    Must be exactly 12 digits
                  </p>
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
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email address"
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
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    minLength={8}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter password"
                    required
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    Minimum 8 characters
                  </p>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      handleInputChange(
                        "role",
                        e.target.value as "ADMIN" | "LIBRARIAN" | "USER"
                      )
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {getAvailableRoles().map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  {!isAdmin() && (
                    <p className="text-gray-400 text-xs mt-1">
                      {user?.role === "LIBRARIAN" 
                        ? "Librarians can only create user accounts" 
                        : "Limited role options based on your permissions"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Initial Balance *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.balance}
                    onChange={(e) =>
                      handleInputChange("balance", parseInt(e.target.value) || 0)
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    required
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    Starting balance (must be 0 or positive)
                  </p>
                </div>
              </div>
            </div>

            {/* Optional Fields */}
            <div>
              <h2 className="text-xl font-semibold text-gray-100 mb-4">
                Additional Information (Optional)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleInputChange("dob", e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    max={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    Must be in the past
                  </p>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    pattern="[0-9]{10,15}"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number"
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    10-15 digits only
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    value={formData.avatarUrl}
                    onChange={(e) => handleInputChange("avatarUrl", e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Role Information */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-100 mb-2">
                Role Permissions
              </h3>
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
                    email: "",
                    password: "",
                    role: "USER",
                    dob: "",
                    phone: "",
                    avatarUrl: "",
                    balance: 0,
                  });
                  setError("");
                  setSuccessMessage("");
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
          {canCreateAccounts() && (
            <div className="mt-8 bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-100 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {isAdmin() && (
                  <button
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, role: "LIBRARIAN", balance: 1000 }));
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-colors text-sm"
                  >
                    Create Librarian
                    <br />
                    <span className="text-green-200">with $1000 balance</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, role: "USER", balance: 100 }));
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors text-sm"
                >
                  Create Student
                  <br />
                  <span className="text-blue-200">with $100 balance</span>
                </button>
                <button
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, role: "USER", balance: 0 }));
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg transition-colors text-sm"
                >
                  Create Basic User
                  <br />
                  <span className="text-purple-200">with no initial balance</span>
                </button>
              </div>
              {!isAdmin() && (
                <p className="text-gray-400 text-sm mt-4">
                  Note: As a librarian, you can only create user accounts. Contact an admin to create librarian accounts.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
