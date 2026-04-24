from .vnpay import VNPayService
from .momo import MoMoService

class PaymentGatewayService:
    """Main service quản lý các payment gateway"""
    
    def create_payment_url(self, payment_method, order_id, amount, description):
        """
        Tạo payment URL theo payment method
        
        Args:
            payment_method: 'vnpay', 'momo', 'stripe', 'paypal'
            order_id: Mã đơn hàng
            amount: Số tiền
            description: Mô tả giao dịch
        
        Returns:
            str: Payment URL
        
        Raises:
            ValueError: Nếu payment method không hỗ trợ
        """
        
        if payment_method == 'vnpay':
            service = VNPayService()
            return service.create_payment_url(order_id, amount, description)
        
        elif payment_method == 'momo':
            service = MoMoService()
            return service.create_payment_url(order_id, amount, description)
        
        elif payment_method == 'stripe':
            # TODO: Implement Stripe
            raise NotImplementedError("Stripe chưa được implement")
        
        elif payment_method == 'paypal':
            # TODO: Implement PayPal
            raise NotImplementedError("PayPal chưa được implement")
        
        else:
            raise ValueError(f"Payment method không hỗ trợ: {payment_method}")
    
    def verify_callback(self, payment_method, params):
        """
        Xác thực callback từ payment gateway
        
        Args:
            payment_method: 'vnpay', 'momo', etc
            params: Callback parameters
        
        Returns:
            tuple: (is_valid: bool, message: str)
        """
        
        if payment_method == 'vnpay':
            service = VNPayService()
            return service.verify_payment_callback(params)
        
        elif payment_method == 'momo':
            service = MoMoService()
            return service.verify_payment_callback(params)
        
        else:
            return False, 'unsupported_payment_method'