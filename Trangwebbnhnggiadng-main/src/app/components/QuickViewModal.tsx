import { useState } from 'react';
import { X, ShoppingCart, Heart, Star, Minus, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import type { Product } from '../types';
import { toast } from 'sonner';
import { Link } from 'react-router';

interface QuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export function QuickViewModal({ isOpen, onClose, product }: QuickViewModalProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  if (!product) return null;

  const finalPrice = product.discount 
    ? product.price * (1 - product.discount / 100)
    : product.price;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
    onClose();
  };

  const handleAddToWishlist = () => {
    if (!isInWishlist(product.id)) {
      addToWishlist(product.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#2a2a2a] border-gray-700 text-white sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white">Xem nhanh sản phẩm</DialogTitle>
          <DialogDescription className="text-gray-400">
            Xem thông tin chi tiết và thêm vào giỏ hàng
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-8 py-4">
          {/* Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-[#1a1a1a]">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.discount && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                -{product.discount}%
              </div>
            )}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-xl font-bold">Hết hàng</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-white mb-2">{product.name}</h2>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < (product.rating || 0)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-400 text-sm">
                ({product.rating || 0} đánh giá)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-bold text-[#8B7355]">
                {finalPrice.toLocaleString('vi-VN')}đ
              </span>
              {product.discount && (
                <span className="text-lg text-gray-500 line-through">
                  {product.price.toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-300 mb-6 line-clamp-3">{product.description}</p>

            {/* Category & Brand */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Danh mục</p>
                <p className="text-white font-medium">{product.category}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Thương hiệu</p>
                <p className="text-white font-medium">{product.brand}</p>
              </div>
            </div>

            {/* Stock */}
            <div className="mb-6">
              <p className="text-gray-400 text-sm mb-1">Tình trạng</p>
              <p className={`font-medium ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
              </p>
            </div>

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-2">Số lượng</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 bg-[#3a3a3a] hover:bg-[#4a4a4a] rounded-lg flex items-center justify-center text-white transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-white font-bold text-lg w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 bg-[#3a3a3a] hover:bg-[#4a4a4a] rounded-lg flex items-center justify-center text-white transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-auto">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-[#8B7355] hover:bg-[#6d5a43] text-white"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Thêm vào giỏ
              </Button>
              <Button
                onClick={handleAddToWishlist}
                variant="outline"
                className="bg-[#3a3a3a] border-gray-600 hover:bg-[#4a4a4a] text-white"
              >
                <Heart
                  className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`}
                />
              </Button>
            </div>

            {/* View Full Details */}
            <Link to={`/product/${product.id}`} onClick={onClose}>
              <Button
                variant="ghost"
                className="w-full mt-3 text-[#8B7355] hover:text-[#6d5a43] hover:bg-[#3a3a3a]"
              >
                Xem chi tiết đầy đủ →
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
