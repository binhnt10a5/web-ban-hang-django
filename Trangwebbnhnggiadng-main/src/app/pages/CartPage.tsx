import React from 'react';
import { Link, useNavigate } from 'react-router';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, Percent } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function CartPage() {
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  const handleRemove = (productId: string) => {
    removeFromCart(productId);
    toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-16 h-16 text-pink-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Giỏ hàng trống</h2>
          <p className="text-gray-400 mb-8">
            Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
          </p>
          <Link to="/">
            <button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-4 rounded-2xl font-bold hover:from-pink-600 hover:to-purple-600 transition shadow-xl inline-flex items-center gap-2">
              Khám phá sản phẩm
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const shipping = 30000;
  const discount = 0;
  const total = subtotal + shipping - discount;

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Giỏ hàng</h1>
          <p className="text-gray-400">Bạn có {cart.length} sản phẩm trong giỏ hàng</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-[#2a2a2a] rounded-2xl p-6 border border-gray-700/50 hover:border-pink-500/30 transition group"
              >
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="relative flex-shrink-0">
                    <div className="w-32 h-32 bg-[#1a1a1a] rounded-xl overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                    {item.discount && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        -{item.discount}%
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 pr-4">
                        <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">
                          {item.name}
                        </h3>
                        {item.category && (
                          <p className="text-sm text-gray-400 flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {item.category}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Price & Quantity */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-pink-400">
                          {item.price.toLocaleString('vi-VN')}đ
                        </p>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <p className="text-sm text-gray-500 line-through">
                            {item.originalPrice.toLocaleString('vi-VN')}đ
                          </p>
                        )}
                      </div>

                      {/* Quantity Control */}
                      <div className="flex items-center gap-3 bg-[#1a1a1a] rounded-xl p-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#2a2a2a] hover:bg-pink-500/20 text-gray-300 hover:text-pink-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-white font-bold min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#2a2a2a] hover:bg-pink-500/20 text-gray-300 hover:text-pink-400 transition"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="mt-3 pt-3 border-t border-gray-700/50">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Tổng cộng</span>
                        <span className="text-xl font-bold text-white">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#2a2a2a] rounded-2xl p-6 border border-gray-700/50 sticky top-24">
              <h2 className="text-2xl font-bold text-white mb-6">Tóm tắt đơn hàng</h2>

              {/* Summary Items */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Tạm tính ({cart.length} sản phẩm)</span>
                  <span className="font-semibold">{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Phí vận chuyển</span>
                  <span className="font-semibold">{shipping.toLocaleString('vi-VN')}đ</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span className="flex items-center gap-1">
                      <Percent className="w-4 h-4" />
                      Giảm giá
                    </span>
                    <span className="font-semibold">-{discount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-700/50 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-white">Tổng cộng</span>
                  <span className="text-3xl font-bold text-pink-400">
                    {total.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>

              {/* Voucher Input */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Mã giảm giá"
                    className="flex-1 bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none transition"
                  />
                  <button className="px-6 py-3 bg-[#333] hover:bg-[#3a3a3a] text-white rounded-xl font-semibold transition">
                    Áp dụng
                  </button>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-pink-600 hover:to-purple-600 transition shadow-xl flex items-center justify-center gap-2 group"
              >
                Tiến hành thanh toán
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </button>

              {!isAuthenticated && (
                <p className="text-sm text-yellow-400 mt-4 text-center flex items-center justify-center gap-1">
                  💡 Bạn có thể đặt hàng không cần đăng nhập
                </p>
              )}

              {/* Benefits */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-green-400">✓</span>
                  </div>
                  <span>Miễn phí đổi trả trong 7 ngày</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-blue-400">✓</span>
                  </div>
                  <span>Thanh toán an toàn & bảo mật</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-purple-400">✓</span>
                  </div>
                  <span>Hỗ trợ 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
