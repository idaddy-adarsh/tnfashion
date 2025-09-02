# 🚀 T&N Fashion - Production Deployment Guide

This guide covers deploying T&N Fashion to production on Vercel with domain `tnfashion.vercel.app`.

## 📋 Pre-Deployment Checklist

### ✅ Environment Configuration
- [ ] Updated `.env.production` with production values
- [ ] Configured `NEXTAUTH_URL=https://tnfashion.vercel.app`
- [ ] Updated `NEXT_PUBLIC_APP_URL=https://tnfashion.vercel.app`
- [ ] Production MongoDB URI configured
- [ ] Production Stripe keys (if using payments)

### ✅ Security & Performance
- [ ] Security headers configured in `vercel.json`
- [ ] CSP headers properly set
- [ ] Error boundaries implemented
- [ ] Production logging configured
- [ ] Database connections optimized

### ✅ SEO & Analytics
- [ ] Metadata configured for all pages
- [ ] Sitemap.xml generated dynamically
- [ ] Robots.txt configured
- [ ] Google verification token added
- [ ] Analytics tracking implemented

## 🔧 Production Environment Variables

Set these in your Vercel dashboard under Project Settings > Environment Variables:

```env
# Core App Configuration
NEXT_PUBLIC_APP_URL=https://tnfashion.vercel.app
NEXT_PUBLIC_APP_NAME=T&N
NODE_ENV=production

# Database
MONGODB_URI=your-production-mongodb-uri

# Authentication
NEXTAUTH_URL=https://tnfashion.vercel.app
NEXTAUTH_SECRET=your-strong-secret-key

# Google OAuth (Update redirect URIs in Google Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Service
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# Stripe (Production keys)
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# Admin Configuration
ADMIN_EMAILS=admin@tnfashion.com,admin1@tn.com

# External Services
NEXT_PUBLIC_MAPTILER_API_KEY=your-maptiler-key

# Optional: Analytics & Monitoring
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

## 🚀 Deployment Steps

### 1. Run Pre-Deployment Checks
```bash
npm run deploy:prod
```

### 2. Deploy to Vercel
```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Deploy to production
vercel --prod
```

### 3. Configure Domain (if custom domain)
```bash
vercel domains add yourdomain.com
```

## 🔗 Post-Deployment Configuration

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Add `https://tnfashion.vercel.app/api/auth/callback/google` to authorized redirect URIs

### Stripe Webhooks (if using payments)
1. Create webhook endpoint: `https://tnfashion.vercel.app/api/webhooks/stripe`
2. Select events: `payment_intent.succeeded`, `checkout.session.completed`
3. Add webhook secret to environment variables

### MongoDB Setup
1. Ensure IP allowlist includes Vercel's IP ranges (or use 0.0.0.0/0)
2. Create production database user with appropriate permissions
3. Configure connection string with proper retry settings

## 📊 Performance Monitoring

### Core Web Vitals
- [x] Largest Contentful Paint (LCP) < 2.5s
- [x] First Input Delay (FID) < 100ms
- [x] Cumulative Layout Shift (CLS) < 0.1

### Monitoring Tools
- Vercel Analytics (built-in)
- Google PageSpeed Insights
- Google Search Console
- Vercel Speed Insights

## 🔐 Security Considerations

### Headers Configured
- [x] Content Security Policy (CSP)
- [x] X-Frame-Options: DENY
- [x] X-Content-Type-Options: nosniff
- [x] Referrer-Policy: origin-when-cross-origin
- [x] Strict-Transport-Security

### Data Protection
- [x] Sensitive data encrypted
- [x] API routes protected with middleware
- [x] Input validation and sanitization
- [x] Rate limiting (if implemented)

## 🐛 Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Check for TypeScript errors
npm run type-check

# Fix linting issues
npm run lint:fix
```

**Environment Variables Not Loading:**
- Ensure variables are set in Vercel dashboard
- Redeploy after adding new variables

**Database Connection Issues:**
- Check MongoDB Atlas IP whitelist
- Verify connection string format
- Test connection locally with production URI

**Authentication Issues:**
- Verify Google OAuth redirect URIs
- Check NEXTAUTH_URL matches exactly
- Ensure NEXTAUTH_SECRET is set

## 📈 SEO Checklist

- [x] Meta titles and descriptions
- [x] Open Graph tags
- [x] Twitter Card tags
- [x] Structured data (JSON-LD)
- [x] Dynamic sitemap.xml
- [x] Robots.txt configured
- [x] Canonical URLs set
- [x] Alt tags on images

## 🚨 Emergency Rollback

If issues arise in production:

```bash
# Rollback to previous deployment
vercel rollback

# Or redeploy with fixes
vercel --prod
```

## 📞 Support

For deployment issues:
- Check Vercel deployment logs
- Review build errors in dashboard
- Test locally with production environment variables

---

**Last Updated:** January 2025
**Domain:** https://tnfashion.vercel.app
**Status:** Production Ready ✅
