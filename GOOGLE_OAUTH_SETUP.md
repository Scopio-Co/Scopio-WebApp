# 🔐 Google OAuth Configuration Guide for Scopio

## 📋 Overview
This guide will help you configure Google OAuth for your Azure VM backend so users can sign in with Google.

---

## 🎯 Step 1: Get Google OAuth Credentials (if you don't have them)

### Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" > "New Project"
3. Name: `Scopio` (or your preferred name)
4. Click "Create"

### Enable Google+ API
1. In your project, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and click "Enable"

### Create OAuth Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. If prompted, configure OAuth consent screen first:
   - User Type: **External** (for testing) or **Internal** (for organization only)
   - App name: `Scopio`
   - User support email: Your email
   - Developer contact: Your email
   - Save and Continue
   - Scopes: Add `email` and `profile` (basic scopes)
   - Test users: Add your email (if in testing mode)
   - Save and Continue

4. Back to "Create credentials" > "OAuth 2.0 Client ID":
   - Application type: **Web application**
   - Name: `Scopio Web App`

---

## 🌐 Step 2: Configure Authorized Redirect URIs

This is the **CRITICAL** step for your Azure VM backend.

In the OAuth client configuration, add these **Authorized redirect URIs**:

### For Production (Azure VM)
```
http://20.17.98.254/accounts/google/login/callback/
```

### For Development (Optional - if testing locally)
```
http://localhost:8000/accounts/google/login/callback/
http://127.0.0.1:8000/accounts/google/login/callback/
```

### Screenshot Reference:
```
┌─────────────────────────────────────────────────────────┐
│ Authorized redirect URIs                                │
├─────────────────────────────────────────────────────────┤
│ http://20.17.98.254/accounts/google/login/callback/   │ ← Add this
│ http://localhost:8000/accounts/google/login/callback/ │ ← Optional (dev)
└─────────────────────────────────────────────────────────┘
```

### Also Configure Authorized JavaScript Origins:
```
http://20.17.98.254
https://scopio-web-app.vercel.app
http://localhost:5173  ← Optional (dev)
```

---

## 🔑 Step 3: Get Your Credentials

After creating the OAuth client:

1. You'll see your **Client ID** and **Client Secret**
2. Copy both values
3. Example format:
   - Client ID: `123456789-abcdefghijk.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-abcdefghijk123456789`

---

## ⚙️ Step 4: Configure Backend Environment Variables

### On Your Azure VM:

1. **SSH into your Azure VM:**
   ```bash
   ssh username@20.17.98.254
   ```

2. **Navigate to Backend directory:**
   ```bash
   cd /path/to/Scopio/Backend
   ```

3. **Edit .env file:**
   ```bash
   nano .env
   ```

4. **Add/Update these variables:**
   ```bash
   # Google OAuth Credentials
   GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-actual-client-secret
   
   # Frontend URL (for OAuth redirects after login)
   FRONTEND_URL=https://scopio-web-app.vercel.app
   
   # Site configuration
   SITE_DOMAIN=20.17.98.254
   SITE_NAME=Scopio
   ```

5. **Save the file** (Ctrl + O, Enter, Ctrl + X in nano)

---

## 🔄 Step 5: Update Django Site Configuration

After updating the .env file, run the production setup script:

```bash
# Activate virtual environment
source benv/bin/activate  # Linux/Mac
# or .\benv\Scripts\activate  # Windows

# Run setup script to update Django Site
python setup_production.py

# Restart your backend server
# If using systemd:
sudo systemctl restart scopio

# If running manually with Gunicorn:
# Stop the current server (Ctrl+C) and restart:
gunicorn main.wsgi:application --bind 0.0.0.0:80 --workers 3
```

---

## 🧪 Step 6: Test Google OAuth

### Frontend Flow:

1. **Go to your Vercel frontend:**
   ```
   https://scopio-web-app.vercel.app/
   ```

2. **Click "Sign in with Google" button**

3. **OAuth Flow:**
   - Frontend redirects to: `http://20.17.98.254/glogin/google/start/`
   - Backend redirects to: `http://20.17.98.254/accounts/google/login/`
   - Google OAuth consent screen appears
   - After consent, Google redirects to: `http://20.17.98.254/accounts/google/login/callback/`
   - Backend processes login and redirects to: `http://20.17.98.254/glogin/google/finalize/`
   - Finally redirects to: `https://scopio-web-app.vercel.app/?access=TOKEN&refresh=TOKEN`
   - Frontend stores tokens and logs you in

### Check for Success:

4. **Open browser DevTools (F12) > Console**
   - Look for JWT tokens in localStorage
   - Check for successful API calls

5. **Test API call:**
   ```bash
   curl http://20.17.98.254/api/auth/user/ \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"

**Problem:** 
```
Error 400: redirect_uri_mismatch
The redirect URI in the request: http://20.17.98.254/accounts/google/login/callback/
does not match the ones authorized for the OAuth client.
```

**Solution:**
1. Go to Google Cloud Console
2. Check your OAuth client's "Authorized redirect URIs"
3. Make sure it EXACTLY matches: `http://20.17.98.254/accounts/google/login/callback/`
4. No trailing slash issues, must match perfectly
5. Wait 5-10 minutes for Google's cache to update
6. Try again

