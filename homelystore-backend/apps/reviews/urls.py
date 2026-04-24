from django.urls import path
from .views import (
    ReviewListCreateView,
    ReviewStatusUpdateView,
    ReviewDeleteView
)

urlpatterns = [

    path("", ReviewListCreateView.as_view()),

    path("<int:review_id>/status/", ReviewStatusUpdateView.as_view()),

    path("<int:review_id>/",ReviewDeleteView.as_view()),
]