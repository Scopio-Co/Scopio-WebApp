# Google OAuth Fix - Execution Checklist

**Complete this checklist to verify all Google OAuth fixes are working correctly.**

---

## PRE-TESTING CHECKLIST

- [ ] **1. Verify Backend/.env has credentials**
  ```bash
  # Backend/.env should contain:
  GOOGLE_CLIENT_ID=xxx (72 chars)
  GOOGLE_CLIENT_SECRET=xxx (35 chars)
  FRONTEND_URL=http://localhost:5173
  DEBUG=True
  ```

- [ ] **2. Verify Google Cloud Console**
  - Go to: https://console.cloud.google.com
  - Project > APIs & Services > Credentials
  - OAuth 2.0 Client ID > "Authorized redirect URIs"
  - Contains:
    - `http://localhost:8000/accounts/google/login/callback/`
    - `https://20.17.98.254.nip.io/accounts/google/login/callback/`
  - **If NOT present:** Add them now and save

- [ ] **3. Run diagnostic**
  ```bash
  cd D:\Scopio\Backend
  ..\benv\Scripts\python.exe manage.py setup_google_oauth --check
  ```
  - All [OK] checks Should pass
  - Fix any [ERR] or [!!] issues shown

- [ ] **4. Verify database setup**
  ```bash
  ..\benv\Scripts\python.exe manage.py setup_google_oauth --setup
  ```
  - Should show: "✓ OAuth setup complete!"

---

## TESTING CHECKLIST

### Backend

- [ ] **Start Backend Server**
  ```bash
  cd D:\Scopio\Backend
  ..\benv\Scripts\python.exe manage.py runserver 0.0.0.0:8000
  ```
  - Wait for "Starting development server at http://0.0.0.0:8000/"
  - ✓ No errors during startup

- [ ] **Test Backend Root**
  - Open: http://localhost:8000/
  - ✓ Should show Django REST Framework browsable API
  - ✓ NOT a JSON redirect or error page

- [ ] **Test Admin**
  - Open: http://localhost:8000/admin/
  - ✓ Should show Django admin login page
  - ✓ No 404 errors

### Frontend

- [ ] **Start Frontend Dev Server**
  ```bash
  cd D:\Scopio\frontend
  npm run dev
  ```
  - ✓ "Local:   http://localhost:5173/"
  - ✓ "VITE v..." version shown
  - ✓ No build errors

- [ ] **Test Frontend Loads**
  - Open: http://localhost:5173
  - ✓ Page loads without errors
  - ✓ Browser console shows no errors (F12)

### OAuth Flow

- [ ] **Click Login Button**
  - On http://localhost:5173
  - Click: "Login with Google"
  - ✓ Redirected to Google login page

- [ ] **Select Google Account**
  - Choose your Google account
  - ✓ Account selection shows your account name

- [ ] **Authorize Application**
  - Click: "Continue"
  - ✓ Google briefly processes
  - ✓ **NO ERRORS** ("This app isn't verified", "Redirect URI mismatch", etc.)

- [ ] **OAuth Redirect (CRITICAL)**
  - **Expected:** Browser redirects to http://localhost:5173/?access=...&refresh=...
  - **NOT Expected:** Browser shows backend page, Django error, or blank page
  - ✓ URL bar contains `?access=` and `?refresh=`

### Frontend After Login

- [ ] **Check Auth State**
  - Page auto-navigates to `/home`
  - ✓ "home" appears in URL
  - ✓ No login form visible

- [ ] **Check Tokens in Console**
  - Open Dev Tools: F12 → Console
  - Paste and run:
  ```javascript
  console.log("Tokens:", localStorage.getItem('accessToken'), localStorage.getItem('refreshToken'))
  ```
  - ✓ Both tokens show (long JWT strings starting with "ey...")

- [ ] **Check User Data**
  - Page shows user profile/dashboard
  - ✓ User name or email visible
  - ✓ Not redirected to login
  - ✓ No "Unauthorized" errors

- [ ] **Check Backend Logs**
  - Backend console should show:
  ```
  [OAuth] google_finalize: user_auth=True
  [OAuth] ✓ User authenticated: your-email@gmail.com
  [OAuth] ✓ JWT tokens generated
  [OAuth] Resolved frontend URL: http://localhost:5173
  [OAuth] ✓ Redirecting user to frontend
  ```
  - ✓ No [ERROR] messages

---

## FAILURE DIAGNOSIS

