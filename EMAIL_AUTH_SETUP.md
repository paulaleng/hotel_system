# Email Authentication Setup Guide

## Overview
This implementation adds email-based verification to your login system. When users log in, they receive a 6-digit code via email and must verify it before accessing their account.

## Step 1: Gmail Configuration

### Generate Gmail App Password
1. Go to your [Google Account](https://myaccount.google.com/)
2. Click **Security** in the left menu
3. Enable **2-Step Verification** (if not already enabled)
4. Search for **App passwords** in the search bar
5. Select **Mail** and **Windows Computer** (or your device)
6. Google will generate a 16-character password - **copy this**

### Update settings.py
Replace these values in `AppDEV/backend/settings.py`:

```python
EMAIL_HOST_USER = 'your_gmail@gmail.com'        # Your Gmail address
EMAIL_HOST_PASSWORD = 'your_app_password'        # The 16-char password from Step 5
DEFAULT_FROM_EMAIL = 'your_gmail@gmail.com'      # Your Gmail address
```

**⚠️ IMPORTANT**: Use the **App Password** (16 characters), NOT your regular Gmail password!

## Step 2: Apply Database Migrations

Run these commands in your project directory:

```bash
# Activate your virtual environment
cd c:\Users\Tsubaki\Documents\GitHub\hotel_system

# On Windows:
myenv\Scripts\activate

# Create migrations
python AppDEV\manage.py makemigrations

# Apply migrations
python AppDEV\manage.py migrate
```

## Step 3: Test the Feature

1. Start your Django server:
   ```bash
   python AppDEV\manage.py runserver
   ```

2. Go to the login page: `http://localhost:8000/login/`

3. Enter your username and password

4. You'll be redirected to verify your email

5. Check your Gmail inbox for the verification code (6 digits)

6. Enter the code and click "Verify Code"

7. You'll be logged in! 🎉

## Features

### ✅ What's New
- **Email Verification**: Code sent to user's email after password authentication
- **Code Expiration**: Codes expire after 10 minutes
- **Resend Option**: Users can request a new code if they didn't receive it
- **Secure**: Uses 6-digit random codes
- **User-Friendly**: Beautiful verification page with countdown timer

### 📧 Email Template
The system sends a professional email with:
- The 6-digit verification code
- Expiration time (10 minutes)
- Hotel system branding

### 🔄 Resend Code
- Users can click "Resend Code" button if they don't receive the initial email
- Generates a new code automatically
- Updates the expiration time

## Troubleshooting

### "Failed to send email" Error
**Problem**: Email sending failed
**Solutions**:
1. Verify Gmail credentials are correct
2. Check if 2-Step Verification is enabled in your Google Account
3. Use the **App Password** (16 chars), not your regular password
4. Check internet connection

### Code Not Received
1. Check Gmail spam/promotions folder
2. Click "Resend Code" button
3. Wait a few seconds before checking email

### "Verification code has expired"
- Codes are valid for 10 minutes
- Click "Resend Code" to get a new one

## Files Modified/Created

### New Files:
- `app/utils.py` - Email utility functions
- `app/templates/verify_email.html` - Verification page template

### Modified Files:
- `app/models.py` - Added EmailVerification model
- `app/views.py` - Updated login flow
- `app/urls.py` - Added verification routes
- `backend/settings.py` - Added email configuration

## Database Changes

New table created: `app_emailverification`

Fields:
- `user_id` - Foreign key to User
- `code` - 6-digit verification code
- `created_at` - When code was generated
- `expires_at` - When code expires
- `is_verified` - Whether code was verified

## Security Notes

1. **Codes are temporary**: Expire after 10 minutes
2. **6-digit format**: Provides good security balance
3. **HTTPS recommended**: For production deployment
4. **Session-based**: Uses Django sessions for temporary state
5. **Database stored**: All attempts are logged

## Production Considerations

1. **Use environment variables** for Gmail credentials:
   ```python
   import os
   EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
   EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')
   ```

2. **Enable HTTPS** before deploying

3. **Set DEBUG = False** in production

4. **Use a proper email service** (SendGrid, Mailgun) for high volume

## Support

For issues or questions, check the troubleshooting section above or review the code comments in:
- `app/utils.py`
- `app/views.py`
