# Supermarket Platform Deployment Guide

This guide provides step-by-step instructions for deploying the supermarket platform to production.

## Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Git
- Supabase account
- Vercel account (recommended) or alternative hosting platform

## Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/supermarket-platform.git
cd supermarket-platform
```

## Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project name (e.g., `supermarket-prod`)
5. Set database password (save it securely)
6. Choose region closest to your customers
7. Click "Create new project"

## Step 3: Set Up Database Schema

Once your Supabase project is ready, run the following migrations:

```bash
# Apply all migrations in order
supabase db push
```

Or manually run the SQL files from the `supabase/migrations/` directory:

1. `001_categories.sql`
2. `002_products.sql`
3. `003_promotions.sql`
4. `004_orders.sql`
5. `005_branding_settings.sql`

## Step 4: Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com/api

# Optional: Analytics and Monitoring
NEXT_PUBLIC_GA_ID=your-google-analytics-id
SENTRY_DSN=your-sentry-dsn
```

Get these values from your Supabase project settings:
1. Go to Project Settings → API
2. Copy the Project URL and anon key
3. Generate a service role key (keep this secret)

## Step 5: Install Dependencies

```bash
npm install
```

## Step 6: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel --prod
```

### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables in Vercel dashboard
5. Click "Deploy"

## Step 7: Configure Domain

### Custom Domain Setup

1. In Vercel dashboard, go to Project Settings → Domains
2. Add your custom domain (e.g., `yourstore.com`)
3. Configure DNS records as instructed by Vercel
4. Wait for SSL certificate to be issued

### Domain Configuration

Add the following DNS records:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## Step 8: Seed Demo Products

Create an admin account and seed initial data:

```bash
# Create admin user (in Supabase SQL editor)
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('admin@yourstore.com', 'hashed_password', NOW());

# Add to users table
INSERT INTO profiles (id, email, role, created_at)
VALUES (auth.uid(), 'admin@yourstore.com', 'admin', NOW());
```

Then access `/admin` to:
1. Add product categories
2. Upload product images
3. Set pricing
4. Configure store settings

## Step 9: Verify Deployment

Check the following:

1. **Homepage loads correctly**
   - Visit `https://your-domain.com`
   - Verify all sections load

2. **Admin panel works**
   - Visit `https://your-domain.com/admin`
   - Login with admin credentials

3. **Database connectivity**
   - Try adding a product
   - Verify it appears in the store

4. **SEO elements**
   - Check `https://your-domain.com/sitemap.xml`
   - Check `https://your-domain.com/robots.txt`

5. **Performance**
   - Run Lighthouse audit
   - Target: 95+ in all categories

## Step 10: Post-Deployment Configuration

### Enable Security Headers

The platform includes security headers by default. Verify they're active:

```bash
curl -I https://your-domain.com
```

Look for headers like:
- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-Frame-Options`

### Set Up Monitoring

1. **Error Tracking** (Optional)
   - Create Sentry account
   - Add `SENTRY_DSN` to environment variables

2. **Analytics** (Optional)
   - Create Google Analytics account
   - Add `NEXT_PUBLIC_GA_ID` to environment variables

### Configure CDN

Vercel provides automatic CDN. For custom domains, ensure:
- Edge caching is enabled
- Images are optimized
- Static assets are cached

## Troubleshooting

### Common Issues

**Build Errors:**
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

**Database Connection Issues:**
- Verify Supabase URL and keys
- Check network policies in Supabase
- Ensure CORS is configured

**Environment Variable Issues:**
- Double-check variable names
- Ensure they're added to Vercel dashboard
- Restart deployment after changes

**Image Upload Issues:**
- Check Supabase Storage permissions
- Verify bucket exists
- Ensure file size limits are appropriate

### Performance Issues

1. **Slow Load Times**
   - Check image optimization
   - Verify CDN is working
   - Run performance audit

2. **Database Slowness**
   - Add database indexes
   - Optimize queries
   - Consider read replicas

## Maintenance

### Regular Tasks

1. **Weekly:**
   - Check error logs
   - Monitor performance metrics
   - Update dependencies

2. **Monthly:**
   - Review security updates
   - Backup database
   - Audit user accounts

3. **Quarterly:**
   - Update major dependencies
   - Review SEO performance
   - Plan feature updates

### Backup Strategy

1. **Database Backups:**
   - Enable daily backups in Supabase
   - Export backups to secure location
   - Test restore procedures

2. **Asset Backups:**
   - Backup product images
   - Store in cloud storage
   - Document backup locations

## Support

For deployment issues:

1. Check this guide first
2. Review error logs
3. Consult the troubleshooting section
4. Contact support with:
   - Deployment URL
   - Error messages
   - Steps taken

## Next Steps

After successful deployment:

1. **Customize Branding**
   - Access admin panel
   - Upload logo
   - Set colors
   - Configure store info

2. **Add Products**
   - Create categories
   - Upload product images
   - Set prices
   - Write descriptions

3. **Test User Experience**
   - Create test orders
   - Test payment flow
   - Verify email notifications

4. **Launch Marketing**
   - Set up Google Analytics
   - Configure social media
   - Plan launch campaign

Congratulations! Your supermarket platform is now live and ready for customers.
