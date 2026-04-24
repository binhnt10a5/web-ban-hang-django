import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router';
import { Eye, ShoppingCart, Heart, Star, Grid3x3, List } from 'lucide-react';
import { productsApi } from '../services/api';
import type { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { SearchBar, SearchFilters } from '../components/SearchBar';
import { QuickViewModal } from '../components/QuickViewModal';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { ProductGridSkeleton, ProductListSkeletonGroup } from '../components/ProductSkeleton';
import { EmptyState } from '../components/EmptyState';

export function ProductsPage() {
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'newest',
  });

  // Get filter params from URL
  const isFeaturedPage = searchParams.get('featured') === 'true';
  const isSalePage = searchParams.get('discount') === 'true';
  const categoryFilter = searchParams.get('category');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const result = await productsApi.getAll();
      if (result.success && result.data) {
        // Add discount to some products
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const handleQuickView = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  // Helper function to match category
  const matchesCategory = (productCategory: string, filterCategory: string) => {
    if (!filterCategory) return true;

    // Direct match
    if (productCategory === filterCategory) return true;

    // Match by slug (convert category name to slug)
    const productSlug = productCategory.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    return productSlug === filterCategory;
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    // Featured page filter
    if (isFeaturedPage && !product.featured) {
      return false;
    }

    // Flash Sale page filter (discount >= 30%)
    if (isSalePage && (!product.discount || product.discount < 30)) {
      return false;
    }

    // Category filter from URL
    if (categoryFilter && !matchesCategory(product.category, categoryFilter)) {
      return false;
    }

    // Category filter from search filters
    if (filters.category && !matchesCategory(product.category, filters.category)) {
      return false;
    }

    // Search query
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Price range
    if (filters.minPrice && product.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice && product.price > filters.maxPrice) {
      return false;
    }

    // In stock
    if (filters.inStock && product.stock === 0) {
      return false;
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name, 'vi');
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const calculateFinalPrice = (product: Product) => {
    if (product.discount) {
      return product.price * (1 - product.discount / 100);
    }
    return product.price;
  };

  const ProductGridCard = ({ product }: { product: Product }) => {
    const finalPrice = calculateFinalPrice(product);
    const isWishlisted = isInWishlist(product.id);

    return (
      <Link to={`/product/${product.id}`} className="group">
        <div className="bg-[#2a2a2a] rounded-xl overflow-hidden border border-gray-700 hover:border-[#8B7355] transition-all duration-300 hover:shadow-xl hover:shadow-[#8B7355]/10">
          <div className="relative aspect-square overflow-hidden bg-[#1a1a1a]">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
            />

            {product.discount && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                -{product.discount}%
              </div>
            )}

            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-bold">Hết hàng</span>
              </div>
            )}

            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
              <button
                onClick={(e) => handleQuickView(product, e)}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-[#8B7355] hover:text-white transition"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => handleAddToCart(product, e)}
                disabled={product.stock === 0}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-[#8B7355] hover:text-white transition disabled:opacity-50"
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

          <div className="p-4">
            <p className="text-gray-400 text-xs mb-1">{product.category}</p>
            <h3 className="text-white font-medium mb-2 line-clamp-2 group-hover:text-[#8B7355] transition">
              {product.name}
            </h3>

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

  const ProductListCard = ({ product }: { product: Product }) => {
    const finalPrice = calculateFinalPrice(product);
    const isWishlisted = isInWishlist(product.id);

    return (
      <Link to={`/product/${product.id}`} className="group">
        <div className="bg-[#2a2a2a] rounded-xl overflow-hidden border border-gray-700 hover:border-[#8B7355] transition-all duration-300 hover:shadow-xl hover:shadow-[#8B7355]/10 flex gap-6 p-4">
          <div className="relative w-48 h-48 flex-shrink-0 overflow-hidden bg-[#1a1a1a] rounded-lg">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
            />

            {product.discount && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                -{product.discount}%
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col">
            <p className="text-gray-400 text-xs mb-1">{product.category}</p>
            <h3 className="text-white font-bold text-xl mb-2 group-hover:text-[#8B7355] transition">
              {product.name}
            </h3>

            {product.rating && (
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < product.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
                    }`}
                  />
                ))}
                <span className="text-gray-400 text-sm ml-1">({product.rating})</span>
              </div>
            )}

            <p className="text-gray-300 text-sm mb-4 line-clamp-2">{product.description}</p>

            <div className="mt-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[#8B7355] font-bold text-2xl">
                  {finalPrice.toLocaleString('vi-VN')}đ
                </span>
                {product.discount && (
                  <span className="text-gray-500 line-through text-lg">
                    {product.price.toLocaleString('vi-VN')}đ
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={(e) => handleQuickView(product, e)}
                  className="w-10 h-10 bg-[#3a3a3a] rounded-full flex items-center justify-center hover:bg-[#8B7355] hover:text-white transition"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => handleAddToCart(product, e)}
                  disabled={product.stock === 0}
                  className="px-4 py-2 bg-[#8B7355] hover:bg-[#6d5a43] text-white rounded-lg font-medium transition disabled:opacity-50"
                >
                  <ShoppingCart className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => handleAddToWishlist(product, e)}
                  className="w-10 h-10 bg-[#3a3a3a] rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
            <Link to="/" className="hover:text-white transition">Trang chủ</Link>
            <span>/</span>
            <span className="text-white">Sản phẩm</span>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {isFeaturedPage ? 'Sản phẩm nổi bật' : isSalePage ? 'Flash Sale' : 'Tất cả sản phẩm'}
              </h1>
              <p className="text-gray-400">
                {isFeaturedPage ? 'Khám phá các sản phẩm nổi bật nhất' : isSalePage ? 'Mua ngay với ưu đãi lớn' : 'Khám phá bộ sưu tập đồ gia dụng hiện đại'}
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-6">
          <SearchBar
            onSearch={handleSearch}
            onFilter={handleFilter}
            placeholder="Tìm kiếm sản phẩm..."
            showFilters={true}
          />
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex items-center justify-between bg-[#2a2a2a] rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400">
            <span className="text-white font-bold">{sortedProducts.length}</span> sản phẩm
          </p>

          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">Hiển thị:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${
                  viewMode === 'grid'
                    ? 'bg-[#8B7355] text-white'
                    : 'bg-[#3a3a3a] text-gray-400 hover:text-white'
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${
                  viewMode === 'list'
                    ? 'bg-[#8B7355] text-white'
                    : 'bg-[#3a3a3a] text-gray-400 hover:text-white'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Products */}
        {loading ? (
          viewMode === 'grid' ? (
            <ProductGridSkeleton count={12} />
          ) : (
            <ProductListSkeletonGroup count={8} />
          )
        ) : sortedProducts.length === 0 ? (
          <EmptyState
            type="search"
            message="Không tìm thấy sản phẩm"
            description="Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác"
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ProductGridCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedProducts.map((product) => (
              <ProductListCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        product={quickViewProduct}
      />
    </div>
  );
}