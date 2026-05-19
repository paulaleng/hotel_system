from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.messages import get_messages
from django.utils.timezone import now
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.core import signing

import json
import random
from .models import Booking, UserProfile, Room
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# =========================
# TOKEN HELPERS
# (uses Django's built-in signing — no DRF needed)
# =========================
def make_token(user):
    """Create a signed token encoding the user's pk."""
    return signing.dumps({'user_id': user.pk}, salt='auth-token')


def get_user_from_token(request):
    """Return User from 'Authorization: Token <token>' header, or None."""
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Token '):
        return None
    token_key = auth.split(' ', 1)[1]
    try:
        # Token valid for 30 days
        data = signing.loads(token_key, salt='auth-token', max_age=60 * 60 * 24 * 30)
        return User.objects.get(pk=data['user_id'])
    except Exception:
        return None


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
            return render(request, 'admin_login.html', {'error': 'Invalid admin credentials'})
    return render(request, 'admin_login.html')


# =========================
# PROFILE (TEMPLATE)
# =========================
@login_required
def profile(request):
    user = request.user
    profile_obj, _ = UserProfile.objects.get_or_create(user=user)

    if request.method == "POST":
        user.email = request.POST.get("email", user.email)
        user.save()
        profile_obj.contact_number = request.POST.get("phone", profile_obj.contact_number)
        profile_obj.address        = request.POST.get("address", profile_obj.address)
        if "profile_image" in request.FILES:
            profile_obj.profile_image = request.FILES["profile_image"]
        profile_obj.save()
        messages.success(request, "Profile updated successfully!")
        return redirect("profile")

    total_bookings = Booking.objects.filter(email=user.email).count() if user.email else 0

    return render(request, "profile.html", {
        "username":       user.username,
        "email":          user.email,
        "date_joined":    user.date_joined,
        "last_login":     user.last_login,
        "profile":        profile_obj,
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
    today               = now().date()
    total_bookings      = Booking.objects.count()
    total_guests        = User.objects.filter(is_staff=False, is_superuser=False).count()
    check_in_count      = Booking.objects.filter(status='Confirmed').count()
    check_out_count     = Booking.objects.filter(status='Confirmed', check_out_date=today).count()
    recent_reservations = Booking.objects.order_by('-id')[:5]

    return render(request, 'admin_dashboard.html', {
        'total_bookings':      total_bookings,
        'total_guests':        total_guests,
        'check_in_count':      check_in_count,
        'check_out_count':     check_out_count,
        'recent_reservations': recent_reservations,
    })


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


# =========================
# REGISTER
# =========================
def register(request):
    if request.method == "POST":
        username  = request.POST.get('username')
        email     = request.POST.get('email')
        password1 = request.POST.get('password1')
        password2 = request.POST.get('password2')

        if password1 != password2:
            return render(request, 'register.html', {'error': 'Passwords do not match'})
        if User.objects.filter(username=username).exists():
            return render(request, 'register.html', {'error': 'Username already exists'})

        User.objects.create_user(username=username, email=email, password=password1)
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
    all_rooms = Room.objects.all()
    return render(request, 'admin_rooms.html', {'rooms': all_rooms})


# =========================
# ADMIN GUESTS PAGE
# =========================
@login_required
def admin_guests(request):
    if not request.user.is_staff:
        return redirect('home')
    guests = User.objects.all().order_by('-date_joined')
    return render(request, 'admin_guests.html', {'guests': guests})


# =========================
# ADMIN BOOKINGS PAGE
# =========================
@login_required
def admin_bookings(request):
    bookings = Booking.objects.filter(status__iexact='Pending').order_by('-created_at')
    return render(request, "admin_bookings.html", {"bookings": bookings})


# =========================
# DELETE / REJECT / CONFIRM BOOKING
# =========================
@login_required
def delete_booking(request, booking_id):
    booking = get_object_or_404(Booking, id=booking_id)
    booking.status = 'Cancelled'
    booking.save()
    return redirect('admin_bookings')


@login_required
def reject_booking(request, booking_id):
    booking = get_object_or_404(Booking, id=booking_id)
    booking.status = 'Rejected'
    booking.save()
    return redirect('admin_bookings')


@login_required
def confirm_booking(request, booking_id):
    booking = get_object_or_404(Booking, id=booking_id)
    booking.status = 'Confirmed'
    booking.save()
    return redirect('admin_bookings')


# =========================
# ADD / EDIT / DELETE / TOGGLE ROOM (TEMPLATE)
# =========================
@login_required
def add_room(request):
    if request.method == "POST":
        Room.objects.create(
            room_type    = request.POST.get('room_type'),
            price        = request.POST.get('price'),
            max_guests   = request.POST.get('max_guests', 1),
            amenities    = request.POST.get('amenities', ''),
            details      = request.POST.get('details', ''),
            image        = request.FILES.get('image'),
            is_available = True,
        )
        return redirect('admin_rooms')
    return render(request, 'add_room.html')


@login_required
def edit_room(request, room_id):
    room = get_object_or_404(Room, id=room_id)
    if request.method == "POST":
        room.room_type  = request.POST.get('room_type',  room.room_type)
        room.price      = request.POST.get('price',      room.price)
        room.max_guests = request.POST.get('max_guests', room.max_guests)
        room.amenities  = request.POST.get('amenities',  room.amenities)
        room.details    = request.POST.get('details',    room.details)
        if request.FILES.get('image'):
            room.image = request.FILES['image']
        room.save()
        return redirect('admin_rooms')
    return render(request, 'edit_room.html', {'room': room})


@login_required
def delete_room(request, room_id):
    room = get_object_or_404(Room, id=room_id)
    room.delete()
    return redirect('admin_rooms')


@login_required
def toggle_room_status(request, room_id):
    room = get_object_or_404(Room, id=room_id)
    room.is_available = not room.is_available
    room.save()
    return redirect('admin_rooms')


# =========================
# DELETE GUEST
# =========================
@login_required
def delete_guest(request, user_id):
    if not request.user.is_staff:
        return redirect('home')
    user = get_object_or_404(User, id=user_id)
    user.delete()
    return redirect('admin_guests')


# =========================
# BOOK NOW (TEMPLATE FORM)
# =========================
def room_details(request):

    if request.method == "POST":

        room_type = request.POST.get("room")
        name      = request.POST.get("fullName")
        contact   = request.POST.get("contactNumber")
        email     = request.POST.get("emailAddress")
        date      = request.POST.get("datePicker")
        guests    = request.POST.get("guests")

        # GET ROOM FROM DATABASE
        room_obj = Room.objects.filter(room_type__iexact=room_type).first()

        if not room_obj:
            messages.error(request, "Room not found")
            return redirect('rooms')

        Booking.objects.create(
            user=request.user if request.user.is_authenticated else None,
            room=room_obj.room_type,
            full_name=name,
            contact_number=contact,
            email=email,
            check_in_date=date,
            guests=guests,
            price=room_obj.price,
            status='Pending',
        )

        messages.success(request, "Booking saved!")
        return redirect('rooms')

    return render(request, "details.html")


# =========================
# SCHEDULE (TEMPLATE)
# =========================
@login_required
def schedule(request):
    user_email   = request.user.email
    reservations = Booking.objects.filter(email=user_email).exclude(status='Completed').order_by('-created_at')
    history      = Booking.objects.filter(email=user_email, status='Completed').order_by('-created_at')
    return render(request, "schedule.html", {
        "reservations": reservations,
        "history":      history,
    })


# =========================================================
# API ENDPOINTS
# =========================================================

def _room_to_dict(room):
    return {
        "id":           room.id,
        "room_type":    room.room_type,
        "price":        str(room.price),
        "max_guests":   room.max_guests,
        "amenities":    room.amenities,
        "details":      room.details,
        "is_available": room.is_available,
        "image":        f"/media/{room.image}" if room.image else None,
        "created_at":   room.created_at.strftime("%Y-%m-%d %H:%M:%S"),
    }


def _booking_to_dict(b):
    return {
        "id":             b.id,
        "room":           b.room,
        "full_name":      b.full_name,
        "contact_number": b.contact_number,
        "email":          b.email,
        "check_in_date":  str(b.check_in_date),
        "check_out_date": str(b.check_out_date) if b.check_out_date else "",
        "guests":         b.guests,
        "price":          str(b.price),
        "nights":         b.nights,
        "total_price":    str(b.total_price),
        "downpayment":    str(b.downpayment),
        "status":         b.status,
        "created_at":     b.created_at.strftime("%Y-%m-%d %H:%M:%S"),
    }


# =========================
# API - LOGIN
# =========================
@csrf_exempt
def api_login(request):
    if request.method != "POST":
        return JsonResponse({"status": "error", "message": "Invalid method"})
    try:
        data     = json.loads(request.body)
        username = data.get("username", "").strip()
        password = data.get("password", "")

        user = authenticate(request, username=username, password=password)
        if user is None:
            return JsonResponse({"status": "error", "message": "Invalid username or password"})

        token       = make_token(user)
        profile_obj, _ = UserProfile.objects.get_or_create(user=user)

        return JsonResponse({
            "status": "success",
            "token":  token,
            "user": {
                "id":             user.id,
                "username":       user.username,
                "email":          user.email,
                "date_joined":    user.date_joined.strftime("%b %d, %Y"),
                "last_login":     user.last_login.strftime("%b %d, %Y %H:%M") if user.last_login else "",
                "contact_number": profile_obj.contact_number or "",
                "address":        profile_obj.address or "",
                "profile_image":  f"/media/{profile_obj.profile_image}" if profile_obj.profile_image else None,
                "total_bookings": Booking.objects.filter(email=user.email).count(),
            }
        })
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)})


