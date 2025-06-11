"use client";

import React, { useState, useEffect } from "react";
import { User, Reservation, Transaction, BookCopy } from "@/lib/api/types";
import { userAPI } from "@/lib/api/userAPI";
import {
  getAllTransactions,
  createTransaction,
  createTransactionFromReservation,
  returnBook,
  createTransactionDetail,
} from "@/app/actions/transactionActions";
import { getAllReservations } from "@/app/actions/reservationActions";
import { updateUser } from "@/app/actions/userActions";
import { bookCopyAPI } from "@/lib/api/bookCopyAPI";
import {
  Search,
  Users,
  CreditCard,
  BookOpen,
  Clock,
  Plus,
  CheckCircle,
  RotateCcw,
  AlertTriangle,
  X,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

function UserManagementPage() {
  const [searchCCCD, setSearchCCCD] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userReservations, setUserReservations] = useState<Reservation[]>([]);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [transactionAmount, setTransactionAmount] = useState(0);

  const handleDeposit = async () => {
    if (!selectedUser) return;

    if (transactionAmount <= 0) {
      alert("Số tiền nạp phải lớn hơn 0!");
      return;
    }

    const newBalance = selectedUser.balance + transactionAmount;

    const updated = await updateUser(selectedUser.id, {
      ...selectedUser,
      balance: newBalance,
    });

    if (updated) {
      setSelectedUser(updated);
      setTransactionAmount(0);
    } else {
      alert("Cập nhật thất bại!");
    }
  };

  const handleWithdraw = async () => {
    if (!selectedUser) return;

    if (transactionAmount <= 0) {
      alert("Số tiền rút phải lớn hơn 0!");
      return;
    }

    if (selectedUser.balance < transactionAmount) {
      alert("Số dư không đủ để rút!");
      return;
    }

    const newBalance = selectedUser.balance - transactionAmount;

    const updated = await updateUser(selectedUser.id, {
      ...selectedUser,
      balance: newBalance,
    });

    if (updated) {
      setSelectedUser(updated);
      setTransactionAmount(0);
    } else {
      alert("Cập nhật thất bại!");
    }
  };

  // Dialog states for transaction workflows
  const [showBorrowDialog, setShowBorrowDialog] = useState(false);
  const [showFulfillDialog, setShowFulfillDialog] = useState<{
    open: boolean;
    reservationId: string | null;
  }>({ open: false, reservationId: null });
  const [showPenaltyDialog, setShowPenaltyDialog] = useState<{
    open: boolean;
    transactionId: string | null;
  }>({ open: false, transactionId: null }); // Form states for dialogs (placeholders)
  const [borrowForm, setBorrowForm] = useState({
    bookCopyId: "",
    dueDate: "",
  });
  const [fulfillForm, setFulfillForm] = useState({
    bookCopyId: "",
    dueDate: "",
  });
  const [penaltyForm, setPenaltyForm] = useState({
    penaltyFee: 0,
    description: "",
  });

  // Additional state for transaction workflows
  const [availableBookCopies, setAvailableBookCopies] = useState<BookCopy[]>(
    []
  );
  const [loadingBookCopies, setLoadingBookCopies] = useState(false);
  const [processingTransaction, setProcessingTransaction] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAllUsers();
  }, []);

  const loadAllUsers = async () => {
    setInitialLoading(true);
    try {
      const result = await userAPI.getUsers();
      if ("data" in result && result.data) {
        setAllUsers(result.data);
        console.log("Loaded users:", result.data);
      } else {
        console.error("Failed to load users:", result.error);
        setAllUsers([]);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      setAllUsers([]);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchCCCD.trim()) return;

    setSearchLoading(true);
    try {
      const result = await userAPI.searchUserByCCCD(searchCCCD.trim());
      if ("data" in result && result.data) {
        setSearchResults(result.data);
      } else {
        setSearchResults([]);
        alert("No users found with that CCCD");
      }
    } catch (error) {
      console.error("Error searching users:", error);
      alert("Failed to search users");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectUser = async (user: User) => {
    setSelectedUser(user);
    setLoading(true);

    try {
      // Load user reservations - using the same inefficient pattern as transactions
      const allReservations = await getAllReservations();
      const userReservationsFiltered = allReservations.filter(
        (r) => r.userId === user.id
      );
      setUserReservations(userReservationsFiltered);

      // Load user transactions
      const allTransactions = await getAllTransactions();
      const userTransactionsFiltered = allTransactions.filter(
        (t) => t.userId === user.id
      );
      setUserTransactions(userTransactionsFiltered);
    } catch (error) {
      console.error("Error loading user data:", error);
      setUserReservations([]);
      setUserTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-400 bg-yellow-400/10";
      case "READY_FOR_PICKUP":
        return "text-green-400 bg-green-400/10";
      case "COMPLETED":
        return "text-blue-400 bg-blue-400/10";
      case "CANCELLED":
        return "text-red-400 bg-red-400/10";
      case "EXPIRED":
        return "text-gray-400 bg-gray-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  // Transaction workflow handlers
  const loadAvailableBookCopies = async () => {
    setLoadingBookCopies(true);
    setError(null);
    try {
      const result = await bookCopyAPI.getBookCopies();
      if ("data" in result && result.data) {
        // Filter available copies
        const availableCopies = result.data.filter(
          (copy) => copy.status === "AVAILABLE"
        );
        setAvailableBookCopies(availableCopies);
      } else {
        setError("Failed to load available book copies");
        setAvailableBookCopies([]);
      }
    } catch (error) {
      console.error("Error loading book copies:", error);
      setError("Failed to load available book copies");
      setAvailableBookCopies([]);
    } finally {
      setLoadingBookCopies(false);
    }
  };

  const handleCreateTransaction = async () => {
    if (!selectedUser || !borrowForm.bookCopyId) {
      setError("Please select a book copy");
      return;
    }

    setProcessingTransaction(true);
    setError(null);
    try {
      const result = await createTransaction({
        userId: selectedUser.id,
        bookCopyId: borrowForm.bookCopyId,
        bookCopyIds: [],
        note: "",
      });

      if (result) {
        alert("Transaction created successfully!");
        setShowBorrowDialog(false);
        setBorrowForm({ bookCopyId: "", dueDate: "" });
        // Refresh user data
        await handleSelectUser(selectedUser);
      } else {
        setError("Failed to create transaction");
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
      setError("Failed to create transaction");
    } finally {
      setProcessingTransaction(false);
    }
  };

  const handleFulfillReservation = async () => {
    if (!showFulfillDialog.reservationId || !fulfillForm.bookCopyId) {
      setError("Please select a book copy");
      return;
    }

    setProcessingTransaction(true);
    setError(null);
    try {
      const result = await createTransactionFromReservation({
        reservationId: showFulfillDialog.reservationId,
        bookCopyId: fulfillForm.bookCopyId,
      });

      if (result) {
        alert("Reservation fulfilled successfully!");
        setShowFulfillDialog({ open: false, reservationId: null });
        setFulfillForm({ bookCopyId: "", dueDate: "" });
        // Refresh user data
        if (selectedUser) {
          await handleSelectUser(selectedUser);
        }
      } else {
        setError("Failed to fulfill reservation");
      }
    } catch (error) {
      console.error("Error fulfilling reservation:", error);
      setError("Failed to fulfill reservation");
    } finally {
      setProcessingTransaction(false);
    }
  };

  const handleReturnBook = async (transactionId: string) => {
    if (!window.confirm("Are you sure you want to return this book?")) {
      return;
    }

    setProcessingTransaction(true);
    setError(null);
    try {
      const result = await returnBook(transactionId, {
        returnedDate: new Date().toISOString(),
      });

      if (result) {
        alert("Book returned successfully!");
        // Refresh user data
        if (selectedUser) {
          await handleSelectUser(selectedUser);
        }
      } else {
        setError("Failed to return book");
      }
    } catch (error) {
      console.error("Error returning book:", error);
      setError("Failed to return book");
    } finally {
      setProcessingTransaction(false);
    }
  };

  const handleCreatePenalty = async () => {
    if (!showPenaltyDialog.transactionId || penaltyForm.penaltyFee <= 0) {
      setError("Please enter a valid penalty amount");
      return;
    }

    setProcessingTransaction(true);
    setError(null);
    try {
      const result = await createTransactionDetail({
        transactionId: showPenaltyDialog.transactionId,
        penaltyFee: penaltyForm.penaltyFee,
        description: penaltyForm.description,
      });

      if (result) {
        alert("Penalty assessed successfully!");
        setShowPenaltyDialog({ open: false, transactionId: null });
        setPenaltyForm({ penaltyFee: 0, description: "" });
        // Refresh user data
        if (selectedUser) {
          await handleSelectUser(selectedUser);
        }
      } else {
        setError("Failed to assess penalty");
      }
    } catch (error) {
      console.error("Error assessing penalty:", error);
      setError("Failed to assess penalty");
    } finally {
      setProcessingTransaction(false);
    }
  };

  const openBorrowDialog = async () => {
    await loadAvailableBookCopies();
    setShowBorrowDialog(true);
    setBorrowForm({
      bookCopyId: "",
      dueDate: "",
    });
  };

  const openFulfillDialog = async (reservationId: string) => {
    await loadAvailableBookCopies();
    setShowFulfillDialog({ open: true, reservationId });
    setFulfillForm({
      bookCopyId: "",
      dueDate: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="h-8 w-8" />
            User Management
          </h1>

          {/* Admin-only Create User Button */}
          <div className="flex gap-4">
            <button
              onClick={() => (window.location.href = "/users/create")}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Users className="h-4 w-4" />
              Create New User
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Search User by CCCD
          </h2>

          <div className="flex gap-4">
            <input
              type="text"
              value={searchCCCD}
              onChange={(e) => setSearchCCCD(e.target.value)}
              placeholder="Enter CCCD (Social Security Number)"
              className="flex-1 p-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={searchLoading || !searchCCCD.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              {searchLoading ? "Searching..." : "Search"}
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Search Results</h3>
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className="p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{user.name}</h4>
                        <p className="text-gray-400 text-sm">
                          CCCD: {user.cccd}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Email: {user.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-medium">
                          {formatCurrency(user.balance)}
                        </p>
                        <span className="inline-block px-2 py-1 text-xs rounded bg-blue-600 text-white">
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* All Users Section */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 mb-8">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold flex items-center">
              <Users className="w-5 h-5 mr-2" />
              All Users ({allUsers.length})
            </h2>
          </div>

          <div className="p-6">
            {initialLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : allUsers.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No users found</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {allUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                      selectedUser?.id === user.id
                        ? "border-blue-500 bg-blue-900/20"
                        : "border-gray-600 bg-gray-700 hover:bg-gray-600"
                    }`}
                    onClick={() => handleSelectUser(user)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{user.name}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          user.role === "ADMIN"
                            ? "bg-red-600/20 text-red-400"
                            : user.role === "LIBRARIAN"
                            ? "bg-blue-600/20 text-blue-400"
                            : "bg-green-600/20 text-green-400"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">CCCD: {user.cccd}</p>
                    <p className="text-gray-400 text-sm">Email: {user.email}</p>
                    <p className="text-gray-400 text-sm">
                      Balance: {formatCurrency(user.balance)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected User Details */}
        {selectedUser && (
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            {" "}
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  User Details: {selectedUser.name}
                </h2>
                <button
                  onClick={openBorrowDialog}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Create Borrow Transaction
                </button>
              </div>
            </div>
            <div className="p-6">
              {/* User Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <CreditCard className="w-5 h-5 mr-2 text-green-500" />
                    <h3 className="font-medium">Balance</h3>
                  </div>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(selectedUser.balance)}
                  </p>
                </div>{" "}
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <BookOpen className="w-5 h-5 mr-2 text-blue-500" />
                    <h3 className="font-medium">Total Reservations</h3>
                  </div>
                  <p className="text-2xl font-bold text-blue-400">
                    {userReservations.length}
                  </p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Clock className="w-5 h-5 mr-2 text-yellow-500" />
                    <h3 className="font-medium">Total Transactions</h3>
                  </div>
                  <p className="text-2xl font-bold text-yellow-400">
                    {userTransactions.length}
                  </p>
                </div>
              </div>
              {/* Deposit / Withdraw Section */}
              <div className="bg-gray-700 p-4 rounded-lg mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Quản lý nạp rút
                </h3>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    placeholder="Nhập số tiền"
                    value={transactionAmount}
                    onChange={(e) =>
                      setTransactionAmount(Number(e.target.value))
                    }
                    className="px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 w-40"
                  />
                  <button
                    onClick={handleDeposit}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  >
                    Nạp tiền
                  </button>
                  <button
                    onClick={handleWithdraw}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                  >
                    Rút tiền
                  </button>
                </div>
              </div>
              {/* Contact Information */}
              <div className="bg-gray-700 p-4 rounded-lg mb-6">
                <h3 className="font-medium mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">CCCD:</span>
                    <span className="ml-2">{selectedUser.cccd}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Email:</span>
                    <span className="ml-2">{selectedUser.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Phone:</span>
                    <span className="ml-2">{selectedUser.phoneNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Role:</span>
                    <span className="ml-2">{selectedUser.role}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-gray-400">Address:</span>
                    <span className="ml-2">{selectedUser.address}</span>
                  </div>
                </div>
              </div>{" "}
              {/* Reservations List */}
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">
                  Reservations History
                </h3>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : userReservations.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    No reservations found
                  </p>
                ) : (
                  <div className="space-y-4">
                    {userReservations.map((reservation) => (
                      <div
                        key={reservation.id}
                        className="bg-gray-700 p-4 rounded-lg"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium">
                              {reservation.bookTitle}
                            </h4>
                            <p className="text-gray-400 text-sm">
                              Authors:{" "}
                              {(reservation.bookAuthors || []).join(", ")}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                                reservation.id
                              )}`}
                            >
                              {reservation.id}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Reserved:</span>
                            <span className="ml-2">
                              {new Date(
                                reservation.reservationDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Expires:</span>
                            <span className="ml-2">
                              {new Date(
                                reservation.expirationDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Deposit:</span>
                            <span className="ml-2 text-green-400">
                              {formatCurrency(reservation.deposit)}
                            </span>
                          </div>
                        </div>

                        {reservation.bookCopyId && (
                          <div className="mt-2 text-sm">
                            <span className="text-gray-400">
                              Assigned Copy:
                            </span>
                            <span className="ml-2 font-mono bg-gray-600 px-2 py-1 rounded">
                              {reservation.bookCopyId}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Transactions List */}
              <div>
                <h3 className="text-lg font-medium mb-4">
                  Transaction History
                </h3>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : userTransactions.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    No transactions found
                  </p>
                ) : (
                  <div className="space-y-4">
                    {userTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="bg-gray-700 p-4 rounded-lg"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium">
                              {transaction.bookTitle}
                            </h4>
                            <p className="text-gray-400 text-sm">
                              Copy ID: {transaction.bookCopyId}
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                transaction.returnedDate
                                  ? "bg-green-600/20 text-green-400"
                                  : "bg-yellow-600/20 text-yellow-400"
                              }`}
                            >
                              {transaction.returnedDate
                                ? "Returned"
                                : "Borrowed"}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Borrowed:</span>
                            <span className="ml-2">
                              {new Date(
                                transaction.borrowDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Due:</span>
                            <span className="ml-2">
                              {new Date(
                                transaction.dueDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          {transaction.returnedDate && (
                            <div>
                              <span className="text-gray-400">Returned:</span>
                              <span className="ml-2">
                                {new Date(
                                  transaction.returnedDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {transaction.transactionDetail && (
                          <div className="mt-3 p-3 bg-red-600/10 border border-red-600/20 rounded">
                            <div className="flex justify-between items-center">
                              <span className="text-red-400 font-medium">
                                Penalty
                              </span>
                              <span className="text-red-400 font-bold">
                                {formatCurrency(
                                  transaction.transactionDetail.penaltyFee
                                )}
                              </span>
                            </div>
                            {transaction.transactionDetail.description && (
                              <p className="text-gray-400 text-sm mt-1">
                                {transaction.transactionDetail.description}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProtectedUserManagementPage() {
  return (
    <ProtectedRoute requiredRole={["ADMIN", "LIBRARIAN"]}>
      <UserManagementPage />
    </ProtectedRoute>
  );
}
