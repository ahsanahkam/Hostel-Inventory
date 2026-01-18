from django.urls import path, include

urlpatterns = [
    path('api/users/', include('users.urls')),
    path('api/assets/', include('assets.urls')),
    path('api/rooms/', include('rooms.urls')),
    path('api/dashboard/', include('dashboard.urls')),
]
