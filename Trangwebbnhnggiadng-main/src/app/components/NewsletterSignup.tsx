import { useState } from 'react';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Vui lòng nhập email');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubscribed(true);
      toast.success('Đăng ký thành công! Cảm ơn bạn đã quan tâm 🎉');
      setEmail('');
      
      // Reset after 3 seconds
      setTimeout(() => setIsSubscribed(false), 3000);
    }, 1000);
  };

  return (
    <div className="mb-12 bg-gradient-to-r from-[#8B7355] to-[#6d5a43] rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Icon */}
        <div className="inline-flex w-16 h-16 bg-white/20 rounded-full items-center justify-center mb-6">
          <Mail className="w-8 h-8 text-white" />
        </div>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Đăng ký nhận tin khuyến mãi
        </h2>
        <p className="text-white/90 text-lg mb-8">
          Nhận ngay voucher 100.000đ cho đơn hàng đầu tiên và cập nhật các chương trình ưu đãi mới nhất
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <div className="flex-1 relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              className="w-full pl-12 pr-4 py-4 rounded-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 font-medium"
              disabled={isLoading || isSubscribed}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || isSubscribed}
            className="px-8 py-4 bg-white text-[#8B7355] rounded-full font-bold hover:bg-gray-100 transition disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {isSubscribed ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Đã đăng ký
              </>
            ) : isLoading ? (
              'Đang xử lý...'
            ) : (
              <>
                Đăng ký
                <Send className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-6 mt-8 text-white/90 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Ưu đãi độc quyền</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Sản phẩm mới</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Hủy đăng ký bất kỳ lúc nào</span>
          </div>
        </div>
      </div>
    </div>
  );
}
