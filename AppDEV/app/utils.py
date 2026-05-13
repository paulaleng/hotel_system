import random
import string
from django.core.mail import send_mail
from django.conf import settings
from django.utils.timezone import now, timedelta
from .models import EmailVerification


# =========================
# GENERATE VERIFICATION CODE
# =========================
def generate_verification_code():
    """Generate a random 6-digit verification code"""
    return ''.join(random.choices(string.digits, k=6))


# =========================
# SEND VERIFICATION EMAIL
# =========================
def send_verification_email(user):
    """
    Generate a verification code and send it to the user's email
    """
    code = generate_verification_code()
    expires_at = now() + timedelta(minutes=10)
    
    # Create or update verification record
    verification, created = EmailVerification.objects.update_or_create(
        user=user,
        defaults={
            'code': code,
            'expires_at': expires_at,
            'is_verified': False
        }
    )
    
    # Send email
    subject = 'Hotel Booking System - Email Verification Code'
    message = f"""
Dear {user.username},

Your email verification code is: {code}

This code will expire in 10 minutes.

If you did not request this code, please ignore this email.

Best regards,
Hotel Booking System Team
    """
    
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        return True, "Verification code sent to your email"
    except Exception as e:
        return False, f"Failed to send email: {str(e)}"


# =========================
# VERIFY CODE
# =========================
def verify_code(user, code):
    """
    Verify if the provided code matches and is not expired
    """
    try:
        verification = EmailVerification.objects.get(user=user)
        
        # Check if code expired
        if verification.expires_at < now():
            return False, "Verification code has expired. Please request a new one."
        
        # Check if code matches
        if verification.code != code:
            return False, "Invalid verification code."
        
        # Mark as verified
        verification.is_verified = True
        verification.save()
        
        return True, "Email verified successfully!"
    
    except EmailVerification.DoesNotExist:
        return False, "No verification code found. Please login again."


# =========================
# SEND BOOKING CONFIRMATION EMAIL
# =========================
def send_booking_confirmation_email(booking):
    """
    Send booking confirmation email to the guest
    """
    subject = 'Grand Solace Hotel - Booking Confirmation ✓'
    message = f"""
Dear {booking.full_name},

Great news! Your booking has been confirmed.

Booking Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Room Type: {booking.room}
Check-in Date: {booking.check_in_date.strftime('%B %d, %Y')}
Check-out Date: {booking.check_out_date.strftime('%B %d, %Y')}
Number of Guests: {booking.guests}
Price per Night: ${booking.price}
Total Price: ${(booking.check_out_date - booking.check_in_date).days * booking.price}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Contact Information:
Full Name: {booking.full_name}
Contact Number: {booking.contact_number}

We look forward to welcoming you at Grand Solace Hotel!

If you have any questions or need to modify your booking, please contact us.

Best regards,
Grand Solace Hotel Management Team
    """
    
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [booking.email],
            fail_silently=False,
        )
        return True, "Confirmation email sent"
    except Exception as e:
        return False, f"Failed to send email: {str(e)}"


# =========================
# SEND CHECKOUT/COMPLETION EMAIL
# =========================
def send_checkout_email(booking):
    """
    Send checkout completion email to the guest
    """
    total_nights = (booking.check_out_date - booking.check_in_date).days
    total_amount = total_nights * booking.price
    
    subject = 'Grand Solace Hotel - Thank You for Your Stay'
    message = f"""
Dear {booking.full_name},

Thank you for staying with us at Grand Solace Hotel!

Stay Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Room Type: {booking.room}
Check-in Date: {booking.check_in_date.strftime('%B %d, %Y')}
Check-out Date: {booking.check_out_date.strftime('%B %d, %Y')}
Number of Nights: {total_nights}
Price per Night: ${booking.price}
Total Amount Paid: ${total_amount}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

We hope you enjoyed your experience at Grand Solace Hotel!

If you have any feedback or would like to book again, feel free to contact us.

We look forward to seeing you soon!

Best regards,
Grand Solace Hotel Management Team
    """
    
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [booking.email],
            fail_silently=False,
        )
        return True, "Checkout email sent"
    except Exception as e:
        return False, f"Failed to send email: {str(e)}"
