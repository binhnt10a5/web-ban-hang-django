import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Save, Package, DollarSign, Hash, Tag, Star, ImageIcon } from 'lucide-react';
import { productsApi } from '../../services/api';
import type { Product } from '../../types';
import { ImageUpload } from '../../components/ImageUpload';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

export function AdminProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(isEdit);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    image: '',
    stock: '',
    featured: false,
    discount: '',
  });

  useEffect(() => {
    if (isEdit && id) {
      loadProduct(id);
    }
  }, [isEdit, id]);

  const loadProduct = async (productId: string) => {
    setLoadingProduct(true);
    try {
      const result = await productsApi.getById(productId);
      if (result.success && result.data) {
        const product = result.data;
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price.toString(),
          category: product.category,
          brand: product.brand,
          image: product.image,
          stock: product.stock.toString(),
          featured: product.featured || false,
          discount: product.discount?.toString() || '',
        });
      } else {
        toast.error('Không tìm thấy sản phẩm');
        navigate('/admin/products');
      }
    } catch (error) {
      toast.error('Lỗi khi tải thông tin sản phẩm');
      navigate('/admin/products');
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (!formData.image) {
      toast.error('Vui lòng tải lên ảnh sản phẩm');
      return;
    }

    // Validate discount
    const discountValue = parseFloat(formData.discount) || 0;
    if (discountValue < 0 || discountValue > 100) {
      toast.error('Giảm giá phải từ 0% đến 100%');
      return;
    }

    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        brand: formData.brand,
        image: formData.image,
        stock: parseInt(formData.stock) || 0,
        featured: formData.featured,
        discount: discountValue > 0 ? discountValue : undefined,
      };

      let result;
      if (isEdit && id) {
        result = await productsApi.update(id, productData);
      } else {
        result = await productsApi.create(productData);
      }

      if (result.success) {
        if (discountValue >= 30) {
          toast.success(
            isEdit ? 'Đã cập nhật sản phẩm và thêm vào Flash Sale' : 'Đã thêm sản phẩm mới vào Flash Sale',
            { description: 'Sản phẩm có giảm giá ≥30% sẽ xuất hiện trong Flash Sale' }
          );
        } else {
          toast.success(isEdit ? 'Đã cập nhật sản phẩm' : 'Đã thêm sản phẩm mới');
        }
        navigate('/admin/products');
      } else {
        toast.error(result.error || 'Lỗi khi lưu sản phẩm');
      }
    } catch (error) {
      toast.error('Lỗi khi lưu sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#8B7355] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-lg mt-4">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/products')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition" />
            Quay lại danh sách sản phẩm
          </button>
          
          <div className="bg-gradient-to-r from-[#8B7355] to-[#6d5a43] rounded-2xl p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Package className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">
                  {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                </h1>
                <p className="text-white/80">
                  {isEdit ? 'Cập nhật thông tin sản phẩm' : 'Tạo sản phẩm mới cho cửa hàng'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-5 h-5 text-[#8B7355]" />
              <h2 className="text-xl font-bold text-white">Hình ảnh sản phẩm</h2>
              <span className="text-red-500">*</span>
            </div>
            <ImageUpload
              value={formData.image}
              onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
            />
            <p className="text-gray-400 text-sm mt-2">
              Tải lên ảnh sản phẩm (JPG/PNG, tối đa 2MB)
            </p>
          </div>

          {/* Basic Info Section */}
          <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-2 mb-6">
              <Package className="w-5 h-5 text-[#8B7355]" />
              <h2 className="text-xl font-bold text-white">Thông tin cơ bản</h2>
            </div>

            <div className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#8B7355] transition"
                  placeholder="VD: Máy pha cà phê Espresso Pro X1"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mô tả sản phẩm
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#8B7355] resize-none transition"
                  placeholder="Mô tả chi tiết về sản phẩm, tính năng nổi bật..."
                />
              </div>
            </div>
          </div>

          {/* Pricing & Inventory Section */}
          <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-2 mb-6">
              <DollarSign className="w-5 h-5 text-[#8B7355]" />
              <h2 className="text-xl font-bold text-white">Giá & Tồn kho</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Giá bán (VNĐ) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#8B7355] transition"
                    placeholder="4500000"
                    min="0"
                    required
                  />
                </div>
                {formData.price && (
                  <p className="text-[#8B7355] text-sm mt-1">
                    {parseFloat(formData.price).toLocaleString('vi-VN')}đ
                  </p>
                )}
              </div>

              {/* Discount */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Giảm giá (%)
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#8B7355] transition"
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>
                {formData.discount && parseFloat(formData.discount) >= 30 && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    🔥 Sẽ xuất hiện trong Flash Sale
                  </p>
                )}
                {formData.discount && parseFloat(formData.discount) > 0 && parseFloat(formData.discount) < 30 && (
                  <p className="text-orange-400 text-sm mt-1">
                    Giảm {parseFloat(formData.discount)}%
                  </p>
                )}
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Số lượng trong kho
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#8B7355] transition"
                    placeholder="50"
                    min="0"
                  />
                </div>
                {formData.stock && parseInt(formData.stock) < 10 && (
                  <p className="text-orange-400 text-sm mt-1">⚠️ Số lượng thấp</p>
                )}
              </div>
            </div>
          </div>

          {/* Category & Brand Section */}
          <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-2 mb-6">
              <Tag className="w-5 h-5 text-[#8B7355]" />
              <h2 className="text-xl font-bold text-white">Phân loại</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Danh mục <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#8B7355] transition"
                  required
                >
                  <option value="">Chọn danh mục</option>
                  <option value="Nhà bếp">🍳 Nhà bếp</option>
                  <option value="Điện gia dụng">⚡ Điện gia dụng</option>
                  <option value="Phòng khách">🛋️ Phòng khách</option>
                  <option value="Phòng ngủ">🛏️ Phòng ngủ</option>
                  <option value="Phòng tắm">🚿 Phòng tắm</option>
                  <option value="Ngoài trời">🌳 Ngoài trời</option>
                </select>
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Thương hiệu
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#8B7355] transition"
                  placeholder="VD: Homely, Philips, Samsung..."
                />
              </div>
            </div>
          </div>

          {/* Additional Options Section */}
          <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-[#8B7355]" />
              <h2 className="text-xl font-bold text-white">Tùy chọn</h2>
            </div>

            <div className="flex items-start gap-4 p-4 bg-[#1a1a1a] rounded-lg border border-gray-700">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="w-5 h-5 mt-0.5 rounded border-gray-700 bg-[#1a1a1a] text-[#8B7355] focus:ring-[#8B7355] focus:ring-offset-0"
              />
              <label htmlFor="featured" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-medium">Sản phẩm nổi bật</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Sản phẩm sẽ được hiển thị ưu tiên trên trang chủ và các danh mục
                </p>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 sticky bottom-4 bg-[#1a1a1a] p-4 rounded-xl border border-gray-700 shadow-xl">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#8B7355] hover:bg-[#6d5a43] text-white h-12 text-base font-bold disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  {isEdit ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={() => navigate('/admin/products')}
              variant="outline"
              className="bg-[#2a2a2a] border-gray-700 text-gray-400 hover:bg-[#3a3a3a] hover:text-white h-12 px-8"
            >
              Hủy
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}