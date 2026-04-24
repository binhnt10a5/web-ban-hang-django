# Hướng dẫn Website Bán Lẻ Đồ Gia Dụng - HOMELY

## 🎯 Tổng quan

Website bán lẻ đồ gia dụng hoàn chỉnh với 3 vai trò: **Guest**, **User**, và **Admin**.  
Frontend được xây dựng bằng **React + TypeScript + Tailwind CSS** với kiến trúc sẵn sàng tích hợp **Backend Python Django**.

> **📚 Xem tài liệu API Django đầy đủ tại:** [`/API_DOCUMENTATION.md`](/API_DOCUMENTATION.md)

---

## 🔑 Tài khoản Demo

### User (Người dùng)
- **Email**: `user@homely.com`
- **Password**: `user123`
- **Quyền**: Xem sản phẩm, thêm giỏ hàng, đặt hàng, xem đơn hàng của mình, sử dụng ví điện tử

### Admin (Quản trị viên)
- **Email**: `admin@homely.com`
- **Password**: `admin123`
- **Quyền**: Toàn bộ quyền User + Quản lý sản phẩm, đơn hàng, người dùng, đánh giá

---

## 📁 Cấu trúc dự án

```
/src/app/
├── components/          # Các component UI
│   ├── Header.tsx      # Header với menu phân quyền
│   ├── ProtectedRoute.tsx  # Bảo vệ route theo role
│   ├── ImageUpload.tsx     # Upload ảnh (max 2MB)
│   ├── OrderStatusBadge.tsx # Badge trạng thái đơn hàng
│   └── ...
├── pages/
│   ├── HomePage.tsx         # Trang chủ với sản phẩm
│   ├── ProductDetailPage.tsx
│   ├── CartPage.tsx
│   ├── CheckoutPage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ForgotPasswordPage.tsx
│   ├── UserDashboard.tsx    # Dashboard người dùng
│   └── admin/               # Các trang Admin
│       ├── AdminDashboard.tsx
│       ├── AdminProductsPage.tsx
│       ├── AdminProductFormPage.tsx
│       ├── AdminOrdersPage.tsx
│       └── AdminUsersPage.tsx
├── services/
│   ├── api.ts          # Mock API (sẵn sàng cho backend)
│   └── mockData.ts     # Dữ liệu mẫu
├── contexts/
│   ├── AuthContext.tsx  # Quản lý authentication & roles
│   └── CartContext.tsx  # Quản lý giỏ hàng
├── types/
│   └── index.ts        # TypeScript interfaces
└── routes.tsx          # React Router với protected routes
```

---

## 🎨 Tính năng chính

### 1. Phân quyền (Guest / User / Admin)

#### 🟢 Guest (Khách)
- ✅ Xem danh sách sản phẩm
- ✅ Tìm kiếm, lọc sản phẩm theo danh mục, giá, thương hiệu
- ✅ Xem chi tiết sản phẩm
- ✅ Đăng ký, đăng nhập
- ✅ Sử dụng chatbot khách hàng với gợi ý mua sắm thông minh
- ❌ Không thể thêm vào giỏ hàng
- ❌ Không thể đặt hàng

#### 🔵 User (Người dùng đã đăng nhập)
- ✅ Tất cả quyền của Guest
- ✅ Thêm sản phẩm vào giỏ hàng
- ✅ Đặt hàng (trạng thái mặc định: **pending**)
- ✅ Xem đơn hàng của mình (Dashboard)
- ✅ Xem thông tin cá nhân
- ✅ Sử dụng ví điện tử (nạp/rút tiền, giảm 2% khi thanh toán bằng ví)
- ✅ Sử dụng chatbot khách hàng với gợi ý mua sắm thông minh
- ❌ Không thể truy cập Admin Dashboard

#### 🔴 Admin (Quản trị viên)
- ✅ Tất cả quyền của User
- ✅ **CRUD Sản phẩm** (Thêm, sửa, xóa sản phẩm)
- ✅ **CRUD Người dùng** (Xem, xóa, thay đổi role)
- ✅ **Quản lý đơn hàng**:
  - Xem tất cả đơn hàng
  - Duyệt đơn (pending → approved)
  - Từ chối đơn (pending → rejected)
  - Đánh dấu đã giao (approved → delivered)
- ✅ Xem Dashboard với thống kê tổng quan
- ✅ Quản lý đánh giá sản phẩm
- ✅ **Chatbot Admin** thông minh với:
  - Thống kê doanh thu theo thời gian
  - Phân tích đơn hàng và khách hàng
  - Cảnh báo tồn kho thấp
  - Gợi ý quản lý và tối ưu
  - **Lưu ý**: Chatbot khách hàng tự động ẩn khi đăng nhập admin

