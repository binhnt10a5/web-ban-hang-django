# 📚 Tài liệu Tích hợp Backend Django - Homely Store

> **Hệ thống tài liệu đầy đủ để xây dựng và kết nối Python Django Backend với React Frontend**

---

## 🎯 Tổng quan

Bạn đang có một hệ thống thương mại điện tử hoàn chỉnh với:
- ✅ **Frontend React** - Đầy đủ UI/UX với Tailwind CSS
- ✅ **Mock API Layer** - Sẵn sàng thay thế bằng real backend
- ✅ **Wallet System** - Deep linking và flow hoàn chỉnh
- ⏳ **Backend Django** - Cần implement (TÀI LIỆU NÀY)

---

## 📦 Các file tài liệu đã tạo

### 1. 🚀 `/START_HERE.md`
**MỤC ĐÍCH:** File đọc đầu tiên, hướng dẫn roadmap tổng thể

**NỘI DUNG:**
- Lộ trình thực hiện từng bước
- Checklist tổng hợp
- Timeline ước tính (9-13h)
- Quick troubleshooting
- Tips & tricks

**KHI NÀO ĐỌC:** 📌 ĐỌC NGAY BÂY GIỜ

---

### 2. 📖 `/DJANGO_BACKEND_INTEGRATION_GUIDE.md`
**MỤC ĐÍCH:** Hướng dẫn chi tiết setup Django từ đầu

**NỘI DUNG:**
- **Phần 1-2:** Tổng quan kiến trúc, chuẩn bị môi trường
- **Phần 3:** Khởi tạo Django project, cài đặt dependencies
- **Phần 4:** Cấu hình Database Models (User, Product, Order, Wallet, etc)
- **Phần 5:** JWT Authentication setup
- **Phần 6-11:** API Endpoints overview
- **Phần 12-13:** Testing & Deployment
- **Phần 14:** Kết nối Frontend
- **Phần 15:** Troubleshooting

**HIGHLIGHT:**
- Settings configuration hoàn chỉnh
- Database models với UUID primary keys
- JWT authentication với refresh tokens
- CORS setup
- File upload validation
- Email service
- Production checklist

**KHI NÀO ĐỌC:** Bước 1-2 của lộ trình

---

### 3. 💻 `/DJANGO_IMPLEMENTATION_COMPLETE.md`
**MỤC ĐÍCH:** Code hoàn chỉnh cho tất cả modules

**NỘI DUNG:**

#### Products App
- ✅ `serializers.py` - ProductSerializer, ProductCreateUpdateSerializer
- ✅ `views.py` - ProductViewSet với CRUD đầy đủ
- ✅ `filters.py` - ProductFilter với search, category, brand, price range
- ✅ `urls.py` - Router configuration

#### Orders App
- ✅ `serializers.py` - OrderSerializer, OrderCreateSerializer, OrderStatusUpdateSerializer
- ✅ `views.py` - OrderViewSet với create, my_orders, update_status, cancel
- ✅ `urls.py` - Router configuration
- ✅ Business logic: Auto-approve cho online payments, stock management

#### Wallet App
- ✅ `services.py` - WalletService với process_payment, deposit, withdraw, refund
- ✅ `views.py` - WalletViewSet với balance, transactions, deposit, withdraw
- ✅ `serializers.py` - WalletTransactionSerializer
- ✅ `urls.py` - Router configuration
- ✅ 2% discount logic cho wallet payment

#### Payment Gateway Services
- ✅ `services/vnpay.py` - VNPayService
  - `create_payment_url()` - Tạo URL thanh toán
  - `verify_payment_callback()` - Xác thực callback
  - HMAC-SHA512 signature
  
- ✅ `services/momo.py` - MoMoService
  - `create_payment_url()` - Tạo URL thanh toán
  - `verify_payment_callback()` - Xác thực callback
  - HMAC-SHA256 signature
  
- ✅ `services/__init__.py` - PaymentGatewayService (main service)
  - Support VNPay, MoMo, Stripe, PayPal
  
- ✅ `views.py` - VNPayCallbackView, MoMoCallbackView
  - Handle browser redirect
  - Handle webhook POST
  - Process wallet deposit vs order payment
  
- ✅ `urls.py` - Callback URLs

#### Additional
- ✅ Custom Permissions (IsAdminUser, IsOwnerOrAdmin)
- ✅ Email Templates (Welcome, Order Confirmation)
- ✅ Complete Testing Checklist

