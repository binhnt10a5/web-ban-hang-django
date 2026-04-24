import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  comment: string;
  product: string;
  date: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    avatar: 'https://i.pravatar.cc/150?img=1',
    rating: 5,
    comment: 'Sản phẩm rất tuyệt vời, chất lượng vượt mong đợi. Giao hàng nhanh, đóng gói cẩn thận. Sẽ ủng hộ shop dài dài!',
    product: 'Ghế Sofa Hiện Đại',
    date: '2 ngày trước',
  },
  {
    id: '2',
    name: 'Trần Thị B',
    avatar: 'https://i.pravatar.cc/150?img=5',
    rating: 5,
    comment: 'Mình rất hài lòng với dịch vụ của shop. Nhân viên tư vấn nhiệt tình, sản phẩm đẹp y hình. Highly recommended!',
    product: 'Bàn Ăn Gỗ Sồi',
    date: '1 tuần trước',
  },
  {
    id: '3',
    name: 'Lê Văn C',
    avatar: 'https://i.pravatar.cc/150?img=3',
    rating: 5,
    comment: 'Chất lượng tốt, giá cả hợp lý. Đặc biệt là dịch vụ hậu mãi rất chu đáo. Cảm ơn shop!',
    product: 'Tủ Quần Áo',
    date: '3 ngày trước',
  },
  {
    id: '4',
    name: 'Phạm Thị D',
    avatar: 'https://i.pravatar.cc/150?img=9',
    rating: 4,
    comment: 'Sản phẩm đẹp, shipper thân thiện. Mình sẽ quay lại mua thêm sản phẩm khác!',
    product: 'Giường Ngủ',
    date: '5 ngày trước',
  },
  {
    id: '5',
    name: 'Hoàng Văn E',
    avatar: 'https://i.pravatar.cc/150?img=7',
    rating: 5,
    comment: 'Lần đầu mua online mà không hề thất vọng. Sản phẩm đúng mô tả, chất lượng tốt. 5 sao không cần bàn cãi!',
    product: 'Bàn Làm Việc',
    date: '4 ngày trước',
  },
];

export function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'start',
    slidesToScroll: 1,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Auto play
  useEffect(() => {
    if (!emblaApi) return;
    
    const autoplay = setInterval(() => {
      emblaApi.scrollNext();
    }, 4000);

    return () => clearInterval(autoplay);
  }, [emblaApi]);

  return (
    <div className="mb-12 bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] rounded-2xl p-8 border border-gray-700">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Khách hàng nói gì về chúng tôi</h2>
        <p className="text-gray-400">Hơn 10,000+ khách hàng hài lòng</p>
      </div>

      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-4">
                <div className="bg-[#2a2a2a] rounded-xl p-6 border border-gray-700 hover:border-[#8B7355] transition h-full">
                  {/* Quote Icon */}
                  <div className="flex justify-between items-start mb-4">
                    <Quote className="w-10 h-10 text-[#8B7355]/30" />
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < testimonial.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <p className="text-gray-300 mb-6 line-clamp-4 italic">
                    "{testimonial.comment}"
                  </p>

                  {/* Product */}
                  <p className="text-[#8B7355] text-sm mb-4">
                    Sản phẩm: {testimonial.product}
                  </p>

                  {/* User Info */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-700">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{testimonial.name}</h4>
                      <p className="text-gray-400 text-sm">{testimonial.date}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={scrollPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-[#8B7355] hover:bg-[#6d5a43] rounded-full flex items-center justify-center text-white transition shadow-lg hidden sm:flex"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={scrollNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-[#8B7355] hover:bg-[#6d5a43] rounded-full flex items-center justify-center text-white transition shadow-lg hidden sm:flex"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
