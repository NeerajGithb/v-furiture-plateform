export interface EarningsOverview {
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  totalWithdrawn: number;
  thisMonthEarnings: number;
  lastMonthEarnings: number;
  growthPercentage: number;
}

export interface Transaction {
  id: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  commission: number;
  netAmount: number;
  status: string;
  type: string;
  createdAt: Date;
  processedAt?: Date;
}

export interface PayoutRequest {
  id: string;
  amount: number;
  status: string;
  requestedAt: Date;
  processedAt?: Date;
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
  };
}

export interface EarningsChart {
  date: string;
  earnings: number;
  orders: number;
  commission: number;
}

export interface ISellerEarningsRepository {
  // Earnings overview
  getEarningsOverview(sellerId: string, period?: string): Promise<EarningsOverview>;
  getEarningsChart(sellerId: string, period?: string): Promise<EarningsChart[]>;
  
  // Transactions
  getTransactions(sellerId: string, options: {
    page: number;
    limit: number;
    status?: string;
    type?: string;
    period?: string;
  }): Promise<{
    transactions: Transaction[];
    total: number;
  }>;
  
  getTransactionById(sellerId: string, transactionId: string): Promise<Transaction>;
  
  // Payouts
  getPayoutRequests(sellerId: string, options: {
    page: number;
    limit: number;
    status?: string;
  }): Promise<{
    payouts: PayoutRequest[];
    total: number;
  }>;
  
  requestPayout(sellerId: string, amount: number, bankDetails: any): Promise<PayoutRequest>;
  
  // Export
  exportTransactions(sellerId: string, filters: {
    startDate?: string;
    endDate?: string;
    status?: string;
    type?: string;
  }): Promise<any[]>;
}