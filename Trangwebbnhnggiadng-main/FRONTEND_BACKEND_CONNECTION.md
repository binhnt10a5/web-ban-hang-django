# Hướng dẫn Kết nối Frontend React với Backend Django

> **Hướng dẫn từng bước để kết nối Frontend hiện tại với Django Backend**

---

## 🎯 Tổng quan

Tài liệu này hướng dẫn bạn cách:
1. Cập nhật file `/src/app/services/api.ts` để gọi real API thay vì mock
2. Xử lý authentication tokens
3. Handle errors và loading states
4. Test kết nối

---

## 1. Cập nhật Environment Variables

### Tạo file `.env` trong thư mục root của frontend:

```env
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_FRONTEND_URL=http://localhost:3000
```

### Cho production:

```env
REACT_APP_API_URL=https://api.homelystore.vn/api/v1
REACT_APP_FRONTEND_URL=https://homelystore.vn
```

---

## 2. Cập nhật `/src/app/services/api.ts`

### 2.1 Base Configuration

```typescript
// Mock API Service Layer - Ready for Python Backend Integration
// Replace these functions with actual fetch calls to Django backend

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

// ================== CONFIGURATION ==================

// Base URL cho backend Django
const API_BASE_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  return user.token || null;
};

// Helper: Create headers with auth token
const createHeaders = (includeAuth: boolean = true, contentType: string = 'application/json'): HeadersInit => {
  const headers: HeadersInit = {};
  
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Helper: Handle API errors
const handleApiError = async (response: Response): Promise<any> => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      success: false,
      error: `HTTP Error: ${response.status}`
    }));
    throw error;
  }
  return response.json();
};

// ================== AUTH API ==================

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: createHeaders(false),
        body: JSON.stringify(credentials)
      });
      
      const data = await handleApiError(response);
      
      if (data.success) {
        // Lưu token và user info vào localStorage
        localStorage.setItem('currentUser', JSON.stringify({
          ...data.data.user,
          token: data.data.access_token,
          refreshToken: data.data.refresh_token
        }));
      }
      
      return data;
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.error || 'Đăng nhập thất bại'
      };
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: createHeaders(false),
        body: JSON.stringify(data)
      });
      
      const result = await handleApiError(response);
      
      if (result.success) {
        // Lưu token và user info
        localStorage.setItem('currentUser', JSON.stringify({
          ...result.data.user,
          token: result.data.access_token,
          refreshToken: result.data.refresh_token
        }));
      }
      
      return result;
    } catch (error: any) {
      console.error('Register error:', error);
      return {
        success: false,
        message: error.error || 'Đăng ký thất bại'
      };
    }
  },

  async forgotPassword(email: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: createHeaders(false),
        body: JSON.stringify({ email })
      });
      
      return await handleApiError(response);
    } catch (error: any) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: error.error || 'Gửi email thất bại'
      };
    }
  },

  async logout(): Promise<ApiResponse> {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      if (user.refreshToken) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: createHeaders(true),
          body: JSON.stringify({ refresh_token: user.refreshToken })
        });
      }
      
      localStorage.removeItem('currentUser');
      return { success: true, message: 'Đăng xuất thành công' };
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('currentUser');
      return { success: true, message: 'Đăng xuất thành công' };
    }
  },

  async refreshToken(): Promise<string | null> {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      if (!user.refreshToken) {
        return null;
      }
      
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: createHeaders(false),
        body: JSON.stringify({ refresh: user.refreshToken })
      });
      
      const data = await handleApiError(response);
      
      if (data.success && data.data.access_token) {
        user.token = data.data.access_token;
        localStorage.setItem('currentUser', JSON.stringify(user));
        return data.data.access_token;
      }
      
      return null;
    } catch (error) {
      console.error('Refresh token error:', error);
      return null;
    }
  }
};

// ================== PRODUCTS API ==================

export const productsApi = {
  async getAll(params?: {
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    featured?: boolean;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse> {
    try {
      const queryString = params 
        ? '?' + new URLSearchParams(
            Object.entries(params).reduce((acc, [key, value]) => {
              if (value !== undefined && value !== null) {
                acc[key] = String(value);
              }
              return acc;
            }, {} as Record<string, string>)
          ).toString()
        : '';
      
      const response = await fetch(`${API_BASE_URL}/products/${queryString}`, {
        headers: createHeaders(false, '')
      });
      
      return await handleApiError(response);
    } catch (error: any) {
      console.error('Get products error:', error);
      return {
        success: false,
        error: error.error || 'Lấy danh sách sản phẩm thất bại'
      };
    }
  },

  async getById(id: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}/`, {
        headers: createHeaders(false, '')
      });
      
      return await handleApiError(response);
    } catch (error: any) {
      console.error('Get product error:', error);
      return {
        success: false,
        error: error.error || 'Lấy thông tin sản phẩm thất bại'
      };
    }
  },

  async create(productData: FormData): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: productData // FormData tự động set Content-Type
      });
      
      return await handleApiError(response);
    } catch (error: any) {
      console.error('Create product error:', error);
      return {
        success: false,
        error: error.error || 'Tạo sản phẩm thất bại'
      };
    }
  },

  async update(id: string, productData: FormData): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: productData
      });
      
      return await handleApiError(response);
    } catch (error: any) {
      console.error('Update product error:', error);
      return {
        success: false,
        error: error.error || 'Cập nhật sản phẩm thất bại'
      };
    }
  },

  async delete(id: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}/`, {
        method: 'DELETE',
        headers: createHeaders(true, '')
      });
      
      return await handleApiError(response);
    } catch (error: any) {
      console.error('Delete product error:', error);
      return {
        success: false,
        error: error.error || 'Xóa sản phẩm thất bại'
      };
    }
  }
};

// ================== ORDERS API ==================

export const ordersApi = {
  async create(orderData: {
    userId?: string;
    userName: string;
    userEmail: string;
    items: Array<{
      productId: string;
      productName: string;
      productImage: string;
      quantity: number;
      price: number;
    }>;
    total: number;
    paymentMethod: string;
    walletDiscount?: number;
    shippingAddress: string;
    phone: string;
    notes?: string;
  }): Promise<ApiResponse> {
    try {
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/orders/`, {
        method: 'POST',
        headers: createHeaders(!!token),
        body: JSON.stringify({
          user_id: orderData.userId,
          user_name: orderData.userName,
          user_email: orderData.userEmail,
          items: orderData.items.map(item => ({
            product_id: item.productId,
            product_name: item.productName,
            product_image: item.productImage,
            quantity: item.quantity,
            price: item.price
          })),
          total: orderData.total,
          payment_method: orderData.paymentMethod,
          wallet_discount: orderData.walletDiscount || 0,
          shipping_address: orderData.shippingAddress,
          phone: orderData.phone,
          notes: orderData.notes || ''
        })
      });
      
      return await handleApiError(response);
    } catch (error: any) {
      console.error('Create order error:', error);
      return {
        success: false,
        error: error.error || 'Đặt hàng thất bại'
      };
    }
  },

  async getMyOrders(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/my_orders/`, {
        headers: createHeaders(true, '')
      });
      
      return await handleApiError(response);
    } catch (error: any) {
      console.error('Get my orders error:', error);
      return {
        success: false,
        error: error.error || 'Lấy danh sách đơn hàng thất bại'
      };
    }
  },

  async getAll(params?: {
    status?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse> {
    try {
      const queryString = params 
        ? '?' + new URLSearchParams(
            Object.entries(params).reduce((acc, [key, value]) => {
              if (value !== undefined && value !== null) {
                acc[key] = String(value);
              }
              return acc;
            }, {} as Record<string, string>)
          ).toString()
        : '';
      
      const response = await fetch(`${API_BASE_URL}/orders/${queryString}`, {
        headers: createHeaders(true, '')
      });
      
      return await handleApiError(response);
    } catch (error: any) {
      console.error('Get all orders error:', error);
      return {
        success: false,
        error: error.error || 'Lấy danh sách đơn hàng thất bại'
      };
    }
  },

  async updateStatus(id: string, status: OrderStatus): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${id}/update_status/`, {
        method: 'PATCH',
        headers: createHeaders(true),
        body: JSON.stringify({ status })
      });
      
      return await handleApiError(response);
    } catch (error: any) {
      console.error('Update order status error:', error);
      return {
        success: false,
        error: error.error || 'Cập nhật trạng thái thất bại'
      };
    }
  },

  async cancel(id: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${id}/cancel/`, {
        method: 'PATCH',
        headers: createHeaders(true, '')
      });
      
      return await handleApiError(response);
    } catch (error: any) {
      console.error('Cancel order error:', error);
      return {
        success: false,
        error: error.error || 'Hủy đơn hàng thất bại'
      };
    }
  }
};

// ================== WALLET API ==================

export const walletApi = {
  async getBalance(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/wallet/balance/`, {
        headers: createHeaders(true, '')
      });
      
      return await handleApiError(response);
    } catch (error: any) {
      console.error('Get balance error:', error);
      return {
        success: false,
        error: error.error || 'Lấy số dư thất bại'
      };
    }
  },

  async getTransactions(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/wallet/transactions/`, {
        headers: createHeaders(true, '')
      });
      
      return await handleApiError(response);
    } catch (error: any) {
      console.error('Get transactions error:', error);
      return {
        success: false,
        error: error.error || 'Lấy lịch sử giao dịch thất bại'
      };
    }
  },

  async deposit(amount: number, paymentMethod: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/wallet/deposit/`, {
        method: 'POST',
        headers: createHeaders(true),
        body: JSON.stringify({ 
          amount, 
          payment_method: paymentMethod 
        })
      });
      
      return await handleApiError(response);
    } catch (error: any) {
      console.error('Deposit error:', error);
      return {
        success: false,
        error: error.error || 'Nạp tiền thất bại'
      };
    }
  },

  async withdraw(data: {
    amount: number;
    bankName: string;
    bankAccount: string;
    bankOwner: string;
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/wallet/withdraw/`, {
        method: 'POST',
        headers: createHeaders(true),
        body: JSON.stringify({
          amount: data.amount,
          bank_name: data.bankName,
          bank_account: data.bankAccount,
          bank_owner: data.bankOwner
        })
      });
      
      return await handleApiError(response);
    } catch (error: any) {
      console.error('Withdraw error:', error);
      return {
        success: false,
        error: error.error || 'Rút tiền thất bại'
      };
    }
  }
};

// ================== USERS API ==================

export const usersApi = {
  async getAll(params?: {
    role?: string;
    search?: string;
    isLocked?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse> {
    try {
      const queryString = params 
        ? '?' + new URLSearchParams(
            Object.entries(params).reduce((acc, [key, value]) => {
              if (value !== undefined && value !== null) {
                acc[key] = String(value);
              }
              return acc;
            }, {} as Record<string, string>)
          ).toString()
        : '';
      
      const response = await fetch(`${API_BASE_URL}/users/${queryString}`, {
        headers: createHeaders(true, '')
      });
      
      return await handleApiError(response);
    } catch (error: any) {
      console.error('Get users error:', error);
      return {
        success: false,
        error: error.error || 'Lấy danh sách người dùng thất bại'
      };
    }
  },

  async getProfile(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile/`, {
        headers: createHeaders(true, '')
      });
      
      return await handleApiError(response);
    } catch (error: any) {
      console.error('Get profile error:', error);
      return {
        success: false,
        error: error.error || 'Lấy thông tin cá nhân thất bại'
      };
    }
  },

  async updateProfile(data: {
    name?: string;
    phone?: string;
    address?: string;
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile/`, {
        method: 'PUT',
        headers: createHeaders(true),
        body: JSON.stringify(data)
      });
      
      return await handleApiError(response);
    } catch (error: any) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: error.error || 'Cập nhật thông tin thất bại'
      };
    }
  },

  async lockUser(userId: string, isLocked: boolean): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/lock/`, {
        method: 'PATCH',
        headers: createHeaders(true),
        body: JSON.stringify({ is_locked: isLocked })
      });
      
      return await handleApiError(response);
    } catch (error: any) {
      console.error('Lock user error:', error);
      return {
        success: false,
        error: error.error || 'Cập nhật trạng thái thất bại'
      };
    }
  }
};

