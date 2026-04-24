from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from datetime import datetime

from .models import WalletTransaction
from .serializers import (
    WalletTransactionSerializer, 
    WalletDepositSerializer, 
    WalletWithdrawSerializer
)
from .services import WalletService
from apps.payments.services import PaymentGatewayService

class WalletViewSet(viewsets.ViewSet):
    """ViewSet cho Wallet"""
    
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def balance(self, request):
        """GET /api/v1/wallet/balance/"""
        wallet_service = WalletService()
        balance = wallet_service.get_balance(request.user)
        
        return Response({
            'success': True,
            'data': {
                'balance': float(balance)
            }
        })
    
    @action(detail=False, methods=['get'])
    def transactions(self, request):
        """GET /api/v1/wallet/transactions/"""
        wallet_service = WalletService()
        transactions = wallet_service.get_transactions(request.user)
        serializer = WalletTransactionSerializer(transactions, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    @action(detail=False, methods=['post'])
    def deposit(self, request):
        """POST /api/v1/wallet/deposit/"""
        serializer = WalletDepositSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        amount = serializer.validated_data['amount']
        payment_method = serializer.validated_data['payment_method']
        
        # Create unique transaction reference
        transaction_ref = f"WALLET_DEPOSIT_{request.user.id}_{int(datetime.now().timestamp())}"
        
        # Generate payment URL
        try:
            payment_service = PaymentGatewayService()
            payment_url = payment_service.create_payment_url(
                payment_method=payment_method,
                order_id=transaction_ref,
                amount=float(amount),
                description=f"Nạp tiền vào ví - {request.user.email}"
            )
            
            return Response({
                'success': True,
                'data': {
                    'payment_url': payment_url,
                    'transaction_ref': transaction_ref,
                    'amount': float(amount),
                    'payment_method': payment_method
                },
                'message': f'Đang chuyển đến trang thanh toán {payment_method.upper()}'
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Lỗi tạo giao dịch: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def withdraw(self, request):
        """POST /api/v1/wallet/withdraw/"""
        serializer = WalletWithdrawSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        amount = serializer.validated_data['amount']
        bank_info = {
            'bank_name': serializer.validated_data['bank_name'],
            'bank_account': serializer.validated_data['bank_account'],
            'bank_owner': serializer.validated_data['bank_owner']
        }
        
        try:
            wallet_service = WalletService()
            transaction = wallet_service.withdraw(request.user, amount, bank_info)
            
            return Response({
                'success': True,
                'data': WalletTransactionSerializer(transaction).data,
                'message': 'Yêu cầu rút tiền đã được gửi. Admin sẽ xử lý trong vòng 24h.'
            }, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)