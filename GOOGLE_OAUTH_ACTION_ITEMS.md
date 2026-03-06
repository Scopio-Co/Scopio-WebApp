# 🎯 Google OAuth Configuration - Summary

## ✅ What's Already Configured

### Backend ✅
- **OAuth Flow**: Fully implemented with django-allauth
- **Endpoints**: `/glogin/google/start/` and `/glogin/google/finalize/`
- **Credentials**: Configured in Backend/.env (not committed to repository)
  - Client ID: `YOUR-CLIENT-ID.apps.googleusercontent.com`
  - Client Secret: `YOUR-CLIENT-SECRET`
- **Frontend URL**: Updated to `https://scopio-web-app.vercel.app`
- **CORS**: Properly configured

### Frontend ✅
- **Login Button**: Redirects to backend OAuth start endpoint
- **Token Handling**: Captures tokens from URL params and stores in localStorage
- **Auto-login**: Automatically logs in user after OAuth completes

---

## 🚨 ACTION REQUIRED: Update Google Cloud Console

You need to add your Azure VM URL to Google Cloud Console so Google knows where to redirect users after they approve the OAuth consent.

### Step-by-Step Instructions:

#### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

#### 2. Select Your Project
Select the project that has your OAuth credentials (Client ID: 276474739390-...)

#### 3. Navigate to Credentials
- Click on "APIs & Services" in the left sidebar
- Click on "Credentials"

#### 4. Edit OAuth 2.0 Client ID
- Find your OAuth 2.0 Client ID in the list
- Click on it to edit

#### 5. Add Authorized Redirect URI (CRITICAL!)
Under "Authorized redirect URIs" section, click "ADD URI" and add:

```
http://20.17.98.254/accounts/google/login/callback/
```

**Important**: Must be EXACTLY this URL - no typos, no extra spaces!

#### 6. Add Authorized JavaScript Origins
Under "Authorized JavaScript origins" section, add these two URLs:

```
http://20.17.98.254
https://scopio-web-app.vercel.app
```

#### 7. Save Changes
- Click "SAVE" button at the bottom
- Wait 5-10 minutes for Google's servers to propagate the changes

---

## 🚀 Deploy to Azure VM

After updating Google Console, deploy your updated backend configuration:

```bash
# Copy .env to Azure VM (from your local machine)
scp Backend/.env username@20.17.98.254:/path/to/Scopio/Backend/.env

# OR edit directly on Azure VM
ssh username@20.17.98.254
cd /path/to/Scopio/Backend
nano .env

# Make sure these are set:
# DEBUG=False
# FRONTEND_URL=https://scopio-web-app.vercel.app
# ALLOWED_HOSTS=20.17.98.254,127.0.0.1,localhost

# Update Django site configuration
source benv/bin/activate
export SITE_DOMAIN=20.17.98.254
export SITE_NAME=Scopio
python setup_production.py

# Restart backend
sudo systemctl restart scopio
# OR if running manually:
gunicorn main.wsgi:application --bind 0.0.0.0:80 --workers 3
```

---

## 🧪 Test OAuth Flow

1. Visit: https://scopio-web-app.vercel.app/
2. Click "Sign in with Google" button
3. Google consent screen should appear
4. Approve the consent
5. You should be redirected back and logged in automatically

### Verify Success
- Open browser DevTools (F12) > Application tab
- Check localStorage for `access` and `refresh` keys
- Check Console for any errors

---

## 🐛 Common Issues

### "redirect_uri_mismatch" Error
**Cause**: Google Console doesn't have the correct redirect URI

**Solution**: 
- Double-check you added: `http://20.17.98.254/accounts/google/login/callback/`
- Wait 5-10 minutes after adding
- Clear browser cache and try again

### "This app isn't verified" Warning
**Normal**: Your app is in testing mode

**Solution**:
- Click "Advanced" then "Go to Scopio (unsafe)"
- For production, submit app for Google verification

### Not Redirecting Back to Frontend
**Cause**: FRONTEND_URL not set correctly

**Solution**:
- Check Backend/.env has: `FRONTEND_URL=https://scopio-web-app.vercel.app`
- Run `python setup_production.py`
- Restart backend

---

## 📋 Quick Reference

### URLs to Add in Google Console

**Authorized redirect URIs:**
```
http://20.17.98.254/accounts/google/login/callback/
```

**Authorized JavaScript origins:**
```
http://20.17.98.254
https://scopio-web-app.vercel.app
```

### OAuth Flow
```
User clicks button
  → Frontend: https://scopio-web-app.vercel.app
  → Backend: http://20.17.98.254/glogin/google/start/
  → Google: OAuth consent screen
  → Backend: http://20.17.98.254/accounts/google/login/callback/
  → Backend: http://20.17.98.254/glogin/google/finalize/
  → Frontend: https://scopio-web-app.vercel.app/?access=...&refresh=...
  → User logged in! ✅
```

---

## 📚 Documentation Files

- **GOOGLE_OAUTH_SETUP.md** - Comprehensive guide with all details
- **GOOGLE_OAUTH_QUICKSTART.txt** - Visual quick reference card (this file)

---

## ✅ Checklist

- [ ] Open Google Cloud Console
- [ ] Navigate to OAuth 2.0 Client ID settings
- [ ] Add redirect URI: `http://20.17.98.254/accounts/google/login/callback/`
- [ ] Add JS origins: `http://20.17.98.254` and `https://scopio-web-app.vercel.app`
- [ ] Save changes
- [ ] Wait 5-10 minutes
- [ ] Deploy updated .env to Azure VM
- [ ] Run `python setup_production.py` on Azure VM
- [ ] Restart backend server
- [ ] Test OAuth flow end-to-end
- [ ] Verify tokens in browser localStorage

---

**Status**: ✅ Code is ready, just need to update Google Console and deploy!

**Next Step**: Update Google Cloud Console with the redirect URI above ☝️
