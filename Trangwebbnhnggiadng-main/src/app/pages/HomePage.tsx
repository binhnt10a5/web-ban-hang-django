import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Eye, ShoppingCart, Heart, Star, TrendingUp, Sparkles } from 'lucide-react';
import { productsApi } from '../services/api';
import type { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { HeroSlider } from '../components/HeroSlider';
import { FlashSale } from '../components/FlashSale';
import { Testimonials } from '../components/Testimonials';
import { NewsletterSignup } from '../components/NewsletterSignup';
import { QuickViewModal } from '../components/QuickViewModal';
import { SocialProofNotification } from '../components/SocialProofNotification';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

export function HomePage() {
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const result = await productsApi.getAll();
      if (result.success && result.data) {
        // Add discount to some products for flash sale
        const productsWithDiscounts = result.data.map((p, i) => ({
          ...p,
          discount: i % 3 === 0 ? 20 + Math.floor(Math.random() * 30) : p.discount,
        }));
        setProducts(productsWithDiscounts);
      }
    } catch (error) {
      toast.error('Lỗi khi tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const bestSellers = products.filter(p => p.rating && p.rating >= 4).slice(0, 8);
  const newArrivals = products.slice(0, 8);

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success('Đã thêm vào giỏ hàng');
  };

  const handleAddToWishlist = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isInWishlist(product.id)) {
      addToWishlist(product.id);
    }
  };

  const calculateFinalPrice = (product: Product) => {
    if (product.discount) {
      return product.price * (1 - product.discount / 100);
    }
    return product.price;
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const finalPrice = calculateFinalPrice(product);
    const isWishlisted = isInWishlist(product.id);

    return (
      <Link to={`/product/${product.id}`} className="group">
        <div className="bg-[#2a2a2a] rounded-xl overflow-hidden border border-gray-700 hover:border-[#8B7355] transition-all duration-300 hover:shadow-xl hover:shadow-[#8B7355]/10">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-[#1a1a1a]">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
            />

            {/* Badges */}
            {product.discount && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                -{product.discount}%
              </div>
            )}
            {product.featured && (
              <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                <Star className="w-3 h-3 fill-white" />
                HOT
              </div>
            )}

            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleQuickView(product);
                }}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-[#8B7355] hover:text-white transition"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => handleAddToCart(product, e)}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-[#8B7355] hover:text-white transition"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => handleAddToWishlist(product, e)}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="p-4">
            <p className="text-gray-400 text-xs mb-1">{product.category}</p>
            <h3 className="text-white font-medium mb-2 line-clamp-2 group-hover:text-[#8B7355] transition">
              {product.name}
            </h3>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < product.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
                    }`}
                  />
                ))}
                <span className="text-gray-400 text-xs ml-1">({product.rating})</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-[#8B7355] font-bold text-lg">
                {finalPrice.toLocaleString('vi-VN')}đ
              </span>
              {product.discount && (
                <span className="text-gray-500 line-through text-sm">
                  {product.price.toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Slider */}
        <HeroSlider />

        {/* Flash Sale */}
        <FlashSale products={products} />

        {/* Best Sellers */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Bán chạy nhất</h2>
                <p className="text-gray-400">Sản phẩm được yêu thích nhất</p>
              </div>
            </div>
            <Link to="/products">
              <Button variant="ghost" className="text-[#8B7355] hover:text-[#6d5a43]">
                Xem tất cả
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* New Arrivals */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Sản phẩm mới</h2>
                <p className="text-gray-400">Cập nhật liên tục</p>
              </div>
            </div>
            <Link to="/products">
              <Button variant="ghost" className="text-[#8B7355] hover:text-[#6d5a43]">
                Xem tất cả
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mb-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl p-6 border border-blue-500/20">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-white font-bold mb-2">Chất lượng đảm bảo</h3>
            <p className="text-gray-400 text-sm">100% sản phẩm chính hãng</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl p-6 border border-green-500/20">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-white font-bold mb-2">Miễn phí vận chuyển</h3>
            <p className="text-gray-400 text-sm">Đơn hàng từ 500.000đ</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl p-6 border border-purple-500/20">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-white font-bold mb-2">Đổi trả dễ dàng</h3>
            <p className="text-gray-400 text-sm">Trong vòng 7 ngày</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-xl p-6 border border-orange-500/20">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-white font-bold mb-2">Hỗ trợ 24/7</h3>
            <p className="text-gray-400 text-sm">Luôn sẵn sàng hỗ trợ</p>
          </div>
        </div>

        {/* Testimonials */}
        <Testimonials />

        {/* Newsletter */}
        <NewsletterSignup />
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        product={quickViewProduct}
      />

      {/* Social Proof Notification */}
      <SocialProofNotification />
    </div>
  );
}