**KHI NÀO ĐỌC:** Bước 3-4 của lộ trình (Copy code từ đây)

---

### 4. 🔌 `/FRONTEND_BACKEND_CONNECTION.md`
**MỤC ĐÍCH:** Kết nối Frontend React với Backend Django

**NỘI DUNG:**

#### Environment Setup
- `.env` configuration
- API_BASE_URL setup

#### API Service Update
**COMPLETE CODE FOR `/src/app/services/api.ts`:**

- ✅ **Base Configuration**
  - API_BASE_URL
  - getAuthToken()
  - createHeaders()
  - handleApiError()

- ✅ **Auth API**
  - `login()` - Lưu token vào localStorage
  - `register()` - Auto login sau register
  - `forgotPassword()` - Reset password
  - `logout()` - Clear localStorage
  - `refreshToken()` - Auto refresh when expired

- ✅ **Products API**
  - `getAll()` - With filters (category, brand, price, search, sort, pagination)
  - `getById()` - Product details
  - `create()` - FormData upload
  - `update()` - FormData upload
  - `delete()` - Admin only

- ✅ **Orders API**
  - `create()` - Guest checkout supported
  - `getMyOrders()` - User's orders
  - `getAll()` - Admin only
  - `updateStatus()` - Admin only
  - `cancel()` - Refund handling

- ✅ **Wallet API**
  - `getBalance()` - Current balance
  - `getTransactions()` - Transaction history
  - `deposit()` - Generate payment URL
  - `withdraw()` - Request withdrawal

- ✅ **Users API**
  - `getAll()` - Admin only
  - `getProfile()` - Current user
  - `updateProfile()` - Update info
  - `lockUser()` - Admin only

- ✅ **Reviews API**
  - `create()` - Create review
  - `getProductReviews()` - Get product reviews

#### Testing
- Browser console tests
- CORS verification
- Loading & error handling
- Token expiry handling

#### Common Issues & Solutions
- CORS errors
- 401 Unauthorized
- 404 Not Found
- Token refresh logic

**KHI NÀO ĐỌC:** Bước 6 của lộ trình

---

### 5. 📋 `/API_DOCUMENTATION.md` (Đã có sẵn)
**MỤC ĐÍCH:** Reference API specifications

**NỘI DUNG:**
- Database Models specification
- API Endpoints specification
- Request/Response formats
- Wallet System flow
- Payment Integration flow
- URL Parameters & Deep Linking

**KHI NÀO ĐỌC:** Reference khi implement

---

### 6. 📝 `/CHANGELOG_WALLET_INTEGRATION.md` (Đã có sẵn)
**MỤC ĐÍCH:** Wallet system implementation details

**NỘI DUNG:**
- Deep linking flow
- Wallet integration changelog
- URL parameters handling
- Testing checklist

**KHI NÀO ĐỌC:** Reference cho wallet feature

---

## 🗺️ Lộ trình Thực hiện

```
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 1: Đọc /START_HERE.md                        (15 phút) │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 2: Setup Backend                             (1-2 giờ) │
│  - Đọc: /DJANGO_BACKEND_INTEGRATION_GUIDE.md phần 1-3        │
│  - Cài Python, PostgreSQL, Redis                             │
│  - Khởi tạo Django project                                   │
│  - Cấu hình settings                                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 3: Create Models                             (2-3 giờ) │
│  - Đọc: /DJANGO_BACKEND_INTEGRATION_GUIDE.md phần 4          │
│  - Copy: /DJANGO_IMPLEMENTATION_COMPLETE.md (Models)         │
│  - Run migrations                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 4: Implement APIs                            (3-4 giờ) │
│  - Copy: /DJANGO_IMPLEMENTATION_COMPLETE.md (All code)       │
│  - Products, Orders, Wallet, Payments                        │
│  - Serializers, Views, URLs                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 5: Payment Gateway Config                      (1 giờ) │
│  - Đăng ký VNPay, MoMo sandbox                               │
│  - Add credentials vào .env                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 6: Test Backend                              (30 phút) │
│  - Create superuser                                          │
│  - Run server                                                │
│  - Test API endpoints                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 7: Connect Frontend                          (1-2 giờ) │
│  - Đọc: /FRONTEND_BACKEND_CONNECTION.md                      │
│  - Update /src/app/services/api.ts                           │
│  - Create .env                                               │
│  - Test connection                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 8: End-to-End Testing                          (1 giờ) │
│  - Test all flows                                            │
│  - Fix bugs                                                  │
│  - Performance optimization                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    ✅ HOÀN THÀNH!
```

