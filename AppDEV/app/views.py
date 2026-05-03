from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.messages import get_messages
from django.utils.timezone import now
from .models import Booking
from .models import UserProfile 
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.utils.text import slugify

import json
from .models import GuestBooking, Room, AdminBooking, RoomImage


# =========================
# ADMIN LOGIN
# =========================
def admin_login(request):
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None and user.is_staff:
            login(request, user)
            return redirect('admin_dashboard')
        else:
            return render(request, 'admin_login.html', {
                'error': 'Invalid admin credentials'
            })

    return render(request, 'admin_login.html')

# =========================
# PROFILE (FIXED + DB SYNC)
# =========================
@login_required
def profile(request):
    user = request.user
    profile, created = UserProfile.objects.get_or_create(user=user)

    if request.method == "POST":

        # update email
        user.email = request.POST.get("email")
        user.save()

        # update profile fields
        profile.contact_number = request.POST.get("phone")
        profile.address = request.POST.get("address")

        # image upload
        if "profile_image" in request.FILES:
            profile.profile_image = request.FILES["profile_image"]

        profile.save()

        messages.success(request, "Profile updated successfully!")
        return redirect("profile")

    # ✅ COUNT BOOKINGS (for display)
    total_bookings = Booking.objects.filter(email=user.email).count() if user.email else 0

    return render(request, "profile.html", {
        "username": user.username,
        "email": user.email,
        "date_joined": user.date_joined,
        "last_login": user.last_login,
        "profile": profile,
        "total_bookings": total_bookings,
    })

# =========================
# LANDING PAGE
# =========================
def home(request):
    return render(request, 'landing.html')


# =========================
# USER HOMEPAGE
# =========================
def homepage(request):
    return render(request, 'homepage.html')


# =========================
# ADMIN DASHBOARD
# =========================
@login_required
def admin_dashboard(request):
    today = now().date()

    total_bookings = Booking.objects.count()

    # =========================
    # TOTAL GUESTS (auth_user)
    # =========================
    total_guests = User.objects.filter(
        is_staff=False,
        is_superuser=False
    ).count()

    # =========================
    # CHECK IN (ALL CONFIRMED BOOKINGS)
    # =========================
    check_in_count = Booking.objects.filter(
        status='Confirmed'
    ).count()

    # =========================
    # CHECK OUT (TODAY ONLY + CONFIRMED)
    # =========================
    check_out_count = Booking.objects.filter(
        status='Confirmed',
        check_out_date=today
    ).count()

    recent_reservations = Booking.objects.order_by('-id')[:5]

    context = {
        'total_bookings': total_bookings,
        'total_guests': total_guests,
        'check_in_count': check_in_count,
        'check_out_count': check_out_count,
        'recent_reservations': recent_reservations,
    }

    return render(request, 'admin_dashboard.html', context)




# =========================
# LOGOUT
# =========================
def admin_logout(request):
    logout(request)
    return redirect('home')


# =========================
# USER LOGIN
# =========================
def user_login(request):

    # ✅ CLEAR OLD MESSAGES (IMPORTANT FIX)
    storage = get_messages(request)
    storage.used = True

    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect('homepage')
        else:
            messages.error(request, "Invalid username or password")
            return render(request, 'login.html')

    return render(request, 'login.html')


# =========================
# REGISTER
# =========================
def register(request):
    if request.method == "POST":
        username = request.POST.get('username')
        email = request.POST.get('email')
        password1 = request.POST.get('password1')
        password2 = request.POST.get('password2')

        if password1 != password2:
            return render(request, 'register.html', {
                'error': 'Passwords do not match'
            })

        if User.objects.filter(username=username).exists():
            return render(request, 'register.html', {
                'error': 'Username already exists'
            })

        User.objects.create_user(
            username=username,
            email=email,
            password=password1
        )

        messages.success(request, "Account created successfully. Please login.")
        return redirect('login')

    return render(request, 'register.html')


