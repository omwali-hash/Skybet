# SkyBet - Deployment Guide

## Production Deployment Steps

### Backend Deployment (Railway/Render)

1. **Prepare for Production**
```bash
# Backend environment (.env)
NODE_ENV=production
DATABASE_URL=postgresql://[prod-credentials]
JWT_SECRET=[generate-new-secure-key]
MPESA_ENVIRONMENT=production
MPESA_CONSUMER_KEY=[production-key]
MPESA_CONSUMER_SECRET=[production-secret]
MPESA_BUSINESS_CODE=[production-code]
```

2. **Deploy to Railway.app**
- Connect GitHub repo
- Set environment variables
- Deploy will run `npm install && npm start`
- Database: Use Railway PostgreSQL

3. **Deploy to Render.com**
- New → Web Service
- Connect GitHub
- Build Command: `npm install`
- Start Command: `npm start`

### Frontend Deployment (Vercel/Netlify)

1. **Build for Production**
```bash
cd frontend
npm run build
```

2. **Deploy to Vercel**
- Import from GitHub
- Framework: Vite
- Build Command: `npm run build`
- Output: `dist`
- Environment: `VITE_API_URL=https://api.yourdomain.com`

3. **Deploy to Netlify**
- Connect GitHub
- Build Command: `npm run build`
- Publish: `dist`
- Redirect rules (for SPA routing)

### Database Migration

```bash
# SSH into production server
npx prisma migrate deploy

# Or manually run migrations
psql $DATABASE_URL < migrations/migration.sql
```

### SSL/HTTPS Setup

- Use Let's Encrypt (free)
- Configure in deployment platform
- Update MPESA_CALLBACK_URL to use HTTPS

### Monitoring & Logging

- Set up error tracking (Sentry)
- Enable application logs
- Monitor database performance
- Set up uptime monitoring

---

## Production Checklist

- [ ] All environment variables configured
- [ ] Database backed up
- [ ] HTTPS/SSL enabled
- [ ] M-Pesa credentials verified (production)
- [ ] Logging & monitoring active
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Database connection pooled
- [ ] CDN configured (if needed)
- [ ] Backup strategy documented

---

**For detailed production setup, refer to your hosting provider's documentation.**
