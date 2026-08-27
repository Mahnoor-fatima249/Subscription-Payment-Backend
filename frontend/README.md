# BillFlow - Subscription Billing Frontend

A modern, full-stack subscription billing dashboard built with Next.js 16, Tailwind CSS 4, and Framer Motion.

## Features

- **Modern UI/UX** - Dark theme with glassmorphism, gradient accents, and smooth animations
- **Admin Dashboard** - Revenue metrics, charts, recent activity, top plans
- **Plan Management** - CRUD operations with features and tiers
- **Customer Management** - Searchable customer list with details
- **Subscription Management** - Create, update, cancel, pause, resume subscriptions
- **Invoice Management** - Generate, finalize, pay, void invoices
- **Payment Tracking** - Payment history, refunds, status tracking
- **Coupon System** - Create and manage discount coupons
- **Dunning Management** - Automated failed payment retry tracking
- **Reports & Analytics** - MRR, ARR, churn rate, revenue charts
- **Settings** - Profile, notifications, security, billing settings
- **Responsive Design** - Works on all screen sizes

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5.9 |
| Styling | Tailwind CSS 4 |
| Animations | Framer Motion |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| State | Zustand |
| Database | Prisma + PostgreSQL |
| Auth | JWT (jsonwebtoken) |
| Payments | Stripe |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Generate Prisma client
npx prisma generate

# Run development server
npm run dev
```

### Environment Variables

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/billing_system?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key"
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Structure

```
├── app/
│   ├── (auth)/              # Auth pages (login, register)
│   ├── (dashboard)/         # Dashboard pages
│   │   ├── dashboard/       # Main dashboard
│   │   ├── plans/           # Plan management
│   │   ├── customers/       # Customer management
│   │   ├── subscriptions/   # Subscription management
│   │   ├── invoices/        # Invoice management
│   │   ├── payments/        # Payment tracking
│   │   ├── coupons/         # Coupon management
│   │   ├── dunning/         # Dunning management
│   │   ├── reports/         # Reports & analytics
│   │   └── settings/        # Settings
│   ├── api/                 # API routes
│   │   ├── auth/            # Authentication
│   │   ├── plans/           # Plans CRUD
│   │   ├── customers/       # Customers CRUD
│   │   ├── subscriptions/   # Subscriptions CRUD
│   │   ├── invoices/        # Invoices CRUD
│   │   ├── payments/        # Payments
│   │   ├── usage/           # Usage tracking
│   │   ├── coupons/         # Coupons CRUD
│   │   ├── dunning/         # Dunning
│   │   ├── reports/         # Reports
│   │   └── webhook/         # Stripe webhook
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles
├── components/
│   ├── ui/                  # Base UI components
│   ├── dashboard/           # Dashboard components
│   ├── forms/               # Form components
│   └── layout/              # Layout components
├── lib/
│   ├── prisma.ts            # Prisma client
│   ├── stripe.ts            # Stripe client
│   ├── utils.ts             # Utility functions
│   └── validations.ts       # Zod schemas
├── prisma/
│   └── schema.prisma        # Database schema
└── types/
    └── index.ts             # TypeScript types
```

## Deployment

### Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | JWT secret key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |

## UI Components

### Button
- Variants: default, destructive, outline, secondary, ghost, link, success
- Sizes: default, sm, lg, xl, icon
- Loading state with spinner

### Card
- Glassmorphism effect with backdrop blur
- Gradient borders

### Input
- Focus ring animation
- Error state support

### Badge
- Variants: default, success, warning, danger, info, violet

### Modal
- Backdrop blur overlay
- Slide-in animation
- Escape key to close

### DataTable
- Sortable columns
- Row actions dropdown
- Empty state

### Charts
- Bar, Line, Area, Pie charts
- Responsive containers
- Custom tooltips

## Animations

- Page transitions with Framer Motion
- Staggered list animations
- Hover lift effects
- Pulse animations for live indicators
- Smooth scroll behavior

## Color Scheme

- **Primary**: Violet (#7c3aed)
- **Secondary**: Indigo (#6366f1)
- **Accent**: Sky (#06b6d4)
- **Success**: Emerald (#10b981)
- **Warning**: Amber (#f59e0b)
- **Danger**: Rose (#f43f5e)
- **Background**: Slate (#0a0a0f)
- **Surface**: Slate (#111827)

## License

MIT
