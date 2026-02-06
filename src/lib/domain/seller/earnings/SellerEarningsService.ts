import { sellerEarningsRepository } from "./SellerEarningsRepository";
import { 
  SellerEarningsQueryRequest, 
  PayoutRequestRequest, 
  EarningsExportRequest 
} from "./SellerEarningsSchemas";
import { 
  InsufficientBalanceError, 
  InvalidPayoutAmountError 
} from "./SellerEarningsErrors";

export class SellerEarningsService {
  async getEarningsData(sellerId: string, query: SellerEarningsQueryRequest = { period: '30days', page: 1, limit: 20, status: 'all' }) {
    const { period = '30days', action } = query;

    // If specific action is requested, return only that data
    if (action) {
      switch (action) {
        case 'summary':
          const summary = await sellerEarningsRepository.getEarningsSummary(sellerId, period);
          return { summary };
        
        case 'transactions':
          const transactions = await sellerEarningsRepository.getTransactions(sellerId, {
            page: query.page || 1,
            limit: query.limit || 20,
            status: query.status,
            search: query.search,
          });
          return { transactions: transactions.transactions, total: transactions.total };
        
        default:
          break;
      }
    }

    // Return complete earnings data (summary + recent transactions)
    const [summary, transactionsResult] = await Promise.all([
      sellerEarningsRepository.getEarningsSummary(sellerId, period),
      sellerEarningsRepository.getTransactions(sellerId, { page: 1, limit: 5 })
    ]);

    return {
      earnings: {
        transactions: transactionsResult.transactions,
        summary,
      }
    };
  }

  async getTransactions(sellerId: string, options: {
    page: number;
    limit: number;
    status?: string;
    search?: string;
  }) {
    return await sellerEarningsRepository.getTransactions(sellerId, options);
  }

  async requestPayout(sellerId: string, payoutData: PayoutRequestRequest) {
    const { amount, bankDetails } = payoutData;

    if (!amount || amount <= 0) {
      throw new InvalidPayoutAmountError();
    }

    // Check available balance
    const available = await sellerEarningsRepository.calculateAvailablePayout(sellerId);

    if (amount > available) {
      throw new InsufficientBalanceError(available, amount);
    }

    return await sellerEarningsRepository.createPayoutRequest(sellerId, amount, bankDetails);
  }

  async getEarningsSummary(sellerId: string, period: string = '30days') {
    return await sellerEarningsRepository.getEarningsSummary(sellerId, period);
  }

  async getPayoutHistory(sellerId: string, options: {
    page: number;
    limit: number;
    status?: string;
  }) {
    return await sellerEarningsRepository.getPayoutHistory(sellerId, options);
  }

  async cancelPayout(sellerId: string, payoutId: string) {
    return await sellerEarningsRepository.cancelPayout(sellerId, payoutId);
  }

  async exportEarnings(sellerId: string, exportOptions: EarningsExportRequest) {
    const { period, format } = exportOptions;
    
    const data = await sellerEarningsRepository.getEarningsExportData(sellerId, period);

    if (format === 'json') {
      return {
        format: 'json',
        data,
        filename: `seller-earnings-${period}.json`
      };
    }

    // Generate CSV content
    let csvContent = 'Order Number,Customer Name,Customer Email,Product Names,Order Amount,Platform Fee,Seller Amount,Status,Order Date\n';
    
    data.forEach((row: any) => {
      csvContent += `"${row.orderNumber}","${row.customerName}","${row.customerEmail}","${row.productNames}",${row.orderAmount},${row.platformFee},${row.sellerAmount},"${row.status}","${row.orderDate}"\n`;
    });

    return {
      format: 'csv',
      content: csvContent,
      filename: `seller-earnings-${period}.csv`
    };
  }
}

export const sellerEarningsService = new SellerEarningsService();