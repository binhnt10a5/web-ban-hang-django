import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import type { OrderItem } from '../types';
import { toast } from 'sonner';

interface ProductReviewModalProps {
  item: OrderItem;
  orderId: string;
  onSubmit: (rating: number, comment: string) => void;
  onClose: () => void;
}

export function ProductReviewModal({ item, orderId, onSubmit, onClose }: ProductReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      toast.error('Vui lòng nhập đánh giá');
      return;
    }

    onSubmit(rating, comment);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2a2a] rounded-lg max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Đánh giá sản phẩm</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Product Info */}
        <div className="flex gap-3 mb-6 p-3 bg-[#1a1a1a] rounded-lg">
          <img
            src={item.productImage}
            alt={item.productName}
            className="w-16 h-16 rounded object-cover"
          />
          <div>
            <p className="text-white font-medium">{item.productName}</p>
            <p className="text-gray-400 text-sm">
              {item.price.toLocaleString('vi-VN')} đ
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Đánh giá của bạn
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-gray-400 text-sm mt-2">
              {rating === 1 && 'Rất tệ'}
              {rating === 2 && 'Tệ'}
              {rating === 3 && 'Bình thường'}
              {rating === 4 && 'Tốt'}
              {rating === 5 && 'Tuyệt vời'}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nhận xét của bạn
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
              required
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium"
            >
              Gửi đánh giá
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition font-medium"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