# =========================
# ROOMS PAGE (GUEST SIDE)
# =========================
def rooms(request):
    room_list = Room.objects.filter(is_available=True)

    for room in room_list:
        if room.amenities:
            room.amenities_list = [a.strip() for a in room.amenities.split(",")]
        else:
            room.amenities_list = []

    return render(request, 'rooms.html', {'rooms': room_list})


# =========================
# ROOM DETAILS PAGE
# =========================
def details(request):
    room_slug = request.GET.get('room')

    room = None
    if room_slug:
        room = Room.objects.filter(
            room_type__iexact=room_slug.replace("-", " ")
        ).first()

        # 🔥 THIS IS THE FIX
        if room and room.amenities:
            room.amenities_list = [a.strip() for a in room.amenities.split(",")]
        else:
            room.amenities_list = []

    return render(request, 'details.html', {
        'room': room
    })


# =========================
# ADMIN ROOMS PAGE
# =========================
@login_required
def admin_rooms(request):

    if request.method == "POST":
        Room.objects.create(
            room_type=request.POST.get('room_type'),
            price=request.POST.get('price'),
            max_guests=request.POST.get('max_guests'),
            amenities=request.POST.get('amenities'),
            details=request.POST.get('details'),
            image=request.FILES.get('image'),
            is_available=True
        )

        return redirect('admin_rooms')

    rooms = Room.objects.all().order_by('-created_at')

    print("ROOM COUNT:", rooms.count())  # DEBUG

    return render(request, 'admin_rooms.html', {
        'rooms': rooms
    })

def admin_guests(request):
    return render(request, "admin_guests.html")

@login_required
def admin_bookings(request):
    bookings = Booking.objects.filter(status__iexact='Pending').order_by('-created_at')

    room_prices = {
        "single": 2000,
        "twin": 3200,
        "standard": 3900,
        "family": 5000,
        "deluxe": 5500,
        "suite": 7000,
        "superior": 8500,
        "executive": 10000,
        "seaview": 12500,
        "penthouse": 20000,
    }

    for b in bookings:
        b.total_price = b.price

    return render(request, "admin_bookings.html", {
        "bookings": bookings
    })

@login_required
def delete_booking(request, booking_id):
    booking = get_object_or_404(Booking, id=booking_id)

    # ✅ Instead of deleting, mark as Cancelled/Rejected
    booking.status = 'Cancelled'
    booking.save()

    return redirect('admin_bookings')

# =========================
# Reject Reservations
# =========================
@login_required
def reject_booking(request, booking_id):
    booking = get_object_or_404(Booking, id=booking_id)

    booking.status = 'Rejected'
    booking.save()

    return redirect('admin_bookings')



# =========================
# EDIT ROOM
# =========================
@login_required
def edit_room(request, room_id):

    room = get_object_or_404(Room, id=room_id)

    if request.method == "POST":

        room.room_type = request.POST.get('room_type') or room.room_type
        room.price = request.POST.get('price') or room.price
        room.max_guests = request.POST.get('max_guests') or room.max_guests
        room.amenities = request.POST.get('amenities') or room.amenities
        room.details = request.POST.get('details') or room.details

        if request.FILES.get('image'):
            room.image = request.FILES.get('image')

        room.save()

        print("🔥 ROOM UPDATED SUCCESSFULLY")

        return redirect('admin_rooms')

    return render(request, 'edit_room.html', {'room': room})


# =========================
# DELETE ROOM
# =========================
@login_required
def delete_room(request, room_id):
    room = get_object_or_404(Room, id=room_id)
    room.delete()
    return redirect('admin_rooms')  # FIXED


# =========================
# TOGGLE ROOM STATUS
# =========================
@login_required
def toggle_room_status(request, room_id):
    room = get_object_or_404(Room, id=room_id)
    room.is_available = not room.is_available
    room.save()
    return redirect('admin_rooms')  # FIXED

