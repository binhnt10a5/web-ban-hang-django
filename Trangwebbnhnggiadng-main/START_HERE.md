# 🚀 BẮT ĐẦU TỪ ĐÂY - Hướng dẫn Tích hợp Backend Django

> **Đọc file này trước khi bắt đầu!**

---

## 📚 Tài liệu đã chuẩn bị sẵn

Tôi đã tạo 4 file hướng dẫn chi tiết cho bạn:

### 1. `/DJANGO_BACKEND_INTEGRATION_GUIDE.md` ⭐ START HERE
**Nội dung:** Hướng dẫn từng bước setup Django backend từ đầu
- Cài đặt môi trường (Python, PostgreSQL, Redis)
- Khởi tạo Django project
- Cấu hình database models
- JWT Authentication setup
- CORS configuration
- File upload
- Quick start guide

**Khi nào đọc:** Đọc đầu tiên nếu bạn chưa có backend

### 2. `/DJANGO_IMPLEMENTATION_COMPLETE.md` ⭐ IMPORTANT
**Nội dung:** Code hoàn chỉnh cho tất cả modules
- Products App (Views, Serializers, URLs, Filters)
- Orders App (Views, Serializers, URLs)
- Wallet App (Services, Views, URLs)
- Payment Gateway Services (VNPay, MoMo, Stripe, PayPal)
- Custom Permissions
- Email Templates
- Testing checklist

**Khi nào đọc:** Sau khi setup xong Django project, copy code từ file này

### 3. `/FRONTEND_BACKEND_CONNECTION.md` ⭐ CRITICAL
**Nội dung:** Kết nối Frontend React với Backend Django
- Cập nhật `/src/app/services/api.ts`
- Environment variables
- Auth token handling
- Error handling
- Testing connection
- Troubleshooting

**Khi nào đọc:** Sau khi backend đã chạy, đọc để kết nối frontend

### 4. `/API_DOCUMENTATION.md` 📖 REFERENCE
**Nội dung:** Đã có sẵn, tài liệu API đầy đủ
- Database models spec
- API endpoints specification
- Request/Response format
- Wallet system flow
- Payment integration

**Khi nào đọc:** Reference khi implement

---

## 🎯 Lộ trình thực hiện (Step by Step)

### BƯỚC 1: Cài đặt Backend (1-2 giờ)

```bash
# 1. Cài đặt Python và PostgreSQL
sudo apt install python3.11 postgresql

# 2. Tạo database
sudo -u postgres psql
CREATE DATABASE homelystore_db;
CREATE USER homelystore_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE homelystore_db TO homelystore_user;
\q

# 3. Tạo Django project
mkdir homelystore-backend
cd homelystore-backend
python3.11 -m venv venv
source venv/bin/activate
```

📖 **Đọc:** `/DJANGO_BACKEND_INTEGRATION_GUIDE.md` phần 2-3

---

### BƯỚC 2: Setup Django Models & Apps (2-3 giờ)

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Create apps
python manage.py startapp apps.authentication
python manage.py startapp apps.products
python manage.py startapp apps.orders
python manage.py startapp apps.wallet
python manage.py startapp apps.payments

