# Stock Price Drop Alert System

A serverless stock price monitoring system built with Cloudflare Workers, Hono, and React.

## Features

- Add stock alerts with baseline price and drop threshold
- Automatic price checking every 15 minutes via cron
- Telegram notifications when threshold is breached
- Simple React UI for managing alerts

## Setup

### Backend

1. Install dependencies: `npm install`
2. Set up D1 database: `npx wrangler d1 create stocks-db`
3. Update `wrangler.toml` with the database ID
4. Generate Prisma client: `npx prisma generate`
5. Apply migrations: `npx wrangler d1 migrations apply stocks-db --local`
6. Set environment variables: `TELEGRAM_BOT_TOKEN` and `ALPHA_VANTAGE_API_KEY`
7. Run locally: `npx wrangler dev --local`

### Frontend

1. Install dependencies: `npm install`
2. Run dev server: `npm run dev`

## API Endpoints

- `POST /api/users` - Create user
- `GET /api/stocks` - Get user's alerts
- `POST /api/stocks` - Add alert
- `DELETE /api/stocks/:id` - Delete alert

## Deployment

Deploy backend to Cloudflare: `npx wrangler deploy`

Frontend can be deployed to Vercel, Netlify, etc.