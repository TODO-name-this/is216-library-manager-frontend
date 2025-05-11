export const mockTransaction: {
  id: string;
  userId: string;
  borrowDate: string;
  transactionDetails: {
    transactionId: string;
    bookCopyId: string;
    returnedDate: string | null;
    penaltyFee: number;
  }[];
}[] = [];
