import { getCompanyByUserId } from '@/app/admin/profile/_services/profileUpdate.action';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const {
      price,
      tokenQuantity = 0,
      modelQuantity = 0,
      interval,
      userId,
      planName,
      userEmail,
      remainingTokens = 0,
    } = await request.json();
    if (!price || !interval || !userId || !planName || !userEmail) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const companyData = await getCompanyByUserId(userId);

    // Convert price to cents
    const unitAmount = Math.round(price * 100);

    // Create subscription session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tokenQuantity} Tokens (${
                interval === 'year' ? 'Annual' : 'Monthly'
              })`,
            },
            unit_amount: unitAmount,
            recurring: {
              interval: interval,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      customer_email: userEmail,
      success_url: `${request.headers.get(
        'origin'
      )}/user/dashboard?success=true&subscription=true`,
      cancel_url: `${request.headers.get('origin')}/user/dashboard?canceled=true`,
      subscription_data: {
        metadata: {
          userId,
          tokenQuantity: tokenQuantity.toString(),
          modelQuantity: modelQuantity.toString(),
          interval,
          price: price.toString(),
          planName,
          remainingTokens: remainingTokens.toString(),
          userEmail,
          companyName: companyData?.companyName ?? '',
          vatNumber: companyData?.companyNumber ?? '',
          companyAddress: companyData?.companyDescription ?? '',
        },
      },
      metadata: {
        userId,
        tokenQuantity: tokenQuantity.toString(),
        modelQuantity: modelQuantity.toString(),
        interval,
        price: price.toString(),
        planName,
        remainingTokens: remainingTokens.toString(),
        userEmail,
        companyName: companyData?.companyName ?? '',
        vatNumber: companyData?.companyNumber ?? '',
        companyAddress: companyData?.companyDescription ?? '',
      },
    });

    return NextResponse.json({ sessionUrl: session.url });
  } catch (err) {
    console.error('Error creating Stripe subscription session:', err);
    return NextResponse.json(
      { error: 'Error creating subscription session' },
      { status: 500 }
    );
  }
}