# =========================
# Book Now
# =========================
def room_details(request):
    if request.method == "POST":

        print("ROOM DETAILS VIEW HIT")  # 🔥 DEBUG

        room = request.POST.get("room")
        name = request.POST.get("fullName")
        contact = request.POST.get("contactNumber")
        email = request.POST.get("emailAddress")
        date = request.POST.get("datePicker")
        guests = request.POST.get("guests")

        print(room, name, email)  # 🔥 DEBUG CHECK

        room_prices = {
            "single": 2000,
            "twin": 3200,
            "standard": 3900,
            "family": 5000,
            "deluxe": 5500,
            "suite": 7000,
            "superior": 8500,
            "executive": 10000,
            "seaview": 12500,
            "penthouse": 20000,
        }

        price = room_prices.get(room.lower(), 0)

        Booking.objects.create(
        room=room,
        full_name=name,
        contact_number=contact,
        email=email,
        check_in_date=date,
        guests=guests,
        price=price,   # ✅ ADD THIS
        status='Pending'
)


        messages.success(request, "Booking saved!")

        return redirect('rooms')

    return render(request, "details.html")

# =========================
# ✅ NEW API FOR FETCH (IMPORTANT FIX)
# =========================
@csrf_exempt
def book_room(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            room_prices = {
                "single": 2000,
                "twin": 3200,
                "standard": 3900,
                "family": 5000,
                "deluxe": 5500,
                "suite": 7000,
                "superior": 8500,
                "executive": 10000,
                "seaview": 12500,
                "penthouse": 20000,
            }

            room_name = (data.get("room") or "").lower().replace(" room", "").strip()
            price = room_prices.get(room_name, 0)

            Booking.objects.create(
            user=request.user,   # 🔥 IMPORTANT
            room=data.get("room"),
            full_name=data.get("full_name"),
            contact_number=data.get("contact_number"),
            email=data.get("email"),
            check_in_date=data.get("check_in_date"),
            check_out_date=data.get("check_out_date"),
            guests=data.get("guests"),
            price=price,   # ✅ ADD THIS
            status='Pending'
)

            return JsonResponse({
                "status": "success",
                "message": "Booking saved successfully"
            })

        except Exception as e:
            print("ERROR:", e)  # 🔥 DEBUG
            return JsonResponse({
                "status": "error",
                "message": str(e)
            })

    return JsonResponse({
        "status": "error",
        "message": "Invalid method"
    })


# =========================
# SCHEDULE (NEW FIXED)
# =========================
@login_required
def schedule(request):
    user_email = request.user.email

    # ✅ ALL BOOKINGS (including Pending, Confirmed, Cancelled)
    reservations = Booking.objects.filter(
        email=user_email
    ).order_by('-created_at')

    # ✅ HISTORY (optional if completed)
    history = Booking.objects.filter(
        email=user_email,
        status='Completed'
    ).order_by('-created_at')

    return render(request, "schedule.html", {
        "reservations": reservations,
        "history": history
    })




# =========================
# ADMIN BOOKING
# =========================
@login_required
def confirm_booking(request, booking_id):
    booking = get_object_or_404(Booking, id=booking_id)

    booking.status = 'Confirmed'
    booking.save()

    return redirect('admin_bookings')


# =========================
# Admin Guests
# =========================

@login_required
def admin_guests(request):
    if not request.user.is_staff:
        return redirect('home')

    guests = User.objects.filter(
        is_staff=False,
        is_superuser=False
    ).order_by('-date_joined')

    for g in guests:
        g.total_bookings = Booking.objects.filter(user=g).count()

    return render(request, 'admin_guests.html', {
        'guests': guests
    })


@login_required
def delete_guest(request, user_id):
    if not request.user.is_staff:
        return redirect('home')

    user = get_object_or_404(User, id=user_id)
    user.delete()
    return redirect('admin_guests')




