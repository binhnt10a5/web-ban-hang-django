import React from 'react';
import { Link, useNavigate } from 'react-router';
import { Star, ShoppingCart, Zap } from 'lucide-react';
import { Product } from '../contexts/CartContext';
import { Button } from './ui/button';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const navigate = useNavigate();

  const handleBuyNow = () => {
    onAddToCart(product);
    navigate('/checkout');
  };

  return (
    <div className="bg-[#2a2a2a] rounded-2xl overflow-hidden border border-gray-700 hover:border-[#8B7355] transition group">
      <Link to={`/product/${product.id}`}>
        <div className="aspect-square overflow-hidden bg-[#3a3a3a]">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      <div className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-400 px-2 py-1 bg-[#3a3a3a] rounded">
            {product.category}
          </span>
        </div>

        <Link to={`/product/${product.id}`}>
          <h3 className="text-white font-semibold text-lg mb-2 hover:text-[#8B7355] transition">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating)
                    ? 'fill-yellow-500 text-yellow-500'
                    : 'text-gray-600'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400">({product.reviews})</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-[#8B7355] font-bold text-xl">
            {product.price.toLocaleString('vi-VN')}đ
          </span>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => onAddToCart(product)}
            className="flex-1 bg-[#2a2a2a] border border-[#8B7355] text-[#8B7355] hover:bg-[#8B7355] hover:text-white"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Thêm vào giỏ
          </Button>
          <Button
            onClick={handleBuyNow}
            className="flex-1 bg-gradient-to-r from-[#8B7355] to-[#6d5a43] hover:from-[#6d5a43] hover:to-[#8B7355] text-white"
          >
            <Zap className="w-4 h-4 mr-2" />
            Mua ngay
          </Button>
        </div>
      </div>
    </div>
  );
}
