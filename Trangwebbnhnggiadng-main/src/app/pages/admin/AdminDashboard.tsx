import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { 
  Package, Users, ShoppingBag, TrendingUp, ArrowRight, 
  Star, DollarSign, Activity, AlertCircle, Eye, Edit,
  CheckCircle, XCircle, Clock, BarChart3, PieChart, TrendingDown,
  Sparkles, Award, Target, Zap
} from 'lucide-react';
import { productsApi, ordersApi, usersApi, reviewsApi } from '../../services/api';
import { DashboardCharts } from '../../components/admin/DashboardCharts';
import { OrderStatusBadge } from '../../components/OrderStatusBadge';
import type { Product, Order, User } from '../../types';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    pendingOrders: 0,
    approvedOrders: 0,
    deliveredOrders: 0,
    revenue: 0,
    pendingReviews: 0,
    lowStockProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [productsRes, usersRes, ordersRes, reviewsRes] = await Promise.all([
        productsApi.getAll(),
        usersApi.getAll(),
        ordersApi.getAll(),
        reviewsApi.getAll(),
      ]);

      if (productsRes.success && usersRes.success && ordersRes.success && reviewsRes.success) {
        const products = productsRes.data || [];
        const orders = ordersRes.data || [];
        const reviews = reviewsRes.data || [];

        const pendingOrders = orders.filter(o => o.status === 'pending');
        const approvedOrders = orders.filter(o => o.status === 'approved');
        const deliveredOrders = orders.filter(o => o.status === 'delivered');
        const revenue = deliveredOrders.reduce((sum, o) => sum + o.total, 0);
        const pendingReviews = reviews.filter(r => r.status === 'pending').length;
        const lowStockProducts = products.filter(p => p.stock < 10).length;

        setStats({
          totalProducts: products.length,
          totalUsers: usersRes.data?.length || 0,
          totalOrders: orders.length,
          pendingOrders: pendingOrders.length,
          approvedOrders: approvedOrders.length,
          deliveredOrders: deliveredOrders.length,
          revenue,
          pendingReviews,
          lowStockProducts,
        });

        setAllOrders(orders);
        setRecentOrders(orders.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0, 8));

        // Get top products (featured products)
        setTopProducts(products.filter(p => p.featured).slice(0, 4));
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Admin Dashboard 🎯</h1>
                <p className="text-white/80 text-lg">Tổng quan hệ thống quản lý</p>
              </div>
              <div className="hidden lg:flex items-center gap-4">
                <div className="text-center px-6 py-4 bg-white/10 backdrop-blur rounded-xl border border-white/20">
                  <DollarSign className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{(stats.revenue / 1000000).toFixed(1)}M</p>
                  <p className="text-sm text-white/80">Doanh thu</p>
                </div>
                <div className="text-center px-6 py-4 bg-white/10 backdrop-blur rounded-xl border border-white/20">
                  <Activity className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                  <p className="text-sm text-white/80">Đơn hàng</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Products */}
          <Link to="/admin/products" className="group">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6 hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <Package className="w-7 h-7 text-blue-400" />
                </div>
                <ArrowRight className="w-5 h-5 text-blue-400 opacity-0 group-hover:opacity-100 transition" />
              </div>
              <p className="text-4xl font-bold text-white mb-2">{stats.totalProducts}</p>
              <p className="text-blue-400 font-medium mb-1">Sản phẩm</p>
              {stats.lowStockProducts > 0 && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {stats.lowStockProducts} sắp hết hàng
                </p>
              )}
            </div>
          </Link>

          {/* Total Users */}
          <Link to="/admin/users" className="group">
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6 hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <Users className="w-7 h-7 text-green-400" />
                </div>
                <ArrowRight className="w-5 h-5 text-green-400 opacity-0 group-hover:opacity-100 transition" />
              </div>
              <p className="text-4xl font-bold text-white mb-2">{stats.totalUsers}</p>
              <p className="text-green-400 font-medium mb-1">Người dùng</p>
              <p className="text-gray-400 text-sm">Tài khoản đăng ký</p>
            </div>
          </Link>

          {/* Pending Orders */}
          <Link to="/admin/orders?status=pending" className="group">
            <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-xl p-6 hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-yellow-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <Clock className="w-7 h-7 text-yellow-400" />
                </div>
                {stats.pendingOrders > 0 && (
                  <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full animate-pulse">
                    {stats.pendingOrders}
                  </span>
                )}
              </div>
              <p className="text-4xl font-bold text-white mb-2">{stats.pendingOrders}</p>
              <p className="text-yellow-400 font-medium mb-1">Chờ duyệt</p>
              <p className="text-gray-400 text-sm">Cần xử lý ngay</p>
            </div>
          </Link>

          {/* Pending Reviews */}
          <Link to="/admin/reviews" className="group">
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6 hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <Star className="w-7 h-7 text-purple-400" />
                </div>
                {stats.pendingReviews > 0 && (
                  <span className="px-2 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">
                    {stats.pendingReviews}
                  </span>
                )}
              </div>
              <p className="text-4xl font-bold text-white mb-2">{stats.pendingReviews}</p>
              <p className="text-purple-400 font-medium mb-1">Đánh giá</p>
              <p className="text-gray-400 text-sm">Chờ phê duyệt</p>
            </div>
          </Link>
        </div>

        {/* Revenue & Order Status Row */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Card */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/10 rounded-xl p-6 border border-emerald-500/30 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Tổng doanh thu</p>
                  <p className="text-emerald-400 text-xs">(Đơn đã giao)</p>
                </div>
              </div>
              <p className="text-5xl font-bold text-emerald-400 mb-2">
                {(stats.revenue / 1000000).toFixed(1)}M
              </p>
              <p className="text-gray-400 text-sm">
                {stats.deliveredOrders} đơn hoàn thành
              </p>
            </div>
          </div>

          {/* Order Status Cards */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-gray-400 text-sm">Đã duyệt</p>
                  <p className="text-2xl font-bold text-white">{stats.approvedOrders}</p>
                </div>
              </div>
              <div className="w-full bg-[#1a1a1a] rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.approvedOrders / stats.totalOrders) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-gray-400 text-sm">Đã giao</p>
                  <p className="text-2xl font-bold text-white">{stats.deliveredOrders}</p>
                </div>
              </div>
              <div className="w-full bg-[#1a1a1a] rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.deliveredOrders / stats.totalOrders) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-gray-400 text-sm">Chờ xử lý</p>
                  <p className="text-2xl font-bold text-white">{stats.pendingOrders}</p>
                </div>
              </div>
              <div className="w-full bg-[#1a1a1a] rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.pendingOrders / stats.totalOrders) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <Activity className="w-8 h-8 text-[#8B7355]" />
                <div>
                  <p className="text-gray-400 text-sm">Tổng đơn</p>
                  <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
                </div>
              </div>
              <div className="w-full bg-[#1a1a1a] rounded-full h-2">
                <div className="bg-[#8B7355] h-2 rounded-full transition-all duration-500" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            Thao tác nhanh
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/admin/products/new"
              className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6 hover:scale-105 transition text-center group"
            >
              <Package className="w-10 h-10 text-blue-400 mx-auto mb-3 group-hover:scale-110 transition" />
              <h3 className="text-white font-bold mb-1">Thêm sản phẩm</h3>
              <p className="text-gray-400 text-sm">Tạo mới</p>
            </Link>

            <Link
              to="/admin/orders?status=pending"
              className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-xl p-6 hover:scale-105 transition text-center group relative"
            >
              {stats.pendingOrders > 0 && (
                <span className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {stats.pendingOrders}
                </span>
              )}
              <ShoppingBag className="w-10 h-10 text-yellow-400 mx-auto mb-3 group-hover:scale-110 transition" />
              <h3 className="text-white font-bold mb-1">Duyệt đơn</h3>
              <p className="text-gray-400 text-sm">Chờ xử lý</p>
            </Link>

            <Link
              to="/admin/reviews"
              className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6 hover:scale-105 transition text-center group relative"
            >
              {stats.pendingReviews > 0 && (
                <span className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {stats.pendingReviews}
                </span>
              )}
              <Star className="w-10 h-10 text-purple-400 mx-auto mb-3 group-hover:scale-110 transition" />
              <h3 className="text-white font-bold mb-1">Duyệt đánh giá</h3>
              <p className="text-gray-400 text-sm">Quản lý</p>
            </Link>

            <Link
              to="/admin/users"
              className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6 hover:scale-105 transition text-center group"
            >
              <Users className="w-10 h-10 text-green-400 mx-auto mb-3 group-hover:scale-110 transition" />
              <h3 className="text-white font-bold mb-1">Người dùng</h3>
              <p className="text-gray-400 text-sm">Quản lý</p>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-[#8B7355]" />
                  Đơn hàng gần đây
                </h2>
                <Link to="/admin/orders" className="text-[#8B7355] hover:text-[#6d5a43] text-sm font-medium flex items-center gap-1">
                  Xem tất cả
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Chưa có đơn hàng nào</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      to={`/admin/orders`}
                      className="block p-4 bg-[#1a1a1a] rounded-lg hover:bg-[#333] border border-gray-700 hover:border-[#8B7355] transition group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-[#8B7355]/10 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-[#8B7355]" />
                          </div>
                          <div>
                            <p className="text-white font-medium group-hover:text-[#8B7355] transition">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </p>
                            <p className="text-gray-400 text-sm">{order.userName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold mb-1">
                            {order.total.toLocaleString('vi-VN')}đ
                          </p>
                          <OrderStatusBadge status={order.status} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div>
            <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-400" />
                Sản phẩm nổi bật
              </h2>

              {topProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Chưa có sản phẩm nổi bật</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topProducts.map((product) => (
                    <Link
                      key={product.id}
                      to={`/admin/products/edit/${product.id}`}
                      className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-lg hover:bg-[#333] border border-gray-700 hover:border-[#8B7355] transition group"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm line-clamp-1 group-hover:text-[#8B7355] transition">
                          {product.name}
                        </p>
                        <p className="text-[#8B7355] font-bold text-sm">
                          {product.price.toLocaleString('vi-VN')}đ
                        </p>
                        <p className="text-gray-400 text-xs">
                          Còn: {product.stock}
                        </p>
                      </div>
                      <Edit className="w-4 h-4 text-gray-500 group-hover:text-[#8B7355]" />
                    </Link>
                  ))}
                </div>
              )}

              <Link
                to="/admin/products"
                className="block mt-4 text-center py-2 text-[#8B7355] hover:text-[#6d5a43] text-sm font-medium"
              >
                Xem tất cả sản phẩm →
              </Link>
            </div>
          </div>
        </div>

        {/* Dashboard Charts */}
        <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#8B7355]" />
            Biểu đồ thống kê
          </h2>
          <DashboardCharts orders={allOrders} />
        </div>
      </div>
    </div>
  );
}