**Tổng thời gian ước tính:** 9-13 giờ

---

## 🎯 Checklist Tổng Hợp

### Phase 1: Backend Setup
- [ ] Python 3.11+ installed
- [ ] PostgreSQL installed & running
- [ ] Django project created
- [ ] Virtual environment activated
- [ ] Dependencies installed (`requirements.txt`)
- [ ] Database created
- [ ] `.env` file configured
- [ ] Settings files created (base, development, production)

### Phase 2: Models & Migrations
- [ ] User model (authentication app)
- [ ] Product & ProductImage models (products app)
- [ ] Order & OrderItem models (orders app)
- [ ] WalletTransaction model (wallet app)
- [ ] ProductReview model (reviews app)
- [ ] Migrations created: `python manage.py makemigrations`
- [ ] Migrations applied: `python manage.py migrate`
- [ ] Superuser created: `python manage.py createsuperuser`

### Phase 3: API Implementation
- [ ] Products: serializers, views, urls, filters
- [ ] Orders: serializers, views, urls
- [ ] Wallet: services, views, urls, serializers
- [ ] Payments: services (VNPay, MoMo), views, urls
- [ ] Authentication: views, urls (login, register, logout)
- [ ] Users: views, urls (profile, lock/unlock)
- [ ] Reviews: views, urls
- [ ] Custom permissions (IsAdminUser, IsOwnerOrAdmin)

### Phase 4: Configuration
- [ ] CORS configured
- [ ] JWT settings configured
- [ ] File upload settings configured
- [ ] Email settings configured
- [ ] Payment gateway credentials added
- [ ] Main URLs configured (`config/urls.py`)

### Phase 5: Frontend Connection
- [ ] Frontend `.env` created
- [ ] `/src/app/services/api.ts` updated
- [ ] Auth token handling implemented
- [ ] Error handling added
- [ ] Loading states handled

### Phase 6: Testing
- [ ] Backend server runs: `python manage.py runserver`
- [ ] Frontend server runs: `npm run dev`
- [ ] Login/Register works
- [ ] Products CRUD works
- [ ] Orders CRUD works
- [ ] Wallet deposit works
- [ ] Payment callbacks work
- [ ] Admin panel accessible

---

## 🚀 Quick Start

```bash
# 1. Đọc hướng dẫn
cat START_HERE.md

# 2. Setup backend
mkdir homelystore-backend
cd homelystore-backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 3. Create database
sudo -u postgres psql
# ... (follow guide)

# 4. Run migrations
python manage.py migrate

# 5. Create superuser
python manage.py createsuperuser

# 6. Run server
python manage.py runserver

# 7. Update frontend
cd ../homelystore-frontend
# Update /src/app/services/api.ts
# Create .env
npm run dev
```

---

## 📊 File Structure Reference

```
homelystore-backend/
├── config/
│   ├── settings/
│   │   ├── base.py          ✅ Settings chính
│   │   ├── development.py   ✅ Dev settings
│   │   └── production.py    ✅ Production settings
│   ├── urls.py              ✅ Main URLs
│   └── wsgi.py
├── apps/
│   ├── authentication/
│   │   ├── models.py        ✅ User model
│   │   ├── serializers.py   ✅ Auth serializers
│   │   ├── views.py         ✅ Login, Register, Logout
│   │   └── urls.py          ✅ Auth URLs
│   ├── products/
│   │   ├── models.py        ✅ Product, ProductImage
│   │   ├── serializers.py   ✅ Product serializers
│   │   ├── views.py         ✅ Product CRUD
│   │   ├── filters.py       ✅ Product filters
│   │   └── urls.py          ✅ Product URLs
│   ├── orders/
│   │   ├── models.py        ✅ Order, OrderItem
│   │   ├── serializers.py   ✅ Order serializers
│   │   ├── views.py         ✅ Order CRUD
│   │   └── urls.py          ✅ Order URLs
│   ├── wallet/
│   │   ├── models.py        ✅ WalletTransaction
│   │   ├── services.py      ✅ Wallet logic
│   │   ├── serializers.py   ✅ Wallet serializers
│   │   ├── views.py         ✅ Wallet API
│   │   └── urls.py          ✅ Wallet URLs
│   └── payments/
│       ├── services/
│       │   ├── vnpay.py     ✅ VNPay integration
│       │   ├── momo.py      ✅ MoMo integration
│       │   └── __init__.py  ✅ Main service
│       ├── views.py         ✅ Callback handlers
│       └── urls.py          ✅ Payment URLs
├── media/                   📁 Uploaded files
├── logs/                    📁 Application logs
├── requirements.txt         ✅ Dependencies
├── .env                     ✅ Environment variables
└── manage.py                ✅ Django CLI
```