### 2. Hệ thống Chatbot Thông Minh

#### 🤖 Chatbot Khách Hàng (Màu nâu vàng)
- ✅ Gợi ý sản phẩm thông minh theo từ khóa
- ✅ Hỗ trợ tìm kiếm và so sánh sản phẩm
- ✅ Thông tin về khuyến mãi, mã giảm giá
- ✅ Chính sách đổi trả, vận chuyển, thanh toán
- ✅ Tư vấn miễn phí về thiết kế nội thất
- ✅ Quick replies cho trải nghiệm nhanh
- ✅ **Tự động ẩn khi đăng nhập tài khoản Admin**

#### 💼 Chatbot Admin (Màu xanh dương)
- ✅ Thống kê doanh thu (hôm nay, tháng này, tổng)
- ✅ Phân tích đơn hàng theo trạng thái
- ✅ Thống kê khách hàng và người dùng
- ✅ Cảnh báo sản phẩm tồn kho thấp
- ✅ Top sản phẩm bán chạy
- ✅ Gợi ý quản lý và tối ưu hệ thống
- ✅ **Chỉ hiển thị trong khu vực Admin Dashboard**

### 3. Hệ thống Ví Điện Tử

#### 💰 Tính năng Ví
- ✅ Nạp tiền qua VNPay, MoMo, Stripe, PayPal
- ✅ Rút tiền về tài khoản ngân hàng
- ✅ Lịch sử giao dịch chi tiết
- ✅ **Giảm 2% khi thanh toán bằng ví**
- ✅ Kiểm tra số dư thời gian thực
- ✅ Bảo mật giao dịch cao

### 4. Thanh Toán Trực Tuyến

#### 💳 Cổng Thanh Toán
- ✅ **VNPay** - Thanh toán qua thẻ ATM/Visa/Master
- ✅ **MoMo** - Ví điện tử MoMo
- ✅ **Stripe** - Thanh toán quốc tế
- ✅ **PayPal** - Thanh toán PayPal
- ✅ **Wallet** - Ví điện tử nội bộ (giảm 2%)
- ✅ **COD** - Thanh toán khi nhận hàng

#### 🚀 Tự động duyệt đơn
- ✅ Đơn hàng thanh toán online (VNPay, MoMo, Stripe, PayPal) → **Tự động approved**
- ✅ Đơn hàng COD → **Chờ admin duyệt (pending)**
- ✅ Webhook/Callback sẵn sàng tích hợp backend

---

## 🛒 Luồng nghiệp vụ

### Đặt hàng (User)
1. Thêm sản phẩm vào giỏ hàng
2. Vào trang Giỏ hàng → Thanh toán
3. Điền thông tin giao hàng
4. Chọn phương thức thanh toán (COD / Chuyển khoản)
5. Xác nhận đặt hàng → Trạng thái: **pending**

### Duyệt đơn (Admin)
1. Vào **Admin → Đơn hàng** hoặc **Admin Dashboard**
2. Xem danh sách đơn hàng với bộ lọc trạng thái
3. Duyệt đơn:
   - **pending** → **approved** (Duyệt)
   - **pending** → **rejected** (Từ chối)
   - **approved** → **delivered** (Đã giao)

### Trạng thái đơn hàng
- 🟡 **pending**: Chờ duyệt
- 🔵 **approved**: Đã duyệt
- 🟢 **delivered**: Đã giao
- 🔴 **rejected**: Từ chối
- ⚫ **cancelled**: Đã hủy

---

## 🖼️ Upload ảnh sản phẩm

### Tính năng
- ✅ Chỉ chấp nhận **JPG, PNG**
- ✅ Dung lượng tối đa **2MB**
- ✅ Preview trước khi lưu
- ✅ Validation file type & size

### Sử dụng
```tsx
<ImageUpload
  value={imageUrl}
  onChange={(url) => setImageUrl(url)}
  label="Ảnh sản phẩm"
/>
```

---

## 🔗 Tích hợp Backend Python

### Mock API Service Layer

File `/src/app/services/api.ts` đã được thiết kế sẵn sàng cho backend Python:

```typescript
// Ví dụ: Auth API
export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // TODO: Replace with actual API call
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return await response.json();
  }
}
```

### Backend Endpoints cần thiết

#### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/forgot-password` - Quên mật khẩu