# =========================
# API - REGISTER
# =========================
@csrf_exempt
def api_register(request):
    if request.method != "POST":
        return JsonResponse({"status": "error", "message": "Invalid method"})
    try:
        data      = json.loads(request.body)
        username  = data.get("username", "").strip()
        email     = data.get("email", "").strip()
        password1 = data.get("password1", "")
        password2 = data.get("password2", "")

        if not username or not email or not password1:
            return JsonResponse({"status": "error", "message": "All fields are required"})
        if password1 != password2:
            return JsonResponse({"status": "error", "message": "Passwords do not match"})
        if User.objects.filter(username=username).exists():
            return JsonResponse({"status": "error", "message": "Username already exists"})
        if User.objects.filter(email=email).exists():
            return JsonResponse({"status": "error", "message": "Email already registered"})

        user = User.objects.create_user(username=username, email=email, password=password1)
        UserProfile.objects.create(user=user)
        token = make_token(user)

        return JsonResponse({
            "status":  "success",
            "message": "Account created successfully",
            "token":   token,
        })
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)})


# =========================
# API - GET PROFILE
# =========================
@csrf_exempt
def api_get_profile(request):
    if request.method != "GET":
        return JsonResponse({"status": "error", "message": "Invalid method"})

    user = get_user_from_token(request)
    if not user:
        return JsonResponse({"status": "error", "message": "Unauthorized"}, status=401)

    try:
        profile_obj, _ = UserProfile.objects.get_or_create(user=user)
        return JsonResponse({
            "status": "success",
            "user": {
                "id":             user.id,
                "username":       user.username,
                "email":          user.email,
                "date_joined":    user.date_joined.strftime("%b %d, %Y"),
                "last_login":     user.last_login.strftime("%b %d, %Y %H:%M") if user.last_login else "",
                "contact_number": profile_obj.contact_number or "",
                "address":        profile_obj.address or "",
                "profile_image":  f"/media/{profile_obj.profile_image}" if profile_obj.profile_image else None,
                "total_bookings": Booking.objects.filter(email=user.email).count(),
            }
        })
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)})


