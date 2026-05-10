from django.contrib import admin
from .models import Room

from .models import Room, Booking, UserProfile
class AdminBooking(admin.ModelAdmin):
    list_display = ('id', 'price')