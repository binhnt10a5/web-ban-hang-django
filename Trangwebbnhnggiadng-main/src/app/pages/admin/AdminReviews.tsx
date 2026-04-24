import { useState, useEffect } from 'react';
import { Star, Check, X, Trash2, Eye } from 'lucide-react';
import { reviewsApi } from '../../services/api';
import type { ProductReview } from '../../types';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

export function AdminReviews() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    loadReviews();
  }, [filter]);

  const loadReviews = async () => {
    try {
      const params = filter === 'all' ? {} : { status: filter as 'pending' | 'approved' | 'rejected' };
      const result = await reviewsApi.getAll(params);
      if (result.success && result.data) {
        setReviews(result.data.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      }
    } catch (error) {
      toast.error('Lỗi khi tải đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: string) => {
    try {
      const result = await reviewsApi.updateStatus(reviewId, 'approved');
      if (result.success) {
        toast.success('Đã duyệt đánh giá');
        loadReviews();
      }
    } catch (error) {
      toast.error('Lỗi khi duyệt đánh giá');
    }
  };

  const handleReject = async (reviewId: string) => {
    try {
      const result = await reviewsApi.updateStatus(reviewId, 'rejected');
      if (result.success) {
        toast.success('Đã từ chối đánh giá');
        loadReviews();
      }
    } catch (error) {
      toast.error('Lỗi khi từ chối đánh giá');
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;

    try {
      const result = await reviewsApi.delete(reviewId);
      if (result.success) {
        toast.success('Đã xóa đánh giá');
        loadReviews();
      }
    } catch (error) {
      toast.error('Lỗi khi xóa đánh giá');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      approved: 'bg-green-500/20 text-green-400 border-green-500/50',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/50',
    };

    const labels = {
      pending: 'Chờ duyệt',
      approved: 'Đã duyệt',
      rejected: 'Từ chối',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const pendingCount = reviews.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Quản lý đánh giá</h1>
          <p className="text-gray-400">
            Duyệt và quản lý đánh giá từ khách hàng
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-700">
          {[
            { key: 'pending', label: 'Chờ duyệt', count: pendingCount },
            { key: 'approved', label: 'Đã duyệt', count: reviews.filter(r => r.status === 'approved').length },
            { key: 'rejected', label: 'Từ chối', count: reviews.filter(r => r.status === 'rejected').length },
            { key: 'all', label: 'Tất cả', count: reviews.length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-4 py-2 font-medium transition relative ${
                filter === key
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  filter === key ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Đang tải...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-[#2a2a2a] rounded-lg p-12 text-center">
            <Star className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Không có đánh giá nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-[#2a2a2a] rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-white font-semibold">{review.userName}</p>
                      {getStatusBadge(review.status)}
                    </div>
                    <p className="text-gray-400 text-sm">
                      {new Date(review.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < review.rating
                            ? 'fill-yellow-500 text-yellow-500'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-300">{review.comment}</p>
                </div>

                <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                  <div className="text-sm text-gray-400">
                    <span>Đơn hàng: #{review.orderId}</span>
                    <span className="mx-2">•</span>
                    <span>Sản phẩm: {review.productName}</span>
                  </div>

                  <div className="flex gap-2">
                    {review.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(review.id)}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Duyệt
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleReject(review.id)}
                          variant="outline"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Từ chối
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleDelete(review.id)}
                      variant="outline"
                      className="border-gray-600 text-gray-400 hover:bg-gray-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}