If something goes wrong, follow this:

### Issue: "Redirects to backend Django page"

1. **Check Google Cloud Console**
   ```
   ✓ Callback URLs contain EXACTLY:
     - http://localhost:8000/accounts/google/login/callback/
   ✓ Both OAuth app credentials match Backend/.env
   ```

2. **Check Backend Logs**
   - Look for error messages in console
   - Run diagnostic: `python manage.py setup_google_oauth --check`
   - Find [ERR] entries

3. **Check Browser Console**
   - F12 → Console tab
   - Look for CORS, CSRF, or network errors
   - Check Network tab for failed requests

4. **Check Adapter**
   - Backend/glogin/adapter.py has settings fallback
   - If using DB config, SocialApp must exist
   - Run: `python manage.py setup_google_oauth --setup`

### Issue: "Tokens not in URL"

1. **Check Session**
   - Backend should store `oauth_frontend_origin` in session
   - Check logs for "Frontend origin persisted in session"

2. **Check Frontend**
   - Login.jsx passes `frontend_origin` query param
   - Console should show: "Frontend origin: http://localhost:5173"

3. **Check frontend URL Resolution**
   - Backend should try: session → query -> Origin → Referer → default
   - Logs should show which one was used

### Issue: "SocialApp errors"

1. **Verify Setup**
   ```bash
   python manage.py setup_google_oauth --check
   ```
   - Should show SocialApp linkedto Site

2. **Fix if Needed**
   ```bash
   python manage.py setup_google_oauth --setup
   ```

3. **Restart Backend**
   - Kill runserver (Ctrl+C)
   - Start fresh

### Issue: "CORS or CSRF errors"

1. **Check Front-end URL**
   ```
   FRONTEND_ALLOWED_ORIGINS must include:
   - http://localhost:5173
   - http://127.0.0.1:5173
   ```

2. **Check Settings**
   ```bash
   cd Backend
   ..\benv\Scripts\python.exe manage.py shell -c \
     "from django.conf import settings; \
      print('CORS_ALLOWED_ORIGINS:', settings.CORS_ALLOWED_ORIGINS)"
   ```

3. **Check Browser**
   - F12 → console should show CORS errors clearly
   - Inspect Network → failed request details

---

## SUCCESS VERIFICATION

✅ **All of These Must Be True:**

- [ ] Google login button works
- [ ] Google account selection works
- [ ] No redirect errors from Google
- [ ] Browser redirects back to frontend (not backend)
- [ ] URL contains `?access=` and `?refresh=` query params
- [ ] Frontend shows `/home` page
- [ ] User profile data visible
- [ ] No "Unauthorized" errors
- [ ] Backend logs show successful OAuth flow
- [ ] Browser console shows no errors
- [ ] localStorage contains `accessToken` and `refreshToken`

---

## FINAL STEPS

Once everything works locally:

- [ ] **Commit Changes**
  ```bash
  cd D:\Scopio
  git add .
  git commit -m "Fix Google OAuth redirect flow with adapter fallback"
  ```

- [ ] **Push to Production** (when ready)
  ```bash
  git push origin master
  ```

- [ ] **Update Production Backend/.env**
  ```bash
  DEBUG=False
  FRONTEND_URL=https://scopio-webapp.pages.dev
  GOOGLE_CLIENT_ID=(same as local)
  GOOGLE_CLIENT_SECRET=(same as local)
  ```

- [ ] **Test Production**
  ```
  1. Open: https://scopio-webapp.pages.dev
  2. Click: "Login with Google"
  3. Verify same flow works
  4. Check logs on Azure VM
  ```

---

## SUPPORT

If stuck:

1. **Run Diagnostic**
   - `python manage.py setup_google_oauth --check`
   - Look for [ERR] entries

2. **Check Documentation**
   - `docs/GOOGLE_OAUTH_FIX.md` - Detailed guide
   - `OAUTH_QUICKSTART.md` - Quick reference

3. **Inspect Logs**
   - Backend console output (most detailed)
   - Browser console (F12)
   - Network tab for HTTP requests

4. **Common Fixes**
   - Ensure Google Cloud Console has callback URLs
   - Run setup command: `python manage.py setup_google_oauth --setup`
   - Restart backend after any changes
   - Clear browser cache/cookies if needed

---

**Expected Time:** 10-15 minutes for full testing
**Status:** Ready for testing
**Next:** Run diagnostic and start backend/frontend
