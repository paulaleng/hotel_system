from django.contrib import admin
from .models import GuestBooking, Room

from .models import Room, Booking, UserProfile, AdminBooking
class AdminBooking(admin.ModelAdmin):
    list_display = ('id', 'price')