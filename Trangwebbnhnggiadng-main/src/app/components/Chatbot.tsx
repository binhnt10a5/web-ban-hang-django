import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User as UserIcon, Loader2, Package, CreditCard, Truck, Info, ShoppingBag, Tag, Heart, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
  quickReplies?: string[];
}

const FAQ_DATA = {
  'chính sách đổi trả': {
    answer: '🔄 **Chính sách đổi trả của Homely Store:**\n\n✅ Đổi trả trong vòng 7 ngày kể từ khi nhận hàng\n✅ Sản phẩm còn nguyên tem mác, chưa qua sử dụng\n✅ Miễn phí đổi size/màu trong 3 ngày đầu\n✅ Hoàn tiền 100% nếu sản phẩm lỗi do nhà sản xuất\n✅ Hỗ trợ đổi hàng tại nhà với phí 30.000đ\n\n📋 Quy trình đổi trả:\n1️⃣ Liên hệ hotline hoặc chat với chúng tôi\n2️⃣ Cung cấp mã đơn hàng và lý do đổi trả\n3️⃣ Đóng gói sản phẩm theo hướng dẫn\n4️⃣ Chờ nhân viên đến lấy hàng\n5️⃣ Nhận sản phẩm mới hoặc hoàn tiền trong 3-5 ngày\n\nBạn có muốn tôi hướng dẫn chi tiết hơn không? 😊',
    quickReplies: ['Hướng dẫn đổi trả', 'Xem chính sách vận chuyển', 'Liên hệ hỗ trợ']
  },
  'đổi trả': {
    answer: '🔄 **Chính sách đổi trả của Homely Store:**\n\n✅ Đổi trả trong vòng 7 ngày kể từ khi nhận hàng\n✅ Sản phẩm còn nguyên tem mác, chưa qua sử dụng\n✅ Miễn phí đổi size/màu trong 3 ngày đầu\n✅ Hoàn tiền 100% nếu sản phẩm lỗi do nhà sản xuất\n✅ Hỗ trợ đổi hàng tại nhà với phí 30.000đ\n\n📋 Quy trình đổi trả:\n1️⃣ Liên hệ hotline hoặc chat với chúng tôi\n2️⃣ Cung cấp mã đơn hàng và lý do đổi trả\n3️⃣ Đóng gói sản phẩm theo hướng dẫn\n4️⃣ Chờ nhân viên đến lấy hàng\n5️⃣ Nhận sản phẩm mới hoặc hoàn tiền trong 3-5 ngày\n\nBạn có muốn tôi hướng dẫn chi tiết hơn không? 😊',
    quickReplies: ['Hướng dẫn đổi trả', 'Xem chính sách vận chuyển', 'Liên hệ hỗ trợ']
  },
  'vận chuyển': {
    answer: '🚚 **Thông tin vận chuyển:**\n\n• Miễn phí ship cho đơn hàng từ 500.000đ\n• Giao hàng toàn quốc trong 2-5 ngày\n• Hỗ trợ COD (thanh toán khi nhận hàng)\n• Kiểm tra hàng trước khi thanh toán\n\nĐối tác vận chuyển: GHN, GHTK, Viettel Post',
    quickReplies: ['Theo dõi đơn hàng', 'Chính sách đổi trả', 'Xem sản phẩm']
  },
  'thanh toán': {
    answer: '💳 **Phương thức thanh toán:**\n\n1. **COD** - Thanh toán khi nhận hàng\n2. **Chuyển khoản ngân hàng** - Giảm 2% cho đơn trên 1 triệu\n3. **Ví điện tử** - Momo, ZaloPay, VNPay\n\nTất cả đều an toàn và bảo mật 100% ✅',
    quickReplies: ['Hướng dẫn chuyển khoản', 'Xem giỏ hàng', 'Đặt hàng ngay']
  },
  'theo dõi đơn hàng': {
    answer: '📦 **Theo dõi đơn hàng:**\n\nĐể theo dõi đơn hàng của bạn:\n1. Đăng nhập vào tài khoản\n2. Vào mục "Đơn hàng của tôi"\n3. Xem chi tiết và trạng thái đơn hàng\n\nBạn cũng có thể nhận thông báo qua email! 📧',
    quickReplies: ['Đăng nhập', 'Xem đơn hàng', 'Liên hệ hỗ trợ']
  },
  'sản phẩm': {
    answer: '🏠 **Sản phẩm của Homely Store:**\n\n• Đồ nội thất cao cấp\n• Đồ trang trí nhà cửa\n• Đồ dùng nhà bếp\n• Đèn trang trí\n• Thảm & rèm cửa\n\nTất cả sản phẩm đều có bảo hành và chất lượng đảm bảo! ✨',
    quickReplies: ['Xem sản phẩm bán chạy', 'Sản phẩm giảm giá', 'Tìm kiếm sản phẩm']
  },
  'bảo hành': {
    answer: '🛡️ **Chính sách bảo hành:**\n\n• Bảo hành 12 tháng cho tất cả sản phẩm\n• Bảo hành 24 tháng cho sản phẩm cao cấp\n• Sửa chữa/thay thế miễn phí nếu lỗi nhà sản xuất\n• Hỗ trợ bảo trì trọn đời sản phẩm\n\nLiên hệ hotline: 1900 xxxx để được hỗ trợ!',
    quickReplies: ['Kích hoạt bảo hành', 'Điều kiện bảo hành', 'Liên hệ']
  },
  'liên hệ': {
    answer: '📞 **Liên hệ với chúng tôi:**\n\n📧 Email: support@homelystore.vn\n📱 Hotline: 1900 xxxx (8h-22h)\n🏢 Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM\n💬 Facebook: fb.com/homelystore\n📷 Instagram: @homelystore\n\nChúng tôi luôn sẵn sàng hỗ trợ bạn! 😊',
    quickReplies: ['Xem sản phẩm', 'Về trang chủ']
  },
  'giảm giá': {
    answer: '🎉 **Chương trình khuyến mãi HOT:**\n\n🔥 Flash Sale mỗi ngày: Giảm đến 50%\n🎁 Mã giảm giá cho khách hàng mới: WELCOME10\n⭐ Tích điểm đổi quà cho thành viên\n🎂 Ưu đãi sinh nhật: Giảm 20%\n💳 Giảm thêm 2% khi thanh toán qua ví Homely\n🚚 Miễn phí ship cho đơn từ 500.000đ\n\n📱 Đăng ký nhận tin để không bỏ lỡ ưu đãi! 🔔',
    quickReplies: ['Xem Flash Sale', 'Đăng ký nhận tin', 'Sản phẩm giảm giá']
  },
  'mã giảm giá': {
    answer: '🎫 **Mã giảm giá hiện có:**\n\n🔹 WELCOME10 - Giảm 10% cho đơn đầu (tối đa 100k)\n🔹 FREESHIP - Miễn phí ship cho đơn từ 300k\n🔹 NEWYEAR2024 - Giảm 15% cho đơn từ 500k\n🔹 FLASH50 - Giảm 50% cho sản phẩm Flash Sale\n🔹 VIP20 - Giảm 20% cho thành viên VIP\n🔹 BDAY30 - Giảm 30% trong tháng sinh nhật\n\n💡 Áp dụng mã tại trang thanh toán!',
    quickReplies: ['Mua sắm ngay', 'Xem Flash Sale', 'Đăng ký thành viên']
  },
  'tư vấn': {
    answer: '👨‍💼 **Dịch vụ tư vấn miễn phí:**\n\n🏠 Tư vấn thiết kế nội thất\n📐 Tư vấn bố trí không gian\n🎨 Tư vấn phối màu và phong cách\n💰 Tư vấn ngân sách hợp lý\n📦 Tư vấn chọn sản phẩm phù hợp\n\n📞 Đặt lịch tư vấn:\n• Gọi hotline: 1900 xxxx\n• Chat trực tiếp với chúng tôi\n• Đến trực tiếp showroom\n\nChuyên viên sẽ hỗ trợ bạn 100% MIỄN PHÍT! 🎁',
    quickReplies: ['Đặt lịch tư vấn', 'Xem showroom', 'Liên hệ ngay']
  },
  'showroom': {
    answer: '🏢 **Hệ thống showroom Homely Store:**\n\n📍 **TP. Hồ Chí Minh:**\n• Quận 1: 123 Nguyễn Huệ (8h-22h)\n• Quận 3: 456 Võ Văn Tần (8h-22h)\n• Quận 7: 789 Nguyễn Hữu Thọ (8h-21h)\n\n📍 **Hà Nội:**\n• Hoàn Kiếm: 321 Bà Triệu (8h-22h)\n• Cầu Giấy: 654 Trần Duy Hưng (8h-21h)\n\n🎁 Ưu đãi khi mua tại showroom:\n• Giảm thêm 5% giá niêm yết\n• Tặng voucher 200k cho lần mua sau\n• Miễn phí vận chuyển và lắp đặt\n\nHẹn gặp bạn tại showroom! 🤗',
    quickReplies: ['Xem bản đồ', 'Đặt lịch hẹn', 'Xem sản phẩm']
  }
};