---

## 💡 Tips & Best Practices

### 1. Development Workflow
- Luôn activate virtual environment trước khi làm việc
- Chạy migrations sau mỗi lần thay đổi models
- Test API bằng Swagger UI: `http://localhost:8000/api/docs/`

### 2. Debugging
- Check Django logs: `logs/django.log`
- Use Django shell: `python manage.py shell`
- Enable DEBUG toolbar trong development

### 3. Security
- Không commit `.env` file
- Dùng strong SECRET_KEY trong production
- Set DEBUG=False trong production
- Configure HTTPS cho production

### 4. Performance
- Use database indexes
- Implement caching với Redis
- Optimize queries với `select_related()` và `prefetch_related()`
- Use pagination cho large datasets

---

## 🆘 Troubleshooting

### Problem: `ModuleNotFoundError`
**Solution:**
```bash
pip install -r requirements.txt
```

### Problem: Database connection error
**Solution:**
```bash
# Check PostgreSQL running
sudo service postgresql status

# Check .env DATABASE_URL
cat .env | grep DATABASE_URL
```

### Problem: CORS errors
**Solution:**
```python
# config/settings/base.py
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
]
```

### Problem: 404 on API endpoints
**Solution:**
```bash
# Check URLs registered
python manage.py show_urls

# Ensure trailing slash
/api/v1/products/  # Correct
/api/v1/products   # Wrong
```

---

## 📞 Support & Resources

### Documentation Files
1. `/START_HERE.md` - Bắt đầu từ đây
2. `/DJANGO_BACKEND_INTEGRATION_GUIDE.md` - Setup guide chi tiết
3. `/DJANGO_IMPLEMENTATION_COMPLETE.md` - Code hoàn chỉnh
4. `/FRONTEND_BACKEND_CONNECTION.md` - Kết nối frontend
5. `/API_DOCUMENTATION.md` - API reference
6. `/CHANGELOG_WALLET_INTEGRATION.md` - Wallet flow

### External Resources
- Django: https://docs.djangoproject.com/
- DRF: https://www.django-rest-framework.org/
- PostgreSQL: https://www.postgresql.org/docs/
- VNPay: https://sandbox.vnpayment.vn/apis/docs/
- MoMo: https://developers.momo.vn/

---

## ✅ Success Criteria

Bạn đã hoàn thành khi:

1. ✅ Backend Django chạy trên `http://localhost:8000`
2. ✅ Swagger UI accessible: `http://localhost:8000/api/docs/`
3. ✅ Admin panel works: `http://localhost:8000/admin/`
4. ✅ Frontend gọi được API: Products, Orders, Wallet
5. ✅ Authentication works: Login, Register, JWT tokens
6. ✅ File upload works: Product images
7. ✅ Payment flow works: VNPay, MoMo callbacks
8. ✅ Wallet system works: Deposit, Withdraw, Payment
9. ✅ Admin CRUD works: Products, Orders, Users
10. ✅ End-to-end flow works: Browse → Add to Cart → Checkout → Payment

---

## 🎉 Next Steps

Sau khi hoàn thành:

1. **Optimization**
   - Implement caching
   - Database query optimization
   - Add API rate limiting

2. **Monitoring**
   - Setup Sentry for error tracking
   - Add analytics
   - Performance monitoring

3. **Deployment**
   - Deploy to production server
   - Configure Nginx
   - Setup SSL certificates
   - Configure CI/CD

4. **Additional Features**
   - Email notifications
   - Push notifications
   - Real-time updates với WebSockets
   - Export reports (PDF, Excel)

---

**🚀 Bắt đầu ngay bằng cách đọc `/START_HERE.md`!**

**Good luck! 💪**

---

**Version:** 1.0.0  
**Last Updated:** March 11, 2024  
**Author:** AI Assistant  
**License:** MIT
