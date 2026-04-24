import { useState, useEffect } from 'react';
import { X, CheckCircle2, Copy, Clock, ArrowLeft } from 'lucide-react';
import { QRCodeGenerator } from './QRCodeGenerator';
import { toast } from 'sonner';

type PaymentMethod = 'vnpay' | 'momo' | 'stripe' | 'paypal';

interface PaymentGatewayModalProps {
  paymentMethod: PaymentMethod;
  amount: number;
  orderId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PaymentGatewayModal({
  paymentMethod,
  amount,
  orderId,
  onSuccess,
  onCancel,
}: PaymentGatewayModalProps) {
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [isPaying, setIsPaying] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.error('Hết thời gian thanh toán');
          onCancel();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onCancel]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`Đã sao chép ${field}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmPayment = () => {
    setIsPaying(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsPaying(false);
      toast.success('Thanh toán thành công! 🎉');
      onSuccess();
    }, 2000);
  };

  const paymentConfig = {
    vnpay: {
      name: 'VNPay',
      logo: '🏦',
      color: 'blue',
      bankInfo: {
        bankName: 'Ngân hàng TMCP Ngoại Thương Việt Nam (Vietcombank)',
        accountNumber: '1234567890',
        accountName: 'CONG TY HOMELY STORE',
        content: `HOMELY ${orderId}`,
      },
      qrContent: `VNP|1234567890|HOMELY ${orderId}|${amount}`,
    },
    momo: {
      name: 'MoMo',
      logo: '📱',
      color: 'pink',
      bankInfo: {
        bankName: 'Ví điện tử MoMo',
        accountNumber: '0901234567',
        accountName: 'HOMELY STORE',
        content: `HOMELY ${orderId}`,
      },
      qrContent: `MOMO|0901234567|${amount}|HOMELY ${orderId}`,
    },
    stripe: {
      name: 'Stripe',
      logo: '💳',
      color: 'purple',
      bankInfo: {
        bankName: 'Stripe Payment',
        accountNumber: 'stripe_account_123',
        accountName: 'HOMELY STORE',
        content: `Order #${orderId}`,
      },
      qrContent: `STRIPE|${orderId}|${amount}`,
    },
    paypal: {
      name: 'PayPal',
      logo: '🅿️',
      color: 'blue',
      bankInfo: {
        bankName: 'PayPal',
        accountNumber: 'homely@paypal.com',
        accountName: 'HOMELY STORE',
        content: `Order #${orderId}`,
      },
      qrContent: `PAYPAL|homely@paypal.com|${amount}`,
    },
  };

  const config = paymentConfig[paymentMethod];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#2a2a2a] rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className={`bg-gradient-to-r ${
          config.color === 'blue' ? 'from-blue-500 to-blue-600' :
          config.color === 'pink' ? 'from-pink-500 to-pink-600' :
          'from-purple-500 to-purple-600'
        } p-6 relative`}>
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="text-center">
            <div className="text-5xl mb-3">{config.logo}</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Thanh toán qua {config.name}
            </h2>
            <div className="flex items-center justify-center gap-2 bg-white/20 rounded-full px-4 py-2 inline-flex">
              <Clock className="w-4 h-4 text-white" />
              <span className="text-white font-semibold">{formatTime(countdown)}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Amount */}
          <div className="bg-[#1a1a1a] rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm mb-1">Số tiền cần thanh toán</p>
            <p className="text-3xl font-bold text-pink-400">
              {amount.toLocaleString('vi-VN')}đ
            </p>
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-xl p-6">
            <p className="text-gray-900 text-sm font-medium text-center mb-4">
              Quét mã QR để thanh toán
            </p>
            <div className="flex justify-center">
              <QRCodeGenerator
                value={config.qrContent}
                size={200}
              />
            </div>
          </div>

          {/* Bank Info */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm">Hoặc chuyển khoản thủ công:</h3>
            
            {/* Bank Name */}
            <div className="bg-[#1a1a1a] rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Ngân hàng</p>
              <div className="flex items-center justify-between">
                <p className="text-white text-sm font-medium">{config.bankInfo.bankName}</p>
              </div>
            </div>

            {/* Account Number */}
            <div className="bg-[#1a1a1a] rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Số tài khoản</p>
              <div className="flex items-center justify-between">
                <p className="text-white font-mono font-bold">{config.bankInfo.accountNumber}</p>
                <button
                  onClick={() => copyToClipboard(config.bankInfo.accountNumber, 'Số tài khoản')}
                  className="p-2 hover:bg-[#2a2a2a] rounded transition"
                >
                  {copiedField === 'Số tài khoản' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Account Name */}
            <div className="bg-[#1a1a1a] rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Chủ tài khoản</p>
              <div className="flex items-center justify-between">
                <p className="text-white text-sm font-medium">{config.bankInfo.accountName}</p>
              </div>
            </div>

            {/* Amount */}
            <div className="bg-[#1a1a1a] rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Số tiền</p>
              <div className="flex items-center justify-between">
                <p className="text-pink-400 font-bold">{amount.toLocaleString('vi-VN')}đ</p>
                <button
                  onClick={() => copyToClipboard(amount.toString(), 'Số tiền')}
                  className="p-2 hover:bg-[#2a2a2a] rounded transition"
                >
                  {copiedField === 'Số tiền' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="bg-[#1a1a1a] rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Nội dung chuyển khoản</p>
              <div className="flex items-center justify-between">
                <p className="text-white font-mono font-bold">{config.bankInfo.content}</p>
                <button
                  onClick={() => copyToClipboard(config.bankInfo.content, 'Nội dung')}
                  className="p-2 hover:bg-[#2a2a2a] rounded transition"
                >
                  {copiedField === 'Nội dung' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-yellow-400 text-xs">
              ⚠️ Vui lòng chuyển <strong>ĐÚNG số tiền</strong> và <strong>ĐÚNG nội dung</strong> để đơn hàng được xác nhận tự động.
            </p>
          </div>

          {/* Demo Note */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-400 text-xs text-center">
              🎯 <strong>DEMO MODE:</strong> Đây là môi trường thử nghiệm. Nhấn "Tôi đã chuyển khoản" để giả lập thanh toán thành công.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-[#1a1a1a] hover:bg-[#252525] text-white rounded-xl font-semibold transition flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Hủy
            </button>
            <button
              onClick={handleConfirmPayment}
              disabled={isPaying}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPaying ? (
                'Đang xử lý...'
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Tôi đã chuyển khoản
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
