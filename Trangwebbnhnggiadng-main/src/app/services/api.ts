// Mock API Service Layer - Ready for Python Backend Integration
// Replace these functions with actual fetch calls to Flask/Django backend

import type { 
  User, 
  Product, 
  Order, 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  ApiResponse,
  OrderStatus,
  ProductReview
} from '../types';

// Mock delay để giả lập API call
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Base URL cho backend Python (Flask/Django)
const API_BASE_URL = import.meta.env.VITE_API_URL;

// ============= AUTH API =============

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await mockDelay();
    
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/auth/login`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(credentials)
    // });
    // return await response.json();

    // Mock implementation
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((u: any) => u.email === credentials.email);
    
    if (userIndex === -1) {
      return { success: false, message: 'Email hoặc mật khẩu không đúng' };
    }

    const user = users[userIndex];

    // Kiểm tra tài khoản bị khóa
    if (user.isLocked) {
      return { success: false, message: 'Tài khoản đã bị khóa do đăng nhập sai quá nhiều lần. Vui lòng liên hệ admin.' };
    }

    // Kiểm tra mật khẩu
    if (user.password === credentials.password) {
      // Đăng nhập thành công - reset failed attempts
      users[userIndex].failedLoginAttempts = 0;
      localStorage.setItem('users', JSON.stringify(users));
      
      const { password, ...userWithoutPassword } = user;
      localStorage.setItem('currentUser', JSON.stringify({ ...userWithoutPassword, failedLoginAttempts: 0 }));
      return { success: true, user: { ...userWithoutPassword, failedLoginAttempts: 0 }, token: 'mock-jwt-token' };
    }
    
    // Đăng nhập sai - tăng failed attempts
    users[userIndex].failedLoginAttempts = (users[userIndex].failedLoginAttempts || 0) + 1;
    
    // Khóa tài khoản nếu sai >= 5 lần
    if (users[userIndex].failedLoginAttempts >= 5) {
      users[userIndex].isLocked = true;
      localStorage.setItem('users', JSON.stringify(users));
      return { success: false, message: 'Tài khoản đã bị khóa do đăng nhập sai 5 lần. Vui lòng liên hệ admin.' };
    }
    
    localStorage.setItem('users', JSON.stringify(users));
    const remainingAttempts = 5 - users[userIndex].failedLoginAttempts;
    return { 
      success: false, 
      message: `Email hoặc mật khẩu không đúng. Còn ${remainingAttempts} lần thử.` 
    };
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    await mockDelay();
    
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/auth/register`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // });
    // return await response.json();

    // Mock implementation
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.find((u: any) => u.email === data.email)) {
      return { success: false, message: 'Email đã được sử dụng' };
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: data.email,
      name: data.name,
      role: 'user',
      phone: data.phone,
      createdAt: new Date().toISOString(),
    };

    users.push({ ...newUser, password: data.password });
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    return { success: true, user: newUser, token: 'mock-jwt-token' };
  },

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    await mockDelay();
    
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email })
    // });
    // return await response.json();

    // Mock implementation - kiểm tra email có tồn tại không
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
    
    if (userIndex === -1) {
      return { 
        success: false, 
        error: 'Email không tồn tại trong hệ thống' 
      };
    }

    // Tạo mật khẩu mới ngẫu nhiên
    const newPassword = Math.random().toString(36).slice(-8);
    
    // Cập nhật mật khẩu mới cho user
    users[userIndex].password = newPassword;
    
    // Reset failed login attempts và unlock account
    users[userIndex].failedLoginAttempts = 0;
    users[userIndex].isLocked = false;
    
    localStorage.setItem('users', JSON.stringify(users));
    
    // Mock gửi email - trong thực tế sẽ gọi API backend
    console.log(`
═══════════════════════════════════════════════
📧 EMAIL KHÔI PHỤC MẬT KHẨU
════════════════════════════���═════════════════
Gửi đến: ${email}
Chủ đề: Khôi phục mật khẩu - Homely

Xin chào ${users[userIndex].name},

Bạn đã yêu cầu khôi phục mật khẩu tài khoản Homely.

Mật khẩu mới của bạn là: ${newPassword}

Vui lòng đăng nhập và đổi mật khẩu ngay sau khi nhận được email này.

Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.

Trân trọng,
Đội ngũ Homely
═══════════════════════════════════════════════
    `);
    
    // Hiển thị toast cho demo (trong production sẽ xóa)
    setTimeout(() => {
      alert(`🎉 DEMO: Mật khẩu mới đã được gửi!\n\nEmail: ${email}\nMật khẩu mới: ${newPassword}\n\n(Trong production, mật khẩu sẽ được gửi qua email thật)`);
    }, 1500);
    
    return { 
      success: true, 
      message: 'Mật khẩu mới đã được gửi đến email của bạn' 
    };
  },

  logout() {
    localStorage.removeItem('currentUser');
  }
};

