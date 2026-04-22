from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='landing'),  # landing page

    path('homepage/', views.homepage, name='homepage'),  # user home

    path('admin-login/', views.admin_login, name='admin_login'),
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('logout/', views.admin_logout, name='logout'),

    path('login/', views.user_login, name='login'),
    path('register/', views.register, name='register'),
    path('rooms/', views.rooms, name='rooms'),
    path('details/', views.details, name='details'),
]