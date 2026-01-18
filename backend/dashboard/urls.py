from django.urls import path
from . import views

urlpatterns = [
    path('summary/', views.dashboard_summary_view, name='dashboard-summary'),
]
