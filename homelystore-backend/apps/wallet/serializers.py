from rest_framework import serializers
from .models import WalletTransaction


class WalletTransactionSerializer(serializers.ModelSerializer):
    """Serializer cho lịch sử giao dịch"""

    class Meta:
        model = WalletTransaction
        fields = "__all__"
        read_only_fields = [
            "id",
            "balance_before",
            "balance_after",
            "created_at"
        ]


class WalletDepositSerializer(serializers.Serializer):
    """Nạp tiền"""

    amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        min_value=0
    )
    payment_method = serializers.CharField(max_length=50)


class WalletWithdrawSerializer(serializers.Serializer):
    """Rút tiền"""

    amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        min_value=0
    )