# 3. Copy models từ guide
# 4. Run migrations
python manage.py makemigrations
python manage.py migrate
```

📖 **Đọc:** `/DJANGO_BACKEND_INTEGRATION_GUIDE.md` phần 4  
📖 **Copy code:** `/DJANGO_IMPLEMENTATION_COMPLETE.md` phần Models

---

### BƯỚC 3: Implement API Endpoints (3-4 giờ)

```bash
# Copy code từ /DJANGO_IMPLEMENTATION_COMPLETE.md
# 1. Serializers
# 2. Views
# 3. URLs
# 4. Filters
# 5. Services
```

📖 **Copy code:** `/DJANGO_IMPLEMENTATION_COMPLETE.md` toàn bộ

**Files cần tạo:**
- `apps/products/serializers.py` ✅
- `apps/products/views.py` ✅
- `apps/products/urls.py` ✅
- `apps/products/filters.py` ✅
- `apps/orders/serializers.py` ✅
- `apps/orders/views.py` ✅
- `apps/orders/urls.py` ✅
- `apps/wallet/services.py` ✅
- `apps/wallet/views.py` ✅
- `apps/wallet/urls.py` ✅
- `apps/payments/services/vnpay.py` ✅
- `apps/payments/services/momo.py` ✅
- `apps/payments/views.py` ✅
- `apps/payments/urls.py` ✅

---

### BƯỚC 4: Configure Payment Gateways (1 giờ)

```bash
# 1. Đăng ký sandbox accounts:
# - VNPay: https://sandbox.vnpayment.vn/
# - MoMo: https://developers.momo.vn/

# 2. Thêm credentials vào .env
VNPAY_TMN_CODE=your_code
VNPAY_HASH_SECRET=your_secret
MOMO_PARTNER_CODE=your_code
MOMO_SECRET_KEY=your_secret
```

📖 **Đọc:** `/DJANGO_IMPLEMENTATION_COMPLETE.md` phần Payment Gateway

---

### BƯỚC 5: Test Backend (30 phút)

```bash
# 1. Create superuser
python manage.py createsuperuser

# 2. Run server
python manage.py runserver

# 3. Test API
# - Browse http://localhost:8000/admin
# - Test http://localhost:8000/api/v1/products/
# - Test http://localhost:8000/api/docs/ (Swagger UI)
```

📖 **Đọc:** `/DJANGO_BACKEND_INTEGRATION_GUIDE.md` phần 12 (Testing)

---

### BƯỚC 6: Kết nối Frontend (1-2 giờ)

```bash
# 1. Tạo .env trong frontend
echo "REACT_APP_API_URL=http://localhost:8000/api/v1" > .env

# 2. Cập nhật /src/app/services/api.ts
# Copy toàn bộ code từ /FRONTEND_BACKEND_CONNECTION.md

# 3. Test
npm run dev
```

📖 **Đọc:** `/FRONTEND_BACKEND_CONNECTION.md` toàn bộ

**File cần cập nhật:**
- `/src/app/services/api.ts` ✅ (Thay thế hoàn toàn)
- `.env` ✅ (Tạo mới)

---

### BƯỚC 7: End-to-End Testing (1 giờ)

**Test flows:**
1. ✅ Register → Login → Browse Products
2. ✅ Add to Cart → Checkout → COD Payment
3. ✅ Wallet Deposit → Checkout with Wallet (2% discount)
4. ✅ VNPay Payment → Callback handling
5. ✅ Admin: Manage Products, Orders, Users
6. ✅ User: View Orders, Wallet Transactions

---

## 📋 Checklist tổng hợp

### Backend Setup
- [ ] Python 3.11+ installed
- [ ] PostgreSQL installed & configured
- [ ] Django project created
- [ ] All apps created (authentication, products, orders, wallet, payments)
- [ ] Models created & migrated
- [ ] Superuser created
- [ ] CORS configured
- [ ] Environment variables set
- [ ] Payment gateway credentials added

### Implementation
- [ ] All serializers implemented
- [ ] All views implemented
- [ ] All URLs configured
- [ ] Wallet service implemented
- [ ] Payment services implemented (VNPay, MoMo)
- [ ] Custom permissions added
- [ ] Email templates created

### Frontend Connection
- [ ] `.env` created với API_BASE_URL
- [ ] `/src/app/services/api.ts` updated
- [ ] Auth token handling implemented
- [ ] Error handling added

### Testing
- [ ] Backend tests pass: `python manage.py test`
- [ ] All API endpoints working
- [ ] CORS working
- [ ] File upload working
- [ ] Payment flow working
- [ ] Wallet flow working
- [ ] Frontend can call backend

---

## 🆘 Troubleshooting Quick Guide

### Backend không chạy được

```bash
# Check Python version
python --version  # Should be 3.11+

