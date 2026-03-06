# 🚀 Scopio Deployment Guide

Complete setup guide for connecting your Vercel frontend with Azure VM backend.

## 📋 Overview

- **Frontend**: https://scopio-web-app.vercel.app/ (Vercel)
- **Backend**: http://20.17.98.254 (Azure VM)
- **Database**: PostgreSQL (NeonDB or self-hosted)

---

## 🔧 Backend Configuration (Azure VM)

### 1. Environment Variables

Create a `.env` file in the `Backend/` directory with the following configuration:

```bash
# Django Settings
DEBUG=False
DJANGO_SECRET_KEY=your-secure-production-secret-key-here-change-this
ALLOWED_HOSTS=20.17.98.254,localhost,127.0.0.1

# Frontend URL for CORS
FRONTEND_URL=https://scopio-web-app.vercel.app

# Database (NeonDB or PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Site Configuration
SITE_DOMAIN=20.17.98.254
SITE_NAME=Scopio
```

**Generate a secure SECRET_KEY:**
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 2. Azure VM Security Group Configuration

Ensure your Azure VM Network Security Group (NSG) allows:

- **HTTP (Port 80)**: Inbound from anywhere (0.0.0.0/0)
- **HTTPS (Port 443)**: Inbound from anywhere (0.0.0.0/0) - recommended
- **SSH (Port 22)**: Inbound from your IP only (for management)

### 3. Backend Deployment Steps

```bash
# SSH into your Azure VM
ssh username@20.17.98.254

# Navigate to project directory
cd /path/to/Scopio/Backend

# Activate virtual environment
source benv/bin/activate  # Linux/Mac
# or
.\benv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Apply migrations
python manage.py migrate

# Create superuser (if not exists)
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput

# Run production setup
python setup_production.py

# Start server with Gunicorn
gunicorn main.wsgi:application --bind 0.0.0.0:80 --workers 3 --timeout 120
```

### 4. Background Service (Optional but Recommended)

Create a systemd service to run Django automatically:

```bash
# Create service file
sudo nano /etc/systemd/system/scopio.service
```

Add the following content:

```ini
[Unit]
Description=Scopio Django Application
After=network.target

[Service]
User=your-username
Group=www-data
WorkingDirectory=/path/to/Scopio/Backend
Environment="PATH=/path/to/Scopio/Backend/benv/bin"
ExecStart=/path/to/Scopio/Backend/benv/bin/gunicorn \
    --workers 3 \
    --bind 0.0.0.0:80 \
    --timeout 120 \
    --access-logfile /var/log/scopio/access.log \
    --error-logfile /var/log/scopio/error.log \
    main.wsgi:application

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
# Create log directory
sudo mkdir -p /var/log/scopio
sudo chown your-username:www-data /var/log/scopio

# Enable and start service
sudo systemctl enable scopio
sudo systemctl start scopio
sudo systemctl status scopio
```

---

## 🌐 Frontend Configuration (Vercel)

### 1. Environment Variables

Set the following environment variable in your Vercel project:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **scopio-web-app**
3. Navigate to **Settings** > **Environment Variables**
4. Add the variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `http://20.17.98.254`
   - **Environment**: Select **Production**, **Preview**, and **Development**
5. Click **Save**

### 2. Redeploy Frontend

After setting environment variables:

```bash
# Trigger a new deployment
git commit --allow-empty -m "Trigger deployment with new env vars"
git push origin main
```

Or use the Vercel dashboard:
- Go to **Deployments**
- Click **Redeploy** on the latest deployment

---

## ✅ Verification Steps

### Backend Health Check

1. **API Root**:
   ```bash
   curl http://20.17.98.254/api/
   ```
   Expected: JSON response with API endpoints

2. **CORS Check**:
   ```bash
   curl -H "Origin: https://scopio-web-app.vercel.app" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        http://20.17.98.254/api/video/courses/
   ```
   Expected: `Access-Control-Allow-Origin` header in response

3. **CSRF Token**:
   ```bash
   curl http://20.17.98.254/api/auth/csrf/ -v
   ```
   Expected: `Set-Cookie: csrftoken=...`

