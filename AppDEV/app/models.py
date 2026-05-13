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

    room_type = models.CharField(max_length=20, choices=ROOM_TYPES)

    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    image = models.ImageField(upload_to='rooms/', null=True, blank=True)
    max_guests = models.IntegerField(default=1)
    amenities = models.TextField(blank=True, null=True)
    details = models.TextField(blank=True, null=True)

    is_available = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.room_type}"


# =========================
# ROOM GALLERY (NEW)
# =========================
class RoomImage(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='gallery')
    image = models.ImageField(upload_to='rooms/gallery/')

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.room.room_number} - Gallery Image"


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
        return f"{self.guest_name} - {self.room}"

    

# =========================
# BOOKING TABLE
# =========================
class Booking(models.Model):

    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Confirmed', 'Confirmed'),
        ('Completed', 'Completed'),
        ('Rejected', 'Rejected'),
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

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
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
        ('Rejected', 'Rejected'),
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
        return f"{self.guest_name} - {self.room}"

    
# =========================
# EMAIL VERIFICATION (FOR LOGIN 2FA)
# =========================
class EmailVerification(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='email_verification')
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.email} - Code Verification"

    
# =========================
# ADMIN GUEST
# =========================
class Guest(models.Model):
    username = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username
