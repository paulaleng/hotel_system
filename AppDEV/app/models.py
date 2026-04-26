from django.db import models
from django.contrib.auth.models import User 

# =========================
# ROOM TABLE
# =========================
class Room(models.Model):
    ROOM_TYPES = [
        ('Standard', 'Standard'),
        ('Deluxe', 'Deluxe'),
        ('Suite', 'Suite'),
        ('Executive', 'Executive'),
    ]

    room_number = models.CharField(max_length=10, unique=True)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPES)

    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    image = models.ImageField(upload_to='rooms/', null=True, blank=True)

    is_available = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)   # NEW
    updated_at = models.DateTimeField(auto_now=True)       # NEW

    def __str__(self):
        return f"Room {self.room_number} ({self.room_type})"


# =========================
# GUEST BOOKING TABLE
# =========================
class GuestBooking(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Active', 'Active'),
        ('Completed', 'Completed'),
    ]

    guest_name = models.CharField(max_length=100)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='bookings')

    check_in = models.DateField()
    check_out = models.DateField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Pending'  # NEW DEFAULT
    )

    created_at = models.DateTimeField(auto_now_add=True)  # NEW

    class Meta:
        ordering = ['-created_at']  # NEW (latest bookings first)

    def __str__(self):
        return f"{self.guest_name} - Room {self.room.room_number}"
    

# =========================
# BOOKING TABLE
# =========================
class Booking(models.Model):

    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Confirmed', 'Confirmed'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]

    ROOM_CHOICES = [
        ('single', 'Single Room'),
        ('twin', 'Twin Room'),
        ('standard', 'Standard Room'),
        ('family', 'Family Room'),
        ('deluxe', 'Deluxe Room'),
        ('suite', 'Suite Room'),
        ('superior', 'Superior Room'),
        ('executive', 'Executive Room'),
        ('seaview', 'Sea View Suite'),
        ('penthouse', 'Penthouse Room'),
    ]

    room = models.CharField(max_length=50)
    full_name = models.CharField(max_length=100)
    contact_number = models.CharField(max_length=15)
    email = models.EmailField()

    check_in_date = models.DateField()
    check_out_date = models.DateField()   # ✅ ADDED

    guests = models.IntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    status = models.CharField(        # ✅ ADDED
        max_length=20,
        choices=STATUS_CHOICES,
        default='Pending'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} - {self.room}"

    
# =========================
# USER PROFILE (🔥 MISSING BEFORE — THIS IS THE FIX)
# =========================
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    contact_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    profile_image = models.ImageField(
        upload_to='profiles/',
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.username
    
# =========================
# ADMIN BOOKINGS TABLE
# (FOR ADMIN DASHBOARD DISPLAY ONLY)
# =========================
class AdminBooking(models.Model):

    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Confirmed', 'Confirmed'),
        ('Cancelled', 'Cancelled'),
    ]

    room = models.CharField(max_length=100)  # ✅ CHANGE THIS

    guest_name = models.CharField(max_length=100)
    email = models.EmailField()
    contact_number = models.CharField(max_length=15)

    check_in_date = models.DateField()
    check_out_date = models.DateField(null=True, blank=True)

    guests = models.IntegerField(default=1)

    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Pending'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.guest_name} - {self.room.room_number}"
    
# =========================
# ADMIN GUEST
# =========================
class Guest(models.Model):
    username = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username