# =========================
# API - UPDATE PROFILE
# =========================
@csrf_exempt
def api_update_profile(request):
    if request.method != "POST":
        return JsonResponse({"status": "error", "message": "Invalid method"})

    user = get_user_from_token(request)
    if not user:
        return JsonResponse({"status": "error", "message": "Unauthorized"}, status=401)

    try:
        profile_obj, _ = UserProfile.objects.get_or_create(user=user)

        if request.content_type and 'multipart' in request.content_type:
            email   = request.POST.get("email",          user.email)
            contact = request.POST.get("contact_number", profile_obj.contact_number)
            address = request.POST.get("address",        profile_obj.address)
            if request.FILES.get("profile_image"):
                profile_obj.profile_image = request.FILES["profile_image"]
        else:
            data    = json.loads(request.body)
            email   = data.get("email",          user.email)
            contact = data.get("contact_number", profile_obj.contact_number)
            address = data.get("address",        profile_obj.address)

        user.email                 = email
        profile_obj.contact_number = contact
        profile_obj.address        = address
        user.save()
        profile_obj.save()

        return JsonResponse({
            "status":  "success",
            "message": "Profile updated successfully",
            "user": {
                "username":       user.username,
                "email":          user.email,
                "contact_number": profile_obj.contact_number or "",
                "address":        profile_obj.address or "",
                "profile_image":  f"/media/{profile_obj.profile_image}" if profile_obj.profile_image else None,
            }
        })
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)})