// ============= PRODUCTS API =============

export const productsApi = {
  async getAll(params?: { search?: string; category?: string; minPrice?: number; maxPrice?: number }): Promise<ApiResponse<Product[]>> {
    await mockDelay();
    
    // TODO: Replace with actual API call
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    let filtered = [...products];

    if (params?.search) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(params.search!.toLowerCase()));
    }
    if (params?.category) {
      filtered = filtered.filter(p => p.category === params.category);
    }
    if (params?.minPrice) {
      filtered = filtered.filter(p => p.price >= params.minPrice!);
    }
    if (params?.maxPrice) {
      filtered = filtered.filter(p => p.price <= params.maxPrice!);
    }

    return { success: true, data: filtered };
  },

  async getById(id: string): Promise<ApiResponse<Product>> {
    await mockDelay();
    
    // TODO: Replace with actual API call
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const product = products.find((p: Product) => p.id === id);
    
    if (product) {
      return { success: true, data: product };
    }
    return { success: false, error: 'Không tìm thấy sản phẩm' };
  },

  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Product>> {
    await mockDelay();
    
    // TODO: Replace with actual API call
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    
    return { success: true, data: newProduct };
  },

  async update(id: string, product: Partial<Product>): Promise<ApiResponse<Product>> {
    await mockDelay();
    
    // TODO: Replace with actual API call
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const index = products.findIndex((p: Product) => p.id === id);
    
    if (index === -1) {
      return { success: false, error: 'Không tìm thấy sản phẩm' };
    }
    
    products[index] = {
      ...products[index],
      ...product,
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem('products', JSON.stringify(products));
    return { success: true, data: products[index] };
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    await mockDelay();
    
    // TODO: Replace with actual API call
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const filtered = products.filter((p: Product) => p.id !== id);
    
    localStorage.setItem('products', JSON.stringify(filtered));
    return { success: true };
  },

  async uploadImage(file: File): Promise<ApiResponse<string>> {
    await mockDelay();
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'File phải là ảnh (jpg, png)' };
    }
    
    if (file.size > 2 * 1024 * 1024) {
      return { success: false, error: 'Dung lượng ảnh tối đa 2MB' };
    }
    
    // TODO: Replace with actual API call to upload image
    // const formData = new FormData();
    // formData.append('image', file);
    // const response = await fetch(`${API_BASE_URL}/products/upload-image`, {
    //   method: 'POST',
    //   body: formData
    // });
    // const result = await response.json();
    // return result;

    // Mock: Convert to base64 for demo
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({ success: true, data: reader.result as string });
      };
      reader.readAsDataURL(file);
    });
  }
};

// ============= ORDERS API =============

