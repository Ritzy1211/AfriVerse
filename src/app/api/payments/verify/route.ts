import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPayment } from '@/lib/paystack';
import { sendEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.redirect(new URL('/subscribe/premium?error=missing_reference', request.url));
    }

    // Verify payment with Paystack
    const paymentData = await verifyPayment(reference);

    // Find the payment record
    const payment = await prisma.payment.findUnique({
      where: { reference },
      include: {
        subscription: true,
        advertisingOrder: true,
      },
    });

    if (!payment) {
      return NextResponse.redirect(new URL('/subscribe/premium?error=payment_not_found', request.url));
    }

    if (paymentData.status === 'success') {
      // Update payment record
      await prisma.payment.update({
        where: { reference },
        data: {
          status: 'SUCCESS',
          paystackReference: paymentData.reference,
          channel: paymentData.channel,
          paidAt: new Date(paymentData.paid_at),
        },
      });

      // Handle subscription payment
      if (payment.subscription) {
        // Update subscription status
        await prisma.subscription.update({
          where: { id: payment.subscription.id },
          data: {
            status: 'ACTIVE',
            paystackCustomerCode: paymentData.customer.customer_code,
          },
        });

        // Update subscriber to premium
        if (payment.subscription.subscriberId) {
          await prisma.subscriber.update({
            where: { id: payment.subscription.subscriberId },
            data: { isPremium: true },
          });
        }

        // Send confirmation email
        try {
          await sendEmail({
            to: payment.email,
            subject: '🎉 Welcome to AfriVerse Premium!',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #1a1a2e;">Welcome to AfriVerse Premium!</h1>
                <p>Thank you for subscribing to AfriVerse Premium Newsletter.</p>
                <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">Your Subscription Details:</h3>
                  <p><strong>Plan:</strong> ${payment.subscription.plan}</p>
                  <p><strong>Amount:</strong> ₦${(payment.amount / 100).toLocaleString()}</p>
                  <p><strong>Next billing:</strong> ${payment.subscription.currentPeriodEnd.toLocaleDateString()}</p>
                </div>
                <h3>Premium Benefits:</h3>
                <ul>
                  <li>✅ Ad-free reading experience</li>
                  <li>✅ Early access to articles</li>
                  <li>✅ Exclusive premium content</li>
                  <li>✅ Weekly digest with insights</li>
                  <li>✅ Priority support</li>
                </ul>
                <p>If you have any questions, reply to this email.</p>
                <p>Welcome to the AfriVerse community!</p>
              </div>
            `,
          });
        } catch (emailError) {
          console.error('Failed to send subscription confirmation email:', emailError);
        }

        return NextResponse.redirect(new URL('/subscribe/premium/success', request.url));
      }

      // Handle advertising payment
      if (payment.advertisingOrder) {
        // Update order status
        await prisma.advertisingOrder.update({
          where: { id: payment.advertisingOrder.id },
          data: { status: 'PAID' },
        });

        // Send confirmation email
        try {
          await sendEmail({
            to: payment.email,
            subject: '🎉 AfriVerse Advertising Order Confirmed!',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #1a1a2e;">Advertising Order Confirmed!</h1>
                <p>Thank you for choosing AfriVerse for your advertising needs.</p>
                <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">Order Details:</h3>
                  <p><strong>Package:</strong> ${payment.advertisingOrder.packageType.replace(/_/g, ' ')}</p>
                  <p><strong>Company:</strong> ${payment.advertisingOrder.companyName}</p>
                  <p><strong>Amount:</strong> ₦${(payment.amount / 100).toLocaleString()}</p>
                  <p><strong>Reference:</strong> ${reference}</p>
                </div>
                <p>Our sales team will contact you within 24 hours to discuss the next steps.</p>
                <p>For urgent inquiries, please contact us at tips@afriverse.africa</p>
              </div>
            `,
          });

          // Notify admin
          await sendEmail({
            to: process.env.ADMIN_EMAIL || 'john.paulson@afriverse.africa',
            subject: `💰 New Advertising Order: ${payment.advertisingOrder.packageType}`,
            html: `
              <div style="font-family: Arial, sans-serif;">
                <h2>New Advertising Order Received!</h2>
                <p><strong>Package:</strong> ${payment.advertisingOrder.packageType}</p>
                <p><strong>Company:</strong> ${payment.advertisingOrder.companyName}</p>
                <p><strong>Contact:</strong> ${payment.advertisingOrder.contactName}</p>
                <p><strong>Email:</strong> ${payment.email}</p>
                <p><strong>Phone:</strong> ${payment.advertisingOrder.phone || 'N/A'}</p>
                <p><strong>Amount:</strong> ₦${(payment.amount / 100).toLocaleString()}</p>
                <p><strong>Reference:</strong> ${reference}</p>
              </div>
            `,
          });
        } catch (emailError) {
          console.error('Failed to send advertising confirmation email:', emailError);
        }

        return NextResponse.redirect(new URL('/media-kit/success', request.url));
      }

      return NextResponse.redirect(new URL('/?payment=success', request.url));

    } else {
      // Payment failed
      await prisma.payment.update({
        where: { reference },
        data: {
          status: paymentData.status === 'abandoned' ? 'ABANDONED' : 'FAILED',
        },
      });

      // Clean up pending records
      if (payment.subscription) {
        await prisma.subscription.delete({
          where: { id: payment.subscription.id },
        });
      }

      if (payment.advertisingOrder) {
        await prisma.advertisingOrder.update({
          where: { id: payment.advertisingOrder.id },
          data: { status: 'CANCELLED' },
        });
      }

      const redirectUrl = payment.subscription 
        ? '/subscribe/premium?error=payment_failed'
        : '/media-kit?error=payment_failed';

      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.redirect(new URL('/subscribe/premium?error=verification_failed', request.url));
  }
}
