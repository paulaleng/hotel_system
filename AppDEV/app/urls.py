from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='landing'),

    path('homepage/', views.homepage, name='homepage'),

    path('admin-login/', views.admin_login, name='admin_login'),
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),

    path('logout/', views.admin_logout, name='logout'),

    path('login/', views.user_login, name='login'),
    path('register/', views.register, name='register'),

    path('rooms/', views.rooms, name='rooms'),
    path('details/', views.details, name='details'),
    path("profile/", views.profile, name="profile"),
    path('schedule/', views.schedule, name='schedule'),
    path('room-details/', views.room_details, name='room_details'),

    # =========================
    # ✅ API ROUTE (FIXED)
    # =========================
    path('api/book-room/', views.book_room, name='book_room'),

    # =========================
    # ADMIN ROOMS ROUTES
    # =========================
    path('dashboard/rooms/', views.admin_rooms, name='admin_rooms'),
    path('dashboard/rooms/add/', views.add_room, name='add_room'),
    path('dashboard/rooms/edit/<int:room_id>/', views.edit_room, name='edit_room'),
    path('dashboard/rooms/delete/<int:room_id>/', views.delete_room, name='delete_room'),
    path('dashboard/rooms/toggle/<int:room_id>/', views.toggle_room_status, name='toggle_room_status'),
    path('dashboard/guests/', views.admin_guests, name='admin_guests'),
    path('dashboard/bookings/', views.admin_bookings, name='admin_bookings'),
    path('dashboard/bookings/confirm/<int:booking_id>/', views.confirm_booking, name='confirm_booking'),
    path('dashboard/bookings/delete/<int:booking_id>/', views.delete_booking, name='delete_booking'),


]
    