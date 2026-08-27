# Subscription Billing System

A production-ready subscription payment and billing system built with Node.js, TypeScript, Prisma, Stripe, and PostgreSQL.

## Features

- **Authentication & Authorization** - JWT-based auth with role-based access (Super Admin, Admin, Finance, Support, Customer)
- **Subscription Management** - Create, upgrade, downgrade, pause, resume, and cancel subscriptions
- **Flexible Billing Models** - Flat rate, per-seat, usage-based, tiered, and hybrid billing
- **Payment Processing** - Stripe integration for payments, refunds, and disputes
- **Invoice Generation** - Automated invoice creation with line items and tax calculations
- **Coupon & Discount System** - Percentage-based, fixed amount, free trial, and trial extension coupons
- **Dunning Management** - Automated retry logic for failed payments
- **Usage Tracking** - Record and bill based on usage metrics
- **Webhook Processing** - Handle Stripe webhooks with retry mechanism
- **Audit Logging** - Track all system actions with user attribution
- **Notifications** - In-app notification system
- **Reporting & Analytics** - MRR, ARR, churn rate, LTV, and revenue analytics
- **Rate Limiting** - Configurable rate limiting per IP
- **Docker Support** - Multi-stage Dockerfile with docker-compose setup
- **Health Checks** - Application health monitoring endpoint
- **Structured Logging** - Winston-based logging with request tracking

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 |
| Language | TypeScript 5.3 |
| Framework | Express.js 4.18 |
| ORM | Prisma 5.10 |
| Database | PostgreSQL 15 |
| Cache | Redis 7 |
| Payments | Stripe 14 |
| Auth | JWT (jsonwebtoken) |
| Validation | Zod + Joi |
| Logging | Winston |
| Testing | Jest |
| Container | Docker |

## Project Structure

```
src/
├── config/           # Environment configuration
├── controllers/      # Route handlers (11 controllers)
├── middleware/        # Auth, validation, error handling
├── routes/           # API route definitions (11 routes)
├── services/         # Business logic (13 services)
├── types/            # TypeScript type definitions
├── utils/            # Utilities (logger, prisma client, errors, response)
├── index.ts          # Server entry point
└── server.ts         # Express app setup
prisma/
├── schema.prisma     # Database schema (15+ models)
└── seed.ts           # Database seeder
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Stripe account

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/subscription-billing-system.git
cd subscription-billing-system

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure your .env file (see Environment Variables below)

# Run database migrations
npx prisma migrate dev

# Seed the database
npm run seed

# Start development server
npm run dev
```

### Docker Setup

```bash
# Start all services (PostgreSQL, Redis, App)
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | - |
| `STRIPE_SECRET_KEY` | Stripe secret key | - |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook endpoint secret | - |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh` | Refresh token |
| POST | `/api/v1/auth/logout` | Logout |
| GET | `/api/v1/auth/profile` | Get profile |
| PUT | `/api/v1/auth/profile` | Update profile |

### Plans
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/plans` | List all plans |
| GET | `/api/v1/plans/:id` | Get plan details |
| POST | `/api/v1/plans` | Create plan (Admin) |
| PUT | `/api/v1/plans/:id` | Update plan (Admin) |
| DELETE | `/api/v1/plans/:id` | Delete plan (Admin) |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/customers` | List customers |
| GET | `/api/v1/customers/:id` | Get customer details |
| POST | `/api/v1/customers` | Create customer |
| PUT | `/api/v1/customers/:id` | Update customer |

### Subscriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/subscriptions` | List subscriptions |
| GET | `/api/v1/subscriptions/:id` | Get subscription |
| POST | `/api/v1/subscriptions` | Create subscription |
| PUT | `/api/v1/subscriptions/:id` | Update subscription |
| POST | `/api/v1/subscriptions/:id/cancel` | Cancel subscription |
| POST | `/api/v1/subscriptions/:id/pause` | Pause subscription |
| POST | `/api/v1/subscriptions/:id/resume` | Resume subscription |
| POST | `/api/v1/subscriptions/:id/upgrade` | Upgrade/Downgrade |

### Invoices
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/invoices` | List invoices |
| GET | `/api/v1/invoices/:id` | Get invoice |
| POST | `/api/v1/invoices` | Create invoice |
| POST | `/api/v1/invoices/:id/pay` | Pay invoice |
| POST | `/api/v1/invoices/:id/void` | Void invoice |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/payments` | List payments |
| GET | `/api/v1/payments/:id` | Get payment |
| POST | `/api/v1/payments/:id/refund` | Refund payment |

### Usage
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/usage` | Record usage |
| GET | `/api/v1/usage` | Query usage |

### Coupons
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/coupons` | List coupons |
| POST | `/api/v1/coupons` | Create coupon |
| POST | `/api/v1/coupons/apply` | Apply coupon to subscription |

### Dunning
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/dunning` | List failed payments |
| POST | `/api/v1/dunning/:id/retry` | Retry payment |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/reports/revenue` | Revenue metrics |
| GET | `/api/v1/reports/subscriptions` | Subscription analytics |
| GET | `/api/v1/reports/churn` | Churn analysis |

### Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/webhook/stripe` | Stripe webhook handler |

## Database Schema

The system uses 15+ database models including:
- **User** - User accounts with roles
- **Customer** - Customer profiles linked to users
- **Plan** - Subscription plans with features and tiers
- **Subscription** - Active subscriptions with status tracking
- **Invoice** - Generated invoices with line items
- **Payment** - Payment records and refund tracking
- **Usage** - Usage metric recordings
- **Coupon** - Discount coupons
- **WebhookEvent** - Webhook event log with retry support
- **AuditLog** - System audit trail
- **Notification** - User notifications

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Start production server |
| `npm run migrate` | Run Prisma migrations |
| `npm run seed` | Seed database |
| `npm test` | Run tests with coverage |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint code |
| `npm run lint:fix` | Auto-fix lint issues |

## Security Features

- Helmet.js for HTTP security headers
- CORS configuration
- Rate limiting (configurable)
- JWT token authentication
- Password hashing with bcrypt
- Input validation (Zod + Joi)
- SQL injection prevention (Prisma ORM)
- Non-root Docker user

## License

MIT
