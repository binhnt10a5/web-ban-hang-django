import { useState, useEffect } from 'react';
import { Zap, Clock, ArrowRight, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import Countdown from 'react-countdown';
import type { Product } from '../types';
import { useCart } from '../contexts/CartContext';

interface FlashSaleProps {
  products: Product[];
}

export function FlashSale({ products }: FlashSaleProps) {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Flash sale ends in 6 hours from now
  const endTime = Date.now() + 6 * 60 * 60 * 1000;

  const handleBuyNow = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    navigate('/checkout');
  };

  const renderer = ({ hours, minutes, seconds, completed }: any) => {
    if (completed) {
      return <span className="text-red-400">Flash Sale đã kết thúc!</span>;
    } else {
      return (
        <div className="flex gap-2">
          <div className="bg-[#1a1a1a] rounded-lg px-3 py-2 min-w-[60px] text-center">
            <div className="text-2xl font-bold text-white">{String(hours).padStart(2, '0')}</div>
            <div className="text-xs text-gray-400">Giờ</div>
          </div>
          <div className="flex items-center text-white text-2xl">:</div>
          <div className="bg-[#1a1a1a] rounded-lg px-3 py-2 min-w-[60px] text-center">
            <div className="text-2xl font-bold text-white">{String(minutes).padStart(2, '0')}</div>
            <div className="text-xs text-gray-400">Phút</div>
          </div>
          <div className="flex items-center text-white text-2xl">:</div>
          <div className="bg-[#1a1a1a] rounded-lg px-3 py-2 min-w-[60px] text-center">
            <div className="text-2xl font-bold text-white">{String(seconds).padStart(2, '0')}</div>
            <div className="text-xs text-gray-400">Giây</div>
          </div>
        </div>
      );
    }
  };

  // Get flash sale products (discount >= 30%, first 4 products)
  const flashProducts = products.filter(p => p.discount && p.discount >= 30).slice(0, 4);

  if (flashProducts.length === 0) return null;

  return (
    <div className="mb-12 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl p-8 border border-orange-500/30">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" fill="white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
              Flash Sale
              <span className="text-orange-400 animate-pulse">🔥</span>
            </h2>
            <p className="text-gray-400">Giảm giá sốc - Số lượng có hạn</p>
          </div>
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-orange-400" />
          <Countdown date={endTime} renderer={renderer} />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {flashProducts.map((product) => {
          const finalPrice = product.price * (1 - (product.discount || 0) / 100);
          const soldPercent = Math.floor(Math.random() * 60 + 20); // Mock sold percentage

          return (
            <Link key={product.id} to={`/product/${product.id}`}>
              <div className="bg-[#2a2a2a] rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-orange-500/20 transition group border border-gray-700 hover:border-orange-500">
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-[#1a1a1a]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />
                  {/* Discount Badge */}
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    -{product.discount}%
                  </div>
                  {/* Hot Badge */}
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                    HOT
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-white font-medium mb-2 line-clamp-2 group-hover:text-orange-400 transition">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-orange-500 font-bold text-xl">
                      {finalPrice.toLocaleString('vi-VN')}đ
                    </span>
                    <span className="text-gray-500 line-through text-sm">
                      {product.price.toLocaleString('vi-VN')}đ
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Đã bán {soldPercent}%</span>
                      <span className="text-xs text-orange-400 font-medium">
                        Còn {100 - soldPercent}%
                      </span>
                    </div>
                    <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all"
                        style={{ width: `${soldPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Buy Now Button */}
                  <button
                    onClick={(e) => handleBuyNow(e, product)}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" fill="white" />
                    Mua ngay
                  </button>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* View All Button */}
      <div className="text-center">
        <Link to="/products?discount=true">
          <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold hover:shadow-lg hover:shadow-orange-500/50 transition inline-flex items-center gap-2">
            Xem tất cả Flash Sale
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </div>
  );
}