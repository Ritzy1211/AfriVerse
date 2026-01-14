import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  initializePayment,
  generateReference,
  SUBSCRIPTION_PRICES,
  ADVERTISING_PRICES,
} from '@/lib/paystack';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, email, plan, packageType, companyName, contactName, phone, notes } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'https://afriverse.africa';
    let amount: number;
    let description: string;
    let reference: string;
    let metadata: Record<string, unknown>;

    if (type === 'subscription') {
      // Newsletter Premium Subscription
      const planDetails = plan === 'YEARLY' 
        ? SUBSCRIPTION_PRICES.YEARLY 
        : SUBSCRIPTION_PRICES.MONTHLY;
      
      amount = planDetails.amount;
      description = planDetails.description;
      reference = generateReference('SUB');
      metadata = {
        type: 'subscription',
        plan,
        email,
      };

      // Create pending subscription record
      const periodEnd = new Date();
      if (plan === 'YEARLY') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      // Find or create subscriber
      let subscriber = await prisma.subscriber.findUnique({
        where: { email },
      });

      if (!subscriber) {
        subscriber = await prisma.subscriber.create({
          data: {
            email,
            source: 'premium_subscription',
            status: 'ACTIVE',
          },
        });
      }

      // Create subscription record
      const subscription = await prisma.subscription.create({
        data: {
          email,
          subscriberId: subscriber.id,
          plan: plan === 'YEARLY' ? 'YEARLY' : 'MONTHLY',
          status: 'ACTIVE', // Will be activated after payment
          amount,
          currentPeriodEnd: periodEnd,
        },
      });

      // Create payment record
      await prisma.payment.create({
        data: {
          email,
          amount,
          reference,
          status: 'PENDING',
          subscriptionId: subscription.id,
          metadata: metadata as object,
        },
      });

    } else if (type === 'advertising') {
      // Advertising Package
      if (!packageType || !companyName || !contactName) {
        return NextResponse.json(
          { error: 'Package type, company name, and contact name are required' },
          { status: 400 }
        );
      }

      const packageDetails = ADVERTISING_PRICES[packageType as keyof typeof ADVERTISING_PRICES];
      if (!packageDetails) {
        return NextResponse.json(
          { error: 'Invalid package type' },
          { status: 400 }
        );
      }

      amount = packageDetails.amount;
      description = packageDetails.description;
      reference = generateReference('ADV');
      metadata = {
        type: 'advertising',
        packageType,
        companyName,
        contactName,
        phone,
        notes,
      };

      // Create advertising order record
      const order = await prisma.advertisingOrder.create({
        data: {
          email,
          companyName,
          contactName,
          phone,
          packageType: packageType as 'SPONSORED_ARTICLE' | 'CONTENT_SERIES' | 'BRAND_TAKEOVER',
          amount,
          status: 'PENDING',
          notes,
        },
      });

      // Create payment record
      await prisma.payment.create({
        data: {
          email,
          amount,
          reference,
          status: 'PENDING',
          advertisingOrderId: order.id,
          metadata: metadata as object,
        },
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid payment type' },
        { status: 400 }
      );
    }

    // Initialize Paystack payment
    const paymentData = await initializePayment({
      email,
      amount,
      reference,
      callbackUrl: `${baseUrl}/api/payments/verify?reference=${reference}`,
      metadata: {
        ...metadata,
        description,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        authorizationUrl: paymentData.authorization_url,
        reference: paymentData.reference,
        accessCode: paymentData.access_code,
      },
    });

  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize payment' },
      { status: 500 }
    );
  }
}
