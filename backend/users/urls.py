from django.urls import path, include
from . import views

urlpatterns = [
    # Customer endpoints
    path('register/', views.UserRegistrationView.as_view(), name='user-register'),
    path('login/', views.login_view, name='user-login'),
    path('logout/', views.logout_view, name='user-logout'),
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('dashboard/', views.user_dashboard, name='user-dashboard'),
    
    # Admin customer management
    path('', include('users.admin_urls')),
]
