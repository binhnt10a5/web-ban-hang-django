import React, { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Mail, CheckCircle, Send } from 'lucide-react';
import { authApi } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Vui lòng nhập email');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Email không hợp lệ');
      return;
    }

    setLoading(true);

    try {
      const result = await authApi.forgotPassword(email);
      if (result.success) {
        setSent(true);
        toast.success('Đã gửi email khôi phục mật khẩu thành công!');
      } else {
        toast.error(result.error || 'Email không tồn tại trong hệ thống');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Back Link */}
        <Link
          to="/login"
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại đăng nhập
        </Link>

        {/* Card */}
        <div className="bg-[#2a2a2a] rounded-2xl p-8 border border-gray-700">
          {sent ? (
            // Success State
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Email đã được gửi!</h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến email <span className="text-[#8B7355] font-semibold">{email}</span>
              </p>
              
              <div className="bg-[#3a3a3a] rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-400 mb-2">📧 Vui lòng kiểm tra:</p>
                <ul className="text-sm text-gray-300 space-y-1 text-left">
                  <li>• Hộp thư đến (Inbox)</li>
                  <li>• Thư mục spam/junk</li>
                  <li>• Email có thể mất 2-5 phút để nhận được</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Link to="/login" className="block">
                  <Button className="w-full bg-[#8B7355] hover:bg-[#6d5a43] text-white">
                    Quay lại đăng nhập
                  </Button>
                </Link>
                
                <button
                  onClick={() => {
                    setSent(false);
                    setEmail('');
                  }}
                  className="text-sm text-gray-400 hover:text-white transition"
                >
                  Gửi lại email khác
                </button>
              </div>
            </div>
          ) : (
            // Form State
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#8B7355]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-[#8B7355]" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Quên mật khẩu?</h1>
                <p className="text-gray-400 leading-relaxed">
                  Nhập email đã đăng ký để nhận hướng dẫn đặt lại mật khẩu
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="text-gray-300 mb-2">
                    Địa chỉ Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      required
                      className="bg-[#3a3a3a] border-gray-600 text-white pl-10"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#8B7355] hover:bg-[#6d5a43] text-white"
                >
                  <Send className="w-5 h-5 mr-2" />
                  {loading ? 'Đang gửi...' : 'Gửi email khôi phục'}
                </Button>

                <p className="text-center text-gray-400 text-sm">
                  Đã nhớ mật khẩu?{' '}
                  <Link to="/login" className="text-[#8B7355] hover:text-[#a8906a] font-semibold transition">
                    Đăng nhập ngay
                  </Link>
                </p>
              </form>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-[#3a3a3a] rounded-lg border border-gray-700">
                <p className="text-xs text-gray-400 text-center">
                  💡 Mật khẩu mới sẽ được gửi về email của bạn. Hãy kiểm tra cả thư mục spam nếu không thấy email.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}