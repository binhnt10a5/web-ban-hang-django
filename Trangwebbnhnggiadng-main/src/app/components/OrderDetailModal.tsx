import React from 'react';
import { Package, MapPin, Phone, Mail, Calendar, CreditCard, X, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { OrderStatusBadge } from './OrderStatusBadge';
import type { Order } from '../types';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onReviewProduct?: (productId: string, productName: string, productImage: string, orderId: string) => void;
}

export function OrderDetailModal({ isOpen, onClose, order, onReviewProduct }: OrderDetailModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#2a2a2a] border-gray-700 text-white sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-6 h-6 text-[#8B7355]" />
              Chi tiết đơn hàng #{order.id}
            </div>
            <OrderStatusBadge status={order.status} />
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Xem chi tiết thông tin đơn hàng và trạng thái giao hàng
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Order Info */}
          <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Thông tin đơn hàng
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Mã đơn hàng</p>
                <p className="text-white font-medium">#{order.id}</p>
              </div>
              <div>
                <p className="text-gray-400">Ngày đặt</p>
                <p className="text-white font-medium">
                  {new Date(order.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Trạng thái</p>
                <div className="mt-1">
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
              <div>
                <p className="text-gray-400">Tổng tiền</p>
                <p className="text-[#8B7355] font-bold text-xl">
                  {order.total.toLocaleString('vi-VN')} đ
                </p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Mail className="w-5 h-5 text-green-400" />
              Thông tin người nhận
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-gray-400 min-w-[100px]">Họ tên:</span>
                <span className="text-white font-medium">{order.userName}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gray-400 min-w-[100px]">Email:</span>
                <span className="text-white font-medium">{order.userEmail}</span>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                <span className="text-gray-400 min-w-[85px]">Điện thoại:</span>
                <span className="text-white font-medium">{order.phone}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <span className="text-gray-400 min-w-[85px]">Địa chỉ:</span>
                <span className="text-white font-medium">{order.shippingAddress}</span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-400" />
              Sản phẩm đã đặt
            </h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-4 p-3 bg-[#2a2a2a] rounded-lg hover:bg-[#3a3a3a] transition"
                >
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-20 h-20 rounded-lg object-cover border border-gray-700"
                  />
                  <div className="flex-1">
                    <p className="text-white font-medium mb-1">{item.productName}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-400">
                        Đơn giá: <span className="text-white">{item.price.toLocaleString('vi-VN')} đ</span>
                      </span>
                      <span className="text-gray-400">
                        Số lượng: <span className="text-white">×{item.quantity}</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#8B7355] font-bold text-lg">
                      {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                    </p>
                    {order.status === 'awaiting_review' && onReviewProduct && (
                      <Button
                        size="sm"
                        onClick={() => onReviewProduct(item.productId, item.productName, item.productImage, order.id)}
                        className="mt-2 bg-purple-500 hover:bg-purple-600 text-white text-xs"
                      >
                        <Star className="w-3 h-3 mr-1" />
                        Đánh giá
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-yellow-400" />
              Tổng quan thanh toán
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tạm tính:</span>
                <span className="text-white">{order.total.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Phí vận chuyển:</span>
                <span className="text-green-400">Miễn phí</span>
              </div>
              <div className="border-t border-gray-700 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">Tổng cộng:</span>
                  <span className="text-[#8B7355] font-bold text-2xl">
                    {order.total.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-2">Ghi chú</h3>
              <p className="text-gray-400 text-sm">{order.notes}</p>
            </div>
          )}

          {/* Close Button */}
          <Button
            onClick={onClose}
            className="w-full bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white"
          >
            <X className="w-4 h-4 mr-2" />
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}