# Check PostgreSQL running
sudo service postgresql status

# Check database exists
psql -U homelystore_user -d homelystore_db

# Check migrations
python manage.py showmigrations
```

### Frontend không connect được Backend

```bash
# Check backend running
curl http://localhost:8000/api/v1/products/

# Check CORS settings
# Django settings.py → CORS_ALLOWED_ORIGINS

# Check .env file
cat .env
# Should have: REACT_APP_API_URL=http://localhost:8000/api/v1
```

### CORS Error

**Fix trong Django:**
```python
# config/settings/base.py
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
]
```

### 401 Unauthorized

**Check token format:**
```typescript
// Phải có "Bearer " prefix
headers: {
  'Authorization': `Bearer ${token}`
}
```

---

## 💡 Tips

### 1. Development Workflow

```bash
# Terminal 1: Backend
cd homelystore-backend
source venv/bin/activate
python manage.py runserver

# Terminal 2: Frontend
cd homelystore-frontend
npm run dev

# Terminal 3: Database
sudo service postgresql status
```

### 2. Quick Test Commands

```bash
# Test API with curl
curl http://localhost:8000/api/v1/products/
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'

# Django shell
python manage.py shell
>>> from apps.authentication.models import User
>>> User.objects.all()
```

### 3. Debugging

```python
# Thêm vào views để debug
import logging
logger = logging.getLogger(__name__)
logger.info(f"Request data: {request.data}")
```

---

## 📞 Hỗ trợ

### File tài liệu:
1. `/DJANGO_BACKEND_INTEGRATION_GUIDE.md` - Setup guide
2. `/DJANGO_IMPLEMENTATION_COMPLETE.md` - Complete code
3. `/FRONTEND_BACKEND_CONNECTION.md` - Connection guide
4. `/API_DOCUMENTATION.md` - API reference
5. `/CHANGELOG_WALLET_INTEGRATION.md` - Wallet flow

### External Resources:
- Django Docs: https://docs.djangoproject.com/
- DRF Docs: https://www.django-rest-framework.org/
- PostgreSQL: https://www.postgresql.org/docs/

---

## 🎯 Estimated Timeline

| Task | Time | Priority |
|------|------|----------|
| Backend setup | 1-2h | ⭐⭐⭐ |
| Models & Apps | 2-3h | ⭐⭐⭐ |
| API Implementation | 3-4h | ⭐⭐⭐ |
| Payment Gateway | 1h | ⭐⭐ |
| Frontend Connection | 1-2h | ⭐⭐⭐ |
| Testing | 1h | ⭐⭐ |
| **TOTAL** | **9-13h** | |

---

## ✅ Khi nào coi như hoàn thành?

Bạn đã hoàn thành khi:

1. ✅ Backend Django chạy được: `http://localhost:8000/api/v1/products/`
2. ✅ Frontend React chạy được: `http://localhost:3000`
3. ✅ Login/Register works
4. ✅ Products list loads from backend
5. ✅ Order creation works (COD)
6. ✅ Wallet deposit works (VNPay sandbox)
7. ✅ Admin panel accessible
8. ✅ All CRUD operations work

---

## 🚀 Let's Start!

### Bắt đầu ngay:

```bash
# 1. Đọc file này ✅ (Bạn đang đọc)
# 2. Mở /DJANGO_BACKEND_INTEGRATION_GUIDE.md
# 3. Follow từng bước
# 4. Copy code từ /DJANGO_IMPLEMENTATION_COMPLETE.md
# 5. Kết nối frontend với /FRONTEND_BACKEND_CONNECTION.md
# 6. Test & Deploy!
```

**Good luck! 💪**

---

**Tác giả:** AI Assistant  
**Ngày tạo:** March 11, 2024  
**Version:** 1.0.0
