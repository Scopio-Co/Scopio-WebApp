# Production Deployment Checklist

## Architecture Overview
- **Frontend**: Vercel (`https://scopio-web-app.vercel.app`)
- **Backend**: Render (`https://scopio-webapp.onrender.com`)
- **Database**: Neon PostgreSQL

## Critical Changes Applied

### 1. **Middleware Order Fix** ✅
**Why**: Duplicate `SecurityMiddleware` caused unpredictable behavior.

**Order matters**:
1. SecurityMiddleware (HTTPS, security headers)
2. WhiteNoiseMiddleware (static files)
3. CorsMiddleware (CORS before session)
4. SessionMiddleware (sessions before auth)
5. CsrfViewMiddleware (CSRF after session)
6. AuthenticationMiddleware (auth after CSRF)
7. AccountMiddleware (allauth after auth)

### 2. **CSRF Trusted Origins** ✅
**Why**: Django rejects cross-domain requests if origin not trusted.

```python
CSRF_TRUSTED_ORIGINS = [
    'https://scopio-web-app.vercel.app',
    'https://scopio-webapp.onrender.com',
]
```

**Fixed**: Was pointing to wrong domain (`scopio.vercel.app`)

### 3. **Session Cookie Configuration** ✅
**Why**: Cross-domain sessions fail without proper SameSite/Secure settings.

**Production settings**:
- `SESSION_COOKIE_SAMESITE = 'None'` (allows cross-domain)
- `SESSION_COOKIE_SECURE = True` (HTTPS only)
- `SESSION_SAVE_EVERY_REQUEST = True` (prevents cold-start loss)
- `SESSION_ENGINE = 'db'` (persist in PostgreSQL, not memory)

### 4. **Database Connection Handling** ✅
**Why**: `dj_database_url` fails with special characters in password.

**Fixed**: Manual URL parsing with `urllib.parse` for reliable connection.

### 5. **OAuth Token Delivery** ✅
**Why**: Hash fragments (`#access=...`) don't reach server on redirect.

**Changed**: Query params (`?access=...`) + secure cookies for reliability.

### 6. **Gunicorn Configuration** ✅
**Why**: Single worker + no timeout = slow responses on cold start.

```
--workers 2 --threads 4 --timeout 60
```

**Why**:
- 2 workers = handle concurrent requests
- 4 threads = better I/O handling
- 60s timeout = handle cold starts (Render free tier sleeps)

---

## Render Environment Variables

Set these in **Render Dashboard → Environment**:

```bash
DATABASE_URL=postgresql://neondb_owner:npg_1PFVp6gXeQjy@ep-mute-sun-a741ku8q-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

DJANGO_SECRET_KEY=<generate-with: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())">

DEBUG=False

FRONTEND_URL=https://scopio-web-app.vercel.app

SITE_DOMAIN=scopio-webapp.onrender.com

SITE_NAME=Scopio

GOOGLE_CLIENT_ID=<your-google-client-id>

GOOGLE_CLIENT_SECRET=<your-google-client-secret>

ALLOWED_HOSTS=  # Leave empty or don't set (defaults handled in settings.py)
```

---

## Google Cloud Console Configuration

1. Go to: https://console.cloud.google.com/
2. Select your project → **APIs & Services** → **Credentials**
3. Click your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add:

```
https://scopio-webapp.onrender.com/accounts/google/login/callback/
```

5. Save changes

**Test redirect**: Should see Google consent screen, then redirect back to your app.

---

## Vercel Environment Variables

Set in **Vercel Dashboard → Project → Settings → Environment Variables**:

```bash
VITE_API_URL=https://scopio-webapp.onrender.com
```

**Important**: Redeploy frontend after changing env vars (Vercel auto-redeploys on git push, but not on env var change).

---

## Database Migration Steps

1. **Verify DATABASE_URL is set in Render**
2. **Push code to main branch**:
   ```bash
   git add -A
   git commit -m "Production authentication fixes"
   git push origin main
   ```
3. **Render will automatically**:
   - Run migrations via `release` phase
   - Run `setup_production.py` to configure Site
   - Start gunicorn with new settings

