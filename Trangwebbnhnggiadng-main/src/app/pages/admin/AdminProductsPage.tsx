import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { 
  Search, Plus, Edit, Trash2, Package, Grid3x3, List,
  AlertCircle, Star, Eye, TrendingUp, Filter
} from 'lucide-react';
import { productsApi } from '../../services/api';
import type { Product } from '../../types';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const result = await productsApi.getAll();
      if (result.success && result.data) {
        setProducts(result.data);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    try {
      const result = await productsApi.delete(id);
      if (result.success) {
        toast.success('Đã xóa sản phẩm');
        loadProducts();
      } else {
        toast.error(result.error || 'Lỗi khi xóa sản phẩm');
      }
    } catch (error) {
      toast.error('Lỗi khi xóa sản phẩm');
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    let matchesStock = true;
    if (stockFilter === 'low') matchesStock = product.stock > 0 && product.stock < 10;
    if (stockFilter === 'out') matchesStock = product.stock === 0;
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];
  
  const stats = {
    total: products.length,
    lowStock: products.filter(p => p.stock > 0 && p.stock < 10).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    featured: products.filter(p => p.featured).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#8B7355] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-lg mt-4">Đang tải...</p>
        </div>
      </div>
    );
  }

  const ProductGridCard = ({ product }: { product: Product }) => (
    <div className="bg-[#2a2a2a] rounded-xl overflow-hidden border border-gray-700 hover:border-[#8B7355] transition-all duration-300 hover:shadow-xl hover:shadow-[#8B7355]/10">
      <div className="relative aspect-square overflow-hidden bg-[#1a1a1a]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        
        {product.featured && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded flex items-center gap-1">
            <Star className="w-3 h-3 fill-white" />
            Hot
          </div>
        )}
        
        {product.stock === 0 && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
            Hết hàng
          </div>
        )}
        
        {product.stock > 0 && product.stock < 10 && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Sắp hết
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-gray-400 text-xs mb-1">{product.category}</p>
        <h3 className="text-white font-medium mb-2 line-clamp-2 h-12">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-[#8B7355] font-bold text-lg">
            {product.price.toLocaleString('vi-VN')}đ
          </span>
          <span className={`text-sm ${product.stock === 0 ? 'text-red-400' : product.stock < 10 ? 'text-orange-400' : 'text-green-400'}`}>
            SL: {product.stock}
          </span>
        </div>

        <div className="flex gap-2">
          <Link
            to={`/admin/products/edit/${product.id}`}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition text-sm font-medium"
          >
            <Edit className="w-4 h-4" />
            Sửa
          </Link>
          <button
            onClick={() => handleDelete(product.id)}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const ProductListCard = ({ product }: { product: Product }) => (
    <div className="bg-[#2a2a2a] rounded-xl p-4 border border-gray-700 hover:border-[#8B7355] transition-all duration-300 flex items-center gap-4">
      <img
        src={product.image}
        alt={product.name}
        className="w-24 h-24 object-cover rounded-lg"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-2">
          <h3 className="text-white font-medium flex-1">{product.name}</h3>
          {product.featured && (
            <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs font-bold rounded flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400" />
              Hot
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
          <span>{product.category}</span>
          <span>•</span>
          <span>ID: {product.id.slice(0, 8)}</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div>
            <p className="text-gray-400 text-xs">Giá</p>
            <p className="text-[#8B7355] font-bold">{product.price.toLocaleString('vi-VN')}đ</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Tồn kho</p>
            <p className={`font-bold ${product.stock === 0 ? 'text-red-400' : product.stock < 10 ? 'text-orange-400' : 'text-green-400'}`}>
              {product.stock}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Rating</p>
            <p className="text-white font-bold">{product.rating || 0} ⭐</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          to={`/admin/products/edit/${product.id}`}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition font-medium"
        >
          <Edit className="w-4 h-4" />
          Sửa
        </Link>
        <button
          onClick={() => handleDelete(product.id)}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition font-medium"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Quản lý sản phẩm</h1>
            <p className="text-gray-400">{filteredProducts.length} / {products.length} sản phẩm</p>
          </div>
          <Link to="/admin/products/new">
            <Button className="bg-[#8B7355] hover:bg-[#6d5a43] text-white">
              <Plus className="w-5 h-5 mr-2" />
              Thêm sản phẩm
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#2a2a2a] rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-gray-400 text-sm">Tổng</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#2a2a2a] rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-gray-400 text-sm">Sắp hết</p>
                <p className="text-2xl font-bold text-white">{stats.lowStock}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#2a2a2a] rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-gray-400 text-sm">Hết hàng</p>
                <p className="text-2xl font-bold text-white">{stats.outOfStock}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#2a2a2a] rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-gray-400 text-sm">Nổi bật</p>
                <p className="text-2xl font-bold text-white">{stats.featured}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#2a2a2a] rounded-xl p-4 mb-6 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#8B7355]"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#8B7355]"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.filter(c => c !== 'all').map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Stock Filter */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#8B7355]"
            >
              <option value="all">Tất cả tồn kho</option>
              <option value="low">Sắp hết hàng (&lt;10)</option>
              <option value="out">Hết hàng</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              Hiển thị {filteredProducts.length} sản phẩm
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${
                  viewMode === 'grid'
                    ? 'bg-[#8B7355] text-white'
                    : 'bg-[#1a1a1a] text-gray-400 hover:text-white border border-gray-700'
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${
                  viewMode === 'list'
                    ? 'bg-[#8B7355] text-white'
                    : 'bg-[#1a1a1a] text-gray-400 hover:text-white border border-gray-700'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Products */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-[#2a2a2a] rounded-xl border border-gray-700">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-white text-xl font-bold mb-2">Không tìm thấy sản phẩm</p>
            <p className="text-gray-400 mb-6">Thử thay đổi bộ lọc hoặc tìm kiếm</p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setStockFilter('all');
              }}
              className="bg-[#8B7355] hover:bg-[#6d5a43]"
            >
              Xóa bộ lọc
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductGridCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <ProductListCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}