#### Products
- `GET /api/products` - Lấy danh sách sản phẩm (với query params: search, category, minPrice, maxPrice)
- `GET /api/products/:id` - Lấy sản phẩm theo ID
- `POST /api/products` - Tạo sản phẩm mới (Admin only)
- `PUT /api/products/:id` - Cập nhật sản phẩm (Admin only)
- `DELETE /api/products/:id` - Xóa sản phẩm (Admin only)
- `POST /api/products/upload-image` - Upload ảnh sản phẩm

#### Orders
- `GET /api/orders` - Lấy tất cả đơn hàng (Admin) hoặc đơn hàng của user
- `GET /api/orders/:id` - Lấy đơn hàng theo ID
- `POST /api/orders` - Tạo đơn hàng mới
- `PATCH /api/orders/:id/status` - Cập nhật trạng thái đơn hàng (Admin only)

#### Users
- `GET /api/users` - Lấy danh sách người dùng (Admin only)
- `PATCH /api/users/:id/role` - Cập nhật role (Admin only)
- `DELETE /api/users/:id` - Xóa người dùng (Admin only)

### Cách tích hợp

1. **Cài đặt Flask/Django backend**
2. **Thay thế mock implementation bằng fetch call thật**:
   ```typescript
   // FROM:
   const users = JSON.parse(localStorage.getItem('users') || '[]');
   
   // TO:
   const response = await fetch(`${API_BASE_URL}/api/users`);
   const users = await response.json();
   ```

3. **Cấu hình CORS** trên backend
4. **Thêm JWT token authentication** (đã có sẵn `token` trong AuthResponse)

---

## 🎨 Giao diện

- ✅ **Responsive**: Desktop + Mobile
- ✅ **Dark theme** hiện đại
- ✅ **Tailwind CSS v4**
- ✅ **Lucide Icons**
- ✅ **Toast notifications** (Sonner)
- ✅ **Form validation**
- ✅ **Loading states**

---

## 📱 Responsive Design

- **Desktop**: Full navigation, sidebar filters
- **Tablet**: Responsive grid layout
- **Mobile**: Hamburger menu, single column layout

---

## 🚀 Bắt đầu

### 1. Clone & Install
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Đăng nhập với tài khoản demo
- User: `user@homely.com` / `user123`
- Admin: `admin@homely.com` / `admin123`

---

## 🔐 Bảo mật

### Frontend (Hiện tại)
- ✅ Protected Routes theo role
- ✅ Client-side validation
- ✅ localStorage cho demo

### Backend (Cần implement)
- 🔴 JWT authentication
- 🔴 Password hashing (bcrypt)
- 🔴 CSRF protection
- 🔴 Rate limiting
- 🔴 Input sanitization
- 🔴 SQL injection prevention

---

## 📝 TypeScript Interfaces

Tất cả types được định nghĩa trong `/src/app/types/index.ts`:

```typescript
type UserRole = 'guest' | 'user' | 'admin';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  image: string;
  stock: number;
  rating?: number;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

type OrderStatus = 'pending' | 'approved' | 'rejected' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: string;
  phone: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 🎯 Roadmap tích hợp Backend

### Phase 1: Basic Integration
- [ ] Setup Flask/Django project
- [ ] Implement Authentication endpoints
- [ ] Connect frontend to real API
- [ ] JWT token management

### Phase 2: Database
- [ ] Setup PostgreSQL/MySQL
- [ ] Create database models
- [ ] Migrations
- [ ] Seed data

### Phase 3: Advanced Features
- [ ] File upload to cloud (S3, Cloudinary)
- [ ] Email notifications
- [ ] Payment gateway integration
- [ ] Admin analytics dashboard

### Phase 4: Production
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Performance optimization
- [ ] Security hardening

---

## 📞 Hỗ trợ

Hệ thống đã sẵn sàng cho:
- ✅ Tích hợp backend Python (Flask/Django)
- ✅ Mở rộng tính năng
- ✅ Tùy chỉnh giao diện
- ✅ Deploy production

---

## 🎉 Kết luận

Website đã hoàn thiện với:
- ✅ Frontend React hoàn chỉnh
- ✅ Phân quyền Guest/User/Admin
- ✅ CRUD Products, Orders, Users
- ✅ Upload ảnh sản phẩm
- ✅ Responsive design
- ✅ Mock API layer sẵn sàng cho backend Python

**Bước tiếp theo**: Tích hợp backend Python (Flask/Django) theo hướng dẫn ở trên!