### Error: "Origin not allowed"

**Problem:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
1. Add your frontend URL to "Authorized JavaScript origins" in Google Console:
   ```
   https://scopio-web-app.vercel.app
   ```
2. Verify CORS settings in Django (already configured)
3. Restart backend server

### Error: "invalid_client"

**Problem:**
```
Error 401: invalid_client
```

**Solution:**
1. Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env
2. Make sure there are no extra spaces or quotes
3. Verify credentials in Google Cloud Console
4. Run `python setup_production.py` again
5. Restart backend

### User Not Authenticated After OAuth

**Problem:** Redirects to frontend but not logged in

**Solution:**
1. Check browser cookies - should have `jwt_access` and `jwt_refresh`
2. Check URL parameters - should have `?access=...&refresh=...`
3. Check frontend console for token storage logs
4. Verify FRONTEND_URL in backend .env matches Vercel URL exactly
5. Check backend logs: `sudo journalctl -u scopio -f`

### OAuth Consent Screen Shows Warning

**Problem:** "This app isn't verified"

**Solution:**
- This is normal for apps in testing mode
- Click "Advanced" > "Go to Scopio (unsafe)" to continue
- To remove warning, submit app for Google verification (for production)
- Or keep app in testing mode and add test users manually

---

## 🔒 Security Recommendations

### For Testing:
- Use OAuth consent screen in **Testing** mode
- Add test users manually in Google Console
- Keep app unpublished

### For Production:
1. **Submit app for verification** (if public)
2. **Use HTTPS** instead of HTTP:
   ```bash
   # Install SSL certificate with Let's Encrypt
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```
3. **Update redirect URIs to HTTPS:**
   ```
   https://yourdomain.com/accounts/google/login/callback/
   ```
4. **Update Django settings:**
   ```python
   CSRF_COOKIE_SECURE = True
   SESSION_COOKIE_SECURE = True
   ACCOUNT_DEFAULT_HTTP_PROTOCOL = 'https'
   ```

---

## 📋 Complete OAuth URL Reference

### URLs You Need to Whitelist in Google Console:

**Authorized redirect URIs:**
```
http://20.17.98.254/accounts/google/login/callback/
```

**Authorized JavaScript origins:**
```
http://20.17.98.254
https://scopio-web-app.vercel.app
```

### OAuth Flow URLs (For Reference):
```
Start:      http://20.17.98.254/glogin/google/start/
Login:      http://20.17.98.254/accounts/google/login/
Callback:   http://20.17.98.254/accounts/google/login/callback/  ← Google redirects here
Finalize:   http://20.17.98.254/glogin/google/finalize/
Frontend:   https://scopio-web-app.vercel.app/?access=...&refresh=...
```

---

## ✅ Configuration Checklist

- [ ] Google Cloud Project created
- [ ] OAuth Client ID created
- [ ] Authorized redirect URI added: `http://20.17.98.254/accounts/google/login/callback/`
- [ ] Authorized JavaScript origin added: `http://20.17.98.254`
- [ ] Authorized JavaScript origin added: `https://scopio-web-app.vercel.app`
- [ ] Client ID and Secret copied
- [ ] Backend .env updated with GOOGLE_CLIENT_ID
- [ ] Backend .env updated with GOOGLE_CLIENT_SECRET
- [ ] Backend .env updated with FRONTEND_URL
- [ ] `python setup_production.py` executed
- [ ] Backend server restarted
- [ ] Test OAuth flow works end-to-end
- [ ] Tokens stored in browser localStorage
- [ ] User can access protected routes

---

## 🎉 Success Criteria

Your Google OAuth is working when:

1. ✅ Frontend "Sign in with Google" button works
2. ✅ Google consent screen appears
3. ✅ After approval, redirects back to frontend
4. ✅ User is logged in automatically
5. ✅ JWT tokens in localStorage
6. ✅ Protected routes accessible
7. ✅ No CORS errors in console
8. ✅ No redirect_uri_mismatch errors

---

## 📞 Quick Help Commands

### Check backend OAuth configuration:
```bash
# SSH to Azure VM
ssh username@20.17.98.254

# Check environment variables
cd /path/to/Scopio/Backend
cat .env | grep GOOGLE
cat .env | grep FRONTEND_URL

# Check Django site configuration
source benv/bin/activate
python manage.py shell
>>> from django.contrib.sites.models import Site
>>> site = Site.objects.get(id=1)
>>> print(f"Domain: {site.domain}, Name: {site.name}")
>>> exit()

# View OAuth logs
sudo journalctl -u scopio -f | grep -i oauth
# or
sudo journalctl -u scopio -f | grep -i google
```

### Test OAuth callback endpoint:
```bash
curl -I http://20.17.98.254/accounts/google/login/
```

Should return a redirect (302) response.

---

**Need More Help?**
- Check backend logs: `sudo journalctl -u scopio -f`
- Check browser console for frontend errors
- Verify all URLs match exactly (no typos)
- Make sure backend is running and accessible

---

**Last Updated:** March 6, 2026  
**Backend URL:** http://20.17.98.254  
**Frontend URL:** https://scopio-web-app.vercel.app