4. **Verify in Render logs**:
   - Look for: `✓ Using PostgreSQL/Neon`
   - Look for: `✓ Site updated: scopio-webapp.onrender.com`

---

## Testing Production Authentication

### Test 1: Google OAuth Flow
1. Visit: `https://scopio-web-app.vercel.app`
2. Click "Continue with Google"
3. **Expected**: Redirect to Google → consent → back to app with tokens
4. **Check**: Browser URL should have `?access=...&refresh=...`
5. **Check**: Cookies `jwt_access` and `jwt_refresh` should be set

### Test 2: Session Persistence
1. Login via Google
2. Refresh page
3. **Expected**: Still logged in (session persists)
4. Wait 10 minutes (cold start simulation)
5. Refresh again
6. **Expected**: Still logged in (session saved in DB)

### Test 3: Database Verification
```bash
psql "postgresql://neondb_owner:npg_1PFVp6gXeQjy@ep-mute-sun-a741ku8q-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require"
```

```sql
-- Check users
SELECT id, username, email, date_joined FROM auth_user;

-- Check sessions
SELECT session_key, expire_date FROM django_session;

-- Check social accounts
SELECT user_id, provider, uid FROM socialaccount_socialaccount;
```

---

## Common Issues & Solutions

### Issue: "CSRF verification failed"
**Fix**: Check `CSRF_TRUSTED_ORIGINS` includes your frontend URL (no trailing slash)

### Issue: "User not authenticated in google_finalize"
**Fix**: Check Google Console redirect URI matches exactly:
```
https://scopio-webapp.onrender.com/accounts/google/login/callback/
```

### Issue: "No such table: django_site"
**Fix**: Migrations didn't run. Check Render logs for migration errors.

### Issue: Login works, but reloading page logs user out
**Fix**: Check `SESSION_COOKIE_SAMESITE = 'None'` and `SESSION_COOKIE_SECURE = True` in production.

### Issue: Slow first request after inactivity
**Fix**: This is normal for Render free tier (cold start). Consider:
- Upgrading to paid tier
- Using external keepalive service (e.g., UptimeRobot)

### Issue: "This string is not a valid url" (DATABASE_URL)
**Fix**: Applied manual URL parsing in settings.py. Verify DATABASE_URL has no extra quotes or spaces.

---

## Post-Deployment Monitoring

**Check these Render logs**:
- `✓ Using PostgreSQL/Neon` = DB connected
- `✓ Site updated` = OAuth configured
- `✓ Auto-signup allowed` = User creation works
- `✓ Login successful` = Form login works
- `✓ Social login connected` = OAuth works

**If you see**:
- `⚠ Using SQLite fallback` = DATABASE_URL not set or malformed
- `❌ Failed to parse DATABASE_URL` = Check DATABASE_URL format
- `django.core.exceptions.ImproperlyConfigured` = Settings error

---

## Security Checklist

- [ ] `DEBUG=False` in production
- [ ] `SECRET_KEY` is unique and secret (not the default)
- [ ] `ALLOWED_HOSTS` set correctly
- [ ] `SESSION_COOKIE_SECURE=True` in production
- [ ] `CSRF_COOKIE_SECURE=True` in production
- [ ] `DATABASE_URL` uses SSL (`sslmode=require`)
- [ ] Google OAuth credentials in env vars, not code

---

## Performance Optimization

### Current Settings (Free Tier)
- Gunicorn: 2 workers, 4 threads
- DB connections: max_age=600 (10 min pool)
- Session: Database-backed (persists across restarts)

### If Upgrading
- Increase workers: `--workers 4`
- Add Redis for sessions: `SESSION_ENGINE = 'django.contrib.sessions.backends.cache'`
- Enable connection pooling: `'CONN_POOL_SIZE': 20`

---

## Next Steps

1. **Deploy**: `git push origin main`
2. **Monitor**: Watch Render deployment logs
3. **Test**: Try Google login from incognito/different browser
4. **Verify**: Check Neon DB for new users
5. **Optimize**: Add caching/CDN if needed

---

## Support

If issues persist:
1. Share **Render deployment logs**
2. Share **browser console errors**
3. Share **network tab** (check for 4xx/5xx responses)
4. Verify all env vars are set correctly
