import hashlib
import hmac
import urllib.parse
from datetime import datetime
from django.conf import settings

class VNPayService:
    """Service xử lý thanh toán VNPay"""
    
    def __init__(self):
        self.config = settings.VNPAY_CONFIG
    
    def create_payment_url(self, order_id, amount, description):
        """
        Tạo URL thanh toán VNPay
        
        Args:
            order_id: Mã đơn hàng hoặc transaction ref
            amount: Số tiền (VND)
            description: Mô tả giao dịch
        
        Returns:
            str: Payment URL
        """
        
        # VNPay parameters
        vnp_params = {
            'vnp_Version': '2.1.0',
            'vnp_Command': 'pay',
            'vnp_TmnCode': self.config['TMN_CODE'],
            'vnp_Amount': int(amount * 100),  # VNPay yêu cầu amount * 100
            'vnp_CurrCode': 'VND',
            'vnp_TxnRef': str(order_id),
            'vnp_OrderInfo': description,
            'vnp_OrderType': 'other',
            'vnp_Locale': 'vn',
            'vnp_ReturnUrl': self.config['RETURN_URL'],
            'vnp_CreateDate': datetime.now().strftime('%Y%m%d%H%M%S'),
            'vnp_IpAddr': '127.0.0.1',
        }
        
        # Sort parameters
        sorted_params = sorted(vnp_params.items())
        
        # Create query string
        query_string = '&'.join([
            f"{key}={urllib.parse.quote_plus(str(val))}" 
            for key, val in sorted_params
        ])
        
        # Create secure hash
        hash_data = '&'.join([f"{key}={val}" for key, val in sorted_params])
        secure_hash = hmac.new(
            self.config['HASH_SECRET'].encode('utf-8'),
            hash_data.encode('utf-8'),
            hashlib.sha512
        ).hexdigest()
        
        # Final payment URL
        payment_url = f"{self.config['URL']}?{query_string}&vnp_SecureHash={secure_hash}"
        
        return payment_url
    
    def verify_payment_callback(self, params):
        """
        Xác thực callback từ VNPay
        
        Args:
            params: Dict chứa query parameters từ VNPay callback
        
        Returns:
            tuple: (is_valid: bool, message: str)
        """
        
        vnp_secure_hash = params.get('vnp_SecureHash')
        
        # Remove hash from params for verification
        input_data = {k: v for k, v in params.items() if k != 'vnp_SecureHash'}
        
        # Sort and create hash
        sorted_params = sorted(input_data.items())
        hash_data = '&'.join([f"{key}={val}" for key, val in sorted_params])
        secure_hash = hmac.new(
            self.config['HASH_SECRET'].encode('utf-8'),
            hash_data.encode('utf-8'),
            hashlib.sha512
        ).hexdigest()
        
        # Verify signature
        if secure_hash != vnp_secure_hash:
            return False, 'invalid_signature'
        
        # Check response code
        response_code = params.get('vnp_ResponseCode')
        if response_code == '00':
            return True, 'success'
        else:
            return False, f'payment_failed_code_{response_code}'