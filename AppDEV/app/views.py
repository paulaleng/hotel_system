from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib import messages
from django.utils.timezone import now

from .models import GuestBooking, Room


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
        guestbooking__check_in__lte=today,
        guestbooking__check_out__gte=today
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
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect('homepage')
        else:
            return render(request, 'login.html', {
                'error': 'Invalid username or password'
            })

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

def profile(request):
    return render(request, "profile.html")

def schedule(request):
    return render(request, "schedule.html")


# =========================
# ADMIN ROOMS PAGE
# =========================
@login_required
def admin_rooms(request):
    rooms = Room.objects.all()
    return render(request, 'admin_rooms', {'rooms': rooms})


# =========================
# ADD ROOM
# =========================
@login_required
def add_room(request):
    if request.method == "POST":
        Room.objects.create(
            room_type=request.POST.get('room_type'),
            price=request.POST.get('price'),
            image=request.FILES.get('image'),
            is_available=True
        )
        return redirect('admin_rooms')

    return render(request, 'add_room')


# =========================
# EDIT ROOM
# =========================
@login_required
def edit_room(request, room_id):
    room = get_object_or_404(Room, id=room_id)

    if request.method == "POST":
        room.room_type = request.POST.get('room_type')
        room.price = request.POST.get('price')

        if request.FILES.get('image'):
            room.image = request.FILES.get('image')

        room.save()
        return redirect('admin_rooms')

    return render(request, 'edit_room', {'room': room})


# =========================
# DELETE ROOM
# =========================
@login_required
def delete_room(request, room_id):
    room = get_object_or_404(Room, id=room_id)
    room.delete()
    return redirect('admin_rooms')


# =========================
# TOGGLE ROOM STATUS
# =========================
@login_required
def toggle_room_status(request, room_id):
    room = get_object_or_404(Room, id=room_id)
    room.is_available = not room.is_available
    room.save()
    return redirect('admin_rooms')
