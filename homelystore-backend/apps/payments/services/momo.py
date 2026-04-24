import hashlib
import hmac
import json
import requests
from datetime import datetime
from django.conf import settings

class MoMoService:
    """Service xử lý thanh toán MoMo"""
    
    def __init__(self):
        self.config = settings.MOMO_CONFIG
    
    def create_payment_url(self, order_id, amount, description):
        """
        Tạo URL thanh toán MoMo
        
        Args:
            order_id: Mã đơn hàng
            amount: Số tiền (VND)
            description: Mô tả giao dịch
        
        Returns:
            str: Payment URL
        """
        
        request_id = f"{order_id}_{int(datetime.now().timestamp())}"
        
        # Request data
        data = {
            'partnerCode': self.config['PARTNER_CODE'],
            'accessKey': self.config['ACCESS_KEY'],
            'requestId': request_id,
            'amount': str(int(amount)),
            'orderId': str(order_id),
            'orderInfo': description,
            'returnUrl': self.config['RETURN_URL'],
            'notifyUrl': self.config['NOTIFY_URL'],
            'extraData': '',
            'requestType': 'captureMoMoWallet',
        }
        
        # Create signature
        raw_signature = (
            f"partnerCode={data['partnerCode']}"
            f"&accessKey={data['accessKey']}"
            f"&requestId={data['requestId']}"
            f"&amount={data['amount']}"
            f"&orderId={data['orderId']}"
            f"&orderInfo={data['orderInfo']}"
            f"&returnUrl={data['returnUrl']}"
            f"&notifyUrl={data['notifyUrl']}"
            f"&extraData={data['extraData']}"
        )
        
        signature = hmac.new(
            self.config['SECRET_KEY'].encode('utf-8'),
            raw_signature.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        data['signature'] = signature
        
        # Send request to MoMo
        try:
            response = requests.post(
                self.config['ENDPOINT'], 
                json=data,
                timeout=10
            )
            result = response.json()
            
            if result.get('errorCode') == 0:
                return result.get('payUrl')
            else:
                raise Exception(f"MoMo error: {result.get('message', 'Unknown error')}")
        except Exception as e:
            raise Exception(f"MoMo request failed: {str(e)}")
    
    def verify_payment_callback(self, params):
        """
        Xác thực callback từ MoMo
        
        Args:
            params: Dict chứa data từ MoMo callback
        
        Returns:
            tuple: (is_valid: bool, message: str)
        """
        
        # Create signature for verification
        raw_signature = (
            f"partnerCode={params.get('partnerCode', '')}"
            f"&accessKey={params.get('accessKey', '')}"
            f"&requestId={params.get('requestId', '')}"
            f"&amount={params.get('amount', '')}"
            f"&orderId={params.get('orderId', '')}"
            f"&orderInfo={params.get('orderInfo', '')}"
            f"&orderType={params.get('orderType', '')}"
            f"&transId={params.get('transId', '')}"
            f"&message={params.get('message', '')}"
            f"&localMessage={params.get('localMessage', '')}"
            f"&responseTime={params.get('responseTime', '')}"
            f"&errorCode={params.get('errorCode', '')}"
            f"&payType={params.get('payType', '')}"
            f"&extraData={params.get('extraData', '')}"
        )
        
        signature = hmac.new(
            self.config['SECRET_KEY'].encode('utf-8'),
            raw_signature.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        # Verify signature
        if signature != params.get('signature'):
            return False, 'invalid_signature'
        
        # Check error code
        if params.get('errorCode') == '0':
            return True, 'success'
        else:
            return False, f"payment_failed_code_{params.get('errorCode')}"