import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  CreditCard, MapPin, User, Phone, Mail, CheckCircle2, Truck, Package,
  Wallet, ExternalLink, ArrowRight, ArrowLeft, ShoppingBag, Check, Building, Copy, X, Tag, Gift
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { ordersApi } from '../services/api';
import { shippingApi, type ShippingOption } from '../services/shippingApi';
import { couponService, type Coupon } from '../services/couponService';
import { AddressSelector, formatFullAddress } from '../components/AddressSelector';
import { AccountCreationModal } from '../components/AccountCreationModal';
import { PaymentGatewayModal } from '../components/PaymentGatewayModal';
import { toast } from 'sonner';

type CheckoutStep = 'info' | 'shipping' | 'payment' | 'review';

export function CheckoutPage() {
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { balance, pay } = useWallet();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('info');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [guestOrderData, setGuestOrderData] = useState<{ email: string; name: string } | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [showCouponList, setShowCouponList] = useState(false);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);

  const WALLET_DISCOUNT_PERCENT = 2;

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: '',
    district: '',
    ward: '',
    paymentMethod: 'cod',
  });

  // Load saved info
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        address: user.address || prev.address,
      }));
    } else {
      const savedInfo = localStorage.getItem('guestCheckoutInfo');
      if (savedInfo) {
        setFormData(prev => ({ ...prev, ...JSON.parse(savedInfo) }));
      }
    }
  }, [user]);

  // Load shipping options
  useEffect(() => {
    if (formData.city) {
      loadShippingOptions();
    }
  }, [formData.city]);

  const loadShippingOptions = async () => {
    const totalWeight = cart.reduce((sum, item) => sum + item.quantity, 0);
    const result = await shippingApi.getShippingOptions({
      fromProvince: 'TP.HCM',
      toProvince: formData.city,
      weight: totalWeight,
    });

    if (result.success && result.data) {
      setShippingOptions(result.data);
      if (result.data.length > 0) {
        setSelectedShipping(result.data[0]);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = () => {
    if (currentStep === 'info') {
      if (!formData.fullName || !formData.phone || !formData.address || !formData.city) {
        toast.error('Vui lòng điền đầy đủ thông tin');
        return;
      }
      if (!user && !formData.email) {
        toast.error('Vui lòng nhập email');
        return;
      }
      setCurrentStep('shipping');
    } else if (currentStep === 'shipping') {
      if (!selectedShipping) {
        toast.error('Vui lòng chọn phương thức vận chuyển');
        return;
      }
      setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      setCurrentStep('review');
    }
  };

  const handleSubmitOrder = async () => {
    // Validate wallet balance if needed
    if (formData.paymentMethod === 'wallet') {
      let finalTotal = getCartTotal();
      if (selectedShipping) finalTotal += selectedShipping.fee;
      if (couponDiscount > 0) finalTotal -= couponDiscount;
      finalTotal = finalTotal * (1 - WALLET_DISCOUNT_PERCENT / 100);

      if (balance < finalTotal) {
        toast.error('Số dư ví không đủ');
        return;
      }
    }

    // Show payment gateway for online payments
    if (['vnpay', 'momo', 'stripe', 'paypal'].includes(formData.paymentMethod)) {
      setShowPaymentGateway(true);
      return;
    }

    processOrder();
  };

  const handlePaymentSuccess = () => {
    setShowPaymentGateway(false);
    processOrder();
  };

  const handlePaymentCancel = () => {
    setShowPaymentGateway(false);
    toast.info('Đã hủy thanh toán');
  };

  const processOrder = async () => {
    setIsProcessing(true);

    try {
      let finalTotal = getCartTotal();
      let walletDiscount = 0;

      if (formData.paymentMethod === 'wallet') {
        walletDiscount = Math.round(finalTotal * (WALLET_DISCOUNT_PERCENT / 100));
        finalTotal = finalTotal - walletDiscount;
        const paymentSuccess = await pay(finalTotal);
        if (!paymentSuccess) {
          toast.error('Thanh toán thất bại');
          setIsProcessing(false);
          return;
        }
      }

      // Save guest info
      if (!user) {
        localStorage.setItem('guestCheckoutInfo', JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          district: formData.district,
          ward: formData.ward,
        }));
      }

      const shippingAddress = formatFullAddress({
        street: formData.address,
        ward: formData.ward,
        district: formData.district,
        province: formData.city,
      });

      const orderData = {
        userId: user?.id || 'guest',
        userName: formData.fullName,
        userEmail: formData.email || user?.email || '',
        items: cart.map(item => ({
          productId: item.id,
          productName: item.name,
          productImage: item.image,
          quantity: item.quantity,
          price: item.price,
        })),
        total: finalTotal,
        paymentMethod: formData.paymentMethod,
        walletDiscount: walletDiscount > 0 ? walletDiscount : undefined,
        paymentStatus: formData.paymentMethod === 'cod' ? 'pending' : 'completed',
        shippingAddress,
        phone: formData.phone,
        notes: !user ? '(Đặt hàng không cần đăng nhập)' : '',
      };

      const result = await ordersApi.create(orderData);

      if (result.success && result.data) {
        setOrderComplete(true);
        clearCart();
        toast.success('Đặt hàng thành công!');

        if (!user && formData.email) {
          setGuestOrderData({ email: formData.email, name: formData.fullName });
          setShowAccountModal(true);
        } else {
          setTimeout(() => navigate('/dashboard'), 3000);
        }
      } else {
        toast.error(result.error || 'Lỗi khi đặt hàng');
      }
    } catch (error) {
      toast.error('Lỗi khi đặt hàng');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`Đã sao chép ${field}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }

    const cartTotal = getCartTotal();
    const result = couponService.applyCoupon(couponCode.trim(), cartTotal);

    if (result.success) {
      const validation = couponService.validateCoupon(couponCode.trim(), cartTotal);
      if (validation.valid && validation.coupon) {
        setAppliedCoupon(validation.coupon);
        setCouponDiscount(result.discount);
        toast.success(result.message);
      }
    } else {
      toast.error(result.message);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode('');
    toast.info('Đã xóa mã giảm giá');
  };

  const handleSelectCoupon = (coupon: Coupon) => {
    setCouponCode(coupon.code);
    setShowCouponList(false);
    handleApplyCoupon();
  };

  const steps = [
    { id: 'info' as CheckoutStep, label: 'Thông tin', icon: User },
    { id: 'shipping' as CheckoutStep, label: 'Vận chuyển', icon: Truck },
    { id: 'payment' as CheckoutStep, label: 'Thanh toán', icon: CreditCard },
    { id: 'review' as CheckoutStep, label: 'Xác nhận', icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Giỏ hàng trống</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-4 rounded-2xl font-bold hover:from-pink-600 hover:to-purple-600 transition"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Đặt hàng thành công!</h2>
          <p className="text-gray-400 mb-8">
            Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-4 rounded-2xl font-bold hover:from-pink-600 hover:to-purple-600 transition w-full"
          >
            Xem đơn hàng
          </button>
        </div>

        {showAccountModal && guestOrderData && (
          <AccountCreationModal
            email={guestOrderData.email}
            name={guestOrderData.name}
            onClose={() => {
              setShowAccountModal(false);
              navigate('/dashboard');
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index <= currentStepIndex;
              const isCurrent = step.id === currentStep;

              return (
                <div key={step.id} className="contents">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
                        isActive
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500'
                          : 'bg-[#2a2a2a] border-2 border-gray-700'
                      } ${isCurrent ? 'ring-4 ring-pink-500/30' : ''}`}
                    >
                      <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <span
                      className={`mt-2 text-sm font-medium ${
                        isActive ? 'text-white' : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-1 mx-2 mb-8">
                      <div
                        className={`h-full rounded-full transition ${
                          index < currentStepIndex
                            ? 'bg-gradient-to-r from-pink-500 to-purple-500'
                            : 'bg-[#2a2a2a]'
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-[#2a2a2a] rounded-2xl p-6 border border-gray-700/50">
              {/* Step 1: Info */}
              {currentStep === 'info' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Thông tin giao hàng</h2>

                  {/* Full Name */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Họ và tên <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white focus:border-pink-500 focus:outline-none transition"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  {!user && (
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Email <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white focus:border-pink-500 focus:outline-none transition"
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>
                  )}

                  {/* Phone */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Số điện thoại <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white focus:border-pink-500 focus:outline-none transition"
                        placeholder="0901234567"
                      />
                    </div>
                  </div>

                  {/* Address Selector */}
                  <AddressSelector
                    value={{
                      street: formData.address,
                      province: formData.city,
                      district: formData.district,
                      ward: formData.ward,
                    }}
                    onChange={(address) => {
                      setFormData({
                        ...formData,
                        address: address.street,
                        city: address.province,
                        district: address.district,
                        ward: address.ward,
                      });
                    }}
                  />
                </div>
              )}

              {/* Step 2: Shipping */}
              {currentStep === 'shipping' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Phương thức vận chuyển</h2>

                  <div className="space-y-3">
                    {shippingOptions.length > 0 ? (
                      shippingOptions.map((option) => (
                        <label
                          key={option.id}
                          className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition ${
                            selectedShipping?.id === option.id
                              ? 'border-pink-500 bg-pink-500/10'
                              : 'border-gray-700 hover:border-gray-600 bg-[#1a1a1a]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="shipping"
                              checked={selectedShipping?.id === option.id}
                              onChange={() => setSelectedShipping(option)}
                              className="w-5 h-5 text-pink-500"
                            />
                            <div>
                              <p className="text-white font-semibold">{option.name}</p>
                              <p className="text-gray-400 text-sm">{option.estimatedDelivery}</p>
                            </div>
                          </div>
                          <span className="text-pink-400 font-bold">
                            {option.fee.toLocaleString('vi-VN')}đ
                          </span>
                        </label>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Truck className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">Vui lòng nhập địa chỉ để xem phương thức vận chuyển</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 'payment' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Phương thức thanh toán</h2>

                  <div className="space-y-3">
                    {/* COD */}
                    <label className="flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition hover:border-pink-500/30 bg-[#1a1a1a] border-gray-700">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={formData.paymentMethod === 'cod'}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-pink-500"
                        />
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                            <Package className="w-6 h-6 text-orange-400" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">Thanh toán khi nhận hàng (COD)</p>
                            <p className="text-gray-400 text-sm">Thanh toán tiền mặt</p>
                          </div>
                        </div>
                      </div>
                    </label>

                    {/* Wallet */}
                    <label className="flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition hover:border-pink-500/30 bg-[#1a1a1a] border-gray-700">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="wallet"
                          checked={formData.paymentMethod === 'wallet'}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-pink-500"
                        />
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                            <Wallet className="w-6 h-6 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">Ví Homely</p>
                            <p className="text-gray-400 text-sm">
                              Giảm {WALLET_DISCOUNT_PERCENT}% • Số dư: {balance.toLocaleString('vi-VN')}đ
                            </p>
                          </div>
                        </div>
                      </div>
                      {formData.paymentMethod === 'wallet' && (
                        <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                          -{WALLET_DISCOUNT_PERCENT}%
                        </span>
                      )}
                    </label>

                    {/* VNPay */}
                    <label className="flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition hover:border-pink-500/30 bg-[#1a1a1a] border-gray-700">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="vnpay"
                          checked={formData.paymentMethod === 'vnpay'}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-pink-500"
                        />
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold">VNP</span>
                          </div>
                          <div>
                            <p className="text-white font-semibold">VNPay</p>
                            <p className="text-gray-400 text-sm">Thanh toán qua VNPay QR</p>
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="w-5 h-5 text-gray-500" />
                    </label>

                    {/* MoMo */}
                    <label className="flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition hover:border-pink-500/30 bg-[#1a1a1a] border-gray-700">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="momo"
                          checked={formData.paymentMethod === 'momo'}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-pink-500"
                        />
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-pink-600 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold">M</span>
                          </div>
                          <div>
                            <p className="text-white font-semibold">MoMo</p>
                            <p className="text-gray-400 text-sm">Ví điện tử MoMo</p>
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="w-5 h-5 text-gray-500" />
                    </label>
                  </div>

                  {/* Wallet insufficient balance warning */}
                  {formData.paymentMethod === 'wallet' && (() => {
                    const finalTotal = getCartTotal() * (1 - WALLET_DISCOUNT_PERCENT / 100);
                    const isEnough = balance >= finalTotal;
                    if (!isEnough) {
                      const amountNeeded = Math.ceil(finalTotal - balance);
                      return (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                          <p className="text-red-400 font-medium mb-2">Số dư ví không đủ</p>
                          <p className="text-red-300 text-sm mb-3">
                            Cần nạp thêm: {amountNeeded.toLocaleString('vi-VN')}đ
                          </p>
                          <button
                            onClick={() => navigate(`/dashboard?tab=wallet&deposit=${amountNeeded}`)}
                            className="text-sm px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition"
                          >
                            Nạp tiền ngay
                          </button>
                        </div>
                      );
                    }
                  })()}
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 'review' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Xác nhận đơn hàng</h2>

                  {/* Delivery Info */}
                  <div className="bg-[#1a1a1a] rounded-xl p-4">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-pink-400" />
                      Địa chỉ giao hàng
                    </h3>
                    <div className="text-gray-300 space-y-1">
                      <p className="font-semibold">{formData.fullName}</p>
                      <p className="text-sm">{formData.phone}</p>
                      <p className="text-sm">
                        {formatFullAddress({
                          street: formData.address,
                          ward: formData.ward,
                          district: formData.district,
                          province: formData.city,
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Shipping Method */}
                  <div className="bg-[#1a1a1a] rounded-xl p-4">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-blue-400" />
                      Phương thức vận chuyển
                    </h3>
                    {selectedShipping && (
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-300">{selectedShipping.name}</p>
                          <p className="text-gray-500 text-sm">{selectedShipping.estimatedDelivery}</p>
                        </div>
                        <span className="text-pink-400 font-semibold">
                          {selectedShipping.fee.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div className="bg-[#1a1a1a] rounded-xl p-4">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-purple-400" />
                      Phương thức thanh toán
                    </h3>
                    <p className="text-gray-300">
                      {formData.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' :
                       formData.paymentMethod === 'wallet' ? `Ví Homely (Giảm ${WALLET_DISCOUNT_PERCENT}%)` :
                       formData.paymentMethod === 'vnpay' ? 'VNPay' :
                       formData.paymentMethod === 'momo' ? 'MoMo' : ''}
                    </p>
                  </div>

                  {/* Products */}
                  <div className="bg-[#1a1a1a] rounded-xl p-4">
                    <h3 className="text-white font-semibold mb-3">Sản phẩm ({cart.length})</h3>
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 rounded-lg object-cover bg-[#2a2a2a]"
                          />
                          <div className="flex-1">
                            <p className="text-white font-medium text-sm line-clamp-1">{item.name}</p>
                            <p className="text-gray-400 text-sm">x{item.quantity}</p>
                          </div>
                          <span className="text-pink-400 font-semibold">
                            {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-6">
                {currentStep !== 'info' && (
                  <button
                    onClick={() => {
                      const index = steps.findIndex(s => s.id === currentStep);
                      if (index > 0) setCurrentStep(steps[index - 1].id);
                    }}
                    className="px-6 py-3 bg-[#1a1a1a] hover:bg-[#252525] text-white rounded-xl font-semibold transition flex items-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Quay lại
                  </button>
                )}
                {currentStep !== 'review' ? (
                  <button
                    onClick={handleNextStep}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition flex items-center justify-center gap-2"
                  >
                    Tiếp tục
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitOrder}
                    disabled={isProcessing}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>Đang xử lý...</>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Đặt hàng
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#2a2a2a] rounded-2xl p-6 border border-gray-700/50 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-6">Tóm tắt đơn hàng</h2>

              {/* Coupon Input */}
              <div className="mb-6">
                <div className="flex gap-2 mb-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Nhập mã giảm giá"
                      disabled={!!appliedCoupon}
                      className="w-full pl-10 pr-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
                    />
                  </div>
                  {appliedCoupon ? (
                    <button
                      onClick={handleRemoveCoupon}
                      className="px-4 py-2 bg-red-500/20 border border-red-500 text-red-500 rounded-lg hover:bg-red-500/30 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition font-medium"
                    >
                      Áp dụng
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowCouponList(!showCouponList)}
                  className="text-sm text-pink-400 hover:text-pink-300 flex items-center gap-1"
                >
                  <Gift className="w-4 h-4" />
                  Xem danh sách mã giảm giá
                </button>

                {/* Coupon List */}
                {showCouponList && (
                  <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                    {couponService.getAvailableCoupons().map((coupon) => (
                      <button
                        key={coupon.code}
                        onClick={() => handleSelectCoupon(coupon)}
                        className="w-full p-3 bg-[#1a1a1a] border border-gray-700 rounded-lg hover:border-pink-500 transition text-left"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-pink-400 font-bold">{coupon.code}</span>
                          <span className="text-xs text-green-400">
                            {coupon.discountType === 'percentage'
                              ? `-${coupon.discountValue}%`
                              : `-${coupon.discountValue.toLocaleString('vi-VN')}đ`}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">{coupon.description}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Tạm tính</span>
                  <span className="font-semibold">{getCartTotal().toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Phí vận chuyển</span>
                  <span className="font-semibold">
                    {selectedShipping ? selectedShipping.fee.toLocaleString('vi-VN') + 'đ' : '-'}
                  </span>
                </div>
                {appliedCoupon && couponDiscount > 0 && (
                  <div className="flex justify-between text-pink-400">
                    <span>Mã giảm giá ({appliedCoupon.code})</span>
                    <span className="font-semibold">-{couponDiscount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                {formData.paymentMethod === 'wallet' && (
                  <div className="flex justify-between text-green-400">
                    <span>Giảm giá ví ({WALLET_DISCOUNT_PERCENT}%)</span>
                    <span className="font-semibold">
                      -{Math.round(getCartTotal() * (WALLET_DISCOUNT_PERCENT / 100)).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-700 pt-4">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl font-bold text-white">Tổng cộng</span>
                  <span className="text-3xl font-bold text-pink-400">
                    {(() => {
                      let total = getCartTotal();
                      if (selectedShipping) total += selectedShipping.fee;
                      if (couponDiscount > 0) total -= couponDiscount;
                      if (formData.paymentMethod === 'wallet') {
                        total = total * (1 - WALLET_DISCOUNT_PERCENT / 100);
                      }
                      return Math.max(0, Math.round(total)).toLocaleString('vi-VN');
                    })()}đ
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Miễn phí đổi trả 7 ngày</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Check className="w-4 h-4 text-blue-400" />
                    <span>Thanh toán bảo mật</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Check className="w-4 h-4 text-purple-400" />
                    <span>Hỗ trợ 24/7</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAccountModal && guestOrderData && (
        <AccountCreationModal
          email={guestOrderData.email}
          name={guestOrderData.name}
          onClose={() => {
            setShowAccountModal(false);
            navigate('/dashboard');
          }}
        />
      )}

      {showPaymentGateway && (
        <PaymentGatewayModal
          paymentMethod={formData.paymentMethod as 'vnpay' | 'momo' | 'stripe' | 'paypal'}
          amount={(() => {
            let total = getCartTotal();
            if (selectedShipping) total += selectedShipping.fee;
            if (couponDiscount > 0) total -= couponDiscount;
            return Math.max(0, Math.round(total));
          })()}
          orderId={Date.now().toString().slice(-8)}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}
    </div>
  );
}