# =========================
# API - SCHEDULE
# =========================
@csrf_exempt
def api_schedule(request):
    if request.method != "GET":
        return JsonResponse({"status": "error", "message": "Invalid method"})

    user = get_user_from_token(request)
    if not user:
        return JsonResponse({"status": "error", "message": "Unauthorized"}, status=401)

    try:
        from django.db.models import Q

        qs = Booking.objects.filter(
            Q(user=user) | Q(email=user.email)
        ).distinct()

        # Active bookings: Pending or Confirmed
        reservations = qs.filter(
            status__in=['Pending', 'Confirmed']
        ).order_by('-created_at')

        # History: Completed, Cancelled, or Rejected
        history = qs.filter(
            status__in=['Completed', 'Cancelled', 'Rejected']
        ).order_by('-created_at')

        return JsonResponse({
            "status":       "success",
            "reservations": [_booking_to_dict(b) for b in reservations],
            "history":      [_booking_to_dict(b) for b in history],
        })
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)})
# =========================
# API - GET ALL ROOMS
# =========================
@csrf_exempt
def api_get_rooms(request):
    if request.method != "GET":
        return JsonResponse({"status": "error", "message": "Invalid method"})
    try:
        return JsonResponse({"status": "success", "rooms": [_room_to_dict(r) for r in Room.objects.all()]})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)})


# =========================
# API - GET SINGLE ROOM
# =========================
@csrf_exempt
def api_get_room(request, room_id):
    if request.method != "GET":
        return JsonResponse({"status": "error", "message": "Invalid method"})
    try:
        room = get_object_or_404(Room, id=room_id)
        data = _room_to_dict(room)
        data["gallery"] = [f"/media/{img.image}" for img in room.gallery.all()]
        return JsonResponse({"status": "success", "room": data})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)})


# =========================
# API - ADD ROOM
# =========================
@csrf_exempt
def api_add_room(request):
    if request.method != "POST":
        return JsonResponse({"status": "error", "message": "Invalid method"})
    try:
        room = Room.objects.create(
            room_type    = request.POST.get("room_type"),
            price        = request.POST.get("price"),
            max_guests   = request.POST.get("max_guests", 1),
            amenities    = request.POST.get("amenities", ""),
            details      = request.POST.get("details", ""),
            image        = request.FILES.get("image"),
            is_available = True,
        )
        return JsonResponse({"status": "success", "message": "Room added", "room_id": room.id})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)})


# =========================
# API - EDIT ROOM
# =========================
@csrf_exempt
def api_edit_room(request, room_id):
    if request.method != "POST":
        return JsonResponse({"status": "error", "message": "Invalid method"})
    try:
        room            = get_object_or_404(Room, id=room_id)
        room.room_type  = request.POST.get("room_type",  room.room_type)
        room.price      = request.POST.get("price",      room.price)
        room.max_guests = request.POST.get("max_guests", room.max_guests)
        room.amenities  = request.POST.get("amenities",  room.amenities)
        room.details    = request.POST.get("details",    room.details)
        if request.FILES.get("image"):
            room.image = request.FILES["image"]
        room.save()
        return JsonResponse({"status": "success", "message": "Room updated"})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)})


# =========================
# API - DELETE ROOM
# =========================
@csrf_exempt
def api_delete_room(request, room_id):
    if request.method != "DELETE":
        return JsonResponse({"status": "error", "message": "Invalid method"})
    try:
        room = get_object_or_404(Room, id=room_id)
        room.delete()
        return JsonResponse({"status": "success", "message": "Room deleted"})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)})


# =========================
# API - TOGGLE ROOM STATUS
# =========================
@csrf_exempt
def api_toggle_room_status(request, room_id):
    if request.method != "POST":
        return JsonResponse({"status": "error", "message": "Invalid method"})
    try:
        room              = get_object_or_404(Room, id=room_id)
        room.is_available = not room.is_available
        room.save()
        return JsonResponse({"status": "success", "is_available": room.is_available})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)})


