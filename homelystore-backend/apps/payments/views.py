from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import redirect
from django.db import transaction

from .services import VNPayService, MoMoService
from apps.orders.models import Order
from apps.wallet.services import WalletService

class VNPayCallbackView(APIView):
    """Callback từ VNPay sau khi thanh toán"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        """GET /api/v1/payments/vnpay/callback"""
        
        vnpay_service = VNPayService()
        is_valid, message = vnpay_service.verify_payment_callback(request.GET.dict())
        
        transaction_ref = request.GET.get('vnp_TxnRef', '')
        
        if is_valid:
            # Check if this is wallet deposit or order payment
            if transaction_ref.startswith('WALLET_DEPOSIT_'):
                # Wallet deposit
                try:
                    user_id = transaction_ref.split('_')[2]
                    amount = float(request.GET.get('vnp_Amount', 0)) / 100
                    
                    from apps.authentication.models import User
                    user = User.objects.get(id=user_id)
                    
                    wallet_service = WalletService()
                    wallet_service.deposit(
                        user=user,
                        amount=amount,
                        payment_method='vnpay',
                        transaction_ref=transaction_ref
                    )
                    
                    return redirect(f'http://localhost:3000/dashboard?tab=wallet&success=deposit&amount={amount}')
                except Exception as e:
                    return redirect(f'http://localhost:3000/payment/failed?error=deposit_failed')
            else:
                # Order payment
                try:
                    order = Order.objects.get(id=transaction_ref)
                    order.payment_status = 'completed'
                    order.save()
                    
                    return redirect(f'http://localhost:3000/payment/success?orderId={transaction_ref}')
                except Order.DoesNotExist:
                    return redirect('http://localhost:3000/payment/failed?error=order_not_found')
        else:
            return redirect(f'http://localhost:3000/payment/failed?error={message}')

class MoMoCallbackView(APIView):
    """Callback từ MoMo"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        """GET callback from browser redirect"""
        return self.process_callback(request.GET.dict())
    
    def post(self, request):
        """POST webhook from MoMo server"""
        return self.process_callback(request.data)
    
    def process_callback(self, data):
        """Process MoMo callback"""
        
        momo_service = MoMoService()
        is_valid, message = momo_service.verify_payment_callback(data)
        
        transaction_ref = data.get('orderId', '')
        
        if is_valid:
            # Similar logic như VNPay
            if transaction_ref.startswith('WALLET_DEPOSIT_'):
                # Wallet deposit
                try:
                    user_id = transaction_ref.split('_')[2]
                    amount = float(data.get('amount', 0))
                    
                    from apps.authentication.models import User
                    user = User.objects.get(id=user_id)
                    
                    wallet_service = WalletService()
                    wallet_service.deposit(
                        user=user,
                        amount=amount,
                        payment_method='momo',
                        transaction_ref=transaction_ref
                    )
                    
                    if 'HTTP_REFERER' in data:
                        # Browser redirect
                        return redirect(f'http://localhost:3000/dashboard?tab=wallet&success=deposit')
                    else:
                        # Webhook
                        return Response({'success': True, 'message': 'Nạp tiền thành công'})
                except Exception as e:
                    return Response({'success': False, 'error': str(e)})
            else:
                # Order payment
                try:
                    order = Order.objects.get(id=transaction_ref)
                    order.payment_status = 'completed'
                    order.save()
                    
                    return Response({'success': True})
                except Order.DoesNotExist:
                    return Response({'success': False, 'error': 'order_not_found'})
        else:
            return Response({'success': False, 'error': message})