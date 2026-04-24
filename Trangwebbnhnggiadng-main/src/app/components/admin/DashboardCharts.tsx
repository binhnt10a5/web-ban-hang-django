import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { Order } from '../../types';
import { Calendar } from 'lucide-react';

interface DashboardChartsProps {
  orders: Order[];
}

export function DashboardCharts({ orders }: DashboardChartsProps) {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month');

  // Helper functions để tạo data cho charts với useMemo
  const revenueData = useMemo(() => {
    const now = new Date();
    const data: { name: string; doanhthu: number; donhang: number }[] = [];

    if (timeRange === 'day') {
      // 7 ngày gần nhất
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        
        const dayOrders = orders.filter(o => {
          const orderDate = new Date(o.createdAt);
          return orderDate.toDateString() === date.toDateString() && o.status === 'delivered';
        });

        data.push({
          name: dateStr,
          doanhthu: dayOrders.reduce((sum, o) => sum + o.total, 0),
          donhang: dayOrders.length,
        });
      }
    } else if (timeRange === 'week') {
      // 4 tuần gần nhất
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const weekOrders = orders.filter(o => {
          const orderDate = new Date(o.createdAt);
          return orderDate >= weekStart && orderDate <= weekEnd && o.status === 'delivered';
        });

        data.push({
          name: `Tuần ${4 - i}`,
          doanhthu: weekOrders.reduce((sum, o) => sum + o.total, 0),
          donhang: weekOrders.length,
        });
      }
    } else if (timeRange === 'month') {
      // 6 tháng gần nhất
      for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = month.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });

        const monthOrders = orders.filter(o => {
          const orderDate = new Date(o.createdAt);
          return orderDate.getMonth() === month.getMonth() && 
                 orderDate.getFullYear() === month.getFullYear() &&
                 o.status === 'delivered';
        });

        data.push({
          name: monthStr,
          doanhthu: monthOrders.reduce((sum, o) => sum + o.total, 0),
          donhang: monthOrders.length,
        });
      }
    } else {
      // 3 năm gần nhất
      for (let i = 2; i >= 0; i--) {
        const year = now.getFullYear() - i;
        const yearOrders = orders.filter(o => {
          const orderDate = new Date(o.createdAt);
          return orderDate.getFullYear() === year && o.status === 'delivered';
        });

        data.push({
          name: `${year}`,
          doanhthu: yearOrders.reduce((sum, o) => sum + o.total, 0),
          donhang: yearOrders.length,
        });
      }
    }

    return data;
  }, [orders, timeRange]);

  // Thống kê theo trạng thái đơn hàng
  const statusData = useMemo(() => {
    const data = [
      { id: 'status-pending', name: 'Chờ duyệt', value: orders.filter(o => o.status === 'pending').length, color: '#F59E0B' },
      { id: 'status-approved', name: 'Đã duyệt', value: orders.filter(o => o.status === 'approved').length, color: '#3B82F6' },
      { id: 'status-delivered', name: 'Đã giao', value: orders.filter(o => o.status === 'delivered').length, color: '#10B981' },
      { id: 'status-awaiting-review', name: 'Chờ đánh giá', value: orders.filter(o => o.status === 'awaiting_review').length, color: '#A855F7' },
      { id: 'status-rejected', name: 'Từ chối', value: orders.filter(o => o.status === 'rejected').length, color: '#EF4444' },
    ].filter(item => item.value > 0);

    return data;
  }, [orders]);

  // Top sản phẩm bán chạy
  const topProducts = useMemo(() => {
    const productSales: { [key: string]: { id: string; name: string; quantity: number; revenue: number } } = {};

    orders.filter(o => o.status === 'delivered').forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            id: item.productId,
            name: item.productName,
            quantity: 0,
            revenue: 0,
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.price * item.quantity;
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Biểu đồ thống kê</h2>
        <div className="flex gap-2">
          {(['day', 'week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg transition ${
                timeRange === range
                  ? 'bg-blue-500 text-white'
                  : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#333]'
              }`}
            >
              {range === 'day' && 'Ngày'}
              {range === 'week' && 'Tuần'}
              {range === 'month' && 'Tháng'}
              {range === 'year' && 'Năm'}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Area Chart */}
        <div className="bg-[#2a2a2a] rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Doanh thu theo {
            timeRange === 'day' ? 'ngày' :
            timeRange === 'week' ? 'tuần' :
            timeRange === 'month' ? 'tháng' : 'năm'
          }</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData} key={`area-${timeRange}`}>
              <defs>
                <linearGradient id={`colorRevenue-${timeRange}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444' }}
                labelStyle={{ color: '#fff' }}
                formatter={(value: number) => value.toLocaleString('vi-VN') + ' đ'}
              />
              <Area
                type="monotone"
                dataKey="doanhthu"
                stroke="#3B82F6"
                fillOpacity={1}
                fill={`url(#colorRevenue-${timeRange})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Bar Chart */}
        <div className="bg-[#2a2a2a] rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Số đơn hàng theo {
            timeRange === 'day' ? 'ngày' :
            timeRange === 'week' ? 'tuần' :
            timeRange === 'month' ? 'tháng' : 'năm'
          }</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData} key={`bar-${timeRange}`}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="donhang" fill="#10B981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Pie Chart */}
        <div className="bg-[#2a2a2a] rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Trạng thái đơn hàng</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart key={`pie-${statusData.length}`}>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry) => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444' }}
                labelStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-[#2a2a2a] rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Top 5 sản phẩm bán chạy</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts} layout="vertical" key={`products-${topProducts.length}`}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis type="number" stroke="#888" />
              <YAxis dataKey="name" type="category" stroke="#888" width={150} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444' }}
                labelStyle={{ color: '#fff' }}
                formatter={(value: number) => value.toLocaleString('vi-VN') + ' đ'}
              />
              <Bar dataKey="revenue" fill="#A855F7" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Comparison Line Chart */}
      <div className="bg-[#2a2a2a] rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">So sánh doanh thu và số đơn hàng</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData} key={`line-${timeRange}`}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="name" stroke="#888" />
            <YAxis yAxisId="left" stroke="#888" />
            <YAxis yAxisId="right" orientation="right" stroke="#888" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="doanhthu"
              stroke="#3B82F6"
              strokeWidth={2}
              name="Doanh thu (đ)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="donhang"
              stroke="#10B981"
              strokeWidth={2}
              name="Số đơn hàng"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}