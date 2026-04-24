from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from .models import WalletTransaction
from apps.authentication.models import User

class WalletService:
    """Service xử lý ví điện tử"""
    
    @transaction.atomic
    def process_payment(self, user, amount, order_id):
        """
        Xử lý thanh toán bằng ví
        Returns: (success: bool, message: str)
        """
        
        # Check balance
        if user.wallet_balance < amount:
            needed = amount - user.wallet_balance
            return False, f"Số dư ví không đủ. Cần nạp thêm {needed:,.0f}đ"
        
        # Calculate discount (2%)
        discount = amount * Decimal('0.02')
        final_amount = amount - discount
        
        balance_before = user.wallet_balance
        balance_after = balance_before - final_amount
        
        # Update user balance
        user.wallet_balance = balance_after
        user.save(update_fields=['wallet_balance'])
        
        # Create transaction
        WalletTransaction.objects.create(
            user=user,
            type='payment',
            amount=final_amount,
            balance_before=balance_before,
            balance_after=balance_after,
            description=f"Thanh toán đơn hàng {order_id} (Giảm giá 2%: -{discount:,.0f}đ)",
            status='completed',
            created_at=timezone.now()
        )
        
        return True, "Thanh toán thành công"
    
    @transaction.atomic
    def deposit(self, user, amount, payment_method, transaction_ref):
        """
        Nạp tiền vào ví
        Returns: WalletTransaction
        """
        
        balance_before = user.wallet_balance
        balance_after = balance_before + amount
        
        # Update user balance
        user.wallet_balance = balance_after
        user.save(update_fields=['wallet_balance'])
        
        # Create transaction
        transaction = WalletTransaction.objects.create(
            user=user,
            type='deposit',
            amount=amount,
            balance_before=balance_before,
            balance_after=balance_after,
            description=f"Nạp tiền qua {payment_method.upper()}",
            status='completed',
            payment_method=payment_method,
            transaction_ref=transaction_ref,
            created_at=timezone.now()
        )
        
        return transaction
    
    @transaction.atomic
    def withdraw(self, user, amount, bank_info):
        """
        Rút tiền từ ví
        Returns: WalletTransaction
        Raises: ValueError nếu số dư không đủ
        """
        
        # Minimum withdrawal: 50,000đ
        if amount < 50000:
            raise ValueError("Số tiền rút tối thiểu là 50,000đ")
        
        # Check balance
        if user.wallet_balance < amount:
            raise ValueError("Số dư ví không đủ")
        
        balance_before = user.wallet_balance
        balance_after = balance_before - amount
        
        # Update user balance
        user.wallet_balance = balance_after
        user.save(update_fields=['wallet_balance'])
        
        # Create transaction (pending - chờ admin duyệt)
        transaction = WalletTransaction.objects.create(
            user=user,
            type='withdrawal',
            amount=amount,
            balance_before=balance_before,
            balance_after=balance_after,
            description=f"Rút tiền về {bank_info['bank_name']} - STK: {bank_info['bank_account']} - CTK: {bank_info['bank_owner']}",
            status='pending',
            created_at=timezone.now()
        )
        
        return transaction
    
    @transaction.atomic
    def refund_payment(self, user, amount, order_id):
        """
        Hoàn tiền vào ví (khi hủy đơn hàng)
        Returns: WalletTransaction
        """
        
        balance_before = user.wallet_balance
        balance_after = balance_before + amount
        
        # Update user balance
        user.wallet_balance = balance_after
        user.save(update_fields=['wallet_balance'])
        
        # Create transaction
        transaction = WalletTransaction.objects.create(
            user=user,
            type='refund',
            amount=amount,
            balance_before=balance_before,
            balance_after=balance_after,
            description=f"Hoàn tiền đơn hàng {order_id}",
            status='completed',
            created_at=timezone.now()
        )
        
        return transaction
    
    def get_balance(self, user):
        """Lấy số dư ví"""
        return user.wallet_balance
    
    def get_transactions(self, user, limit=None):
        """Lấy lịch sử giao dịch"""
        queryset = WalletTransaction.objects.filter(user=user).order_by('-created_at')
        if limit:
            queryset = queryset[:limit]
        return queryset