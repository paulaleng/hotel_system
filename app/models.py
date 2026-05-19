from django.db import models
from django.contrib.auth.models import User


# =========================
# ROOM TABLE
# =========================
class Room(models.Model):

    ROOM_TYPES = [
        ('Single', 'Single Room'),
        ('Twin', 'Twin Room'),
        ('Standard', 'Standard Room'),
        ('Family', 'Family Room'),
        ('Deluxe', 'Deluxe Room'),
        ('Suite', 'Suite Room'),
        ('Superior', 'Superior Room'),
        ('Executive', 'Executive Room'),
        ('Seaview', 'Sea View Suite'),
        ('Penthouse', 'Penthouse Room'),
    ]

    room_type   = models.CharField(max_length=20, choices=ROOM_TYPES)
    price       = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    image       = models.ImageField(upload_to='rooms/', null=True, blank=True)
    max_guests  = models.IntegerField(default=1)
    amenities   = models.TextField(blank=True, null=True)
    details     = models.TextField(blank=True, null=True)
    is_available = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.room_type


# =========================
# ROOM GALLERY
# =========================
class RoomImage(models.Model):
    room       = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='gallery')
    image      = models.ImageField(upload_to='rooms/gallery/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.room.room_type} - Gallery Image"


# =========================
# BOOKING TABLE
# =========================
class Booking(models.Model):

    STATUS_CHOICES = [
        ('Pending',   'Pending'),
        ('Confirmed', 'Confirmed'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
        ('Rejected',  'Rejected'),
    ]

    user           = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    room           = models.CharField(max_length=50)
    full_name      = models.CharField(max_length=100)
    contact_number = models.CharField(max_length=15)
    email          = models.EmailField()
    check_in_date  = models.DateField()
    check_out_date = models.DateField(null=True, blank=True)
    guests         = models.IntegerField(default=1)
    price          = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at     = models.DateTimeField(auto_now_add=True)
    nights = models.IntegerField(default=0)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    downpayment = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.full_name} - {self.room}"


# =========================
# USER PROFILE
# =========================
class UserProfile(models.Model):
    user           = models.OneToOneField(User, on_delete=models.CASCADE)
    contact_number = models.CharField(max_length=20, blank=True, null=True)
    address        = models.TextField(blank=True, null=True)
    profile_image  = models.ImageField(upload_to='profiles/', null=True, blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.username

# models.py
class EmailOTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        from django.utils.timezone import now
        return (now() - self.created_at).seconds < 300  # 5 minutes