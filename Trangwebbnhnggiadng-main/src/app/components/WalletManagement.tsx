import React, { useState, useEffect } from 'react';
import {
  Wallet, Plus, Minus, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight, ShoppingCart, RotateCcw, Clock, 
  QrCode, Copy, Check, X, CheckCircle2, XCircle, Loader2, CreditCard, Building
} from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { toast } from 'sonner';

type DepositStep = 'amount' | 'bank-transfer' | 'processing' | 'success' | 'error';

interface WalletManagementProps {
  depositAmount?: number | null;
}

export function WalletManagement({ depositAmount = null }: WalletManagementProps) {
  const { balance, transactions, deposit, loadTransactions } = useWallet();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [depositStep, setDepositStep] = useState<DepositStep>('amount');
  const [transactionCode, setTransactionCode] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Auto-open deposit modal with pre-filled amount
  useEffect(() => {
    if (depositAmount && depositAmount > 0) {
      setAmount(depositAmount.toString());
      setShowDepositModal(true);
      toast.info(`Cần nạp thêm ${depositAmount.toLocaleString('vi-VN')}đ để hoàn tất thanh toán`);
    }
  }, [depositAmount]);

  // Thông tin ngân hàng để nạp tiền
  const bankInfo = {
    bankName: 'MB Bank',
    bankCode: '970422',
    accountNumber: '4227090620052',
    accountName: 'TA THANH BINH',
    branch: 'Chi nhánh MB Bank',
  };

  // Quick amount buttons
  const quickAmounts = [50000, 100000, 200000, 500000];

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`Đã sao chép ${field}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value.replace(/\D/g, ''));
    if (isNaN(num)) return '';
    return num.toLocaleString('vi-VN');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setAmount(value);
  };

  const handleContinue = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }
    if (numAmount < 10000) {
      toast.error('Số tiền nạp tối thiểu là 10.000đ');
      return;
    }
    
    setDepositStep('bank-transfer');
  };

  const handleConfirmTransfer = async () => {
    setDepositStep('processing');
    
    // Generate transaction code
    const txCode = `TX${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    setTransactionCode(txCode);

    // Simulate payment processing
    setTimeout(async () => {
      const numAmount = parseFloat(amount);
      const result = await deposit(numAmount);
      
      if (result.success) {
        setDepositStep('success');
        loadTransactions();
      } else {
        setDepositStep('error');
      }
    }, 2000);
  };

  const resetDeposit = () => {
    setAmount('');
    setDepositStep('amount');
    setTransactionCode('');
    setShowDepositModal(false);
  };

  const handleRetry = () => {
    setDepositStep('bank-transfer');
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownRight className="w-5 h-5 text-green-400" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-5 h-5 text-red-400" />;
      case 'payment':
        return <ShoppingCart className="w-5 h-5 text-blue-400" />;
      case 'refund':
        return <RotateCcw className="w-5 h-5 text-yellow-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'refund':
        return 'text-green-400';
      case 'withdrawal':
      case 'payment':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Nạp tiền';
      case 'withdrawal':
        return 'Rút tiền';
      case 'payment':
        return 'Thanh toán';
      case 'refund':
        return 'Hoàn tiền';
      default:
        return 'Giao dịch';
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet Balance Card - MoMo/ZaloPay Style */}
      <div className="relative overflow-hidden rounded-3xl shadow-2xl">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-pink-600 to-red-600" />
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        {/* Content */}
        <div className="relative p-8 text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium">Ví Homely</p>
              <p className="text-xs text-white/60">Số dư khả dụng</p>
            </div>
          </div>

          {/* Balance */}
          <div className="mb-8">
            <div className="text-5xl font-bold mb-1">
              {balance.toLocaleString('vi-VN')}
            </div>
            <div className="text-xl font-medium text-white/90">đồng</div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowDepositModal(true)}
              className="flex-1 bg-white text-pink-600 py-4 rounded-2xl font-bold text-base hover:bg-white/95 transition shadow-lg flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nạp tiền
            </button>
            <button className="flex-1 bg-white/20 backdrop-blur-sm text-white py-4 rounded-2xl font-bold text-base hover:bg-white/30 transition border border-white/30">
              Lịch sử
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-[#2a2a2a] rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Giao dịch gần đây</h3>
          <button className="text-sm text-pink-400 hover:text-pink-300">Xem tất cả</button>
        </div>

        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Chưa có giao dịch nào</p>
            </div>
          ) : (
            transactions.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 bg-[#333] rounded-xl hover:bg-[#3a3a3a] transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#2a2a2a] rounded-xl flex items-center justify-center">
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div>
                    <p className="text-white font-medium">{getTransactionLabel(tx.type)}</p>
                    <p className="text-gray-400 text-sm">
                      {new Date(tx.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className={`text-right ${getTransactionColor(tx.type)}`}>
                  <p className="font-bold text-lg">
                    {tx.type === 'deposit' || tx.type === 'refund' ? '+' : '-'}
                    {tx.amount.toLocaleString('vi-VN')}đ
                  </p>
                  <p className="text-xs text-gray-400">Số dư: {tx.balanceAfter.toLocaleString('vi-VN')}đ</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#1a1a1a] w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
            {/* Step 1: Amount Selection */}
            {depositStep === 'amount' && (
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Nạp tiền vào ví</h2>
                  <button
                    onClick={resetDeposit}
                    className="w-10 h-10 bg-[#2a2a2a] rounded-full flex items-center justify-center hover:bg-[#333] transition"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Amount Input */}
                <div className="mb-6">
                  <label className="text-gray-400 text-sm mb-2 block">Số tiền (VND)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formatCurrency(amount)}
                      onChange={handleAmountChange}
                      placeholder="0"
                      className="w-full bg-[#2a2a2a] border-2 border-gray-700 rounded-2xl px-6 py-5 text-white text-3xl font-bold focus:border-pink-500 focus:outline-none transition"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-500">đ</span>
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div className="mb-6">
                  <p className="text-gray-400 text-sm mb-3">Chọn nhanh</p>
                  <div className="grid grid-cols-2 gap-3">
                    {quickAmounts.map((value) => (
                      <button
                        key={value}
                        onClick={() => handleQuickAmount(value)}
                        className={`py-4 rounded-xl font-bold transition ${
                          amount === value.toString()
                            ? 'bg-pink-500 text-white'
                            : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#333]'
                        }`}
                      >
                        {value.toLocaleString('vi-VN')}đ
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                  <p className="text-blue-300 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Miễn phí giao dịch
                  </p>
                </div>

                {/* Continue Button */}
                <button
                  onClick={handleContinue}
                  disabled={!amount || parseFloat(amount) <= 0}
                  className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white py-5 rounded-2xl font-bold text-lg hover:from-pink-600 hover:to-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                >
                  Tiếp tục
                </button>
              </div>
            )}

            {/* Step 2: Bank Transfer */}
            {depositStep === 'bank-transfer' && (
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Thông tin chuyển khoản</h2>
                  <button
                    onClick={() => setDepositStep('amount')}
                    className="w-10 h-10 bg-[#2a2a2a] rounded-full flex items-center justify-center hover:bg-[#333] transition"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Amount Display */}
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 rounded-2xl p-6 mb-6">
                  <p className="text-green-300 text-sm mb-2">Số tiền cần chuyển</p>
                  <p className="text-green-400 text-4xl font-bold">{parseFloat(amount).toLocaleString('vi-VN')}đ</p>
                </div>

                {/* Bank Info */}
                <div className="space-y-4 mb-6">
                  {/* Bank Name */}
                  <div className="bg-[#2a2a2a] rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
                          <Building className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Ngân hàng</p>
                          <p className="text-white font-bold text-lg">{bankInfo.bankName}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account Number */}
                  <div className="bg-[#2a2a2a] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-400 text-sm">Số tài khoản</p>
                      <button
                        onClick={() => copyToClipboard(bankInfo.accountNumber, 'số tài khoản')}
                        className="p-2 hover:bg-[#333] rounded-lg transition"
                      >
                        {copiedField === 'số tài khoản' ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <p className="text-white font-bold text-xl tracking-wider">{bankInfo.accountNumber}</p>
                  </div>

                  {/* Account Name */}
                  <div className="bg-[#2a2a2a] rounded-xl p-4">
                    <p className="text-gray-400 text-sm mb-2">Chủ tài khoản</p>
                    <p className="text-white font-bold text-lg">{bankInfo.accountName}</p>
                  </div>

                  {/* Transfer Content */}
                  <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-blue-300 text-sm font-medium">Nội dung chuyển khoản</p>
                      <button
                        onClick={() => copyToClipboard(`NAP ${transactionCode || 'HOMELY'}`, 'nội dung')}
                        className="p-2 hover:bg-blue-500/20 rounded-lg transition"
                      >
                        {copiedField === 'nội dung' ? (
                          <Check className="w-4 h-4 text-blue-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-blue-300" />
                        )}
                      </button>
                    </div>
                    <p className="text-blue-400 font-bold text-lg">NAP HOMELY</p>
                    <p className="text-yellow-300 text-xs mt-2 flex items-center gap-1">
                      <span>⚠️</span>
                      <span>Vui lòng ghi chính xác nội dung này</span>
                    </p>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-6">
                  <h3 className="text-orange-300 font-bold mb-2 flex items-center gap-2">
                    <QrCode className="w-4 h-4" />
                    Hướng dẫn
                  </h3>
                  <ol className="text-orange-200 text-sm space-y-1 list-decimal list-inside">
                    <li>Mở app ngân hàng và chuyển khoản theo thông tin trên</li>
                    <li>Nhập chính xác nội dung chuyển khoản</li>
                    <li>Sau khi chuyển khoản, nhấn "Tôi đã chuyển khoản"</li>
                    <li>Tiền sẽ được cập nhật trong 5-15 phút</li>
                  </ol>
                </div>

                {/* Confirm Button */}
                <button
                  onClick={handleConfirmTransfer}
                  className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white py-5 rounded-2xl font-bold text-lg hover:from-pink-600 hover:to-red-600 transition shadow-xl"
                >
                  Tôi đã chuyển khoản
                </button>
              </div>
            )}

            {/* Step 3: Processing */}
            {depositStep === 'processing' && (
              <div className="p-6 py-12">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Đang xử lý...</h3>
                  <p className="text-gray-400 mb-6">Vui lòng chờ trong giây lát</p>
                  
                  {transactionCode && (
                    <div className="bg-[#2a2a2a] rounded-xl p-4 inline-block">
                      <p className="text-gray-400 text-xs mb-1">Mã giao dịch</p>
                      <p className="text-white font-mono font-bold">{transactionCode}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Success */}
            {depositStep === 'success' && (
              <div className="p-6 py-12">
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Nạp tiền thành công!</h3>
                  <p className="text-gray-400 mb-6">Số dư đã được cập nhật</p>
                  
                  {/* Transaction Details */}
                  <div className="bg-[#2a2a2a] rounded-2xl p-6 mb-6 text-left space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Số tiền</span>
                      <span className="text-green-400 font-bold text-xl">+{parseFloat(amount).toLocaleString('vi-VN')}đ</span>
                    </div>
                    {transactionCode && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Mã GD</span>
                        <span className="text-white font-mono text-sm">{transactionCode}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Số dư mới</span>
                      <span className="text-white font-bold text-xl">{balance.toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>

                  <button
                    onClick={resetDeposit}
                    className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white py-5 rounded-2xl font-bold text-lg hover:from-pink-600 hover:to-red-600 transition shadow-xl"
                  >
                    Quay về ví
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Error */}
            {depositStep === 'error' && (
              <div className="p-6 py-12">
                <div className="text-center">
                  <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-10 h-10 text-red-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Thanh toán thất bại</h3>
                  <p className="text-gray-400 mb-6">Vui lòng thử lại sau</p>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={resetDeposit}
                      className="flex-1 bg-[#2a2a2a] text-white py-4 rounded-2xl font-bold hover:bg-[#333] transition"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleRetry}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 text-white py-4 rounded-2xl font-bold hover:from-pink-600 hover:to-red-600 transition shadow-xl"
                    >
                      Thử lại
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}