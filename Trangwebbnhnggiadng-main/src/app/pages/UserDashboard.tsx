import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { 
  Package, User as UserIcon, MapPin, Phone, Star, Edit, Eye, 
  ShoppingBag, Heart, Clock, CheckCircle, XCircle, TrendingUp,
  Calendar, Mail, CreditCard, Award, Gift, Wallet
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ordersApi, usersApi, reviewsApi } from '../services/api';
import type { Order, OrderItem, User, ProductReview, OrderStatus } from '../types';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { ProductReviewModal } from '../components/ProductReviewModal';
import { ProfileEditModal } from '../components/ProfileEditModal';
import { OrderDetailModal } from '../components/OrderDetailModal';
import { WalletManagement } from '../components/WalletManagement';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Link } from 'react-router';

export function UserDashboard() {
  const { user, updateUserProfile } = useAuth();
  const location = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'profile' | 'reviews' | 'wallet'>('overview');
  const [orderFilter, setOrderFilter] = useState<'all' | OrderStatus>('all');
  const [reviewingItem, setReviewingItem] = useState<{ item: OrderItem; orderId: string } | null>(null);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(user);
  const [depositAmount, setDepositAmount] = useState<number | null>(null);

  // Check URL parameters for auto-tab switching and deposit amount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    const deposit = params.get('deposit');
    
    if (tab === 'wallet') {
      setActiveTab('wallet');
    }
    
    if (deposit) {
      const amount = parseInt(deposit, 10);
      if (!isNaN(amount) && amount > 0) {
        setDepositAmount(amount);
      }
    }
  }, [location.search]);

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      const [ordersResult, reviewsResult] = await Promise.all([
        ordersApi.getByUserId(user.id),
        reviewsApi.getAll(),
      ]);

      if (ordersResult.success && ordersResult.data) {
        setOrders(ordersResult.data.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      }

      if (reviewsResult.success && reviewsResult.data) {
        const userReviews = reviewsResult.data.filter(r => r.userId === user.id);
        setReviews(userReviews);
      }
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!reviewingItem) return;

    try {
      await reviewsApi.create({
        orderId: reviewingItem.orderId,
        productId: reviewingItem.item.productId,
        rating,
        comment
      });

      toast.success('Đã gửi đánh giá thành công! Đang chờ admin duyệt.');
      setReviewingItem(null);
      loadUserData();
    } catch (error) {
      toast.error('Lỗi khi gửi đánh giá');
    }
  };

  const handleProfileEdit = async (updatedData: Partial<User>) => {
    if (!user) return;

    try {
      const result = await usersApi.updateProfile(user.id, updatedData);
      if (result.success && result.data) {
        // Update both local state and auth context
        setCurrentUser(result.data);
        updateUserProfile(updatedData);
        setShowProfileEdit(false);
        toast.success('Đã cập nhật thông tin thành công!');
      } else {
        toast.error(result.error || 'Lỗi khi cập nhật thông tin');
      }
    } catch (error) {
      toast.error('Lỗi khi cập nhật thông tin');
    }
  };

  const filteredOrders = orderFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === orderFilter);

  const getReviewsByOrderId = (orderId: string) => {
    return reviews.filter(r => r.orderId === orderId);
  };

  // Statistics
  const stats = {
    totalOrders: orders.length,
    pending: orders.filter(o => o.status === 'pending' || o.status === 'approved').length,
    completed: orders.filter(o => o.status === 'delivered' || o.status === 'reviewed').length,
    totalSpent: orders.reduce((sum, o) => sum + o.total, 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#8B7355] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-lg mt-4">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-[#8B7355] to-[#6d5a43] rounded-2xl p-8 text-white">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border-4 border-white/30">
                <UserIcon className="w-12 h-12" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">Xin chào, {currentUser?.name}! 👋</h1>
                <p className="text-white/80 text-lg">Chào mừng bạn đến với trang quản lý tài khoản</p>
              </div>
              <div className="hidden lg:flex items-center gap-4">
                <div className="text-center px-6 py-4 bg-white/10 backdrop-blur rounded-xl border border-white/20">
                  <Award className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                  <p className="text-sm text-white/80">Đơn hàng</p>
                </div>
                <div className="text-center px-6 py-4 bg-white/10 backdrop-blur rounded-xl border border-white/20">
                  <Gift className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{stats.totalSpent.toLocaleString('vi-VN')}đ</p>
                  <p className="text-sm text-white/80">Tổng chi tiêu</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Mobile */}
        <div className="lg:hidden grid grid-cols-2 gap-4 mb-8">
          <div className="bg-[#2a2a2a] rounded-xl p-4 border border-gray-700 text-center">
            <Award className="w-8 h-8 mx-auto mb-2 text-[#8B7355]" />
            <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
            <p className="text-sm text-gray-400">Đơn hàng</p>
          </div>
          <div className="bg-[#2a2a2a] rounded-xl p-4 border border-gray-700 text-center">
            <Gift className="w-8 h-8 mx-auto mb-2 text-[#8B7355]" />
            <p className="text-2xl font-bold text-white">{stats.totalSpent.toLocaleString('vi-VN')}đ</p>
            <p className="text-sm text-gray-400">Chi tiêu</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: 'overview', label: 'Tổng quan', icon: TrendingUp },
              { id: 'orders', label: 'Đơn hàng', icon: Package },
              { id: 'reviews', label: 'Đánh giá', icon: Star },
              { id: 'profile', label: 'Thông tin', icon: UserIcon },
              { id: 'wallet', label: 'Ví', icon: Wallet },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#8B7355] text-white shadow-lg shadow-[#8B7355]/30'
                    : 'bg-[#2a2a2a] text-gray-400 hover:text-white border border-gray-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-blue-400" />
                    </div>
                    <span className="text-blue-400 text-sm font-medium">Tổng</span>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">{stats.totalOrders}</p>
                  <p className="text-gray-400 text-sm">Đơn hàng</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-yellow-400" />
                    </div>
                    <span className="text-yellow-400 text-sm font-medium">Đang xử lý</span>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">{stats.pending}</p>
                  <p className="text-gray-400 text-sm">Chờ duyệt</p>
                </div>

                <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                    <span className="text-green-400 text-sm font-medium">Hoàn tất</span>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">{stats.completed}</p>
                  <p className="text-gray-400 text-sm">Đã giao</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-purple-400" />
                    </div>
                    <span className="text-purple-400 text-sm font-medium">Chi tiêu</span>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">
                    {(stats.totalSpent / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-gray-400 text-sm">Tổng tiền</p>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Đơn hàng gần đây</h2>
                  <Button
                    onClick={() => setActiveTab('orders')}
                    variant="outline"
                    className="bg-transparent border-[#8B7355] text-[#8B7355] hover:bg-[#8B7355] hover:text-white"
                  >
                    Xem tất cả
                  </Button>
                </div>

                {orders.slice(0, 3).length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">Bạn chưa có đơn hàng nào</p>
                    <Link to="/products">
                      <Button className="bg-[#8B7355] hover:bg-[#6d5a43]">
                        Khám phá sản phẩm
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center gap-4 p-4 bg-[#1a1a1a] rounded-lg border border-gray-700 hover:border-[#8B7355] transition cursor-pointer"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <div className="w-12 h-12 bg-[#8B7355]/10 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-[#8B7355]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">Đơn hàng #{order.id.slice(0, 8)}</p>
                          <p className="text-gray-400 text-sm">
                            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[#8B7355] font-bold">
                            {order.total.toLocaleString('vi-VN')}đ
                          </p>
                          <OrderStatusBadge status={order.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-3 gap-6">
                <button
                  onClick={() => setActiveTab('orders')}
                  className="bg-gradient-to-br from-[#8B7355] to-[#6d5a43] rounded-xl p-6 text-left hover:scale-105 transition"
                >
                  <Package className="w-10 h-10 text-white mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Quản lý đơn hàng</h3>
                  <p className="text-white/80 text-sm">Theo dõi và quản lý đơn hàng của bạn</p>
                </button>

                <button
                  onClick={() => setActiveTab('reviews')}
                  className="bg-[#2a2a2a] border border-gray-700 rounded-xl p-6 text-left hover:border-[#8B7355] transition"
                >
                  <Star className="w-10 h-10 text-yellow-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Đánh giá sản phẩm</h3>
                  <p className="text-gray-400 text-sm">Chia sẻ trải nghiệm của bạn</p>
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className="bg-[#2a2a2a] border border-gray-700 rounded-xl p-6 text-left hover:border-[#8B7355] transition"
                >
                  <UserIcon className="w-10 h-10 text-blue-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Cập nhật thông tin</h3>
                  <p className="text-gray-400 text-sm">Chỉnh sửa thông tin cá nhân</p>
                </button>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Đơn hàng của tôi</h2>
              </div>

              {/* Order Filters */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {[
                  { value: 'all', label: 'Tất cả', count: orders.length },
                  { value: 'pending', label: 'Chờ duyệt', count: stats.pending },
                  { value: 'approved', label: 'Đã duyệt', count: orders.filter(o => o.status === 'approved').length },
                  { value: 'delivered', label: 'Đã giao', count: stats.completed },
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setOrderFilter(filter.value as any)}
                    className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                      orderFilter === filter.value
                        ? 'bg-[#8B7355] text-white'
                        : 'bg-[#1a1a1a] text-gray-400 hover:text-white border border-gray-700'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>

              {/* Orders List */}
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Không có đơn hàng nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => {
                    const orderReviews = getReviewsByOrderId(order.id);
                    const canReview = order.status === 'delivered' || order.status === 'awaiting_review';

                    return (
                      <div
                        key={order.id}
                        className="bg-[#1a1a1a] rounded-lg border border-gray-700 overflow-hidden hover:border-[#8B7355] transition"
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-bold text-white">
                                  Đơn hàng #{order.id.slice(0, 8).toUpperCase()}
                                </h3>
                                <OrderStatusBadge status={order.status} />
                              </div>
                              <p className="text-gray-400 text-sm flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {new Date(order.createdAt).toLocaleString('vi-VN')}
                              </p>
                            </div>
                            <Button
                              onClick={() => setSelectedOrder(order)}
                              variant="outline"
                              size="sm"
                              className="bg-transparent border-gray-700 text-gray-400 hover:border-[#8B7355] hover:text-[#8B7355]"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Chi tiết
                            </Button>
                          </div>

                          {/* Order Items */}
                          <div className="space-y-3 mb-4">
                            {order.items.map((item, idx) => {
                              const hasReview = orderReviews.some(r => r.productId === item.productId);

                              return (
                                <div key={idx} className="flex items-center gap-4 p-3 bg-[#2a2a2a] rounded-lg">
                                  <img
                                    src={item.productImage}
                                    alt={item.productName}
                                    className="w-16 h-16 object-cover rounded-lg"
                                  />
                                  <div className="flex-1">
                                    <h4 className="text-white font-medium">{item.productName}</h4>
                                    <p className="text-gray-400 text-sm">
                                      {item.price.toLocaleString('vi-VN')}đ x {item.quantity}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[#8B7355] font-bold">
                                      {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                                    </p>
                                    {canReview && !hasReview && (
                                      <Button
                                        onClick={() => setReviewingItem({ item, orderId: order.id })}
                                        size="sm"
                                        className="mt-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-white border-none"
                                      >
                                        <Star className="w-3 h-3 mr-1" />
                                        Đánh giá
                                      </Button>
                                    )}
                                    {hasReview && (
                                      <span className="inline-flex items-center gap-1 text-green-400 text-sm mt-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Đã đánh giá
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Order Total */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                            <span className="text-gray-400">Tổng cộng:</span>
                            <span className="text-2xl font-bold text-[#8B7355]">
                              {order.total.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">Đánh giá của tôi</h2>

              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Bạn chưa có đánh giá nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-700">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-white font-medium mb-2">{review.productName}</p>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-5 h-5 ${
                                    i < review.rating
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-gray-400 text-sm">
                              {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            review.status === 'approved'
                              ? 'bg-green-500/10 text-green-400'
                              : review.status === 'rejected'
                              ? 'bg-red-500/10 text-red-400'
                              : 'bg-yellow-500/10 text-yellow-400'
                          }`}
                        >
                          {review.status === 'approved' && 'Đã duyệt'}
                          {review.status === 'rejected' && 'Bị từ chối'}
                          {review.status === 'pending' && 'Chờ duyệt'}
                        </span>
                      </div>
                      <p className="text-gray-300">{review.comment}</p>
                      {review.adminResponse && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          <p className="text-gray-400 text-sm mb-1">Phản hồi từ Admin:</p>
                          <p className="text-white">{review.adminResponse}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Thông tin cá nhân</h2>
                <Button
                  onClick={() => setShowProfileEdit(true)}
                  className="bg-[#8B7355] hover:bg-[#6d5a43]"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </Button>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4 p-4 bg-[#1a1a1a] rounded-lg border border-gray-700">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Họ và tên</p>
                      <p className="text-white font-medium">{currentUser?.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-[#1a1a1a] rounded-lg border border-gray-700">
                    <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <Mail className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Email</p>
                      <p className="text-white font-medium">{currentUser?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-[#1a1a1a] rounded-lg border border-gray-700">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                      <Phone className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Số điện thoại</p>
                      <p className="text-white font-medium">{currentUser?.phone || 'Chưa cập nhật'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-[#1a1a1a] rounded-lg border border-gray-700">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Địa chỉ</p>
                      <p className="text-white font-medium">{currentUser?.address || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                </div>

                {/* Account Info */}
                <div className="p-6 bg-[#1a1a1a] rounded-lg border border-gray-700">
                  <h3 className="text-xl font-bold text-white mb-4">Thông tin tài khoản</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-3 border-b border-gray-700">
                      <span className="text-gray-400">ID tài khoản</span>
                      <span className="text-white font-mono">{currentUser?.id.slice(0, 8)}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-700">
                      <span className="text-gray-400">Vai trò</span>
                      <span className="text-white capitalize">{currentUser?.role}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-gray-400">Ngày tạo</span>
                      <span className="text-white">
                        {currentUser?.createdAt && new Date(currentUser.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Wallet Tab */}
          {activeTab === 'wallet' && (
            <div>
              <WalletManagement depositAmount={depositAmount} />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {reviewingItem && (
        <ProductReviewModal
          item={reviewingItem.item}
          orderId={reviewingItem.orderId}
          onClose={() => setReviewingItem(null)}
          onSubmit={handleReviewSubmit}
        />
      )}

      {showProfileEdit && currentUser && (
        <ProfileEditModal
          isOpen={true}
          onClose={() => setShowProfileEdit(false)}
          user={currentUser}
          onSave={handleProfileEdit}
        />
      )}

      {selectedOrder && (
        <OrderDetailModal
          isOpen={true}
          onClose={() => setSelectedOrder(null)}
          order={selectedOrder}
        />
      )}
    </div>
  );
}