import { Request } from 'express';
import {
  UserRole,
  SubscriptionStatus,
  InvoiceStatus,
  PaymentStatus,
  BillingModel,
  BillingInterval,
  CouponType,
  SubscriptionCancelReason,
} from '@prisma/client';

export type {
  UserRole,
  SubscriptionStatus,
  InvoiceStatus,
  PaymentStatus,
  BillingModel,
  BillingInterval,
  CouponType,
  SubscriptionCancelReason,
};

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface CreatePlanInput {
  name: string;
  slug: string;
  description?: string;
  billingModel: BillingModel;
  billingInterval: BillingInterval;
  basePrice: number;
  currency?: string;
  features?: CreatePlanFeatureInput[];
  tiers?: CreatePlanTierInput[];
}

export interface UpdatePlanInput {
  name?: string;
  description?: string;
  basePrice?: number;
  isActive?: boolean;
  sortOrder?: number;
}

export interface CreatePlanFeatureInput {
  name: string;
  value: string;
  description?: string;
  isLimit?: boolean;
  limitValue?: number;
}

export interface CreatePlanTierInput {
  upTo: number;
  perUnitPrice: number;
  flatFee?: number;
  description?: string;
}

export interface CreateCustomerInput {
  userId: string;
  company?: string;
  taxId?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  currency?: string;
}

export interface CreateSubscriptionInput {
  customerId: string;
  planId: string;
  quantity?: number;
  trialDays?: number;
  paymentMethodId?: string;
  couponCode?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateSubscriptionInput {
  planId?: string;
  quantity?: number;
  cancelAt?: string;
  cancelReason?: SubscriptionCancelReason;
  metadata?: Record<string, unknown>;
}

export interface CreateInvoiceInput {
  customerId: string;
  subscriptionId?: string;
  items: CreateInvoiceItemInput[];
  dueDate?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateInvoiceItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
  periodStart?: string;
  periodEnd?: string;
}

export interface RecordUsageInput {
  customerId: string;
  subscriptionId: string;
  metricName: string;
  quantity: number;
  timestamp?: string;
}

export interface CreateCouponInput {
  code: string;
  description?: string;
  couponType: CouponType;
  discountPercent?: number;
  discountAmount?: number;
  trialDays?: number;
  maxRedemptions?: number;
  planId?: string;
  validFrom: Date;
  expiresAt?: Date;
}

export interface ApplyCouponInput {
  subscriptionId: string;
  couponCode: string;
}

export interface RevenueMetrics {
  mrr: number;
  arr: number;
  totalRevenue: number;
  averageRevenuePerUser: number;
  churnRate: number;
  lifetimeValue: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  cancelledSubscriptions: number;
  revenueByPlan: Array<{
    planId: string;
    planName: string;
    revenue: number;
    subscribers: number;
  }>;
  revenueByPeriod: Array<{
    period: string;
    revenue: number;
  }>;
}

export interface DunningConfig {
  maxRetries: number;
  retryIntervals: number[];
  gracePeriodDays: number;
  dunningEmailTemplate: string;
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
  created: number;
  livemode: boolean;
  pending_webhooks: number;
  request: {
    id: string | null;
    idempotency_key: string | null;
  };
}