### Frontend Verification

1. Visit https://scopio-web-app.vercel.app/
2. Open browser DevTools (F12) > Console
3. Look for API logs with the correct backend URL
4. Test login/signup functionality
5. Verify course data loads correctly

### Common Issues & Solutions

#### 1. CORS Errors
**Problem**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
- Verify `FRONTEND_URL` in backend `.env` matches your Vercel URL exactly
- Check `CORS_ALLOWED_ORIGINS` in settings.py
- Restart backend server after changing settings

#### 2. 401 Unauthorized
**Problem**: All API calls return 401

**Solution**:
- Check JWT tokens in browser localStorage
- Verify CSRF token cookie is set
- Check `withCredentials: true` in api.js

#### 3. Cannot Connect to Backend
**Problem**: Frontend shows "Unable to connect to server"

**Solution**:
- Verify Azure VM is running: `sudo systemctl status scopio`
- Check Azure NSG rules allow HTTP (port 80)
- Test backend directly: `curl http://20.17.98.254/api/`
- Check backend logs: `sudo journalctl -u scopio -f`

#### 4. Environment Variables Not Loading
**Problem**: Frontend still uses wrong API URL

**Solution**:
- Verify Vercel environment variables are set
- Trigger a new deployment after changing env vars
- Check build logs in Vercel dashboard for confirmation

---

## 🔒 Security Recommendations

### For Production Deployment

1. **Use HTTPS**: Set up SSL/TLS certificate with Let's Encrypt
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

2. **Update Backend Settings**:
   ```python
   DEBUG = False
   ALLOWED_HOSTS = ['yourdomain.com', '20.17.98.254']
   CSRF_COOKIE_SECURE = True
   SESSION_COOKIE_SECURE = True
   ```

3. **Use Custom Domain**: Configure a domain for your backend instead of IP
   - Update DNS A record to point to 20.17.98.254
   - Update all configurations to use the domain

4. **Database Security**:
   - Use strong passwords
   - Enable SSL for database connections
   - Restrict database access to backend IP only

5. **Secret Management**:
   - Never commit `.env` files to Git
   - Use Azure Key Vault or environment variables
   - Rotate secrets regularly

---

## 📊 Monitoring & Maintenance

### Backend Logs
```bash
# Real-time logs
sudo journalctl -u scopio -f

# Error logs only
sudo journalctl -u scopio -p err

# Last 100 lines
sudo journalctl -u scopio -n 100
```

### Application Health
```bash
# Check service status
sudo systemctl status scopio

# Restart service
sudo systemctl restart scopio

# View resource usage
top
htop  # if installed
```

### Database Maintenance
```bash
# Check database connections
python manage.py dbshell
# Then run: SELECT * FROM pg_stat_activity;

# Create backup
pg_dump -h hostname -U username -d database > backup_$(date +%Y%m%d).sql
```

---

## 🆘 Support

If you encounter issues:

1. Check logs (backend and Vercel)
2. Verify environment variables
3. Test API endpoints directly with curl
4. Review Django settings.py configuration
5. Check Azure VM network security rules

---

## 📝 Current Configuration Summary

### ✅ Configured
- ✅ Backend CORS settings updated for Vercel URL
- ✅ Backend ALLOWED_HOSTS includes Azure VM IP
- ✅ Backend CSRF_TRUSTED_ORIGINS includes both frontend and backend URLs
- ✅ Frontend .env configured with Azure VM backend URL
- ✅ Frontend api.js uses environment variable for base URL
- ✅ All API calls use centralized axios instance

### 📋 Action Items
1. Set environment variables on Azure VM (see Backend section)
2. Deploy backend with Gunicorn or set up systemd service
3. Set `VITE_API_URL` environment variable in Vercel dashboard
4. Redeploy frontend on Vercel
5. Test end-to-end functionality

---

## 🎉 You're All Set!

Your Scopio application is now configured for production deployment. Follow the steps above to complete the setup and start serving your users!

For questions or issues, refer to the project documentation or consult with the development team.
