from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib import messages


# ADMIN LOGIN
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


# LANDING PAGE
def home(request):
    return render(request, 'landing.html')


# USER HOMEPAGE AFTER LOGIN (IMPORTANT FIX)
def homepage(request):
    return render(request, 'homepage.html')


# ADMIN DASHBOARD
@login_required
def admin_dashboard(request):
    return render(request, 'admin_dashboard.html')


# LOGOUT
def admin_logout(request):
    logout(request)
    return redirect('home')


# USER LOGIN
def user_login(request):
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect('homepage')  # ✅ MUST MATCH URL NAME
        else:
            return render(request, 'login.html', {
                'error': 'Invalid username or password'
            })

    return render(request, 'login.html')


# REGISTER
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

def rooms(request):
    return render(request, 'rooms.html')

def details(request):
    return render(request, 'details.html')

def profile(request):
    return render(request, "profile.html")

def schedule(request):
    return render(request, "schedule.html")

