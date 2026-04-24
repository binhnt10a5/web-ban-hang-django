import React from 'react';
import { Link } from 'react-router';
import { Home } from 'lucide-react';
import { Button } from '../components/ui/button';

export function NotFoundPage() {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <div className="max-w-md mx-auto">
        <h1 className="text-9xl font-bold text-[#8B7355] mb-4">404</h1>
        <h2 className="text-3xl font-bold text-white mb-4">Không tìm thấy trang</h2>
        <p className="text-gray-400 mb-8">
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        <Link to="/">
          <Button className="bg-[#8B7355] hover:bg-[#6d5a43] text-white">
            <Home className="w-5 h-5 mr-2" />
            Về trang chủ
          </Button>
        </Link>
      </div>
    </div>
  );
}
