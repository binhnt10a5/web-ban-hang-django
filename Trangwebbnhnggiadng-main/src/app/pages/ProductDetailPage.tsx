import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { 
  Star, ShoppingCart, Heart, Minus, Plus, Share2, 
  Truck, Shield, RotateCcw, MessageCircle, ChevronLeft, ChevronRight,
  Check, X
} from 'lucide-react';
import { productsApi, reviewsApi } from '../services/api';
import type { Product, ProductReview } from '../types';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
  
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'shipping'>('description');
  const [reviews, setReviews] = useState<ProductReview[]>([]);

  useEffect(() => {
    if (id) {
      loadProduct();
      window.scrollTo(0, 0);
    }
  }, [id]);

  const loadProduct = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await productsApi.getById(id);
      if (result.success && result.data) {
        setProduct(result.data);
        loadRelatedProducts(result.data.category);
        loadReviews(id);
      }
    } catch (error) {
      toast.error('Lỗi khi tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async (productId: string) => {
    try {
      const result = await reviewsApi.getAll({ productId, status: 'approved' });
      if (result.success && result.data) {
        setReviews(result.data.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      }
    } catch (error) {
      console.error('Error loading reviews');
    }
  };

  const loadRelatedProducts = async (category: string) => {
    try {
      const result = await productsApi.getAll();
      if (result.success && result.data) {
        const related = result.data
          .filter(p => p.category === category && p.id !== id)
          .slice(0, 4);
        setRelatedProducts(related);
      }
    } catch (error) {
      console.error('Error loading related products');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block w-12 h-12 border-4 border-[#8B7355] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-lg mt-4">Đang tải...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">😢</div>
        <h2 className="text-2xl text-white mb-4">Không tìm thấy sản phẩm</h2>
        <Button onClick={() => navigate('/')} className="bg-[#8B7355] hover:bg-[#6d5a43]">
          Quay lại trang chủ
        </Button>
      </div>
    );
  }

  const finalPrice = product.discount 
    ? product.price * (1 - product.discount / 100)
    : product.price;

  const isWished = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast.error('Sản phẩm đã hết hàng');
      return;
    }
    
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
  };

  const handleBuyNow = () => {
    if (product.stock === 0) {
      toast.error('Sản phẩm đã hết hàng');
      return;
    }
    
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    navigate('/checkout');
  };

  const handleWishlist = () => {
    if (isWished) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép link sản phẩm');
    }
  };

  const images = product.images || [product.image];

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-8">
          <Link to="/" className="hover:text-white transition">Trang chủ</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-white transition">Sản phẩm</Link>
          <span>/</span>
          <span className="text-white">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div>
            {/* Main Image */}
            <div className="bg-[#2a2a2a] rounded-2xl overflow-hidden aspect-square mb-4 relative group">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {product.discount && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg">
                  -{product.discount}%
                </div>
              )}

              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">Hết hàng</span>
                </div>
              )}

              {/* Image navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))}
                    disabled={selectedImage === 0}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center disabled:opacity-0 transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImage(Math.min(images.length - 1, selectedImage + 1))}
                    disabled={selectedImage === images.length - 1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center disabled:opacity-0 transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                      selectedImage === idx
                        ? 'border-[#8B7355]'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-[#2a2a2a] text-gray-400 text-sm rounded-full border border-gray-700">
                {product.category}
              </span>
              {product.featured && (
                <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 text-sm rounded-full border border-yellow-500/30 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-500" />
                  Hot
                </span>
              )}
            </div>

            <h1 className="text-4xl font-bold text-white mb-4">{product.name}</h1>

            {/* Rating & Brand */}
            <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < (product.rating || 0)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-400">({product.rating || 0})</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Thương hiệu:</span>
                <span className="text-white font-medium">{product.brand}</span>
              </div>
            </div>

            {/* Price */}
            <div className="mb-8">
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-5xl font-bold text-[#8B7355]">
                  {finalPrice.toLocaleString('vi-VN')}đ
                </span>
                {product.discount && (
                  <span className="text-2xl text-gray-500 line-through">
                    {product.price.toLocaleString('vi-VN')}đ
                  </span>
                )}
              </div>
              {product.discount && (
                <p className="text-green-400 font-medium">
                  Tiết kiệm {(product.price - finalPrice).toLocaleString('vi-VN')}đ ({product.discount}%)
                </p>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-gray-400">Tình trạng:</span>
                {product.stock > 0 ? (
                  <span className="text-green-400 font-medium flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Còn {product.stock} sản phẩm
                  </span>
                ) : (
                  <span className="text-red-400 font-medium flex items-center gap-1">
                    <X className="w-4 h-4" />
                    Hết hàng
                  </span>
                )}
              </div>
            </div>

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="mb-8">
                <label className="text-gray-400 text-sm mb-3 block">Số lượng:</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-[#2a2a2a] rounded-lg border border-gray-700 p-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 hover:bg-[#3a3a3a] rounded-lg flex items-center justify-center text-white transition"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="text-white font-bold text-xl w-16 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-10 h-10 hover:bg-[#3a3a3a] rounded-lg flex items-center justify-center text-white transition"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {product.stock} sản phẩm có sẵn
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 mb-8">
              <Button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 bg-[#8B7355] hover:bg-[#6d5a43] text-white h-14 text-lg font-bold disabled:opacity-50"
              >
                Mua ngay
              </Button>
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                variant="outline"
                className="flex-1 bg-[#2a2a2a] border-[#8B7355] text-[#8B7355] hover:bg-[#8B7355] hover:text-white h-14 text-lg font-bold disabled:opacity-50"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Thêm vào giỏ
              </Button>
            </div>

            {/* Secondary Actions */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleWishlist}
                className={`flex-1 h-12 rounded-lg border-2 transition flex items-center justify-center gap-2 font-medium ${
                  isWished
                    ? 'bg-red-500/10 border-red-500 text-red-500'
                    : 'bg-[#2a2a2a] border-gray-700 text-gray-400 hover:border-red-500 hover:text-red-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWished ? 'fill-red-500' : ''}`} />
                {isWished ? 'Đã yêu thích' : 'Yêu thích'}
              </button>
              <button
                onClick={handleShare}
                className="flex-1 h-12 rounded-lg border-2 bg-[#2a2a2a] border-gray-700 text-gray-400 hover:border-blue-500 hover:text-blue-500 transition flex items-center justify-center gap-2 font-medium"
              >
                <Share2 className="w-5 h-5" />
                Chia sẻ
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 p-6 bg-[#2a2a2a] rounded-xl border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Miễn phí vận chuyển</p>
                  <p className="text-gray-400 text-xs">Đơn từ 500k</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Bảo hành chính hãng</p>
                  <p className="text-gray-400 text-xs">12 tháng</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Đổi trả dễ dàng</p>
                  <p className="text-gray-400 text-xs">Trong 7 ngày</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Hỗ trợ 24/7</p>
                  <p className="text-gray-400 text-xs">1900 xxxx</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-16">
          <div className="flex gap-4 mb-6 border-b border-gray-700">
            {(['description', 'reviews', 'shipping'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium transition relative ${
                  activeTab === tab
                    ? 'text-[#8B7355]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'description' && 'Mô tả sản phẩm'}
                {tab === 'reviews' && 'Đánh giá'}
                {tab === 'shipping' && 'Vận chuyển'}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8B7355]" />
                )}
              </button>
            ))}
          </div>

          <div className="bg-[#2a2a2a] rounded-xl p-8 border border-gray-700">
            {activeTab === 'description' && (
              <div className="prose prose-invert max-w-none">
                <h3 className="text-2xl font-bold text-white mb-4">Thông tin chi tiết</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">{product.description}</p>
                
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="flex justify-between py-3 border-b border-gray-700">
                    <span className="text-gray-400">Danh mục:</span>
                    <span className="text-white font-medium">{product.category}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-700">
                    <span className="text-gray-400">Thương hiệu:</span>
                    <span className="text-white font-medium">{product.brand}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-700">
                    <span className="text-gray-400">Tình trạng:</span>
                    <span className="text-white font-medium">Mới 100%</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-700">
                    <span className="text-gray-400">Bảo hành:</span>
                    <span className="text-white font-medium">12 tháng</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Đánh giá từ khách hàng</h3>
                
                {reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Chưa có đánh giá nào cho sản phẩm này.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Tổng quan đánh giá */}
                    <div className="flex items-center gap-6 pb-6 border-b border-gray-700">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-[#8B7355] mb-2">
                          {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                        </div>
                        <div className="flex items-center justify-center mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-400 text-sm">{reviews.length} đánh giá</p>
                      </div>

                      <div className="flex-1">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = reviews.filter(r => r.rating === star).length;
                          const percentage = (count / reviews.length) * 100;
                          return (
                            <div key={star} className="flex items-center gap-3 mb-2">
                              <span className="text-gray-400 text-sm w-12">{star} sao</span>
                              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-yellow-500 transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-gray-400 text-sm w-12">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Danh sách đánh giá */}
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-700 pb-4 last:border-0">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-white font-semibold">{review.userName}</p>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating
                                          ? 'text-yellow-400 fill-yellow-400'
                                          : 'text-gray-600'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-gray-400 text-sm">
                                {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                          </div>
                          <p className="text-gray-300 leading-relaxed">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'shipping' && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">Thông tin vận chuyển</h3>
                <div className="space-y-4 text-gray-300">
                  <p>✓ Miễn phí vận chuyển cho đơn hàng từ 500.000đ</p>
                  <p>✓ Giao hàng toàn quốc trong 2-5 ngày</p>
                  <p>✓ Kiểm tra hàng trước khi thanh toán</p>
                  <p>✓ Đổi trả miễn phí trong 7 ngày nếu có lỗi từ nhà sản xuất</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => {
                const relatedFinalPrice = relatedProduct.discount
                  ? relatedProduct.price * (1 - relatedProduct.discount / 100)
                  : relatedProduct.price;

                return (
                  <Link
                    key={relatedProduct.id}
                    to={`/product/${relatedProduct.id}`}
                    className="group"
                  >
                    <div className="bg-[#2a2a2a] rounded-xl overflow-hidden border border-gray-700 hover:border-[#8B7355] transition-all duration-300">
                      <div className="relative aspect-square overflow-hidden bg-[#1a1a1a]">
                        <img
                          src={relatedProduct.image}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                        />
                        {relatedProduct.discount && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                            -{relatedProduct.discount}%
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-gray-400 text-xs mb-1">{relatedProduct.category}</p>
                        <h3 className="text-white font-medium mb-2 line-clamp-2 group-hover:text-[#8B7355] transition">
                          {relatedProduct.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-[#8B7355] font-bold text-lg">
                            {relatedFinalPrice.toLocaleString('vi-VN')}đ
                          </span>
                          {relatedProduct.discount && (
                            <span className="text-gray-500 line-through text-sm">
                              {relatedProduct.price.toLocaleString('vi-VN')}đ
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}