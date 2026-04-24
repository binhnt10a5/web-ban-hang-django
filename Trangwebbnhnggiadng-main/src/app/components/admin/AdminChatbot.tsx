import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User as UserIcon, BarChart3, TrendingUp, Package, Users, DollarSign, AlertTriangle, CheckCircle, Clock, Sparkles, Target, Zap, Award, ShoppingBag, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { productsApi, ordersApi, usersApi } from '../../services/api';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
  quickReplies?: string[];
}

const ADMIN_QUICK_SUGGESTIONS = [
  '📊 Thống kê doanh thu',
  '📦 Phân tích đơn hàng',
  '👥 Thống kê khách hàng',
  '⚠️ Cảnh báo tồn kho',
  '🔥 Sản phẩm bán chạy',
  '💡 Gợi ý quản lý',
];

export function AdminChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '👋 Xin chào Admin!\n\nTôi là trợ lý quản lý thông minh của Homely Store.\n\n💼 **Tôi có thể giúp bạn:**\n\n📊 Thống kê & Phân tích:\n• Doanh thu theo thời gian\n• Phân tích đơn hàng\n• Thống kê khách hàng\n• Sản phẩm bán chạy\n\n⚙️ Quản lý:\n• Cảnh báo tồn kho thấp\n• Đơn hàng cần xử lý\n• Đánh giá chờ duyệt\n• Gợi ý tối ưu\n\nBạn cần tôi hỗ trợ gì? 😊',
      sender: 'bot',
      timestamp: new Date(),
      quickReplies: ADMIN_QUICK_SUGGESTIONS,
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadStats();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadStats = async () => {
    try {
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        productsApi.getAll(),
        ordersApi.getAll(),
        usersApi.getAll(),
      ]);

      if (productsRes.success && ordersRes.success && usersRes.success) {
        const products = productsRes.data || [];
        const orders = ordersRes.data || [];
        const users = usersRes.data || [];

        const today = new Date();
        const thisMonth = today.getMonth();
        const thisYear = today.getFullYear();

        // Tính toán thống kê
        const totalRevenue = orders
          .filter(o => o.status === 'delivered')
          .reduce((sum, o) => sum + o.total, 0);

        const monthlyRevenue = orders
          .filter(o => {
            const orderDate = new Date(o.createdAt);
            return o.status === 'delivered' &&
              orderDate.getMonth() === thisMonth &&
              orderDate.getFullYear() === thisYear;
          })
          .reduce((sum, o) => sum + o.total, 0);

        const todayRevenue = orders
          .filter(o => {
            const orderDate = new Date(o.createdAt);
            return o.status === 'delivered' &&
              orderDate.toDateString() === today.toDateString();
          })
          .reduce((sum, o) => sum + o.total, 0);

        const pendingOrders = orders.filter(o => o.status === 'pending').length;
        const approvedOrders = orders.filter(o => o.status === 'approved').length;
        const lowStockProducts = products.filter(p => p.stock < 10);
        
        // Top sản phẩm bán chạy (mock - trong thực tế cần tracking số lượng bán)
        const topProducts = products
          .filter(p => p.featured)
          .slice(0, 5);

        setStats({
          totalRevenue,
          monthlyRevenue,
          todayRevenue,
          totalOrders: orders.length,
          pendingOrders,
          approvedOrders,
          totalProducts: products.length,
          totalUsers: users.length,
          lowStockProducts,
          topProducts,
          avgOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getAdminResponse = (userMessage: string): { answer: string; quickReplies?: string[] } => {
    const lowerMessage = userMessage.toLowerCase();

    // Thống kê doanh thu
    if (lowerMessage.includes('doanh thu') || lowerMessage.includes('revenue')) {
      if (!stats) {
        return {
          answer: '⏳ Đang tải dữ liệu thống kê...',
          quickReplies: ADMIN_QUICK_SUGGESTIONS,
        };
      }

      return {
        answer: `💰 **BÁO CÁO DOANH THU CHI TIẾT**\n\n📈 **Tổng quan:**\n• Tổng doanh thu: ${formatCurrency(stats.totalRevenue)}\n• Doanh thu tháng này: ${formatCurrency(stats.monthlyRevenue)}\n• Doanh thu hôm nay: ${formatCurrency(stats.todayRevenue)}\n\n📊 **Phân tích:**\n• Tổng đơn hàng: ${stats.totalOrders} đơn\n• Giá trị TB/đơn: ${formatCurrency(stats.avgOrderValue)}\n• Đơn đã giao: ${stats.totalOrders - stats.pendingOrders - stats.approvedOrders} đơn\n\n🎯 **Xu hướng:**\n${stats.monthlyRevenue > stats.totalRevenue / 12 ? '✅ Doanh thu tháng này cao hơn TB!\n' : '⚠️ Doanh thu tháng này thấp hơn TB\n'}${stats.todayRevenue > 0 ? `✨ Hôm nay đã có ${formatCurrency(stats.todayRevenue)} doanh thu!` : '💡 Chưa có đơn hàng nào hoàn thành hôm nay'}`,
        quickReplies: ['📦 Phân tích đơn hàng', '🔥 Top sản phẩm', '👥 Thống kê KH', '💡 Gợi ý'],
      };
    }

    // Phân tích đơn hàng
    if (lowerMessage.includes('đơn hàng') || lowerMessage.includes('order')) {
      if (!stats) {
        return {
          answer: '⏳ Đang tải dữ liệu...',
          quickReplies: ADMIN_QUICK_SUGGESTIONS,
        };
      }

      return {
        answer: `📦 **PHÂN TÍCH ĐƠN HÀNG**\n\n📊 **Tổng quan:**\n• Tổng đơn hàng: ${stats.totalOrders} đơn\n• Đơn chờ duyệt: ${stats.pendingOrders} đơn ${stats.pendingOrders > 0 ? '⚠️' : '✅'}\n• Đơn đã duyệt: ${stats.approvedOrders} đơn\n• Đơn hoàn thành: ${stats.totalOrders - stats.pendingOrders - stats.approvedOrders} đơn\n\n💡 **Trạng thái:**\n${stats.pendingOrders > 5 ? '⚠️ CÓ NHIỀU ĐơN CHỜ DUYỆT!\n→ Cần xử lý ngay để tránh chậm trễ\n' : '✅ Số đơn chờ duyệt trong tầm kiểm soát\n'}${stats.approvedOrders > 10 ? '📦 Nhiều đơn đang vận chuyển\n→ Theo dõi tiến độ giao hàng\n' : ''}\n🎯 **Gợi ý:**\n• Kiểm tra đơn pending thường xuyên\n• Xác nhận đơn COD trong 4h\n• Đơn online được auto-approve`,
        quickReplies: ['Xem đơn pending', '📊 Doanh thu', '⚠️ Cảnh báo', 'Gợi ý tối ưu'],
      };
    }

    // Thống kê khách hàng
    if (lowerMessage.includes('khách hàng') || lowerMessage.includes('user') || lowerMessage.includes('customer')) {
      if (!stats) {
        return {
          answer: '⏳ Đang tải dữ liệu...',
          quickReplies: ADMIN_QUICK_SUGGESTIONS,
        };
      }

      const newCustomersRate = Math.floor(Math.random() * 30) + 10; // Mock data
      const returningRate = 100 - newCustomersRate;

      return {
        answer: `👥 **THỐNG KÊ KHÁCH HÀNG**\n\n📊 **Tổng quan:**\n• Tổng khách hàng: ${stats.totalUsers} người\n• Khách hàng mới: ~${newCustomersRate}%\n• Khách quay lại: ~${returningRate}%\n• TB đơn/khách: ${(stats.totalOrders / stats.totalUsers).toFixed(1)} đơn\n\n💎 **Phân loại giá trị:**\n• VIP (>10tr): ${Math.floor(stats.totalUsers * 0.05)} khách\n• Thường xuyên: ${Math.floor(stats.totalUsers * 0.25)} khách\n• Mới: ${Math.floor(stats.totalUsers * 0.70)} khách\n\n🎯 **Xu hướng:**\n✅ Tỷ lệ khách quay lại cao\n💡 Nên có chương trình loyalty\n🎁 Ưu đãi sinh nhật tăng trải nghiệm`,
        quickReplies: ['📊 Doanh thu', '🎁 Chương trình KM', '💡 Gợi ý', '📦 Đơn hàng'],
      };
    }

    // Cảnh báo tồn kho
    if (lowerMessage.includes('tồn kho') || lowerMessage.includes('stock') || lowerMessage.includes('cảnh báo')) {
      if (!stats) {
        return {
          answer: '⏳ Đang tải dữ liệu...',
          quickReplies: ADMIN_QUICK_SUGGESTIONS,
        };
      }

      let stockWarning = '';
      if (stats.lowStockProducts.length > 0) {
        stockWarning = '\n⚠️ **SẢN PHẨM SẮP HẾT HÀNG:**\n';
        stats.lowStockProducts.slice(0, 5).forEach((p: any) => {
          stockWarning += `• ${p.name}: ${p.stock} sản phẩm ${p.stock < 5 ? '🔴' : '🟡'}\n`;
        });
      }

      return {
        answer: `⚠️ **CẢNH BÁO TỒN KHO**\n\n📦 **Tình trạng:**\n• Tổng sản phẩm: ${stats.totalProducts}\n• Hàng tồn kho thấp: ${stats.lowStockProducts.length} sản phẩm${stockWarning}\n\n💡 **Khuyến nghị:**\n${stats.lowStockProducts.length > 0 ? '🚨 CẦN NHẬP HÀNG GẤP!\n• Liên hệ nhà cung cấp\n• Cập nhật số lượng mới\n• Tạm ẩn nếu hết hàng' : '✅ Tồn kho ổn định\n• Theo dõi sản phẩm bán chạy\n• Dự trù hàng cho Flash Sale'}\n\n🎯 Thiết lập cảnh báo tự động khi stock < 10`,
        quickReplies: ['Xem chi tiết stock', '🔥 Top bán chạy', '📊 Thống kê', '💡 Gợi ý'],
      };
    }

    // Sản phẩm bán chạy
    if (lowerMessage.includes('bán chạy') || lowerMessage.includes('top') || lowerMessage.includes('hot')) {
      if (!stats) {
        return {
          answer: '⏳ Đang tải dữ liệu...',
          quickReplies: ADMIN_QUICK_SUGGESTIONS,
        };
      }

      let topProductsList = '\n🔥 **TOP SẢN PHẨM:**\n';
      stats.topProducts.forEach((p: any, idx: number) => {
        const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
        topProductsList += `${medals[idx]} ${p.name}\n   💰 ${formatCurrency(p.price)} | ⭐ ${p.rating || 4.5}\n`;
      });

      return {
        answer: `🔥 **SẢN PHẨM BÁN CHẠY**\n\n📊 **Phân tích:**${topProductsList}\n💡 **Gợi ý marketing:**\n✨ Tăng quảng cáo cho top 3\n🎁 Bundle deal để up-sell\n📸 Chụp ảnh chuyên nghiệp hơn\n⭐ Thu thập thêm reviews\n\n🎯 **Chiến lược:**\n• Flash Sale để tăng conversion\n• Cross-sell sản phẩm liên quan\n• Tạo combo ưu đãi`,
        quickReplies: ['📊 Doanh thu', '⚠️ Tồn kho', '💡 Gợi ý KM', '👥 Khách hàng'],
      };
    }

    // Gợi ý quản lý
    if (lowerMessage.includes('gợi ý') || lowerMessage.includes('suggest') || lowerMessage.includes('tối ưu')) {
      return {
        answer: `💡 **GỢI Ý TỐI ƯU QUẢN LÝ**\n\n🎯 **Ưu tiên hàng đầu:**\n\n1️⃣ **Xử lý đơn hàng:**\n   • Duyệt đơn pending trong 2h\n   • Đơn COD cần xác nhận nhanh\n   • Đơn online auto-approve\n\n2️⃣ **Quản lý tồn kho:**\n   • Check stock hàng ngày\n   • Nhập hàng sản phẩm hot\n   • Ẩn sản phẩm hết hàng\n\n3️⃣ **Chăm sóc khách hàng:**\n   • Trả lời review nhanh\n   • Xử lý khiếu nại trong ngày\n   • Gửi email cảm ơn\n\n4️⃣ **Marketing:**\n   • Flash Sale định kỳ\n   • Email marketing\n   • Social media posts\n\n5️⃣ **Phân tích:**\n   • Review doanh thu tuần\n   • Theo dõi conversion rate\n   • Phân tích hành vi khách\n\n🚀 **Tự động hóa đề xuất:**\n• Auto-approve đơn online\n• Email thông báo đơn hàng\n• Nhắc nhở đánh giá sản phẩm`,
        quickReplies: ['📊 Thống kê', '📦 Đơn hàng', '⚠️ Cảnh báo', '🔥 Bán chạy'],
      };
    }

    // Marketing & Khuyến mãi
    if (lowerMessage.includes('marketing') || lowerMessage.includes('khuyến mãi') || lowerMessage.includes('promotion')) {
      return {
        answer: `🎁 **CHIẾN LƯỢC MARKETING**\n\n🔥 **Flash Sale:**\n• Tổ chức 2-3 lần/tuần\n• Giảm 30-50% sản phẩm chọn lọc\n• Thời gian: 2-4 giờ\n• Tạo cảm giác khan hiếm\n\n📧 **Email Marketing:**\n• Welcome email cho khách mới\n• Giỏ hàng bị bỏ rơi\n• Ưu đãi sinh nhật\n• Newsletter hàng tuần\n\n📱 **Social Media:**\n• Post 1-2 lần/ngày\n• Story sản phẩm mới\n• Live streaming Q&A\n• UGC từ khách hàng\n\n💳 **Mã giảm giá:**\n• WELCOME10 cho khách mới\n• FREESHIP cho đơn >500k\n• VIP20 cho thành viên\n• BDAY30 sinh nhật\n\n🎯 **Chương trình Loyalty:**\n• Tích điểm mỗi đơn hàng\n• Quy đổi điểm = tiền\n• Tier VIP (Silver/Gold/Diamond)\n• Ưu đãi đặc biệt VIP`,
        quickReplies: ['📊 Hiệu quả KM', '👥 Khách hàng', '💡 Gợi ý khác', '📦 Đơn hàng'],
      };
    }

    // Chào hỏi
    if (lowerMessage.includes('xin chào') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return {
        answer: `Xin chào Admin ${user?.name}! 👋\n\n🎯 **Dashboard nhanh:**\n${stats ? `\n💰 Doanh thu hôm nay: ${formatCurrency(stats.todayRevenue)}\n📦 Đơn chờ xử lý: ${stats.pendingOrders} đơn\n⚠️ Tồn kho thấp: ${stats.lowStockProducts.length} SP\n👥 Tổng khách hàng: ${stats.totalUsers} người` : '\n⏳ Đang tải dữ liệu...'}\n\n💡 Bạn cần tôi phân tích gì?`,
        quickReplies: ADMIN_QUICK_SUGGESTIONS,
      };
    }

    // Cảm ơn
    if (lowerMessage.includes('cảm ơn') || lowerMessage.includes('thanks')) {
      return {
        answer: '😊 Rất vui được hỗ trợ bạn!\n\nNếu cần phân tích thêm dữ liệu, hãy nói với tôi nhé!\n\n💼 Chúc bạn quản lý hiệu quả!',
        quickReplies: ['📊 Thống kê', '💡 Gợi ý', '📦 Đơn hàng'],
      };
    }

    // Default response
    return {
      answer: `🤔 Xin lỗi, tôi chưa hiểu rõ câu hỏi.\n\n💡 **Tôi có thể giúp bạn:**\n\n📊 **Thống kê & Báo cáo:**\n• "Thống kê doanh thu"\n• "Phân tích đơn hàng"\n• "Thống kê khách hàng"\n• "Sản phẩm bán chạy"\n\n⚙️ **Quản lý:**\n• "Cảnh báo tồn kho"\n• "Đơn hàng pending"\n• "Gợi ý tối ưu"\n\n🎯 **Marketing:**\n• "Chiến lược marketing"\n• "Khuyến mãi hiệu quả"\n\nHoặc chọn gợi ý bên dưới! 👇`,
      quickReplies: ADMIN_QUICK_SUGGESTIONS,
    };
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputValue.trim();
    if (!textToSend) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 600));

    const { answer, quickReplies } = getAdminResponse(textToSend);

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: answer,
      sender: 'bot',
      timestamp: new Date(),
      quickReplies,
    };

    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  return (
    <>
      {/* Admin Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white shadow-2xl"
            >
              <BarChart3 className="w-7 h-7" />
            </Button>
            {/* AI Badge */}
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[420px] h-[650px] bg-[#0f172a] rounded-2xl shadow-2xl border border-blue-800 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold flex items-center gap-2">
                    Admin AI Assistant
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                  </h3>
                  <p className="text-white/80 text-xs">Trợ lý quản lý thông minh</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
              {messages.map((message) => (
                <div key={message.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-2 ${
                      message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === 'bot'
                        ? 'bg-gradient-to-br from-blue-600 to-blue-800'
                        : 'bg-gradient-to-br from-purple-500 to-pink-500'
                    }`}>
                      {message.sender === 'bot' ? (
                        <BarChart3 className="w-5 h-5 text-white" />
                      ) : (
                        <UserIcon className="w-5 h-5 text-white" />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div className={`flex flex-col max-w-[75%] ${
                      message.sender === 'user' ? 'items-end' : 'items-start'
                    }`}>
                      <div className={`rounded-2xl px-4 py-3 ${
                        message.sender === 'bot'
                          ? 'bg-[#1e293b] border border-blue-800 text-gray-100'
                          : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                      }`}>
                        <p className="text-sm whitespace-pre-line leading-relaxed">
                          {message.text}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 mt-1 px-2">
                        {message.timestamp.toLocaleTimeString('vi-VN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </motion.div>

                  {/* Quick Replies */}
                  {message.sender === 'bot' && message.quickReplies && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex flex-wrap gap-2 mt-3 ml-10"
                    >
                      {message.quickReplies.map((reply, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickReply(reply)}
                          className="px-3 py-1.5 text-xs bg-[#1e293b] hover:bg-[#2d3f5f] border border-blue-800 text-blue-200 rounded-full transition"
                        >
                          {reply}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-[#1e293b] border border-blue-800 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                        className="w-2 h-2 bg-blue-400 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                        className="w-2 h-2 bg-blue-400 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                        className="w-2 h-2 bg-blue-400 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#1e293b] border-t border-blue-800">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Hỏi về thống kê, đơn hàng..."
                  className="flex-1 bg-[#0f172a] border-blue-800 text-white placeholder:text-gray-500"
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" />
                Powered by Admin AI • Real-time Analytics
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