// ================== REVIEWS API ==================

export const reviewsApi = {
  async create(data: {
    orderId: string;
    productId: string;
    rating: number;
    comment: string;
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/`, {
        method: 'POST',
        headers: createHeaders(true),
        body: JSON.stringify({
          order_id: data.orderId,
          product_id: data.productId,
          rating: data.rating,
          comment: data.comment
        })
      });
      
      return await handleApiError(response);
    } catch (error: any) {
      console.error('Create review error:', error);
      return {
        success: false,
        error: error.error || 'Tạo đánh giá thất bại'
      };
    }
  },

  async getProductReviews(productId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/product/${productId}/`, {
        headers: createHeaders(false, '')
      });
      
      return await handleApiError(response);
    } catch (error: any) {
      console.error('Get reviews error:', error);
      return {
        success: false,
        error: error.error || 'Lấy đánh giá thất bại'
      };
    }
  }
};

// Export all APIs
export default {
  auth: authApi,
  products: productsApi,
  orders: ordersApi,
  wallet: walletApi,
  users: usersApi,
  reviews: reviewsApi
};
```

---

## 3. Testing Connection

### 3.1 Test trong Browser Console

```javascript
// Test login
fetch('http://localhost:8000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'password123'
  })
})
.then(res => res.json())
.then(data => console.log(data))

