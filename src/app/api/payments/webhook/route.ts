import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateWebhookSignature } from '@/lib/paystack';

// Paystack webhook events
interface PaystackWebhookEvent {
  event: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    metadata: Record<string, unknown>;
    customer: {
      id: number;
      email: string;
      customer_code: string;
      first_name: string | null;
      last_name: string | null;
    };
    authorization?: {
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
    subscription_code?: string;
    plan?: {
      id: number;
      name: string;
      plan_code: string;
      description: string | null;
      amount: number;
      interval: string;
      currency: string;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    if (!signature) {
      console.error('Missing Paystack signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Validate webhook signature
    const isValid = validateWebhookSignature(payload, signature);
    if (!isValid) {
      console.error('Invalid Paystack signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event: PaystackWebhookEvent = JSON.parse(payload);
    console.log('Paystack webhook event:', event.event);

    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(event.data);
        break;

      case 'subscription.create':
        await handleSubscriptionCreate(event.data);
        break;

      case 'subscription.not_renew':
        await handleSubscriptionNotRenew(event.data);
        break;

      case 'subscription.disable':
        await handleSubscriptionDisable(event.data);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data);
        break;

      case 'transfer.success':
      case 'transfer.failed':
        // Handle transfer events if needed
        console.log('Transfer event:', event.event);
        break;

      default:
        console.log('Unhandled webhook event:', event.event);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleChargeSuccess(data: PaystackWebhookEvent['data']) {
  const { reference, amount, channel, paid_at, customer } = data;

  try {
    // Update payment record
    const payment = await prisma.payment.findUnique({
      where: { reference },
      include: { subscription: true, advertisingOrder: true },
    });

    if (payment) {
      await prisma.payment.update({
        where: { reference },
        data: {
          status: 'SUCCESS',
          channel,
          paidAt: new Date(paid_at),
        },
      });

      // Update related records
      if (payment.subscription) {
        await prisma.subscription.update({
          where: { id: payment.subscription.id },
          data: {
            status: 'ACTIVE',
            paystackCustomerCode: customer.customer_code,
          },
        });

        // Mark subscriber as premium
        if (payment.subscription.subscriberId) {
          await prisma.subscriber.update({
            where: { id: payment.subscription.subscriberId },
            data: { isPremium: true },
          });
        }
      }

      if (payment.advertisingOrder) {
        await prisma.advertisingOrder.update({
          where: { id: payment.advertisingOrder.id },
          data: { status: 'PAID' },
        });
      }
    }

    console.log(`Payment ${reference} marked as successful, amount: ${amount}`);
  } catch (error) {
    console.error('Error handling charge success:', error);
  }
}

async function handleSubscriptionCreate(data: PaystackWebhookEvent['data']) {
  try {
    const subscriptionCode = data.subscription_code;
    const customerEmail = data.customer.email;

    if (subscriptionCode) {
      // Update subscription with Paystack subscription code
      await prisma.subscription.updateMany({
        where: {
          email: customerEmail,
          paystackSubscriptionCode: null,
        },
        data: {
          paystackSubscriptionCode: subscriptionCode,
          status: 'ACTIVE',
        },
      });
    }

    console.log(`Subscription created for ${customerEmail}`);
  } catch (error) {
    console.error('Error handling subscription create:', error);
  }
}

async function handleSubscriptionNotRenew(data: PaystackWebhookEvent['data']) {
  try {
    const subscriptionCode = data.subscription_code;

    if (subscriptionCode) {
      await prisma.subscription.updateMany({
        where: { paystackSubscriptionCode: subscriptionCode },
        data: { status: 'CANCELLED' },
      });

      // Get subscription to update subscriber
      const subscription = await prisma.subscription.findFirst({
        where: { paystackSubscriptionCode: subscriptionCode },
      });

      if (subscription?.subscriberId) {
        // Check if user has any other active subscriptions
        const activeSubscriptions = await prisma.subscription.count({
          where: {
            subscriberId: subscription.subscriberId,
            status: 'ACTIVE',
          },
        });

        if (activeSubscriptions === 0) {
          await prisma.subscriber.update({
            where: { id: subscription.subscriberId },
            data: { isPremium: false },
          });
        }
      }
    }

    console.log(`Subscription will not renew: ${subscriptionCode}`);
  } catch (error) {
    console.error('Error handling subscription not renew:', error);
  }
}

async function handleSubscriptionDisable(data: PaystackWebhookEvent['data']) {
  try {
    const subscriptionCode = data.subscription_code;

    if (subscriptionCode) {
      const subscription = await prisma.subscription.findFirst({
        where: { paystackSubscriptionCode: subscriptionCode },
      });

      if (subscription) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
          },
        });

        // Update subscriber premium status
        if (subscription.subscriberId) {
          const activeSubscriptions = await prisma.subscription.count({
            where: {
              subscriberId: subscription.subscriberId,
              status: 'ACTIVE',
            },
          });

          if (activeSubscriptions === 0) {
            await prisma.subscriber.update({
              where: { id: subscription.subscriberId },
              data: { isPremium: false },
            });
          }
        }
      }
    }

    console.log(`Subscription disabled: ${subscriptionCode}`);
  } catch (error) {
    console.error('Error handling subscription disable:', error);
  }
}

async function handleInvoicePaymentFailed(data: PaystackWebhookEvent['data']) {
  try {
    const subscriptionCode = data.subscription_code;

    if (subscriptionCode) {
      await prisma.subscription.updateMany({
        where: { paystackSubscriptionCode: subscriptionCode },
        data: { status: 'PAST_DUE' },
      });
    }

    console.log(`Invoice payment failed for subscription: ${subscriptionCode}`);
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
  }
}
