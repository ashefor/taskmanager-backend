# Deployment Guide - Railway

## Prerequisites

1. GitHub account with repository access
2. Railway account (sign up at railway.app)
3. Domain configured on Namecheap (molior.dev)

## Step 1: Setup Railway Project

1. Go to [railway.app](https://railway.app) and sign up/login
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose `ashefor/taskmanager-backend`
5. Railway will auto-detect NestJS and start deployment

## Step 2: Add MySQL Database

1. In your Railway project, click "New" → "Database" → "Add MySQL"
2. Wait for provisioning (~2 minutes)
3. Railway automatically injects MySQL environment variables:
   - `MYSQL_URL`
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLDATABASE`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`

## Step 3: Configure Environment Variables

In Railway dashboard → your service → Variables tab, add:

```bash
NODE_ENV=production
PORT=3000

# JWT (REQUIRED - generate strong secret)
JWT_SECRET=your-super-secret-production-key-min-32-chars
JWT_EXPIRES_IN=24h

# Frontend URL
FRONTEND_URL=https://propel.molior.dev

# Email Configuration (required for welcome emails, password reset)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password
MAIL_FROM=noreply@molior.dev
```

## Step 4: Setup Custom Domain

1. In Railway project → Settings → Domains
2. Click "Custom Domain"
3. Enter: `propel-api.molior.dev`
4. Railway will show DNS records to add

## Step 5: Configure Namecheap DNS

1. Login to Namecheap → Manage molior.dev
2. Go to "Advanced DNS"
3. Add CNAME record:
   ```
   Type: CNAME
   Host: propel-api
   Value: <your-railway-app>.railway.app
   TTL: Automatic
   ```
4. Wait for DNS propagation (5-30 minutes)

## Step 6: Verify Deployment

1. Check Railway logs for successful deployment
2. Verify migrations ran successfully
3. Test API: `https://propel-api.molior.dev/api` (Swagger docs)
4. Test health endpoint: `https://propel-api.molior.dev`

## Migrations

### Running Migrations Locally

```bash
# Generate migration after entity changes
npm run migration:generate -- src/migrations/MigrationName

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

### Production Migrations

Migrations run automatically on Railway deployment (via `migrationsRun: true`).

To run manually:
1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Link project: `railway link`
4. Run: `railway run npm run migration:run`

## Monitoring

- **Logs**: Railway dashboard → Deployments → View logs
- **Metrics**: Railway dashboard → Metrics tab
- **Database**: Use Railway's database viewer or connect via MySQL client

## Troubleshooting

### Deployment fails
- Check Railway logs
- Verify all environment variables are set
- Ensure `package.json` has correct start script

### Database connection fails
- Verify MYSQL_URL is set by Railway
- Check SSL configuration in database.config.ts
- Ensure MySQL service is running

### Migrations fail
- Check entity files are correct
- Verify typeorm.config.ts paths
- Run migrations locally first to test

## Costs

- Free $5 credit per month
- After credit: ~$5-10/month for backend + MySQL
- Costs increase with usage (CPU, memory, bandwidth)
