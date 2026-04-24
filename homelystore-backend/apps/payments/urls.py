from django.urls import path
from .views import VNPayCallbackView, MoMoCallbackView

app_name = 'payments'

urlpatterns = [
    path('vnpay/callback', VNPayCallbackView.as_view(), name='vnpay-callback'),
    path('momo/callback', MoMoCallbackView.as_view(), name='momo-callback'),
    path('momo/webhook', MoMoCallbackView.as_view(), name='momo-webhook'),
]