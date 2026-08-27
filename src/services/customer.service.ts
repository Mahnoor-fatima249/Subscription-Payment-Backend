import Stripe from 'stripe';
import prisma from '../utils/prisma';
import config from '../config';
import { NotFoundError, ConflictError, ExternalServiceError } from '../utils/errors';
import { CreateCustomerInput, PaginationQuery } from '../types';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: config.stripe.apiVersion as Stripe.LatestApiVersion,
});

export class CustomerService {
  static async create(data: CreateCustomerInput) {
    const existingCustomer = await prisma.customer.findUnique({
      where: { userId: data.userId },
    });

    if (existingCustomer) {
      throw new ConflictError('Customer profile already exists for this user');
    }

    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    let stripeCustomer: Stripe.Customer | null = null;

    try {
      stripeCustomer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          userId: user.id,
        },
      });
    } catch (error) {
      // Stripe integration is optional for development
      console.warn('Stripe customer creation failed:', error);
    }

    return prisma.customer.create({
      data: {
        userId: data.userId,
        stripeCustomerId: stripeCustomer?.id,
        company: data.company,
        taxId: data.taxId,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country || 'US',
        phone: data.phone,
        currency: data.currency || 'usd',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  static async findAll(query: PaginationQuery) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { company: { contains: search, mode: 'insensitive' as const } },
          { user: { email: { contains: search, mode: 'insensitive' as const } } },
          { user: { firstName: { contains: search, mode: 'insensitive' as const } } },
          { user: { lastName: { contains: search, mode: 'insensitive' as const } } },
        ],
      }),
    };

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              subscriptions: true,
              invoices: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.customer.count({ where }),
    ]);

    return { customers, total, page, limit };
  }

  static async findById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        subscriptions: {
          include: {
            plan: true,
          },
        },
        paymentMethods: true,
        _count: {
          select: {
            invoices: true,
            usages: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundError('Customer');
    }

    return customer;
  }

  static async findByUserId(userId: string) {
    const customer = await prisma.customer.findUnique({
      where: { userId },
    });

    if (!customer) {
      throw new NotFoundError('Customer');
    }

    return customer;
  }

  static async update(
    id: string,
    data: Partial<{
      company: string;
      taxId: string;
      addressLine1: string;
      addressLine2: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      phone: string;
    }>
  ) {
    await this.findById(id);

    const customer = await prisma.customer.update({
      where: { id },
      data,
    });

    if (customer.stripeCustomerId) {
      try {
        await stripe.customers.update(customer.stripeCustomerId, {
          address: {
            line1: (data.addressLine1 || customer.addressLine1) ?? undefined,
            line2: (data.addressLine2 || customer.addressLine2) ?? undefined,
            city: (data.city || customer.city) ?? undefined,
            state: (data.state || customer.state) ?? undefined,
            postal_code: (data.postalCode || customer.postalCode) ?? undefined,
            country: (data.country || customer.country) ?? undefined,
          },
          phone: (data.phone || customer.phone) ?? undefined,
          metadata: {
            company: (data.company || customer.company) ?? '',
            taxId: (data.taxId || customer.taxId) ?? '',
          },
        });
      } catch (error) {
        console.warn('Stripe customer update failed:', error);
      }
    }

    return customer;
  }

  static async syncWithStripe(id: string) {
    const customer = await this.findById(id);

    if (!customer.stripeCustomerId) {
      throw new NotFoundError('Stripe customer ID');
    }

    try {
      const stripeCustomer = await stripe.customers.retrieve(customer.stripeCustomerId) as Stripe.Customer;

      return prisma.customer.update({
        where: { id },
        data: {
          company: (stripeCustomer.metadata?.company as string) || customer.company,
          taxId: (stripeCustomer.metadata?.taxId as string) || customer.taxId,
          phone: stripeCustomer.phone || customer.phone,
          addressLine1: stripeCustomer.address?.line1 || customer.addressLine1,
          addressLine2: stripeCustomer.address?.line2 || customer.addressLine2,
          city: stripeCustomer.address?.city || customer.city,
          state: stripeCustomer.address?.state || customer.state,
          postalCode: stripeCustomer.address?.postal_code || customer.postalCode,
          country: stripeCustomer.address?.country || customer.country,
        },
      });
    } catch (error) {
      throw new ExternalServiceError('Stripe', 'Failed to sync customer data');
    }
  }
}
