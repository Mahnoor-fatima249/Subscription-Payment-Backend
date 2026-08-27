import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

export const planSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
  description: z.string().optional(),
  billingModel: z.enum(['FLAT_RATE', 'PER_SEAT', 'USAGE_BASED', 'TIERED', 'HYBRID']),
  billingInterval: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
  basePrice: z.number().min(0, 'Price must be positive'),
  currency: z.string().default('usd'),
  features: z.array(z.object({
    name: z.string(),
    value: z.string(),
    description: z.string().optional(),
    isLimit: z.boolean().optional(),
    limitValue: z.number().optional(),
  })).optional(),
  tiers: z.array(z.object({
    upTo: z.number(),
    perUnitPrice: z.number(),
    flatFee: z.number().optional(),
    description: z.string().optional(),
  })).optional(),
});

export const customerSchema = z.object({
  userId: z.string().uuid(),
  company: z.string().optional(),
  taxId: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default('US'),
  phone: z.string().optional(),
  currency: z.string().default('usd'),
});

export const subscriptionSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().uuid(),
  quantity: z.number().min(1).default(1),
  trialDays: z.number().min(0).optional(),
  paymentMethodId: z.string().optional(),
  couponCode: z.string().optional(),
});

export const invoiceSchema = z.object({
  customerId: z.string().uuid(),
  subscriptionId: z.string().uuid().optional(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
  })),
  dueDate: z.string().optional(),
});

export const couponSchema = z.object({
  code: z.string().min(1),
  description: z.string().optional(),
  couponType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_TRIAL', 'TRIAL_EXTENSION']),
  discountPercent: z.number().min(0).max(100).optional(),
  discountAmount: z.number().min(0).optional(),
  trialDays: z.number().min(0).optional(),
  maxRedemptions: z.number().min(0).optional(),
  planId: z.string().uuid().optional(),
  validFrom: z.string(),
  expiresAt: z.string().optional(),
});

export const usageSchema = z.object({
  customerId: z.string().uuid(),
  subscriptionId: z.string().uuid(),
  metricName: z.string().min(1),
  quantity: z.number().min(0),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PlanInput = z.infer<typeof planSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type SubscriptionInput = z.infer<typeof subscriptionSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
export type UsageInput = z.infer<typeof usageSchema>;