# =========================
# API - BOOK ROOM
# =========================
@csrf_exempt
def book_room(request):
    if request.method != "POST":
        return JsonResponse({"status": "error", "message": "Invalid method"})
    try:
        data = json.loads(request.body)
        user = get_user_from_token(request)

        # ── Calculate server-side ──────────────────────────
        from datetime import datetime
        from .models import Room

        room_obj = Room.objects.filter(
            room_type__iexact=data.get("room")
        ).first()

        if not room_obj:
            return JsonResponse({"status": "error", "message": "Room not found"})

        check_in  = datetime.strptime(data.get("check_in_date"),  "%Y-%m-%d").date()
        check_out = datetime.strptime(data.get("check_out_date"), "%Y-%m-%d").date()

        nights      = max((check_out - check_in).days, 1)
        total_price = room_obj.price * nights
        downpayment = total_price / 2

        # ── Overlap check ──────────────────────────────────
        conflict = Booking.objects.filter(
            room__iexact=data.get("room"),
            status="Confirmed",
            check_in_date__lt=check_out,
            check_out_date__gt=check_in
        ).exists()

        if conflict:
            return JsonResponse({
                "status": "error",
                "message": "Room is already booked for selected dates"
            })

        Booking.objects.create(
            user           = user,
            room           = room_obj.room_type,
            full_name      = data.get("full_name"),
            contact_number = data.get("contact_number"),
            email          = data.get("email"),
            check_in_date  = check_in,
            check_out_date = check_out,
            guests         = data.get("guests"),
            price          = room_obj.price,
            nights         = nights,
            total_price    = total_price,
            downpayment    = downpayment,
            status         = 'Pending',
        )

        subject = " Booking Confirmed - Grand Solace Hotel"
        message = f"""
Dear {data.get('full_name')},

 Warm greetings from Grand Solace Hotel!

 Booking Details:
Hotel: Grand Solace Hotel
Room: {room_obj.room_type}
Check-in: {check_in}
Check-out: {check_out}
Guests: {data.get('guests')}
Nights: {nights}
Total Price: ₱{total_price:,.2f}
Downpayment (50%%): ₱{downpayment:,.2f}

Please settle the downpayment to confirm your reservation.
Remaining balance is due upon check-in.

We look forward to welcoming you!

Best regards,
Grand Solace Hotel Team
        """

        send_mail(
            subject,
            message,
            "yourgmail@gmail.com",
            [data.get("email")],
            fail_silently=False,
        )

        return JsonResponse({
            "status":      "success",
            "message":     "Booking saved successfully",
            "nights":      nights,
            "total_price": float(total_price),
            "downpayment": float(downpayment),
        })

    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)})

otp_storage = {}


@csrf_exempt
def login_view(request):

    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'POST required'})

    try:
        data = json.loads(request.body.decode('utf-8'))

        username = data.get('username')
        password = data.get('password')

        user = authenticate(username=username, password=password)

        if user is None:
            return JsonResponse({
                'status': 'error',
                'message': 'Invalid username or password'
            })

        # generate OTP
        otp = str(random.randint(100000, 999999))
        otp_storage[username] = otp

        print("OTP GENERATED:", otp)

        # send OTP email
        send_mail(
            'Your OTP Code',
            f'Your OTP is: {otp}',
            'yourgmail@gmail.com',
            [user.email],
            fail_silently=False,
        )

        return JsonResponse({
            'status': 'otp_sent'
        })

    except Exception as e:
        print("LOGIN ERROR:", str(e))
        return JsonResponse({
            'status': 'error',
            'message': 'Server error'
        })


@csrf_exempt
def verify_otp(request):

    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'POST required'})

    try:
        data = json.loads(request.body.decode('utf-8'))

        username = data.get('username')
        otp = data.get('otp')

        saved_otp = otp_storage.get(username)

        if not saved_otp:
            return JsonResponse({
                'status': 'error',
                'message': 'OTP expired or not found'
            })

        if otp == saved_otp:

            del otp_storage[username]

            return JsonResponse({
                'status': 'success',
                'message': 'OTP verified'
            })

        return JsonResponse({
            'status': 'error',
            'message': 'Invalid OTP'
        })

    except Exception as e:
        print("OTP ERROR:", str(e))
        return JsonResponse({
            'status': 'error',
            'message': 'Server error'
        })