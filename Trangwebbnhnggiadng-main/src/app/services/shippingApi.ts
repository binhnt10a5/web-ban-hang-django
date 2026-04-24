// Shipping API Service - Integration with Third-party Shipping Providers
// Supports: GHN (Giao Hàng Nhanh), GHTK (Giao Hàng Tiết Kiệm), Viettel Post

import type { ApiResponse } from '../types';

export type ShippingProvider = 'ghn' | 'ghtk' | 'viettel';

export interface ShippingOption {
  id: string; // Thêm id để dễ select
  provider: ShippingProvider;
  providerName: string;
  serviceName: string;
  estimatedDelivery: string; // Đổi tên từ estimatedDays
  fee: number;
  description: string;
}

export interface ShippingOrder {
  id: string;
  orderId: string;
  provider: ShippingProvider;
  trackingNumber: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'failed';
  estimatedDelivery: string;
  actualDelivery?: string;
  currentLocation?: string;
  history: ShippingHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface ShippingHistory {
  timestamp: string;
  status: string;
  location: string;
  description: string;
}

export interface CreateShippingOrderData {
  orderId: string;
  provider: ShippingProvider;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverProvince: string;
  receiverDistrict: string;
  receiverWard: string;
  weight: number; // kg
  length: number; // cm
  width: number; // cm
  height: number; // cm
  codAmount?: number; // Số tiền thu hộ
  insuranceValue?: number; // Giá trị bảo hiểm
  note?: string;
}

const mockDelay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

// Mock các dịch vụ shipping
export const shippingProviders: ShippingOption[] = [
  {
    id: 'ghn-express',
    provider: 'ghn',
    providerName: 'Giao Hàng Nhanh',
    serviceName: 'Express',
    estimatedDelivery: '1-2 ngày',
    fee: 35000,
    description: 'Giao hàng nhanh chóng, ưu tiên trong nội thành',
  },
  {
    id: 'ghn-standard',
    provider: 'ghn',
    providerName: 'Giao Hàng Nhanh',
    serviceName: 'Standard',
    estimatedDelivery: '2-3 ngày',
    fee: 25000,
    description: 'Giao hàng tiêu chuẩn, giá cả hợp lý',
  },
  {
    id: 'ghtk-fast',
    provider: 'ghtk',
    providerName: 'Giao Hàng Tiết Kiệm',
    serviceName: 'Nhanh',
    estimatedDelivery: '2-3 ngày',
    fee: 22000,
    description: 'Tiết kiệm chi phí, giao hàng đáng tin cậy',
  },
  {
    id: 'viettel-viettelpost',
    provider: 'viettel',
    providerName: 'Viettel Post',
    serviceName: 'ViettelPost',
    estimatedDelivery: '2-4 ngày',
    fee: 20000,
    description: 'Mạng lưới rộng khắp, phù hợp cho ngoại thành',
  },
];

export const shippingApi = {
  /**
   * Lấy danh sách các dịch vụ vận chuyển khả dụng
   */
  async getShippingOptions(params: {
    fromProvince: string;
    toProvince: string;
    weight: number;
  }): Promise<ApiResponse<ShippingOption[]>> {
    await mockDelay();

    // TODO: Replace with actual API calls
      //GHN API: https://api.ghn.vn/home/docs/detail?id=67
     // GHTK API: https://docs.giaohangtietkiem.vn/
    //Viettel Post API: https://viettelpost.com.vn/
    
    // Mock: Tính phí dựa trên khoảng cách và trọng lượng
    const options = shippingProviders.map(option => ({
      ...option,
      fee: Math.round(option.fee + (params.weight * 5000)), // +5k mỗi kg
    }));

    return { success: true, data: options };
  },

  /**
   * Tạo đơn vận chuyển với bên thứ 3
   */
  async createShippingOrder(data: CreateShippingOrderData): Promise<ApiResponse<ShippingOrder>> {
    await mockDelay(1200);

    // TODO: Replace with actual API call to shipping provider
    // Ví dụ với GHN:
    // const response = await fetch('https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create', {
    //   method: 'POST',
    //   headers: {
    //     'Token': 'YOUR_GHN_TOKEN',
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     to_name: data.receiverName,
    //     to_phone: data.receiverPhone,
    //     to_address: data.receiverAddress,
    //     to_ward_code: data.receiverWard,
    //     to_district_id: data.receiverDistrict,
    //     weight: data.weight,
    //     length: data.length,
    //     width: data.width,
    //     height: data.height,
    //     service_type_id: 2, // Express or Standard
    //     payment_type_id: data.codAmount ? 2 : 1, // 1: Người gửi trả, 2: COD
    //     required_note: "KHONGCHOXEMHANG", // Không cho xem hàng
    //     cod_amount: data.codAmount || 0,
    //     insurance_value: data.insuranceValue || 0,
    //     note: data.note || ''
    //   })
    // });
    // const result = await response.json();

    // Mock implementation
    const trackingNumber = `${data.provider.toUpperCase()}${Date.now().toString().slice(-10)}`;
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 3); // +3 ngày

    const newShippingOrder: ShippingOrder = {
      id: Date.now().toString(),
      orderId: data.orderId,
      provider: data.provider,
      trackingNumber,
      status: 'pending',
      estimatedDelivery: estimatedDeliveryDate.toISOString(),
      currentLocation: 'Kho hàng - Đang chờ lấy hàng',
      history: [
        {
          timestamp: new Date().toISOString(),
          status: 'pending',
          location: 'Kho Homely Store - TP.HCM',
          description: 'Đơn hàng đã được tạo và chờ bên vận chuyển lấy hàng',
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Lưu vào localStorage
    const shippingOrders = JSON.parse(localStorage.getItem('shippingOrders') || '[]');
    shippingOrders.push(newShippingOrder);
    localStorage.setItem('shippingOrders', JSON.stringify(shippingOrders));

    return { success: true, data: newShippingOrder };
  },

  /**
   * Tracking đơn hàng vận chuyển
   */
  async trackShipping(trackingNumber: string): Promise<ApiResponse<ShippingOrder>> {
    await mockDelay();

    // TODO: Replace with actual API call
    // GHN: GET https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/detail
    // GHTK: GET https://services.giaohangtietkiem.vn/services/shipment/v2/{tracking_number}

    const shippingOrders = JSON.parse(localStorage.getItem('shippingOrders') || '[]');
    const order = shippingOrders.find((o: ShippingOrder) => o.trackingNumber === trackingNumber);

    if (order) {
      return { success: true, data: order };
    }

    return { success: false, error: 'Không tìm thấy đơn hàng vận chuyển' };
  },

  /**
   * Tracking theo Order ID
   */
  async trackByOrderId(orderId: string): Promise<ApiResponse<ShippingOrder>> {
    await mockDelay();

    const shippingOrders = JSON.parse(localStorage.getItem('shippingOrders') || '[]');
    const order = shippingOrders.find((o: ShippingOrder) => o.orderId === orderId);

    if (order) {
      return { success: true, data: order };
    }

    return { success: false, error: 'Chưa có thông tin vận chuyển cho đơn hàng này' };
  },

  /**
   * Cập nhật trạng thái vận chuyển (webhook từ bên vận chuyển)
   */
  async updateShippingStatus(
    trackingNumber: string,
    status: ShippingOrder['status'],
    location: string,
    description: string
  ): Promise<ApiResponse<ShippingOrder>> {
    await mockDelay();

    const shippingOrders = JSON.parse(localStorage.getItem('shippingOrders') || '[]');
    const index = shippingOrders.findIndex((o: ShippingOrder) => o.trackingNumber === trackingNumber);

    if (index === -1) {
      return { success: false, error: 'Không tìm thấy đơn hàng vận chuyển' };
    }

    // Cập nhật trạng thái
    shippingOrders[index].status = status;
    shippingOrders[index].currentLocation = location;
    shippingOrders[index].updatedAt = new Date().toISOString();

    // Thêm vào lịch sử
    shippingOrders[index].history.push({
      timestamp: new Date().toISOString(),
      status,
      location,
      description,
    });

    // Nếu giao thành công, cập nhật actualDelivery
    if (status === 'delivered') {
      shippingOrders[index].actualDelivery = new Date().toISOString();
    }

    localStorage.setItem('shippingOrders', JSON.stringify(shippingOrders));

    return { success: true, data: shippingOrders[index] };
  },

  /**
   * Hủy đơn vận chuyển
   */
  async cancelShipping(trackingNumber: string, reason: string): Promise<ApiResponse<void>> {
    await mockDelay();

    // TODO: Replace with actual API call
    const result = await this.updateShippingStatus(
      trackingNumber,
      'cancelled',
      'Đơn hàng đã hủy',
      `Hủy đơn: ${reason}`
    );

    if (result.success) {
      return { success: true };
    }

    return { success: false, error: 'Không thể hủy đơn hàng vận chuyển' };
  },

  /**
   * Tính phí vận chuyển
   */
  calculateShippingFee(params: {
    provider: ShippingProvider;
    fromProvince: string;
    toProvince: string;
    weight: number;
    codAmount?: number;
  }): number {
    // TODO: Call actual API to calculate fee
    // Mock calculation
    const baseOption = shippingProviders.find(o => o.provider === params.provider);
    if (!baseOption) return 25000;

    let fee = baseOption.fee;
    fee += params.weight * 5000; // +5k per kg
    
    // COD fee (1% of COD amount, min 5k)
    if (params.codAmount) {
      fee += Math.max(params.codAmount * 0.01, 5000);
    }

    // Xa hơn -> phí cao hơn (mock logic)
    if (params.fromProvince !== params.toProvince) {
      fee += 10000;
    }

    return Math.round(fee);
  },

  /**
   * Mock: Tự động cập nhật trạng thái đơn hàng theo thời gian (for demo)
   */
  async simulateShippingProgress(trackingNumber: string) {
    const statuses: Array<{
      status: ShippingOrder['status'];
      location: string;
      description: string;
      delayHours: number;
    }> = [
      {
        status: 'picked_up',
        location: 'Bưu cục gửi - TP.HCM',
        description: 'Đơn hàng đã được lấy từ người gửi',
        delayHours: 2,
      },
      {
        status: 'in_transit',
        location: 'Trung tâm phân loại - TP.HCM',
        description: 'Đơn hàng đang được phân loại',
        delayHours: 6,
      },
      {
        status: 'in_transit',
        location: 'Đang vận chuyển đến bưu cục đích',
        description: 'Đơn hàng đang trên đường giao',
        delayHours: 24,
      },
      {
        status: 'out_for_delivery',
        location: 'Bưu cục nhận - Địa chỉ người nhận',
        description: 'Đơn hàng đang được giao đến bạn',
        delayHours: 48,
      },
      {
        status: 'delivered',
        location: 'Đã giao hàng thành công',
        description: 'Đơn hàng đã được giao và ký nhận thành công',
        delayHours: 72,
      },
    ];

    // This would be called by a background job or webhook in production
    console.log(`Simulating shipping progress for ${trackingNumber}`);
  }
};