const QUICK_SUGGESTIONS = [
  '🎫 Mã giảm giá',
  '🔥 Flash Sale',
  '🚚 Vận chuyển',
  '🔄 Chính sách đổi trả',
  '👨‍💼 Tư vấn miễn phí',
  '📦 Theo dõi đơn hàng',
  '⭐ Sản phẩm hot',
];

// Thêm gợi ý sản phẩm thông minh
const PRODUCT_SUGGESTIONS = {
  'bàn ăn': {
    answer: '🍽️ **Bộ sưu tập Bàn Ăn cao cấp:**\n\n✨ **Top bán chạy:**\n1. Bàn ăn gỗ tự nhiên 6 ghế - 8.900.000đ\n   • Chất liệu: Gỗ sồi tự nhiên\n   • Kích thước: 1.6m x 0.9m\n   • Bảo hành: 24 tháng\n\n2. Bàn ăn hiện đại mặt đá - 12.500.000đ\n   • Mặt đá granite cao cấp\n   • Thiết kế sang trọng\n   • Giảm 15% hôm nay!\n\n3. Bàn ăn thông minh gấp gọn - 5.200.000đ\n   • Tiết kiệm không gian\n   • Phù hợp căn hộ nhỏ\n\n💡 **Tư vấn miễn phí:**\nBạn muốn tôi gợi ý bàn ăn phù hợp với không gian nhà bạn không?',
    quickReplies: ['Xem bàn ăn gỗ tự nhiên', 'Bàn ăn hiện đại', 'Tư vấn không gian', 'Mua ngay'],
  },
  'ghế sofa': {
    answer: '🛋️ **Bộ sưu tập Ghế Sofa đẳng cấp:**\n\n🔥 **Best Sellers:**\n1. Sofa da thật 3 chỗ ngồi - 15.900.000đ\n   • Da thật nhập khẩu Italy\n   • Khung gỗ sồi chắc chắn\n   • Miễn phí vệ sinh 1 năm\n\n2. Sofa vải bố Bắc Âu - 9.800.000đ\n   • Phong cách Scandinavian\n   • Vải chống bám bụi\n   • Giao hàng & lắp đặt miễn phí!\n\n3. Sofa giường đa năng - 7.500.000đ\n   • 2 trong 1: Sofa + Giường\n   • Tiết kiệm diện tích\n\n🎁 Mua sofa tặng bàn trà + gối trang trí!',
    quickReplies: ['Sofa da thật', 'Sofa Bắc Âu', 'Sofa giường', 'Đặt hẹn xem mẫu'],
  },
  'giường ngủ': {
    answer: '🛏️ **Giường ngủ cao cấp cho giấc ngủ hoàn hảo:**\n\n⭐ **Sản phẩm nổi bật:**\n1. Giường gỗ sồi tự nhiên 1.8m - 12.900.000đ\n   • Thiết kế tối giản hiện đại\n   • Có ngăn kéo chứa đồ\n   • Tặng nệm cao su thiên nhiên!\n\n2. Giường bọc da cao cấp - 18.500.000đ\n   • Sang trọng, đẳng cấp\n   • Đèn LED tích hợp\n   • Giảm 20% cuối tuần này!\n\n3. Giường thông minh massage - 25.000.000đ\n   • Tích hợp massage thư giãn\n   • Điều khiển từ xa\n   • Công nghệ Nhật Bản\n\n💤 Mua giường tặng bộ ga gối + chăn cao cấp!',
    quickReplies: ['Giường gỗ tự nhiên', 'Giường bọc da', 'Tư vấn phong thủy', 'Combo giường + nệm'],
  },
  'tủ quần áo': {
    answer: '👔 **Tủ quần áo - Giải pháp lưu trữ hoàn hảo:**\n\n📦 **Hot Deals:**\n1. Tủ áo gỗ công nghiệp 2m - 8.900.000đ\n   • 4 cánh mở\n   • Gương toàn thân tích hợp\n   • Nhiều ngăn tiện dụng\n\n2. Tủ áo cửa lùa hiện đại - 14.500.000đ\n   • Tiết kiệm không gian\n   • Hệ ray êm ái\n   • Tùy chỉnh ngăn theo ý\n\n3. Tủ áo thông minh - 22.000.000đ\n   • Hệ thống khử mùi tự động\n   • Đèn LED cảm ứng\n   • Thiết kế theo yêu cầu\n\n🎁 Miễn phí thiết kế 3D & lắp đặt tận nhà!',
    quickReplies: ['Tủ áo 2m', 'Tủ cửa lùa', 'Đặt tủ theo size', 'Xem showroom'],
  },
  'đèn trang trí': {
    answer: '💡 **Đèn trang trí - Điểm nhấn cho không gian:**\n\n✨ **Collection mới nhất:**\n1. Đèn chùm pha lê cao cấp - 5.900.000đ\n   • Pha lê Swarovski\n   • Ánh sáng lung linh\n   • Phù hợp phòng khách\n\n2. Đèn thả bàn ăn hiện đại - 2.500.000đ\n   • Phong cách Bắc Âu\n   • Điều chỉnh độ sáng\n   • Tiết kiệm điện 70%\n\n3. Đèn ngủ cảm ứng - 890.000đ\n   • Sạc không dây\n   • Đổi màu RGB\n   • Tặng kèm remote!\n\n💫 Flash Sale: Giảm 30% toàn bộ đèn trang trí!',
    quickReplies: ['Đèn chùm pha lê', 'Đèn Bắc Âu', 'Đèn thông minh', 'Flash Sale'],
  },
  'bàn làm việc': {
    answer: '💼 **Bàn làm việc - Tăng năng suất hiệu quả:**\n\n🖥️ **Lựa chọn hàng đầu:**\n1. Bàn làm việc điều chỉnh độ cao - 6.500.000đ\n   • Nâng hạ điện tự động\n   • Chống gù lưng\n   • Sạc không dây tích hợp\n\n2. Bàn gỗ công nghiệp 1.2m - 3.200.000đ\n   • Thiết kế tối giản\n   • Có ngăn kéo\n   • Giảm 20% hôm nay!\n\n3. Bàn góc chữ L - 5.800.000đ\n   • Tận dụng góc phòng\n   • Diện tích làm việc rộng\n   • Tặng kệ sách treo tường!\n\n🎯 Combo bàn + ghế gaming giảm thêm 15%!',
    quickReplies: ['Bàn nâng hạ', 'Bàn 1.2m', 'Bàn góc chữ L', 'Combo bàn ghế'],
  },
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Xin chào! Tôi là trợ lý mua sắm thông minh của Homely Store 👋\n\n✨ **Tôi có thể giúp bạn:**\n\n🛍️ Tìm kiếm & gợi ý sản phẩm phù hợp\n💰 Săn deal, mã giảm giá hot\n📦 Theo dõi đơn hàng\n🎁 Tư vấn miễn phí\n\nHôm nay bạn cần tìm gì? Hãy nói với tôi nhé! 😊',
      sender: 'bot',
      timestamp: new Date(),
      quickReplies: QUICK_SUGGESTIONS,
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage: string): { answer: string; quickReplies?: string[] } => {
    const lowerMessage = userMessage.toLowerCase();

    // Gợi ý sản phẩm thông minh
    for (const [key, value] of Object.entries(PRODUCT_SUGGESTIONS)) {
      if (lowerMessage.includes(key)) {
        return value;
      }
    }

    // Tìm keyword trong FAQ
    for (const [key, value] of Object.entries(FAQ_DATA)) {
      if (lowerMessage.includes(key)) {
        return value;
      }
    }

    // Xử lý yêu cầu mua hàng
    if (lowerMessage.includes('mua') || lowerMessage.includes('đặt hàng') || lowerMessage.includes('order')) {
      return {
        answer: '🛒 **Hướng dẫn mua hàng nhanh chóng:**\n\n📋 **Cách 1: Mua trực tuyến (Khuyên dùng)**\n1️⃣ Chọn sản phẩm yêu thích\n2️⃣ Thêm vào giỏ hàng\n3️⃣ Thanh toán online → Tự động duyệt!\n4️⃣ Nhận hàng & đánh giá\n\n📋 **Cách 2: Mua tại Showroom**\n• Giảm thêm 5% giá niêm yết\n• Tư vấn trực tiếp\n• Xem & chạm sản phẩm thật\n\n🎁 **Ưu đãi đặc biệt:**\n• Thanh toán online: Duyệt đơn ngay lập tức!\n• Thanh toán qua ví Homely: Giảm thêm 2%\n• Miễn phí ship đơn từ 500k\n\nBạn muốn xem sản phẩm nào? 😊',
        quickReplies: ['Xem Flash Sale', 'Sản phẩm bán chạy', 'Tìm bàn ăn', 'Tìm ghế sofa'],
      };
    }

    // Gợi ý sản phẩm hot
    if (lowerMessage.includes('sản phẩm hot') || lowerMessage.includes('bán chạy') || lowerMessage.includes('best seller')) {
      return {
        answer: '🔥 **Top sản phẩm bán chạy nhất:**\n\n🥇 **#1 Ghế Sofa da thật 3 chỗ**\n💰 15.900.000đ → 12.500.000đ (-21%)\n⭐ 4.9/5 (248 đánh giá)\n🚚 Miễn phí ship + lắp đặt\n\n🥈 **#2 Bàn ăn gỗ sồi tự nhiên**\n💰 8.900.000đ → 7.500.000đ (-16%)\n⭐ 4.8/5 (187 đánh giá)\n🎁 Tặng 6 ghế cao cấp\n\n🥉 **#3 Giường ngủ bọc da**\n💰 18.500.000đ → 14.800.000đ (-20%)\n⭐ 5.0/5 (92 đánh giá)\n💤 Tặng nệm + ga gối\n\n👉 Tất cả đang giảm giá sốc cuối tuần!\n\nBạn quan tâm sản phẩm nào? 😍',
        quickReplies: ['Xem Sofa #1', 'Xem Bàn ăn #2', 'Xem Giường #3', 'Xem tất cả'],
      };
    }

    // Tìm kiếm sản phẩm
    if (lowerMessage.includes('tìm') || lowerMessage.includes('search') || lowerMessage.includes('có')) {
      return {
        answer: '🔍 **Tìm kiếm sản phẩm:**\n\n💡 **Gợi ý tìm kiếm phổ biến:**\n\n🛋️ **Nội thất phòng khách:**\n• Ghế sofa (da thật, vải bố, góc L)\n• Bàn trà (gỗ, kính, mặt đá)\n• Kệ tivi (hiện đại, cổ điển)\n\n🍽️ **Nội thất phòng ăn:**\n• Bàn ăn (4-8 chỗ ngồi)\n• Tủ rượu, tủ bếp\n\n🛏️ **Nội thất phòng ngủ:**\n• Giường ngủ (1.6m, 1.8m, 2m)\n• Tủ quần áo\n• Bàn trang điểm\n\n💼 **Nội thất văn phòng:**\n• Bàn làm việc\n• Ghế văn phòng\n• Kệ sách\n\nBạn muốn tìm gì cụ thể? Hoặc xem danh mục sản phẩm nhé! 📱',
        quickReplies: ['Tìm bàn ăn', 'Tìm ghế sofa', 'Tìm giường ngủ', 'Xem danh mục'],
      };
    }

    // Các từ khóa thông dụng
    if (lowerMessage.includes('xin chào') || lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('chào')) {
      return {
        answer: `Xin chào ${user ? user.name : 'bạn'}! 👋 Rất vui được hỗ trợ bạn hôm nay!\n\n🎯 **Tôi có thể giúp bạn:**\n\n🛍️ **Mua sắm thông minh:**\n• Gợi ý sản phẩm phù hợp\n• Tìm kiếm & so sánh\n• Săn deal Flash Sale\n• Mã giảm giá hot\n\n📦 **Quản lý đơn hàng:**\n• Theo dõi đơn hàng\n• Chính sách đổi trả\n• Phương thức thanh toán\n• Vận chuyển & giao hàng\n\n💬 **Tư vấn chuyên nghiệp:**\n• Thiết kế nội thất\n• Bố trí không gian\n• Phối màu phong cách\n• Ngân sách hợp lý\n\n🔥 **Flash Sale hôm nay:**\nGiảm đến 50% nhiều sản phẩm!\n\nBạn cần tôi tư vấn gì? 😊`,
        quickReplies: ['🔥 Flash Sale', '⭐ Sản phẩm hot', '🎫 Mã giảm giá', '🛍️ Tìm sản phẩm']
      };
    }

    if (lowerMessage.includes('cảm ơn') || lowerMessage.includes('thank')) {
      return {
        answer: 'Rất vui được hỗ trợ bạn! 😊\n\nNếu bạn cần thêm thông tin gì, đừng ngại hỏi nhé!',
        quickReplies: ['Xem sản phẩm', 'Về trang chủ', 'Liên hệ']
      };
    }

    if (lowerMessage.includes('giá') || lowerMessage.includes('bao nhiêu')) {
      return {
        answer: '💰 **Về giá cả:**\n\nGiá sản phẩm của chúng tôi từ 50.000đ - 10.000.000đ tùy thuộc vào từng loại.\n\nĐang có nhiều chương trình giảm giá hấp dẫn:\n• Flash Sale giảm đến 50%\n• Mã giảm giá cho đơn hàng đầu\n• Freeship cho đơn từ 500k\n\nBạn muốn xem sản phẩm nào cụ thể không?',
        quickReplies: ['Xem Flash Sale', 'Sản phẩm bán chạy', 'Tìm kiếm sản phẩm']
      };
    }

    // Thêm các từ khóa phổ biến
    if (lowerMessage.includes('đẹp') || lowerMessage.includes('đáng yêu') || lowerMessage.includes('cute')) {
      return {
        answer: '🥰 Cảm ơn bạn! Chúng tôi luôn cố gắng mang đến trải nghiệm tốt nhất cho khách hàng!\n\n✨ Homely Store tự hào là:\n• Top 1 cửa hàng nội thất được yêu thích\n• Hơn 100,000+ khách hàng hài lòng\n• 4.9⭐ trên mọi nền tảng\n• Sản phẩm chất lượng cao, giá tốt nhất\n\nCảm ơn sự ủng hộ của bạn! 💖',
        quickReplies: ['Xem sản phẩm bán chạy', 'Mã giảm giá', 'Flash Sale']
      };
    }

    if (lowerMessage.includes('nhanh') || lowerMessage.includes('ship') || lowerMessage.includes('giao hàng')) {
      return {
        answer: '🚀 **Giao hàng siêu tốc:**\n\n⚡ Nội thành HCM/HN: 2-4 giờ\n📦 Các tỉnh thành khác: 1-3 ngày\n🎁 Miễn phí ship đơn từ 500k\n✅ Kiểm tra hàng trước khi thanh toán\n🔄 Đổi trả dễ dàng trong 7 ngày\n\nĐối tác vận chuyển uy tín:\n• Giao Hàng Nhanh (GHN)\n• Giao Hàng Tiết Kiệm (GHTK)\n• Viettel Post\n• J&T Express',
        quickReplies: ['Theo dõi đơn hàng', 'Mua ngay', 'Xem Flash Sale']
      };
    }

    // Default response
    return {
      answer: '🤔 Xin lỗi, tôi chưa hiểu rõ câu hỏi của bạn.\n\n💡 **Bạn có thể hỏi tôi về:**\n\n🛍️ Sản phẩm:\n• "Tìm bàn ăn"\n• "Sản phẩm giảm giá"\n• "Ghế sofa giá rẻ"\n\n📦 Đơn hàng:\n• "Theo dõi đơn hàng"\n• "Chính sách đổi trả"\n• "Phương thức thanh toán"\n\n🎁 Khuyến mãi:\n• "Mã giảm giá"\n• "Flash Sale"\n• "Ưu đãi hôm nay"\n\n💬 Hoặc nhấn vào gợi ý bên dưới để được hỗ trợ nhanh hơn!\n\n📞 Liên hệ trực tiếp: Hotline 1900 xxxx (24/7)',
      quickReplies: QUICK_SUGGESTIONS
    };
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputValue.trim();
    if (!textToSend) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot typing delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800));

    // Get bot response
    const { answer, quickReplies } = getBotResponse(textToSend);

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
      {/* Chat Button */}
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
              className="h-16 w-16 rounded-full bg-gradient-to-br from-[#8B7355] to-[#6d5a43] hover:from-[#6d5a43] hover:to-[#5a4935] text-white shadow-2xl"
            >
              <MessageCircle className="w-7 h-7" />
            </Button>
            {/* Notification Badge */}
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">1</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] bg-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-700 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#8B7355] to-[#6d5a43] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Homely Assistant</h3>
                  <p className="text-white/80 text-xs">Luôn sẵn sàng hỗ trợ 24/7</p>
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a]">
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
                        ? 'bg-gradient-to-br from-[#8B7355] to-[#6d5a43]'
                        : 'bg-blue-500'
                    }`}>
                      {message.sender === 'bot' ? (
                        <Bot className="w-5 h-5 text-white" />
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
                          ? 'bg-[#2a2a2a] border border-gray-700 text-gray-100'
                          : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
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
                          className="px-3 py-1.5 text-xs bg-[#2a2a2a] hover:bg-[#3a3a3a] border border-gray-700 text-gray-300 rounded-full transition"
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
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8B7355] to-[#6d5a43] flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-[#2a2a2a] border border-gray-700 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#2a2a2a] border-t border-gray-700">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 bg-[#1a1a1a] border-gray-700 text-white placeholder:text-gray-500"
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-gradient-to-r from-[#8B7355] to-[#6d5a43] hover:from-[#6d5a43] hover:to-[#5a4935] text-white"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Powered by Homely AI • Phản hồi nhanh 24/7
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}