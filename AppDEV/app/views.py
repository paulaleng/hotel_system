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

import json
from .models import GuestBooking, Room, AdminBooking


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

    total_bookings = GuestBooking.objects.count()
    total_rooms = Room.objects.count()

    booked_rooms_today = Room.objects.filter(
        bookings__check_in__lte=today,
        bookings__check_out__gte=today
    ).distinct().count()

    available_rooms = max(total_rooms - booked_rooms_today, 0)

    check_in_count = GuestBooking.objects.filter(check_in=today).count()
    check_out_count = GuestBooking.objects.filter(check_out=today).count()

    recent_reservations = GuestBooking.objects.select_related('room').order_by('-id')[:5]

    context = {
        'total_bookings': total_bookings,
        'available_rooms': available_rooms,
        'booked_rooms_today': booked_rooms_today,
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
    return render(request, 'rooms.html', {'rooms': room_list})


# =========================
# ROOM DETAILS PAGE
# =========================
def details(request):
    return render(request, 'details.html')



# =========================
# ADMIN ROOMS PAGE
# =========================
@login_required
def admin_rooms(request):
    rooms = Room.objects.all()
    return render(request, 'admin_rooms.html', {'rooms': rooms})

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
    booking.delete()
    return redirect('admin_bookings')




# =========================
# ADD ROOM
# =========================
@login_required
def add_room(request):
    if request.method == "POST":
        Room.objects.create(
            room_number=request.POST.get('room_number'),
            room_type=request.POST.get('room_type'),
            price=request.POST.get('price'),
            image=request.FILES.get('image'),
            is_available=True
        )
        return redirect('admin_rooms')  # IMPORTANT

    return render(request, 'add_room.html')


# =========================
# EDIT ROOM
# =========================
@login_required
def edit_room(request, room_id):
    room = get_object_or_404(Room, id=room_id)

    if request.method == "POST":
        room.room_number = request.POST.get('room_number')
        room.room_type = request.POST.get('room_type')
        room.price = request.POST.get('price')

        if request.FILES.get('image'):
            room.image = request.FILES.get('image')

        room.save()
        return redirect('admin_rooms')  # FIXED

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

    # 🔥 UPCOMING = ADMIN CONFIRMED BUT NOT COMPLETED
    upcoming = AdminBooking.objects.filter(
        email=user_email,
        status='Confirmed'
    ).order_by('-check_in_date')

    # 🔥 HISTORY = COMPLETED BOOKINGS
    history = AdminBooking.objects.filter(
        email=user_email,
        status='Completed'
    ).order_by('-check_in_date')

    return render(request, "schedule.html", {
        "upcoming": upcoming,
        "history": history
    })


# =========================
# ADMIN BOOKING
# =========================
@login_required
def confirm_booking(request, booking_id):

    try:
        booking = get_object_or_404(Booking, id=booking_id)

        # ✅ DIRECT MATCH USING STRING (NO Room FK PROBLEM)
        room_name = booking.room

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

        clean_key = room_name.lower().replace(" room", "").strip()
        base_price = room_prices.get(clean_key, 0)

        # compute days
        days = (booking.check_out_date - booking.check_in_date).days
        days = max(days, 1)

        total_price = base_price * days

        # ✅ CREATE ADMIN BOOKING (FIXED)
        AdminBooking.objects.create(
            room=booking.room,   # STRING FIX (no FK crash)
            guest_name=booking.full_name,
            email=booking.email,
            contact_number=booking.contact_number,
            check_in_date=booking.check_in_date,
            check_out_date=booking.check_out_date,
            guests=booking.guests,
            price=total_price,
            status='Confirmed'
        )

        booking.status = 'Confirmed'
        booking.save()

        messages.success(request, "Booking confirmed successfully!")
        return redirect('admin_bookings')

    except Exception as e:
        print("CONFIRM ERROR:", e)
        return redirect('admin_bookings')







