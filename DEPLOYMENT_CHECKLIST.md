# ✅ Scopio Production Deployment Checklist

Quick reference checklist for deploying Scopio to production.

## 🎯 Pre-Deployment

### Backend (Azure VM)
- [ ] Azure VM is running and accessible via SSH
- [ ] Port 80 (HTTP) is open in Azure Network Security Group
- [ ] PostgreSQL database is created and accessible
- [ ] Google OAuth credentials are configured

### Frontend (Vercel)
- [ ] Vercel project is created and connected to Git repository
- [ ] Frontend builds successfully locally (`npm run build`)
- [ ] All code is committed and pushed to main branch

---

## 🔧 Backend Setup (Azure VM)

### 1. Create Environment File
- [ ] SSH into Azure VM: `ssh username@20.17.98.254`
- [ ] Navigate to Backend directory: `cd /path/to/Scopio/Backend`
- [ ] Create `.env` file from `.env.production` template
- [ ] Fill in all required values:
  ```bash
  DEBUG=False
  DJANGO_SECRET_KEY=<generate-new-secret>
  ALLOWED_HOSTS=20.17.98.254,localhost,127.0.0.1
  FRONTEND_URL=https://scopio-web-app.vercel.app
  DATABASE_URL=<your-postgres-url>
  GOOGLE_CLIENT_ID=<your-client-id>
  GOOGLE_CLIENT_SECRET=<your-client-secret>
  SITE_DOMAIN=20.17.98.254
  SITE_NAME=Scopio
  ```

### 2. Install Dependencies & Setup
```bash
# Activate virtual environment
source benv/bin/activate  # Linux/Mac
# or .\benv\Scripts\activate for Windows

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput

# Setup production site
python setup_production.py
```

- [ ] All commands completed successfully
- [ ] No migration errors
- [ ] Superuser created

### 3. Start Backend Server
```bash
# Option A: Quick test (foreground)
python manage.py runserver 0.0.0.0:80

# Option B: Production (with Gunicorn)
gunicorn main.wsgi:application --bind 0.0.0.0:80 --workers 3

# Option C: Systemd service (recommended)
# Follow DEPLOYMENT_GUIDE.md for systemd setup
```

- [ ] Server starts without errors
- [ ] Accessible at: http://20.17.98.254/api/

---

## 🌐 Frontend Setup (Vercel)

### 1. Set Environment Variables
1. [ ] Go to https://vercel.com/dashboard
2. [ ] Select project: `scopio-web-app`
3. [ ] Navigate: Settings > Environment Variables
4. [ ] Add variable:
   - Name: `VITE_API_URL`
   - Value: `http://20.17.98.254`
   - Environment: ✅ Production ✅ Preview ✅ Development
5. [ ] Click Save

### 2. Deploy Frontend
```bash
# Commit any pending changes
git add .
git commit -m "Configure production environment"
git push origin main

# Or trigger redeploy in Vercel dashboard
```

- [ ] Deployment triggered
- [ ] Build completed successfully
- [ ] No build errors

---

## ✅ Verification & Testing

### Backend Health Checks

Test API accessibility:
```bash
# 1. API Root
curl http://20.17.98.254/api/

# 2. CSRF Token
curl http://20.17.98.254/api/auth/csrf/ -v

# 3. Courses endpoint
curl http://20.17.98.254/api/video/courses/

# 4. CORS headers
curl -H "Origin: https://scopio-web-app.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     http://20.17.98.254/api/video/courses/ -v
```

- [ ] All endpoints return valid responses
- [ ] CORS headers present in OPTIONS requests
- [ ] CSRF cookie is set

### Frontend Testing

1. [ ] Visit: https://scopio-web-app.vercel.app/
2. [ ] Open DevTools (F12) > Console
3. [ ] Check API calls use correct URL: `http://20.17.98.254`
4. [ ] Test navigation (Explore, Learning, Leaderboard)
5. [ ] Test authentication:
   - [ ] Sign up new user
   - [ ] Log in with existing user
   - [ ] Log out
   - [ ] Google OAuth (if configured)
6. [ ] Test course features:
   - [ ] Browse courses
   - [ ] View course details
   - [ ] Play videos
   - [ ] Track progress

### Browser Console Checks

Look for:
- [ ] ✅ No CORS errors
- [ ] ✅ API requests succeed (200/201 responses)
- [ ] ✅ JWT tokens stored in localStorage
- [ ] ✅ No 401 Unauthorized errors
- [ ] ✅ CSRF token visible in cookies

---

## 🐛 Troubleshooting

### Common Issues

#### "Unable to connect to server"
```bash
# Check if backend is running
curl http://20.17.98.254/api/

# Check backend logs
sudo journalctl -u scopio -f  # if using systemd
# or check terminal where server is running

# Verify Azure NSG rules
# Azure Portal > VM > Networking > Inbound port rules
```

#### CORS Errors
```bash
# Verify backend environment
cat Backend/.env | grep FRONTEND_URL

# Should show: FRONTEND_URL=https://scopio-web-app.vercel.app

# Restart backend after changing .env
sudo systemctl restart scopio
```

#### 401 Unauthorized on all requests
```bash
# Check frontend environment in Vercel
# Settings > Environment Variables > VITE_API_URL

# Redeploy frontend after changing env variables
```

#### Videos not playing
- [ ] Check video URLs in database
- [ ] Verify video storage is accessible
- [ ] Check browser console for errors

---

## 📊 Post-Deployment Monitoring

### Daily Checks
- [ ] Backend server is running: `systemctl status scopio`
- [ ] No errors in logs: `journalctl -u scopio -p err --since today`
- [ ] Website is accessible
- [ ] Login functionality works

### Weekly Checks
- [ ] Database backups are running
- [ ] Check disk space: `df -h`
- [ ] Review error logs
- [ ] Test all major features

### Monthly Checks
- [ ] Update dependencies
- [ ] Review and rotate secrets
- [ ] Check for security updates
- [ ] Performance optimization review

---

## 🔒 Security Checklist

- [ ] `DEBUG=False` in production
- [ ] Strong `DJANGO_SECRET_KEY` set
- [ ] Database uses SSL connection
- [ ] Only necessary ports are open
- [ ] Regular backups configured
- [ ] SSL/HTTPS configured (recommended)
- [ ] Environment variables not committed to Git
- [ ] Superuser has strong password

---

## 📝 Rollback Plan

If deployment fails:

### Backend Rollback
```bash
# Stop current server
sudo systemctl stop scopio

# Restore previous version
git checkout <previous-commit-hash>

# Restore database backup if needed
pg_restore -h hostname -U username -d database backup_file.sql

# Restart server
sudo systemctl start scopio
```

### Frontend Rollback
1. Go to Vercel Dashboard
2. Navigate to Deployments
3. Find last working deployment
4. Click "Promote to Production"

---

## 🎉 Success Criteria

Your deployment is successful when:

- ✅ Frontend loads at https://scopio-web-app.vercel.app/
- ✅ Backend responds at http://20.17.98.254/api/
- ✅ Users can sign up and log in
- ✅ Courses load and display correctly
- ✅ Videos play without errors
- ✅ No CORS or authentication errors
- ✅ All features work as expected

---

## 📞 Getting Help

If you encounter issues:

1. Check this checklist step by step
2. Review DEPLOYMENT_GUIDE.md for detailed instructions
3. Check application logs (backend and Vercel)
4. Test API endpoints manually with curl
5. Verify all environment variables are set correctly

---

**Last Updated**: March 2026  
**Version**: 1.0  
**Status**: Ready for Production Deployment
