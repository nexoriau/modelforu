import { getCompanyByUserId } from '@/app/admin/profile/_services/profileUpdate.action';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { price, quantity, userId, planName, userEmail, type } =
      await request.json();

    if (!price || !quantity || !userId || !planName || !userEmail || !type) {
      return NextResponse.json(
        {
          error:
            'Price, Quantity, User ID, Plan Name, and User Email, Type are required',
        },
        { status: 400 }
      );
    }
    const companyData = await getCompanyByUserId(userId);

    // Convert the dollar amount to cents
    const unitAmountInCents = Math.round(price * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: unitAmountInCents,
            product_data: {
              name: `${quantity} Tokens`,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: userEmail, // This will pre-fill the email field
      billing_address_collection: 'auto', // Optional: customize address collection
      submit_type: 'pay',
      success_url: `${request.headers.get(
        'origin'
      )}/user/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/user/dashboard?canceled=true`,
      metadata: {
        userId,
        quantity: quantity.toString(),
        price: price.toString(),
        planName,
        userEmail,
        type,
        companyName: companyData?.companyName ?? '',
        vatNumber: companyData?.companyNumber ?? '',
        companyAddress: companyData?.companyDescription ?? '',
      },
      invoice_creation: { enabled: true },
    });
    return NextResponse.json({ sessionUrl: session.url });
  } catch (err) {
    console.error('Error creating Stripe session:', err);
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    );
  }
}