export const ordersApi = {
  async getAll(): Promise<ApiResponse<Order[]>> {
    await mockDelay();
    
    // TODO: Replace with actual API call
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    return { success: true, data: orders };
  },

  async getByUserId(userId: string): Promise<ApiResponse<Order[]>> {
    await mockDelay();
    
    // TODO: Replace with actual API call
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const userOrders = orders.filter((o: Order) => o.userId === userId);
    return { success: true, data: userOrders };
  },

  async getById(id: string): Promise<ApiResponse<Order>> {
    await mockDelay();
    
    // TODO: Replace with actual API call
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find((o: Order) => o.id === id);
    
    if (order) {
      return { success: true, data: order };
    }
    return { success: false, error: 'Không tìm thấy đơn hàng' };
  },

  async create(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<ApiResponse<Order>> {
    await mockDelay();
    
    // TODO: Replace with actual API call
    
    // Kiểm tra điều kiện tự động duyệt
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.id === orderData.userId);
    
    // Kiểm tra 1: Tài khoản không bị khóa
    if (user && user.isLocked) {
      return { 
        success: false, 
        error: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ admin.' 
      };
    }
    
    // Kiểm tra 2: Sản phẩm còn hàng
    for (const item of orderData.items) {
      const product = products.find((p: any) => p.id === item.productId);
      if (!product) {
        return { 
          success: false, 
          error: `Sản phẩm ${item.productName} không tồn tại` 
        };
      }
      if (product.stock < item.quantity) {
        return { 
          success: false, 
          error: `Sản phẩm ${item.productName} chỉ còn ${product.stock} sản phẩm trong kho` 
        };
      }
    }
    
    // Kiểm tra 3: Thông tin hợp lệ
    if (!orderData.phone || !orderData.shippingAddress) {
      return { 
        success: false, 
        error: 'Thông tin đơn hàng không hợp lệ' 
      };
    }
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');

    // Tự động duyệt đơn hàng thanh toán online, COD cần admin duyệt
    const isOnlinePayment = orderData.paymentMethod !== 'cod' &&
                           ((orderData as any).paymentStatus === 'completed' ||
                            orderData.paymentMethod === 'wallet' ||
                            ['vnpay', 'momo', 'stripe', 'paypal'].includes(orderData.paymentMethod || ''));

    const newOrder: Order = {
      ...orderData,
      id: Date.now().toString(),
      status: isOnlinePayment ? 'approved' : 'pending', // Online payment = approved, COD = pending
      paymentStatus: orderData.paymentMethod === 'cod' ? 'pending' : (orderData as any).paymentStatus || 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Trừ stock cho sản phẩm
    for (const item of orderData.items) {
      const productIndex = products.findIndex((p: any) => p.id === item.productId);
      if (productIndex !== -1) {
        products[productIndex].stock -= item.quantity;
      }
    }
    localStorage.setItem('products', JSON.stringify(products));
    
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    return { success: true, data: newOrder };
  },

  async updateStatus(id: string, status: OrderStatus): Promise<ApiResponse<Order>> {
    await mockDelay();
    
    // TODO: Replace with actual API call
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const index = orders.findIndex((o: Order) => o.id === id);
    
    if (index === -1) {
      return { success: false, error: 'Không tìm thấy đơn hàng' };
    }
    
    orders[index] = {
      ...orders[index],
      status: status,
      updatedAt: new Date().toISOString(),
    };
    
    // Nếu đơn hàng được đánh dấu là đã giao, cộng vào doanh thu
    if (status === 'delivered') {
      const revenue = JSON.parse(localStorage.getItem('revenue') || '0');
      localStorage.setItem('revenue', JSON.stringify(revenue + orders[index].total));
    }
    
    localStorage.setItem('orders', JSON.stringify(orders));
    return { success: true, data: orders[index] };
  }
};

// ============= USERS API (Admin only) =============

export const usersApi = {
  async getAll(): Promise<ApiResponse<User[]>> {
    await mockDelay();
    
    // TODO: Replace with actual API call
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const usersWithoutPassword = users.map((u: any) => {
      const { password, ...userWithoutPassword } = u;
      return userWithoutPassword;
    });
    return { success: true, data: usersWithoutPassword };
  },

  async updateProfile(userId: string, data: Partial<User>): Promise<ApiResponse<User>> {
    await mockDelay();
    
    // TODO: Replace with actual API call
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const index = users.findIndex((u: any) => u.id === userId);
    
    if (index === -1) {
      return { success: false, error: 'Không tìm thấy người dùng' };
    }
    
    // Update user data
    users[index] = {
      ...users[index],
      ...data,
    };
    localStorage.setItem('users', JSON.stringify(users));
    
    // Update currentUser if it's the logged in user
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const parsedCurrentUser = JSON.parse(currentUser);
      if (parsedCurrentUser.id === userId) {
        const { password, ...userWithoutPassword } = users[index];
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      }
    }
    
    const { password, ...userWithoutPassword } = users[index];
    return { success: true, data: userWithoutPassword };
  },

  async updateRole(userId: string, role: 'user' | 'admin'): Promise<ApiResponse<User>> {
    await mockDelay();
    
    // TODO: Replace with actual API call
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const index = users.findIndex((u: any) => u.id === userId);
    
    if (index === -1) {
      return { success: false, error: 'Không tìm thấy người dùng' };
    }
    
    users[index].role = role;
    localStorage.setItem('users', JSON.stringify(users));
    
    const { password, ...userWithoutPassword } = users[index];
    return { success: true, data: userWithoutPassword };
  },

  async delete(userId: string): Promise<ApiResponse<void>> {
    await mockDelay();
    
    // TODO: Replace with actual API call
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const filtered = users.filter((u: any) => u.id !== userId);
    
    localStorage.setItem('users', JSON.stringify(filtered));
    return { success: true };
  },

  async unlockAccount(userId: string): Promise<ApiResponse<User>> {
    await mockDelay();
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const index = users.findIndex((u: any) => u.id === userId);
    
    if (index === -1) {
      return { success: false, error: 'Không tìm thấy người dùng' };
    }
    
    users[index].isLocked = false;
    users[index].failedLoginAttempts = 0;
    localStorage.setItem('users', JSON.stringify(users));
    
    const { password, ...userWithoutPassword } = users[index];
    return { success: true, data: userWithoutPassword };
  }
};

