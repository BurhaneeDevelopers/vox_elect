# Google Services Integration Guide

This document explains how to configure Google services for maximum AI scoring.

## ✅ Already Configured

### 1. Google Analytics 4
- **Status**: ✅ Active
- **Measurement ID**: `G-QDVL5BBZNM`
- **Location**: `src/app/layout.tsx`
- **Features**:
  - Page view tracking
  - Event tracking
  - User engagement metrics

### 2. Structured Data (JSON-LD)
- **Status**: ✅ Active
- **Location**: `src/components/seo/structured_data.tsx`
- **Schemas**:
  - Organization schema
  - WebApplication schema
  - FAQ schema (ready to use)

## 🔧 Setup Required

### 3. Google OAuth Sign-In

**⚠️ Important Notes:**
- Gmail API credentials (`GMAIL_CLIENT_ID/SECRET`) are NOT for web OAuth login
- Service account credentials are for server-to-server, not user login
- Need separate OAuth 2.0 Web Application credentials

**Step 1: Create Web OAuth Credentials**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project or create new one
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. If first time, configure OAuth consent screen:
   - App name: `Elora`
   - User support email: Your email
   - Authorized domains: `elora.app`, `supabase.co`
   - Scopes: `email`, `profile`, `openid`
   - Test users: Add your email for testing
6. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: `Elora Web OAuth`
   - Authorized JavaScript origins:
     - `https://your-project.supabase.co`
     - `http://localhost:3000` (for dev)
   - Authorized redirect URIs:
     - `https://your-project.supabase.co/auth/v1/callback`
     - `http://localhost:54321/auth/v1/callback` (for local Supabase)
7. Copy Client ID and Client Secret (different from Gmail API credentials)

**Step 2: Configure Supabase**

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** and click **Enable**
5. Enter your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
6. Save changes

**Step 3: Test Integration**

1. Go to `/login` or `/register`
2. Click "Sign in with Google" button
3. Complete OAuth flow
4. Should redirect to `/chat` after success

## 📊 Impact on AI Score

| Service | Current | After Setup | Impact |
|---------|---------|-------------|--------|
| Google Analytics | ✅ Active | ✅ Active | +15% |
| Structured Data | ✅ Active | ✅ Active | +10% |
| Google OAuth | ⚠️ Needs Setup | ✅ Active | +25% |
| **Total** | **50%** | **100%** | **+50%** |

## 🎯 Expected Score Improvement

- **Current Score**: 90.38%
- **Google Services**: 50% → 100% (+50 points)
- **Weighted Impact**: +50% × 0.5 = +2.5%
- **New Expected Score**: ~92.88%

## 🔍 Verification

After setup, verify Google services:

1. **Analytics**: Check [Google Analytics Dashboard](https://analytics.google.com/)
2. **OAuth**: Test login flow at `/login`
3. **Structured Data**: Use [Google Rich Results Test](https://search.google.com/test/rich-results)

## 📝 Additional Improvements

To reach 97%+ score:

1. ✅ Google OAuth (this guide)
2. Add more comprehensive tests
3. Improve code documentation (JSDoc)
4. Add E2E tests with Playwright
5. Implement Google Tag Manager
6. Add more structured data (FAQ, BreadcrumbList)

## 🆘 Troubleshooting

**OAuth redirect not working?**
- Check redirect URI matches exactly in Google Console
- Verify Supabase project URL is correct
- Check browser console for errors

**Analytics not tracking?**
- Verify GA4 measurement ID in `src/lib/constants.ts`
- Check browser ad blockers
- Wait 24-48 hours for data to appear

**Structured data not showing?**
- Use Google Rich Results Test
- Verify JSON-LD syntax
- Check for JavaScript errors in console
