import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { UserPlus, Sparkles, Mail, Lock, User, Phone, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface AccountCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  guestEmail: string;
  guestName: string;
}

export function AccountCreationModal({ isOpen, onClose, guestEmail, guestName }: AccountCreationModalProps) {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [creationMode, setCreationMode] = useState<'choose' | 'manual' | 'auto' | 'success'>('choose');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  
  const [formData, setFormData] = useState({
    name: guestName,
    email: guestEmail,
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleAutoCreate = async () => {
    setIsLoading(true);
    
    const password = generateRandomPassword();
    setGeneratedPassword(password);

    try {
      const result = await register({
        email: guestEmail,
        name: guestName,
        password: password,
      });

      if (result.success) {
        setCreationMode('success');
        toast.success('Tài khoản đã được tạo thành công!');
      } else {
        toast.error(result.message || 'Lỗi khi tạo tài khoản');
      }
    } catch (error) {
      toast.error('Lỗi khi tạo tài khoản');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({
        email: formData.email,
        name: formData.name,
        password: formData.password,
        phone: formData.phone,
      });

      if (result.success) {
        toast.success('Tài khoản đã được tạo thành công!');
        onClose();
        navigate('/dashboard');
      } else {
        toast.error(result.message || 'Lỗi khi tạo tài khoản');
      }
    } catch (error) {
      toast.error('Lỗi khi tạo tài khoản');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    setCopiedPassword(true);
    toast.success('Đã sao chép mật khẩu');
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#2a2a2a] border-gray-700 text-white sm:max-w-[500px]">
        {creationMode === 'choose' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl text-white">🎉 Đặt hàng thành công!</DialogTitle>
              <DialogDescription className="text-gray-400">
                Tạo tài khoản để theo dõi đơn hàng và nhận nhiều ưu đãi hơn
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Button
                onClick={() => setCreationMode('auto')}
                className="w-full bg-gradient-to-r from-[#8B7355] to-[#6d5a43] hover:from-[#6d5a43] hover:to-[#5a4835] text-white h-20 text-lg"
              >
                <Sparkles className="w-6 h-6 mr-3" />
                <div className="text-left flex-1">
                  <div className="font-bold">Tạo tài khoản tự động</div>
                  <div className="text-sm opacity-90">Nhanh chóng với email {guestEmail}</div>
                </div>
              </Button>

              <Button
                onClick={() => setCreationMode('manual')}
                variant="outline"
                className="w-full bg-[#3a3a3a] border-gray-600 hover:bg-[#4a4a4a] text-white h-20 text-lg"
              >
                <UserPlus className="w-6 h-6 mr-3" />
                <div className="text-left flex-1">
                  <div className="font-bold">Tự tạo tài khoản</div>
                  <div className="text-sm opacity-90">Đặt mật khẩu của riêng bạn</div>
                </div>
              </Button>

              <Button
                onClick={onClose}
                variant="ghost"
                className="w-full text-gray-400 hover:text-white"
              >
                Để sau
              </Button>
            </div>
          </>
        )}

        {creationMode === 'auto' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl text-white">Tạo tài khoản tự động</DialogTitle>
              <DialogDescription className="text-gray-400">
                Hệ thống sẽ tự động tạo mật khẩu an toàn cho bạn
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-[#8B7355]" />
                  <span className="text-gray-400 text-sm">Email</span>
                </div>
                <p className="text-white font-medium">{guestEmail}</p>
              </div>

              <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-[#8B7355]" />
                  <span className="text-gray-400 text-sm">Tên</span>
                </div>
                <p className="text-white font-medium">{guestName}</p>
              </div>

              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
                <p className="text-blue-400 text-sm">
                  💡 Mật khẩu sẽ được tạo tự động và hiển thị sau khi hoàn tất
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setCreationMode('choose')}
                  variant="outline"
                  className="flex-1 bg-[#3a3a3a] border-gray-600 hover:bg-[#4a4a4a] text-white"
                  disabled={isLoading}
                >
                  Quay lại
                </Button>
                <Button
                  onClick={handleAutoCreate}
                  className="flex-1 bg-[#8B7355] hover:bg-[#6d5a43] text-white"
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang tạo...' : 'Tạo tài khoản'}
                </Button>
              </div>
            </div>
          </>
        )}

        {creationMode === 'success' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl text-white">✅ Tạo tài khoản thành công!</DialogTitle>
              <DialogDescription className="text-gray-400">
                Lưu lại thông tin đăng nhập của bạn
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-[#8B7355]" />
                  <span className="text-gray-400 text-sm">Email đăng nhập</span>
                </div>
                <p className="text-white font-medium">{guestEmail}</p>
              </div>

              <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">Mật khẩu của bạn</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-[#1a1a1a] px-3 py-2 rounded text-white font-mono text-lg">
                    {generatedPassword}
                  </code>
                  <Button
                    size="sm"
                    onClick={handleCopyPassword}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {copiedPassword ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30">
                <p className="text-yellow-400 text-sm">
                  ⚠️ <strong>Quan trọng:</strong> Vui lòng lưu lại mật khẩu này. Bạn có thể thay đổi mật khẩu sau trong tài khoản.
                </p>
              </div>

              <Button
                onClick={() => {
                  onClose();
                  navigate('/dashboard');
                }}
                className="w-full bg-[#8B7355] hover:bg-[#6d5a43] text-white"
              >
                Đi tới trang cá nhân
              </Button>
            </div>
          </>
        )}

        {creationMode === 'manual' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl text-white">Tạo tài khoản</DialogTitle>
              <DialogDescription className="text-gray-400">
                Điền thông tin để tạo tài khoản mới
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleManualCreate} className="space-y-4 py-4">
              <div>
                <Label htmlFor="name" className="text-gray-300">
                  Họ và tên *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="bg-[#3a3a3a] border-gray-600 text-white pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-gray-300">
                  Email *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="bg-[#3a3a3a] border-gray-600 text-white pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-gray-300">
                  Số điện thoại
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="bg-[#3a3a3a] border-gray-600 text-white pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-300">
                  Mật khẩu *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="bg-[#3a3a3a] border-gray-600 text-white pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-gray-300">
                  Xác nhận mật khẩu *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="bg-[#3a3a3a] border-gray-600 text-white pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  onClick={() => setCreationMode('choose')}
                  variant="outline"
                  className="flex-1 bg-[#3a3a3a] border-gray-600 hover:bg-[#4a4a4a] text-white"
                  disabled={isLoading}
                >
                  Quay lại
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#8B7355] hover:bg-[#6d5a43] text-white"
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang tạo...' : 'Tạo tài khoản'}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
