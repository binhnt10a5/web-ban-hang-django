import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, TrendingUp, Truck, Star } from 'lucide-react';
import { Link } from 'react-router';
import useEmblaCarousel from 'embla-carousel-react';

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  cta: string;
  ctaLink: string;
  badge?: string;
  badgeColor?: string;
}

const slides: HeroSlide[] = [
  {
    id: '1',
    title: 'Bộ Sưu Tập Mới 2026',
    subtitle: 'Nội Thất Cao Cấp',
    description: 'Mang đến sự sang trọng và tiện nghi tối ưu cho không gian sống của bạn',
    image: 'https://images.unsplash.com/photo-1639663742190-1b3dba2eebcf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBtb2Rlcm4lMjBsaXZpbmclMjByb29tJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzczMDY1NzY2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    cta: 'Khám Phá Ngay',
    ctaLink: '/products',
    badge: 'Mới',
    badgeColor: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
  },
  {
    id: '2',
    title: 'Flash Sale Hôm Nay',
    subtitle: 'Giảm Giá Lên Đến 50%',
    description: 'Cơ hội vàng để sở hữu sản phẩm yêu thích với giá ưu đãi không thể bỏ lỡ',
    image: 'https://images.unsplash.com/photo-1762856490803-8e200418973a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwaG9tZSUyMGZ1cm5pdHVyZSUyMGJlZHJvb218ZW58MXx8fHwxNzczMDY1NzY2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    cta: 'Mua Ngay',
    ctaLink: '/products?discount=true',
    badge: 'Hot Deal',
    badgeColor: 'bg-gradient-to-r from-red-500 to-pink-500',
  },
  {
    id: '3',
    title: 'Miễn Phí Vận Chuyển',
    subtitle: 'Toàn Quốc',
    description: 'Áp dụng cho đơn hàng từ 500.000đ - Giao hàng nhanh chóng, an toàn',
    image: 'https://images.unsplash.com/photo-1680210849773-f97a41c6b7ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjBraXRjaGVuJTIwZGVzaWdufGVufDF8fHx8MTc3MzA2Mzg4N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    cta: 'Xem Sản Phẩm',
    ctaLink: '/products',
    badge: 'Free Ship',
    badgeColor: 'bg-gradient-to-r from-green-500 to-emerald-500',
  },
];

export function HeroSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  // Auto play
  useEffect(() => {
    if (!emblaApi) return;
    
    const autoplay = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);

    return () => clearInterval(autoplay);
  }, [emblaApi]);

  return (
    <div className="relative mb-16 rounded-3xl overflow-hidden shadow-2xl">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => (
            <div key={slide.id} className="flex-[0_0_100%] min-w-0">
              <div className="relative h-[600px] overflow-hidden">
                {/* Background Image with Parallax Effect */}
                <div
                  className="absolute inset-0 bg-cover bg-center transform scale-110 transition-transform duration-700"
                  style={{
                    backgroundImage: `url(${slide.image})`,
                    transform: index === selectedIndex ? 'scale(100%)' : 'scale(110%)',
                  }}
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B7355]/20 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                </div>

                {/* Content */}
                <div className="container mx-auto px-4 h-full flex items-center relative z-10">
                  <div className="max-w-3xl">
                    {/* Badge */}
                    {slide.badge && (
                      <div className={`inline-flex items-center gap-2 ${slide.badgeColor} text-white px-5 py-2 rounded-full font-bold text-sm mb-6 shadow-lg animate-pulse`}>
                        <Sparkles className="w-4 h-4" />
                        {slide.badge}
                      </div>
                    )}

                    {/* Subtitle */}
                    <p className="text-[#8B7355] mb-3 font-semibold text-lg tracking-wide uppercase">
                      {slide.subtitle}
                    </p>

                    {/* Title */}
                    <h1 className="text-7xl font-bold mb-6 text-white leading-tight">
                      {slide.title}
                    </h1>

                    {/* Description */}
                    <p className="text-2xl mb-8 text-gray-200 leading-relaxed max-w-2xl">
                      {slide.description}
                    </p>

                    {/* CTA Button */}
                    <Link to={slide.ctaLink}>
                      <button className="group relative px-10 py-5 bg-gradient-to-r from-[#8B7355] to-[#6d5a43] text-white rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-[#8B7355]/50 transition-all duration-300 transform hover:scale-105 overflow-hidden">
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                        
                        <span className="relative flex items-center gap-2">
                          {slide.cta}
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </button>
                    </Link>
                  </div>
                </div>

                {/* Bottom Features */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-20 pb-8">
                  <div className="container mx-auto px-4">
                    <div className="grid grid-cols-3 gap-8 max-w-3xl">
                      <div className="flex items-center gap-3 text-white/90">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                          <Star className="w-6 h-6 text-yellow-400" />
                        </div>
                        <div>
                          <p className="font-bold">Chất Lượng</p>
                          <p className="text-sm text-white/70">Đảm bảo 100%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-white/90">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                          <Truck className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                          <p className="font-bold">Giao Nhanh</p>
                          <p className="text-sm text-white/70">Toàn quốc</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-white/90">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                          <TrendingUp className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <p className="font-bold">Ưu Đãi</p>
                          <p className="text-sm text-white/70">Hấp dẫn</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows - Enhanced */}
      <button
        onClick={scrollPrev}
        className="absolute left-8 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all duration-300 border border-white/20 hover:border-white/40 group shadow-xl hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-7 h-7 group-hover:-translate-x-0.5 transition-transform" />
      </button>

      <button
        onClick={scrollNext}
        className="absolute right-8 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all duration-300 border border-white/20 hover:border-white/40 group shadow-xl hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight className="w-7 h-7 group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Dots - Enhanced */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`rounded-full transition-all duration-300 ${
              index === selectedIndex
                ? 'w-12 h-3 bg-white shadow-lg'
                : 'w-3 h-3 bg-white/40 hover:bg-white/60 hover:scale-125'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute top-8 right-8 z-20 bg-white/10 backdrop-blur-md rounded-full px-5 py-2.5 text-white font-bold border border-white/20 shadow-xl">
        <span className="text-2xl">{selectedIndex + 1}</span>
        <span className="text-white/60 text-sm"> / {slides.length}</span>
      </div>
    </div>
  );
}