// ============= REVIEWS API =============

export const reviewsApi = {
  async getAll(params?: { productId?: string; status?: 'pending' | 'approved' | 'rejected' }): Promise<ApiResponse<ProductReview[]>> {
    await mockDelay();
    
    const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    let filtered = [...reviews];

    if (params?.productId) {
      filtered = filtered.filter((r: ProductReview) => r.productId === params.productId);
    }
    if (params?.status) {
      filtered = filtered.filter((r: ProductReview) => r.status === params.status);
    }

    return { success: true, data: filtered };
  },

  async create(data: { orderId: string; productId: string; rating: number; comment: string }): Promise<ApiResponse<ProductReview>> {
    await mockDelay();

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    const products = JSON.parse(localStorage.getItem('products') || '[]');

    // Get product name
    const product = products.find((p: any) => p.id === data.productId);

    const newReview: ProductReview = {
      id: Date.now().toString(),
      orderId: data.orderId,
      productId: data.productId,
      productName: product?.name || 'Unknown Product',
      userId: currentUser.id,
      userName: currentUser.name,
      rating: data.rating,
      comment: data.comment,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    reviews.push(newReview);
    localStorage.setItem('reviews', JSON.stringify(reviews));

    // Update order status to 'awaiting_review' when first review is submitted
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const orderIndex = orders.findIndex((o: Order) => o.id === data.orderId);
    if (orderIndex !== -1 && orders[orderIndex].status === 'delivered') {
      orders[orderIndex].status = 'awaiting_review';
      orders[orderIndex].updatedAt = new Date().toISOString();
      localStorage.setItem('orders', JSON.stringify(orders));
    }

    return { success: true, data: newReview };
  },

  async updateStatus(reviewId: string, status: 'approved' | 'rejected'): Promise<ApiResponse<ProductReview>> {
    await mockDelay();
    
    const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    const index = reviews.findIndex((r: ProductReview) => r.id === reviewId);
    
    if (index === -1) {
      return { success: false, error: 'Không tìm thấy đánh giá' };
    }
    
    reviews[index].status = status;
    localStorage.setItem('reviews', JSON.stringify(reviews));
    
    // Nếu duyệt đánh giá, cập nhật trạng thái đơn hàng sang 'reviewed'
    if (status === 'approved') {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const orderIndex = orders.findIndex((o: Order) => o.id === reviews[index].orderId);
      if (orderIndex !== -1 && orders[orderIndex].status === 'awaiting_review') {
        orders[orderIndex].status = 'reviewed';
        orders[orderIndex].updatedAt = new Date().toISOString();
        localStorage.setItem('orders', JSON.stringify(orders));
      }
    }
    
    return { success: true, data: reviews[index] };
  },

  async delete(reviewId: string): Promise<ApiResponse<void>> {
    await mockDelay();
    
    const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    const filtered = reviews.filter((r: ProductReview) => r.id !== reviewId);
    
    localStorage.setItem('reviews', JSON.stringify(filtered));
    return { success: true };
  }
};