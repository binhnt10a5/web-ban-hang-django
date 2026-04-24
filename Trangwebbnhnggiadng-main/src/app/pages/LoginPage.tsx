import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, LogIn, AlertTriangle, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

// Interface để theo dõi failed login attempts
interface LoginAttempt {
  count: number;
  lockedUntil: number | null;
  lockDuration: number; // in minutes
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState<Record<string, LoginAttempt>>({});
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);

  // Load login attempts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('loginAttempts');
    if (saved) {
      try {
        setLoginAttempts(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading login attempts:', e);
      }
    }
  }, []);

  // Check if account is locked
  useEffect(() => {
    if (!formData.email) return;

    const attempt = loginAttempts[formData.email.toLowerCase()];
    if (attempt?.lockedUntil) {
      const now = Date.now();
      if (now < attempt.lockedUntil) {
        setIsLocked(true);
        setLockTimeRemaining(Math.ceil((attempt.lockedUntil - now) / 1000));
      } else {
        // Lock expired, reset
        setIsLocked(false);
        setLockTimeRemaining(0);
        const newAttempts = { ...loginAttempts };
        delete newAttempts[formData.email.toLowerCase()];
        setLoginAttempts(newAttempts);
        localStorage.setItem('loginAttempts', JSON.stringify(newAttempts));
      }
    } else {
      setIsLocked(false);
      setLockTimeRemaining(0);
    }
  }, [formData.email, loginAttempts]);

  // Countdown timer for locked account
  useEffect(() => {
    if (lockTimeRemaining > 0) {
      const timer = setInterval(() => {
        setLockTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockTimeRemaining]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFailedLogin = (email: string) => {
    const emailLower = email.toLowerCase();
    const currentAttempt = loginAttempts[emailLower] || { count: 0, lockedUntil: null, lockDuration: 5 };
    
    const newCount = currentAttempt.count + 1;
    
    // Failed 5 times, lock account
    if (newCount >= 5) {
      // Calculate lock duration based on previous locks
      // First lock: 5 min, Second: 10 min, Third: 15 min, etc.
      const lockDuration = currentAttempt.lockDuration;
      const lockedUntil = Date.now() + (lockDuration * 60 * 1000);
      
      const newAttempts = {
        ...loginAttempts,
        [emailLower]: {
          count: 0, // Reset count after lock
          lockedUntil,
          lockDuration: lockDuration + 5, // Increase for next time
        },
      };
      
      setLoginAttempts(newAttempts);
      localStorage.setItem('loginAttempts', JSON.stringify(newAttempts));
      
      toast.error(`Tài khoản đã bị khóa ${lockDuration} phút do đăng nhập sai quá nhiều lần!`);
      setIsLocked(true);
      setLockTimeRemaining(lockDuration * 60);
    } else {
      const newAttempts = {
        ...loginAttempts,
        [emailLower]: {
          ...currentAttempt,
          count: newCount,
        },
      };
      
      setLoginAttempts(newAttempts);
      localStorage.setItem('loginAttempts', JSON.stringify(newAttempts));
      
      toast.error(`Đăng nhập thất bại! Còn ${5 - newCount} lần thử.`);
    }
  };

  const handleSuccessLogin = (email: string) => {
    // Clear failed attempts on successful login
    const emailLower = email.toLowerCase();
    const newAttempts = { ...loginAttempts };
    delete newAttempts[emailLower];
    setLoginAttempts(newAttempts);
    localStorage.setItem('loginAttempts', JSON.stringify(newAttempts));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      toast.error(`Tài khoản đang bị khóa. Vui lòng thử lại sau ${Math.ceil(lockTimeRemaining / 60)} phút.`);
      return;
    }
    
    setIsLoading(true);

    const result = await login({ email: formData.email, password: formData.password });

    setIsLoading(false);

    if (result.success) {
      handleSuccessLogin(formData.email);
      toast.success('Đăng nhập thành công!');
      navigate('/');
    } else {
      handleFailedLogin(formData.email);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-2 h-8 bg-[#8B7355]"></div>
          <span className="text-2xl font-bold text-white">HOMELY</span>
        </Link>

        {/* Login Form */}
        <div className="bg-[#2a2a2a] rounded-2xl p-8 border border-gray-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Đăng nhập</h1>
            <p className="text-gray-400">Chào mừng bạn trở lại!</p>
          </div>

          {/* Lock Warning */}
          {isLocked && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-3 text-red-400">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold">Tài khoản đã bị khóa</p>
                  <p className="text-sm mt-1">
                    Bạn đã đăng nhập sai quá nhiều lần. Vui lòng thử lại sau{' '}
                    <span className="font-bold">{formatTime(lockTimeRemaining)}</span>
                  </p>
                </div>
                <Clock className="w-5 h-5 flex-shrink-0" />
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-gray-300 mb-2">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isLocked}
                  placeholder="your@email.com"
                  className="bg-[#3a3a3a] border-gray-600 text-white pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-300 mb-2">
                Mật khẩu
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isLocked}
                  placeholder="••••••••"
                  className="bg-[#3a3a3a] border-gray-600 text-white pl-10"
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link to="/forgot-password" className="text-sm text-[#8B7355] hover:text-[#a8906a] transition">
                Quên mật khẩu?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading || isLocked}
              className="w-full bg-[#8B7355] hover:bg-[#6d5a43] text-white"
            >
              <LogIn className="w-5 h-5 mr-2" />
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-[#8B7355] hover:text-[#a8906a] font-semibold transition">
                Đăng ký ngay
              </Link>
            </p>
          </div>

          {/* Demo Account Info */}
          <div className="mt-6 p-4 bg-[#3a3a3a] rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm text-center mb-3 font-semibold">
              Tài khoản demo:
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">👤 User:</span>
                <span className="text-gray-300 font-mono">user@homely.com / user123</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">🛡️ Admin:</span>
                <span className="text-gray-300 font-mono">admin@homely.com / admin123</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-gray-400 hover:text-white transition inline-flex items-center gap-2">
            ← Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}