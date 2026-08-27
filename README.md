# Subscription Payment Backend

Full-stack subscription billing system with separate backend and frontend.

## Project Structure

```
├── backend/          # Express.js + TypeScript API
├── frontend/         # Next.js 16 + Tailwind CSS Dashboard
└── README.md
```

## Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npx prisma generate
npm run dev
```

## Tech Stack

### Backend
- Express.js + TypeScript
- Prisma ORM + PostgreSQL
- Stripe Payment Integration
- JWT Authentication
- Docker Support

### Frontend
- Next.js 16 (App Router)
- Tailwind CSS 4
- Framer Motion
- Recharts
- shadcn/ui style components

## Deployment

### Vercel (Frontend + API Routes)
1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

### Backend (Railway/Render)
1. Connect GitHub repo
2. Set root directory to `backend`
3. Add environment variables
4. Deploy

## License

MIT
