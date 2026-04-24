export interface Coupon {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  expiryDate?: Date;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
}

// Danh sách mã giảm giá mẫu
export const AVAILABLE_COUPONS: Coupon[] = [
  {
    code: 'WELCOME10',
    description: 'Giảm 10% cho đơn hàng đầu tiên (tối đa 100.000đ)',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 200000,
    maxDiscount: 100000,
    usedCount: 0,
    isActive: true,
  },
  {
    code: 'FREESHIP',
    description: 'Miễn phí vận chuyển cho đơn từ 300.000đ',
    discountType: 'fixed',
    discountValue: 30000,
    minOrderValue: 300000,
    usedCount: 0,
    isActive: true,
  },
  {
    code: 'NEWYEAR2024',
    description: 'Giảm 15% cho đơn từ 500.000đ (tối đa 200.000đ)',
    discountType: 'percentage',
    discountValue: 15,
    minOrderValue: 500000,
    maxDiscount: 200000,
    usedCount: 0,
    isActive: true,
  },
  {
    code: 'FLASH50',
    description: 'Giảm 50.000đ cho sản phẩm Flash Sale',
    discountType: 'fixed',
    discountValue: 50000,
    minOrderValue: 250000,
    usedCount: 0,
    isActive: true,
  },
  {
    code: 'VIP20',
    description: 'Giảm 20% cho thành viên VIP (tối đa 300.000đ)',
    discountType: 'percentage',
    discountValue: 20,
    minOrderValue: 1000000,
    maxDiscount: 300000,
    usedCount: 0,
    isActive: true,
  },
  {
    code: 'BDAY30',
    description: 'Giảm 30% trong tháng sinh nhật (tối đa 500.000đ)',
    discountType: 'percentage',
    discountValue: 30,
    minOrderValue: 500000,
    maxDiscount: 500000,
    usedCount: 0,
    isActive: true,
  },
];

class CouponService {
  private coupons: Coupon[] = AVAILABLE_COUPONS;

  // Lấy tất cả mã giảm giá còn hiệu lực
  getAvailableCoupons(): Coupon[] {
    return this.coupons.filter((coupon) => coupon.isActive);
  }

  // Kiểm tra mã giảm giá hợp lệ
  validateCoupon(code: string, orderTotal: number): { valid: boolean; message: string; coupon?: Coupon } {
    const coupon = this.coupons.find((c) => c.code.toUpperCase() === code.toUpperCase());

    if (!coupon) {
      return { valid: false, message: 'Mã giảm giá không tồn tại' };
    }

    if (!coupon.isActive) {
      return { valid: false, message: 'Mã giảm giá đã hết hiệu lực' };
    }

    if (coupon.minOrderValue && orderTotal < coupon.minOrderValue) {
      return {
        valid: false,
        message: `Đơn hàng tối thiểu ${coupon.minOrderValue.toLocaleString('vi-VN')}đ để sử dụng mã này`,
      };
    }

    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      return { valid: false, message: 'Mã giảm giá đã hết hạn' };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, message: 'Mã giảm giá đã đạt giới hạn sử dụng' };
    }

    return { valid: true, message: 'Mã giảm giá hợp lệ', coupon };
  }

  // Tính số tiền giảm giá
  calculateDiscount(coupon: Coupon, orderTotal: number): number {
    if (coupon.discountType === 'percentage') {
      const discount = (orderTotal * coupon.discountValue) / 100;
      return coupon.maxDiscount ? Math.min(discount, coupon.maxDiscount) : discount;
    } else {
      return coupon.discountValue;
    }
  }

  // Áp dụng mã giảm giá
  applyCoupon(code: string, orderTotal: number): { success: boolean; discount: number; message: string } {
    const validation = this.validateCoupon(code, orderTotal);

    if (!validation.valid || !validation.coupon) {
      return { success: false, discount: 0, message: validation.message };
    }

    const discount = this.calculateDiscount(validation.coupon, orderTotal);
    return {
      success: true,
      discount,
      message: `Áp dụng mã thành công! Giảm ${discount.toLocaleString('vi-VN')}đ`,
    };
  }

  // Đánh dấu mã đã sử dụng
  useCoupon(code: string): void {
    const coupon = this.coupons.find((c) => c.code.toUpperCase() === code.toUpperCase());
    if (coupon) {
      coupon.usedCount++;
    }
  }
}

export const couponService = new CouponService();