// Test get products
fetch('http://localhost:8000/api/v1/products/')
  .then(res => res.json())
  .then(data => console.log(data))
```

### 3.2 Kiểm tra CORS

Nếu gặp lỗi CORS, kiểm tra:
1. `CORS_ALLOWED_ORIGINS` trong Django settings
2. Backend đang chạy: `python manage.py runserver`
3. Frontend đang chạy đúng port

---

## 4. Handle Loading & Errors

### 4.1 Update AuthContext để handle token expiry

File: `/src/app/contexts/AuthContext.tsx`

```typescript
// Thêm logic auto refresh token
useEffect(() => {
  const checkTokenExpiry = async () => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (user.token) {
      // Decode JWT để check expiry (optional)
      // Hoặc cứ mỗi 20 phút thì refresh
      const newToken = await authApi.refreshToken();
      if (!newToken) {
        // Token expired, logout
        await authApi.logout();
        setUser(null);
      }
    }
  };

  const interval = setInterval(checkTokenExpiry, 20 * 60 * 1000); // 20 minutes
  return () => clearInterval(interval);
}, []);
```

---

## 5. Update các Component để handle API responses

### Example: ProductList Component

```typescript
// Cũ (mock):
const products = mockData;

// Mới (real API):
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchProducts = async () => {
    setLoading(true);
    const response = await productsApi.getAll({
      category: selectedCategory,
      page: currentPage
    });
    
    if (response.success) {
      setProducts(response.data.products);
    } else {
      setError(response.error);
    }
    setLoading(false);
  };

  fetchProducts();
}, [selectedCategory, currentPage]);
```

---

## 6. Checklist

### Backend:
- [ ] Django server đang chạy: `python manage.py runserver`
- [ ] Database đã migrate: `python manage.py migrate`
- [ ] CORS configured correctly
- [ ] Admin user created: `python manage.py createsuperuser`

### Frontend:
- [ ] `.env` file created với `REACT_APP_API_URL`
- [ ] `/src/app/services/api.ts` updated với real API calls
- [ ] Components updated để handle loading/errors
- [ ] AuthContext handles token refresh

### Testing:
- [ ] Login works
- [ ] Get products works
- [ ] Create order works
- [ ] Wallet deposit works
- [ ] Admin panel works

---

## 7. Common Issues

### Issue 1: CORS Error

**Error:**
```
Access to fetch at 'http://localhost:8000/api/v1/products/' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Fix:**
```python
# Django settings.py
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
]
```

