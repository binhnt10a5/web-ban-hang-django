import { Link } from 'react-router';
import { Package, Search, ShoppingBag, Heart, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';

interface EmptyStateProps {
  type?: 'products' | 'search' | 'cart' | 'wishlist' | 'orders';
  message?: string;
  description?: string;
}

export function EmptyState({ type = 'products', message, description }: EmptyStateProps) {
  const getContent = () => {
    switch (type) {
      case 'search':
        return {
          icon: <Search className="w-16 h-16 text-gray-600" />,
          title: message || 'Không tìm thấy sản phẩm',
          desc: description || 'Không tìm thấy sản phẩm phù hợp với tìm kiếm của bạn. Vui lòng thử lại với từ khóa khác.',
          action: (
            <Link to="/products">
              <Button className="bg-[#8B7355] hover:bg-[#6d5a43]">
                Xem tất cả sản phẩm
              </Button>
            </Link>
          ),
        };
      
      case 'cart':
        return {
          icon: <ShoppingCart className="w-16 h-16 text-gray-600" />,
          title: message || 'Giỏ hàng trống',
          desc: description || 'Bạn chưa thêm sản phẩm nào vào giỏ hàng. Khám phá các sản phẩm tuyệt vời của chúng tôi ngay!',
          action: (
            <Link to="/products">
              <Button className="bg-[#8B7355] hover:bg-[#6d5a43]">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Mua sắm ngay
              </Button>
            </Link>
          ),
        };
      
      case 'wishlist':
        return {
          icon: <Heart className="w-16 h-16 text-gray-600" />,
          title: message || 'Danh sách yêu thích trống',
          desc: description || 'Bạn chưa có sản phẩm yêu thích nào. Hãy thêm sản phẩm bạn thích vào danh sách!',
          action: (
            <Link to="/products">
              <Button className="bg-[#8B7355] hover:bg-[#6d5a43]">
                Khám phá sản phẩm
              </Button>
            </Link>
          ),
        };
      
      case 'orders':
        return {
          icon: <Package className="w-16 h-16 text-gray-600" />,
          title: message || 'Chưa có đơn hàng',
          desc: description || 'Bạn chưa có đơn hàng nào. Bắt đầu mua sắm để tạo đơn hàng đầu tiên!',
          action: (
            <Link to="/products">
              <Button className="bg-[#8B7355] hover:bg-[#6d5a43]">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Bắt đầu mua sắm
              </Button>
            </Link>
          ),
        };
      
      case 'products':
      default:
        return {
          icon: <Package className="w-16 h-16 text-gray-600" />,
          title: message || 'Không có sản phẩm',
          desc: description || 'Hiện tại chưa có sản phẩm nào. Vui lòng quay lại sau!',
          action: (
            <Link to="/">
              <Button className="bg-[#8B7355] hover:bg-[#6d5a43]">
                Về trang chủ
              </Button>
            </Link>
          ),
        };
    }
  };

  const content = getContent();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-[#2a2a2a] rounded-full p-8 mb-6">
        {content.icon}
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-3">
        {content.title}
      </h3>
      
      <p className="text-gray-400 text-center mb-8 max-w-md">
        {content.desc}
      </p>
      
      {content.action}
    </div>
  );
}
