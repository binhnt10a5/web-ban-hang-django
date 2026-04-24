import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Search, ShoppingCart, User, LogOut, Menu, X, Shield, LayoutDashboard, Heart, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { Button } from './ui/button';

export function Header() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setShowMobileMenu(false);
    }
  };

  const cartCount = getCartCount();
  const wishlistCount = getWishlistCount();

  return (
    <header className="sticky top-0 z-50 bg-[#1a1a1a]">
      {/* Top Bar */}
      <div className="bg-[#0a0a0a] border-b border-gray-800">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-400">
                <Phone className="w-4 h-4" />
                <span>Hotline: 1900-xxxx</span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>Miễn phí vận chuyển từ 500.000đ</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <span className="text-gray-400">Xin chào, <span className="text-[#8B7355]">{user?.name}</span></span>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="text-gray-400 hover:text-white transition">
                    Đăng nhập
                  </Link>
                  <span className="text-gray-600">|</span>
                  <Link to="/register" className="text-[#8B7355] hover:text-[#a8906a] transition">
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-[#2a2a2a] border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-2 h-8 bg-[#8B7355]"></div>
              <span className="text-2xl font-bold text-white">HOMELY</span>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm, danh mục..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#3a3a3a] text-white px-4 py-3 pr-12 rounded-lg border border-gray-600 focus:outline-none focus:border-[#8B7355] focus:ring-2 focus:ring-[#8B7355]/20"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#8B7355] hover:bg-[#a8906a] text-white px-4 py-2 rounded-lg transition"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Wishlist - Hide for Admin */}
              {!isAdmin && (
                <Link to="/wishlist" className="relative hidden md:block">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-[#3a3a3a] relative">
                    <Heart className="w-6 h-6" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {wishlistCount}
                      </span>
                    )}
                  </Button>
                </Link>
              )}

              {/* Cart - Hide for Admin */}
              {!isAdmin && (
                <Link to="/cart" className="relative">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-[#3a3a3a] relative">
                    <ShoppingCart className="w-6 h-6" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#8B7355] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </Link>
              )}

              {/* User Menu - Desktop */}
              {isAuthenticated && (
                <div className="hidden md:flex items-center gap-2">
                  <Link to={isAdmin ? '/admin' : '/dashboard'}>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-[#3a3a3a]">
                      {isAdmin ? <Shield className="w-6 h-6" /> : <User className="w-6 h-6" />}
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="text-white hover:bg-[#3a3a3a]"
                  >
                    <LogOut className="w-6 h-6" />
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="md:hidden mt-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#3a3a3a] text-white px-4 py-2 pr-10 rounded-lg border border-gray-600 focus:outline-none focus:border-[#8B7355]"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="hidden md:block bg-[#1a1a1a] border-b border-gray-800">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-8 py-3">
            <Link to="/" className="text-gray-300 hover:text-white transition font-medium">
              Trang chủ
            </Link>
            <Link to="/products" className="text-gray-300 hover:text-white transition font-medium">
              Tất cả sản phẩm
            </Link>
            <Link to="/products?featured=true" className="text-gray-300 hover:text-white transition font-medium">
              Sản phẩm nổi bật
            </Link>
            <Link to="/products?discount=true" className="text-red-400 hover:text-red-300 transition font-medium">
              🔥 Flash Sale
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-gray-300 hover:text-white transition font-medium flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-[#2a2a2a] border-t border-gray-700">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col gap-4">
              <Link to="/" className="text-gray-300 hover:text-white transition py-2" onClick={() => setShowMobileMenu(false)}>
                Trang chủ
              </Link>
              <Link to="/products" className="text-gray-300 hover:text-white transition py-2" onClick={() => setShowMobileMenu(false)}>
                Sản phẩm
              </Link>
              {!isAdmin && (
                <Link to="/wishlist" className="text-gray-300 hover:text-white transition py-2 flex items-center gap-2" onClick={() => setShowMobileMenu(false)}>
                  <Heart className="w-4 h-4" />
                  Yêu thích
                </Link>
              )}
              
              {isAdmin && (
                <Link to="/admin" className="text-gray-300 hover:text-white transition py-2 flex items-center gap-2" onClick={() => setShowMobileMenu(false)}>
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              )}
              
              {!isAdmin && isAuthenticated && (
                <Link to="/dashboard" className="text-gray-300 hover:text-white transition py-2 flex items-center gap-2" onClick={() => setShowMobileMenu(false)}>
                  <LayoutDashboard className="w-4 h-4" />
                  Tài khoản
                </Link>
              )}

              {isAuthenticated ? (
                <div className="flex flex-col gap-2 pt-4 border-t border-gray-700">
                  <span className="text-gray-400 text-sm">Xin chào, <span className="text-white font-semibold">{user?.name}</span></span>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      handleLogout();
                      setShowMobileMenu(false);
                    }}
                    className="text-white hover:bg-[#3a3a3a] justify-start"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Đăng xuất
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-4 border-t border-gray-700">
                  <Link to="/login" onClick={() => setShowMobileMenu(false)}>
                    <Button variant="ghost" className="w-full text-white hover:bg-[#3a3a3a] justify-start">
                      Đăng nhập
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setShowMobileMenu(false)}>
                    <Button className="w-full bg-[#8B7355] hover:bg-[#6d5a43] text-white">
                      Đăng ký
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}