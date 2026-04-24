import { Link } from 'react-router';
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, Twitter } from 'lucide-react';
import { NewsletterSignup } from './NewsletterSignup';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1a1a1a] border-t border-gray-800 mt-20">
      {/* Newsletter Section - Tách riêng phần trên cùng */}
      <div className="container mx-auto px-4 py-12">
        <NewsletterSignup />
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Về Homely</h3>
            <p className="text-gray-400 text-sm mb-4">
              Homely - Cửa hàng đồ gia dụng uy tín, chất lượng cao. Mang đến không gian sống đẹp và tiện nghi cho mọi gia đình Việt.
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-[#2a2a2a] hover:bg-blue-500 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-[#2a2a2a] hover:bg-pink-500 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-[#2a2a2a] hover:bg-red-500 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-[#2a2a2a] hover:bg-sky-500 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white text-sm transition">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-400 hover:text-white text-sm transition">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white text-sm transition">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white text-sm transition">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-gray-400 hover:text-white text-sm transition">
                  Yêu thích
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Chính sách</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/policy/shipping" className="text-gray-400 hover:text-white text-sm transition">
                  Chính sách vận chuyển
                </Link>
              </li>
              <li>
                <Link to="/policy/return" className="text-gray-400 hover:text-white text-sm transition">
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link to="/policy/warranty" className="text-gray-400 hover:text-white text-sm transition">
                  Chính sách bảo hành
                </Link>
              </li>
              <li>
                <Link to="/policy/privacy" className="text-gray-400 hover:text-white text-sm transition">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link to="/policy/terms" className="text-gray-400 hover:text-white text-sm transition">
                  Điều khoản sử dụng
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Liên hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#8B7355] flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#8B7355] flex-shrink-0" />
                <a href="tel:1900xxxx" className="text-gray-400 hover:text-white text-sm transition">
                  1900 xxxx
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#8B7355] flex-shrink-0" />
                <a href="mailto:contact@homely.vn" className="text-gray-400 hover:text-white text-sm transition">
                  contact@homely.vn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-white font-medium text-sm mb-3">Phương thức thanh toán</h4>
              <div className="flex gap-2">
                <div className="px-3 py-2 bg-[#2a2a2a] rounded border border-gray-700">
                  <span className="text-xs text-gray-400">COD</span>
                </div>
                <div className="px-3 py-2 bg-[#2a2a2a] rounded border border-gray-700">
                  <span className="text-xs text-gray-400">Vietcombank</span>
                </div>
                <div className="px-3 py-2 bg-[#2a2a2a] rounded border border-gray-700">
                  <span className="text-xs text-gray-400">MoMo</span>
                </div>
                <div className="px-3 py-2 bg-[#2a2a2a] rounded border border-gray-700">
                  <span className="text-xs text-gray-400">VNPay</span>
                </div>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <h4 className="text-white font-medium text-sm mb-3">Giấy phép kinh doanh</h4>
              <p className="text-gray-400 text-xs">
                GPKD số: 0123456789<br />
                Do Sở KH &amp; ĐT TP. HCM cấp ngày 01/01/2020
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} <span className="text-[#8B7355] font-semibold">Homely</span>. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Made with ❤️ in Vietnam
          </p>
        </div>
      </div>
    </footer>
  );
}