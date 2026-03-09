# Quick Start: Google OAuth Fix

## Summary of Changes

Your Google OAuth flow was breaking because the backend SocialApp adapter didn't have a fallback for settings-based configuration. The fixes now include:

✅ **Backend/glogin/adapter.py** - Falls back to environment variables if database lookup fails
✅ **Backend/glogin/views.py** - Enhanced error handling and logging
✅ **Backend setup command** - Improved with diagnostic and setup modes
✅ **Backend/diagnose_oauth.py** - New diagnostic script to verify configuration

## IMPORTANT: Google Cloud Console

Before testing, ensure your Google OAuth app has these callback URLs configured:

1. Go to: [Google Cloud Console](https://console.cloud.google.com)
2. APIs & Services > Credentials
3. Click your OAuth 2.0 Client ID
4. Add to "Authorized redirect URIs":
   - `http://localhost:8000/accounts/google/login/callback/`
   - `https://scopio.in/accounts/google/login/callback/`
5. Save

## Quick Setup (5 minutes)

### 1. Update Backend/.env

```bash
DEBUG=True
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
FRONTEND_URL=http://localhost:5173
```

### 2. Diagnose Configuration

```bash
cd Backend
python diagnose_oauth.py
```

✓ All checks should pass

### 3. Set Up OAuth

```bash
python manage.py setup_google_oauth --setup
```

### 4. Restart Backend

```bash
# Kill existing process (Ctrl+C)
python manage.py runserver 0.0.0.0:8000
```

### 5. Test Login

1. Open: http://localhost:5173
2. Click "Login with Google"
3. Select your Google account
4. ✅ You should be logged in on frontend (not redirected to backend)

## Expected Behavior After Fix

| Step | Before (Broken) | After (Fixed) |
|------|-----------------|---------------|
| Click Google Login | ✓ Works | ✓ Works |
| Select account | ✓ Works | ✓ Works |
| Click continue | ✓ Works | ✓ Works |
| **Redirect** | ❌ To backend Django page | ✅ To frontend with tokens |
| Logged in state | ❌ Not logged in | ✅ Logged in |

## Troubleshooting

### "Redirects to Django page instead of frontend"
- Run: `python diagnose_oauth.py`
- Check Google Cloud Console callback URLs match
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Backend/.env

### "SocialApp not found" error
- Run: `python manage.py setup_google_oauth --setup`
- This creates/updates the SocialApp in database

### "Tokens not in URL"
- Check browser console for errors
- Run: `python diagnose_oauth.py` 
- Verify frontend origin was passed in initial redirect

## Key Points

1. **Callback URLs Matter** - Must exact match in Google Cloud Console
2. **Environment Variables** - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set
3. **Database Setup** - Run `setup_google_oauth --setup` to initialize
4. **Restart Matters** - Changes only take effect after restart
5. **Frontend Handling** - Frontend must parse `?access=...&refresh=...` query params

## Code Flow (Simplified)

```
Frontend (port 5173)
    ↓
Login → Backend /glogin/google/start/
    ↓
Adapter generates callback URL (from request host, not database)
    ↓
Redirect to Google OAuth
    ↓
User authenticates
    ↓
Google returns code → Backend /glogin/google/finalize/
    ↓
Backend mints JWT tokens
    ↓
Redirect back to Frontend with ?access=...&refresh=...
    ↓
Frontend stores tokens → User logged in ✅
```

## Files Changed

1. `Backend/glogin/adapter.py` - Settings fallback + callback URL fix
2. `Backend/glogin/views.py` - Enhanced error handling + logging
3. `Backend/glogin/management/commands/setup_google_oauth.py` - New diagnostic mode
4. `Backend/diagnose_oauth.py` - New diagnostic script
5. `docs/GOOGLE_OAUTH_FIX.md` - Full documentation

## Verify It Works

```bash
# Windows PowerShell
cd D:\Scopio\Backend

# Run quick check
python diagnose_oauth.py

# Should show ✓ checks for:
# - Environment variables set
# - Django settings configured
# - SocialApp in database
# - OAuth URLs configured
# - Frontend accessible
```

If all checks pass (green ✓), proceed to restart backend and test.

## Next Steps

1. ✅ Update Backend/.env with GOOGLE_CLIENT_ID/SECRET
2. ✅ Run `python diagnose_oauth.py`
3. ✅ Run `python manage.py setup_google_oauth --setup`
4. ✅ Restart backend
5. ✅ Test login on http://localhost:5173
6. ✅ Verify Google OAuth redirects back to frontend

---

**Need help?** Run `python diagnose_oauth.py` - it will tell you exactly what's wrong and how to fix it.
