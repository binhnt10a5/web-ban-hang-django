from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import status

from .models import Review
from .serializers import ReviewSerializer
from apps.orders.models import Order


class ReviewListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        product_id = request.GET.get("productId")
        status_filter = request.GET.get("status")

        reviews = Review.objects.all()

        if product_id:
            reviews = reviews.filter(product_id=product_id)

        if status_filter:
            reviews = reviews.filter(status=status_filter)

        serializer = ReviewSerializer(reviews, many=True)

        return Response({
            "success": True,
            "data": serializer.data
        })


    def post(self, request):

        serializer = ReviewSerializer(data=request.data)

        if serializer.is_valid():

            review = serializer.save(user=request.user)

            # update order status
            order = review.order
            if order.status == "delivered":
                order.status = "awaiting_review"
                order.save()

            return Response({
                "success": True,
                "data": ReviewSerializer(review).data
            })

        return Response({
            "success": False,
            "error": serializer.errors
        }, status=400)