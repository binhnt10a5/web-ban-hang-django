import { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Trash2, ArrowRight, Package, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { productsApi } from '../services/api';
import type { Product } from '../types';
import { toast } from 'sonner';

export function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlistProducts();
  }, [wishlist]);

  const loadWishlistProducts = async () => {
    setLoading(true);
    try {
      const result = await productsApi.getAll();
      if (result.success && result.data) {
        const wishlistProducts = result.data.filter(p => wishlist.includes(p.id));
        setProducts(wishlistProducts);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock > 0) {
      addToCart(product);
      toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
    } else {
      toast.error('Sản phẩm đã hết hàng');
    }
  };

  const handleRemove = (productId: string, productName: string) => {
    removeFromWishlist(productId);
    toast.success(`Đã xóa ${productName} khỏi danh sách yêu thích`);
  };

  const handleAddAllToCart = () => {
    let addedCount = 0;
    products.forEach(product => {
      if (product.stock > 0) {
        addToCart(product);
        addedCount++;
      }
    });
    
    if (addedCount > 0) {
      toast.success(`Đã thêm ${addedCount} sản phẩm vào giỏ hàng`);
    } else {
      toast.error('Không có sản phẩm nào còn hàng');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 bg-gradient-to-br from-pink-500/20 to-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-16 h-16 text-pink-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Danh sách yêu thích trống</h2>
          <p className="text-gray-400 mb-8">
            Hãy thêm sản phẩm yêu thích để dễ dàng theo dõi
          </p>
          <Link to="/">
            <button className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-8 py-4 rounded-2xl font-bold hover:from-pink-600 hover:to-red-600 transition shadow-xl inline-flex items-center gap-2">
              Khám phá sản phẩm
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-2xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Danh sách yêu thích</h1>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-400">Bạn có {products.length} sản phẩm yêu thích</p>
            {products.length > 0 && (
              <button
                onClick={handleAddAllToCart}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition shadow-lg inline-flex items-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Thêm tất cả vào giỏ
              </button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-[#2a2a2a] rounded-2xl overflow-hidden border border-gray-700/50 hover:border-pink-500/30 transition group"
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden bg-[#1a1a1a]">
                <Link to={`/product/${product.id}`}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                </Link>
                
                {/* Discount Badge */}
                {product.discount && product.discount > 0 && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    -{product.discount}%
                  </div>
                )}

                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(product.id, product.name)}
                  className="absolute top-3 right-3 w-10 h-10 bg-black/60 backdrop-blur-sm hover:bg-red-500 rounded-full flex items-center justify-center transition group/btn"
                >
                  <Trash2 className="w-5 h-5 text-white group-hover/btn:scale-110 transition" />
                </button>

                {/* Stock Badge */}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-red-500 text-white px-4 py-2 rounded-full font-bold">
                      Hết hàng
                    </div>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-5">
                <Link to={`/product/${product.id}`}>
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 hover:text-pink-400 transition">
                    {product.name}
                  </h3>
                </Link>

                {/* Category */}
                {product.category && (
                  <p className="text-sm text-gray-400 mb-3">{product.category}</p>
                )}

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-pink-400">
                      {product.price.toLocaleString('vi-VN')}đ
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        {product.originalPrice.toLocaleString('vi-VN')}đ
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock Info */}
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className={`text-sm ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-600 disabled:to-gray-600 flex items-center justify-center gap-2 shadow-lg"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Thêm vào giỏ
                  </button>
                  <Link
                    to={`/product/${product.id}`}
                    className="px-4 py-3 bg-[#333] hover:bg-[#3a3a3a] text-white rounded-xl font-semibold transition flex items-center justify-center"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        {products.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-3">
              Đã tìm thấy sản phẩm yêu thích?
            </h3>
            <p className="text-gray-400 mb-6">
              Thêm vào giỏ hàng và hoàn tất đơn hàng ngay hôm nay
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={handleAddAllToCart}
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-4 rounded-2xl font-bold hover:from-pink-600 hover:to-purple-600 transition shadow-xl inline-flex items-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Thêm tất cả vào giỏ
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="bg-[#2a2a2a] hover:bg-[#333] text-white px-8 py-4 rounded-2xl font-bold transition inline-flex items-center gap-2 border border-gray-700"
              >
                Xem giỏ hàng
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
