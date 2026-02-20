'use client';

import { useState } from 'react';
import { Package, CreditCard, X, AlertTriangle, DollarSign, Clock } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { EarningsOverviewProps, PayoutMethod } from '@/types/seller/earnings';

/* ─── Payout Modal ─── */
interface PayoutRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, method: PayoutMethod, accountDetails?: any) => void;
  availableAmount: number;
  isSubmitting: boolean;
}

const INPUT_CLS = 'w-full px-3 py-2 text-[13px] text-[#111111] border border-[#E5E7EB] rounded-md bg-white placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111111] focus:border-transparent transition';
const LABEL_CLS = 'block text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-1.5';

function PayoutRequestModal({ isOpen, onClose, onSubmit, availableAmount, isSubmitting }: PayoutRequestModalProps) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PayoutMethod>('bank_transfer');
  const [details, setDetails] = useState({ accountNumber: '', ifscCode: '', bankName: '', accountHolderName: '', upiId: '', walletId: '' });

  const reset = () => { setAmount(''); setMethod('bank_transfer'); setDetails({ accountNumber: '', ifscCode: '', bankName: '', accountHolderName: '', upiId: '', walletId: '' }); };
  const handleClose = () => { reset(); onClose(); };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0 || num > availableAmount) return;
    const accountDetails =
      method === 'bank_transfer' ? { accountNumber: details.accountNumber, ifscCode: details.ifscCode, bankName: details.bankName, accountHolderName: details.accountHolderName }
        : method === 'upi' ? { upiId: details.upiId }
          : { walletId: details.walletId };
    onSubmit(num, method, accountDetails);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={e => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-[15px] font-bold text-[#111111]">Request Payout</h3>
          <button onClick={handleClose} className="p-1.5 rounded-md text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Available balance */}
          <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg px-4 py-3">
            <p className="text-[12px] text-[#9CA3AF]">Available for payout</p>
            <p className="text-[20px] font-bold text-[#111111] tabular-nums mt-0.5">{formatCurrency(availableAmount)}</p>
          </div>

          {/* Amount */}
          <div>
            <label className={LABEL_CLS}>Payout Amount</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} max={availableAmount} min="1" step="0.01" required placeholder="Enter amount" className={INPUT_CLS} />
          </div>

          {/* Method */}
          <div>
            <label className={LABEL_CLS}>Method</label>
            <select value={method} onChange={e => setMethod(e.target.value as PayoutMethod)} className={INPUT_CLS}>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="upi">UPI</option>
              <option value="wallet">Wallet</option>
            </select>
          </div>

          {/* Bank fields */}
          {method === 'bank_transfer' && (
            <div className="space-y-3">
              {([['accountHolderName', 'Account Holder Name', 'text'], ['accountNumber', 'Account Number', 'text'], ['ifscCode', 'IFSC Code', 'text'], ['bankName', 'Bank Name', 'text']] as const).map(([key, label, type]) => (
                <div key={key}>
                  <label className={LABEL_CLS}>{label}</label>
                  <input type={type} value={(details as any)[key]} onChange={e => setDetails(p => ({ ...p, [key]: e.target.value }))} required className={INPUT_CLS} />
                </div>
              ))}
            </div>
          )}

          {method === 'upi' && (
            <div>
              <label className={LABEL_CLS}>UPI ID</label>
              <input type="text" value={details.upiId} onChange={e => setDetails(p => ({ ...p, upiId: e.target.value }))} required placeholder="example@upi" className={INPUT_CLS} />
            </div>
          )}

          {method === 'wallet' && (
            <div>
              <label className={LABEL_CLS}>Wallet ID</label>
              <input type="text" value={details.walletId} onChange={e => setDetails(p => ({ ...p, walletId: e.target.value }))} required className={INPUT_CLS} />
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={handleClose} className="flex-1 px-4 py-2.5 text-[13px] font-medium text-[#555555] border border-[#E5E7EB] rounded-lg hover:bg-[#F8F9FA] transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > availableAmount}
              className="flex-1 px-4 py-2.5 text-[13px] font-medium bg-[#111111] text-white rounded-lg hover:bg-[#222222] disabled:opacity-40 transition-colors"
            >
              {isSubmitting ? 'Processing…' : 'Request Payout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function EarningsOverview({ summary, transactions, onRequestPayout, isRequestingPayout, getStatusBadge }: EarningsOverviewProps) {
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const available = summary?.completedRevenue || 0;

  const stats = [
    { label: 'Total Revenue', value: formatCurrency(summary?.totalRevenue || 0), icon: DollarSign, dot: 'bg-emerald-400' },
    { label: 'Pending Revenue', value: formatCurrency(summary?.pendingRevenue || 0), icon: Clock, dot: 'bg-amber-400' },
    { label: 'Platform Fees', value: formatCurrency(summary?.platformFees || 0), icon: Package, dot: 'bg-[#9CA3AF]' },
  ];

  return (
    <div className="space-y-5">
      {/* Payout Banner */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-4 h-4 text-[#6B7280]" />
            <h3 className="text-[14px] font-bold text-[#111111]">Ready for Payout</h3>
          </div>
          <p className="text-[12px] text-[#9CA3AF]">
            {available > 0
              ? <><span className="text-[#111111] font-semibold tabular-nums">{formatCurrency(available)}</span> available for withdrawal</>
              : 'Complete more orders to build your payout balance.'
            }
          </p>
          {!available && (
            <div className="flex items-start gap-1.5 mt-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-md">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-px" />
              <p className="text-[11px] text-amber-700">No balance available yet. Orders must be delivered to unlock earnings.</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowPayoutModal(true)}
          disabled={isRequestingPayout || !available}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium bg-[#111111] text-white rounded-lg hover:bg-[#222222] disabled:opacity-40 transition-colors whitespace-nowrap"
        >
          <CreditCard className="w-4 h-4" />
          {isRequestingPayout ? 'Processing…' : 'Request Payout'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, dot }) => (
          <div key={label} className="bg-white border border-[#E5E7EB] rounded-lg p-5 hover:border-[#D1D5DB] hover:shadow-sm transition-all duration-150">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest">{label}</span>
              <div className="w-7 h-7 bg-[#F8F9FA] border border-[#F3F4F6] rounded-md flex items-center justify-center">
                <Icon className="w-3.5 h-3.5 text-[#6B7280]" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
              <span className="text-[20px] font-bold text-[#111111] tabular-nums leading-none truncate">{value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13px] font-bold text-[#111111]">Recent Transactions</h3>
          <span className="text-[11px] text-[#9CA3AF]">Last 5 entries</span>
        </div>

        {transactions && transactions.length > 0 ? (
          <div className="bg-white border border-[#E5E7EB] rounded-lg divide-y divide-[#F3F4F6] overflow-hidden">
            {transactions.slice(0, 5).map((tx) => (
              <div key={tx._id} className="flex items-center justify-between px-4 py-3.5 hover:bg-[#FAFAFA] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#F3F4F6] border border-[#E5E7EB] rounded-md flex items-center justify-center">
                    <Package className="w-4 h-4 text-[#9CA3AF]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#111111] font-mono">{tx.orderNumber}</p>
                    <p className="text-[11px] text-[#9CA3AF]">{tx.customerName} · {new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-bold tabular-nums text-[#111111]">{formatCurrency(tx.amount || tx.sellerAmount)}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 border rounded capitalize inline-block mt-0.5 ${getStatusBadge(tx.status)}`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#E5E7EB] rounded-lg text-center py-10">
            <div className="w-10 h-10 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-3">
              <Package className="w-5 h-5 text-[#9CA3AF]" />
            </div>
            <p className="text-[13px] text-[#9CA3AF]">No transactions yet</p>
          </div>
        )}
      </div>

      <PayoutRequestModal
        isOpen={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
        onSubmit={(a, m, d) => { onRequestPayout(a, m, d); setShowPayoutModal(false); }}
        availableAmount={available}
        isSubmitting={isRequestingPayout}
      />
    </div>
  );
}