### Issue 2: 401 Unauthorized

**Error:** API returns 401 even with token

**Fix:** Check token format:
```typescript
headers: {
  'Authorization': `Bearer ${token}` // Đúng
  // NOT: 'Authorization': token
}
```

### Issue 3: 404 Not Found

**Error:** API endpoint not found

**Fix:** Check trailing slash:
```typescript
// Django yêu cầu trailing slash
`${API_BASE_URL}/products/` // Đúng
`${API_BASE_URL}/products`  // Sai
```

---

## 8. Next Steps

Sau khi kết nối thành công:

1. **Remove mock data:** Xóa các file mock data không dùng
2. **Add loading states:** Thêm skeleton screens
3. **Error boundaries:** Handle errors gracefully
4. **Analytics:** Track API calls
5. **Caching:** Implement API caching với React Query hoặc SWR
6. **Offline support:** Add service workers

---

## 9. Production Deployment

### Frontend:

```bash
# Build production
npm run build

# Deploy to hosting (Vercel, Netlify, etc)
# Update .env với production API URL
REACT_APP_API_URL=https://api.homelystore.vn/api/v1
```

### Backend:

```bash
# Set production environment
export DJANGO_ENVIRONMENT=production

# Collect static files
python manage.py collectstatic --noinput

# Run with Gunicorn
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

---

**🎉 Hoàn thành! Frontend và Backend đã được kết nối thành công.**

### Tài liệu liên quan:
- `/DJANGO_BACKEND_INTEGRATION_GUIDE.md` - Setup Django từ đầu
- `/DJANGO_IMPLEMENTATION_COMPLETE.md` - Code chi tiết
- `/API_DOCUMENTATION.md` - API specifications
- `/CHANGELOG_WALLET_INTEGRATION.md` - Wallet flow

**Support:** Nếu gặp vấn đề, check console logs và Django server logs.
