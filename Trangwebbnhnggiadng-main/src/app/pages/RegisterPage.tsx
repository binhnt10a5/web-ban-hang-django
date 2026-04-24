import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, User as UserIcon, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setIsLoading(true);

    const result = await register({
      email: formData.email,
      password: formData.password,
      name: formData.name,
    });

    setIsLoading(false);

    if (result.success) {
      toast.success('Đăng ký thành công!');
      navigate('/');
    } else {
      toast.error(result.message || 'Email đã được sử dụng');
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-2 h-8 bg-[#8B7355]"></div>
          <span className="text-2xl font-bold text-white">HOMELY</span>
        </Link>

        {/* Register Form */}
        <div className="bg-[#2a2a2a] rounded-2xl p-8 border border-gray-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Đăng ký</h1>
            <p className="text-gray-400">Tạo tài khoản mới để bắt đầu mua sắm</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-gray-300 flex items-center gap-2 mb-2">
                <UserIcon className="w-4 h-4" />
                Họ và tên
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Nguyễn Văn A"
                className="bg-[#3a3a3a] border-gray-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-300 flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="your@email.com"
                className="bg-[#3a3a3a] border-gray-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-300 flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4" />
                Mật khẩu
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="••••••••"
                className="bg-[#3a3a3a] border-gray-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-gray-300 flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4" />
                Xác nhận mật khẩu
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                placeholder="••••••••"
                className="bg-[#3a3a3a] border-gray-600 text-white"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#8B7355] hover:bg-[#6d5a43] text-white"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-[#8B7355] hover:underline">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-gray-400 hover:text-white transition">
            ← Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}