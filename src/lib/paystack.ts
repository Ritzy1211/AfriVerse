/**
 * Paystack Payment Integration
 * 
 * This module provides utility functions for interacting with Paystack API
 * for payment processing, subscription management, and verification.
 */

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Subscription pricing in kobo (smallest currency unit)
// $1.34/month ≈ ₦2,000/month (using approximate exchange rate)
export const SUBSCRIPTION_PRICES = {
  MONTHLY: {
    amount: 200000, // ₦2,000 in kobo
    amountUSD: 134, // $1.34 in cents
    interval: 'monthly',
    label: 'Monthly',
    description: 'Premium Newsletter - Monthly',
  },
  YEARLY: {
    amount: 2000000, // ₦20,000 in kobo (2 months free)
    amountUSD: 1340, // $13.40 in cents
    interval: 'annually',
    label: 'Yearly',
    description: 'Premium Newsletter - Yearly (Save 17%)',
  },
} as const;

// Advertising package pricing in kobo
export const ADVERTISING_PRICES = {
  SPONSORED_ARTICLE: {
    amount: 74925000, // $499 ≈ ₦749,250 in kobo
    amountUSD: 49900,
    label: 'Sponsored Article',
    description: 'Full-length branded article with homepage feature',
  },
  CONTENT_SERIES: {
    amount: 299925000, // $1,999 ≈ ₦2,999,250 in kobo
    amountUSD: 199900,
    label: 'Content Series',
    description: '4 sponsored articles with dedicated landing page',
  },
  BRAND_TAKEOVER: {
    amount: 749925000, // $4,999 ≈ ₦7,499,250 in kobo
    amountUSD: 499900,
    label: 'Brand Takeover',
    description: 'Homepage takeover (1 week) with 6 sponsored articles',
  },
} as const;

interface PaystackResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

interface InitializePaymentData {
  authorization_url: string;
  access_code: string;
  reference: string;
}

interface VerifyPaymentData {
  id: number;
  domain: string;
  status: 'success' | 'failed' | 'abandoned';
  reference: string;
  amount: number;
  message: string | null;
  gateway_response: string;
  paid_at: string;
  created_at: string;
  channel: string;
  currency: string;
  ip_address: string;
  metadata: Record<string, unknown>;
  customer: {
    id: number;
    email: string;
    customer_code: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
  };
  authorization: {
    authorization_code: string;
    bin: string;
    last4: string;
    exp_month: string;
    exp_year: string;
    channel: string;
    card_type: string;
    bank: string;
    country_code: string;
    brand: string;
    reusable: boolean;
    signature: string;
  };
}

interface CreatePlanData {
  id: number;
  name: string;
  plan_code: string;
  description: string | null;
  amount: number;
  interval: string;
  currency: string;
}

interface CreateSubscriptionData {
  customer: number;
  plan: number;
  integration: number;
  domain: string;
  start: number;
  status: string;
  quantity: number;
  amount: number;
  subscription_code: string;
  email_token: string;
  authorization: {
    authorization_code: string;
    bin: string;
    last4: string;
    exp_month: string;
    exp_year: string;
    channel: string;
    card_type: string;
    bank: string;
    country_code: string;
    brand: string;
    reusable: boolean;
    signature: string;
  };
  next_payment_date: string;
}

/**
 * Make authenticated request to Paystack API
 */
async function paystackRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<PaystackResponse<T>> {
  const response = await fetch(`${PAYSTACK_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Paystack API request failed');
  }

  return response.json();
}

/**
 * Initialize a one-time payment transaction
 */
export async function initializePayment({
  email,
  amount,
  reference,
  callbackUrl,
  metadata = {},
}: {
  email: string;
  amount: number; // in kobo
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<InitializePaymentData> {
  const response = await paystackRequest<InitializePaymentData>(
    '/transaction/initialize',
    {
      method: 'POST',
      body: JSON.stringify({
        email,
        amount,
        reference,
        callback_url: callbackUrl,
        metadata,
      }),
    }
  );

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data;
}

/**
 * Verify a payment transaction
 */
export async function verifyPayment(reference: string): Promise<VerifyPaymentData> {
  const response = await paystackRequest<VerifyPaymentData>(
    `/transaction/verify/${reference}`
  );

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data;
}

/**
 * Create a subscription plan
 */
export async function createPlan({
  name,
  amount,
  interval,
  description,
}: {
  name: string;
  amount: number; // in kobo
  interval: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannually' | 'annually';
  description?: string;
}): Promise<CreatePlanData> {
  const response = await paystackRequest<CreatePlanData>('/plan', {
    method: 'POST',
    body: JSON.stringify({
      name,
      amount,
      interval,
      description,
    }),
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data;
}

/**
 * Create a subscription for a customer
 */
export async function createSubscription({
  customer,
  plan,
  authorization,
  startDate,
}: {
  customer: string; // customer email or code
  plan: string; // plan code
  authorization: string; // authorization code from previous payment
  startDate?: string;
}): Promise<CreateSubscriptionData> {
  const response = await paystackRequest<CreateSubscriptionData>('/subscription', {
    method: 'POST',
    body: JSON.stringify({
      customer,
      plan,
      authorization,
      start_date: startDate,
    }),
  });

  if (!response.status) {
    throw new Error(response.message);
  }

  return response.data;
}

/**
 * Disable (cancel) a subscription
 */
export async function cancelSubscription({
  code,
  token,
}: {
  code: string; // subscription code
  token: string; // email token
}): Promise<void> {
  const response = await paystackRequest<Record<string, never>>('/subscription/disable', {
    method: 'POST',
    body: JSON.stringify({
      code,
      token,
    }),
  });

  if (!response.status) {
    throw new Error(response.message);
  }
}

/**
 * Get customer details
 */
export async function getCustomer(emailOrCode: string) {
  const response = await paystackRequest<{
    id: number;
    customer_code: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    subscriptions: Array<{
      subscription_code: string;
      plan: {
        plan_code: string;
        name: string;
        amount: number;
      };
      status: string;
      next_payment_date: string;
    }>;
  }>(`/customer/${emailOrCode}`);

  return response.data;
}

/**
 * Generate a unique payment reference
 */
export function generateReference(prefix: string = 'AV'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`.toUpperCase();
}

/**
 * Validate Paystack webhook signature
 */
export function validateWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const crypto = require('crypto');
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(payload)
    .digest('hex');
  return hash === signature;
}
