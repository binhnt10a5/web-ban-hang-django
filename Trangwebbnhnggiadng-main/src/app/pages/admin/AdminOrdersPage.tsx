import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router';
import { Search, Filter } from 'lucide-react';
import { ordersApi } from '../../services/api';
import type { Order, OrderStatus } from '../../types';
import { OrderStatusBadge } from '../../components/OrderStatusBadge';
import { toast } from 'sonner';

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || 'all';

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const result = await ordersApi.getAll();
      if (result.success && result.data) {
        setOrders(result.data.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const result = await ordersApi.updateStatus(orderId, newStatus);
      if (result.success) {
        toast.success('Đã cập nhật trạng thái đơn hàng');
        loadOrders();
      } else {
        toast.error(result.error || 'Lỗi khi cập nhật trạng thái');
      }
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusOptions: { value: string; label: string }[] = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'pending', label: 'Chờ duyệt' },
    { value: 'approved', label: 'Đã duyệt' },
    { value: 'delivered', label: 'Đã giao' },
    { value: 'awaiting_review', label: 'Chờ đánh giá' },
    { value: 'reviewed', label: 'Đã hoàn thành' },
    { value: 'rejected', label: 'Từ chối' },
    { value: 'cancelled', label: 'Đã hủy' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-white">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Quản lý đơn hàng</h1>
          <p className="text-gray-400">{filteredOrders.length} đơn hàng</p>
        </div>

        {/* Filters */}
        <div className="bg-[#2a2a2a] rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Tìm kiếm đơn hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setSearchParams({ status: e.target.value })}
              className="px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-[#2a2a2a] rounded-lg p-12 text-center">
            <p className="text-gray-400 text-lg">Không tìm thấy đơn hàng nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-[#2a2a2a] rounded-lg p-6 hover:bg-[#333] transition">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-semibold">Đơn hàng #{order.id}</h3>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-gray-400 text-sm">
                      {order.userName} • {order.userEmail}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-400 mb-2">
                      {order.total.toLocaleString('vi-VN')} đ
                    </p>
                    <p className="text-gray-400 text-sm">
                      {order.items.length} sản phẩm
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-gray-700 pt-4 mb-4">
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-gray-300">{item.productName}</p>
                          <p className="text-gray-500">SL: {item.quantity}</p>
                        </div>
                        <p className="text-gray-400">
                          {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Address */}
                <div className="border-t border-gray-700 pt-4 mb-4">
                  <p className="text-gray-400 text-sm mb-1">Địa chỉ giao hàng:</p>
                  <p className="text-gray-300">{order.shippingAddress}</p>
                  <p className="text-gray-400 text-sm mt-1">SĐT: {order.phone}</p>
                  {order.notes && (
                    <p className="text-gray-400 text-sm mt-1">Ghi chú: {order.notes}</p>
                  )}
                </div>

                {/* Actions */}
                {order.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange(order.id, 'approved')}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition text-sm"
                    >
                      Duyệt đơn
                    </button>
                    <button
                      onClick={() => handleStatusChange(order.id, 'rejected')}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition text-sm"
                    >
                      Từ chối
                    </button>
                  </div>
                )}
                {order.status === 'approved' && (
                  <button
                    onClick={() => handleStatusChange(order.id, 'delivered')}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition text-sm"
                  >
                    ✓ Đánh dấu đã giao (Cộng doanh thu)
                  </button>
                )}
                {order.status === 'delivered' && (
                  <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm">
                    ✓ Đã giao - Đã cộng doanh thu. Khách hàng có thể đánh giá.
                  </div>
                )}
                {order.status === 'awaiting_review' && (
                  <div className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm flex items-center gap-2">
                    ⏳ Chờ admin duyệt đánh giá từ khách hàng
                  </div>
                )}
                {order.status === 'reviewed' && (
                  <div className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm">
                    ✓ Đã hoàn thành (Đã duyệt đánh giá)
                  </div>
                )}
                {order.status === 'rejected' && (
                  <div className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm">
                    ✗ Đã từ chối đơn hàng
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}