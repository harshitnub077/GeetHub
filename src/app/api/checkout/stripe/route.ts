import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json();
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    // If Stripe key is configured, initialize Stripe Checkout
    if (stripeKey) {
      try {
        const stripe = require('stripe')(stripeKey);
        const priceAmount = plan === 'annual' ? 5999 : 999; // $59.99 or $9.99

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: `GeetHub Pro (${plan === 'annual' ? 'Annual Plan' : 'Monthly Plan'})`,
                  description: 'Full access to Pro masterclasses, video uploads, and guitar tutor suite.',
                  images: ['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400'],
                },
                unit_amount: priceAmount,
                recurring: {
                  interval: plan === 'annual' ? 'year' : 'month',
                },
              },
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: `${request.nextUrl.origin}/pro?success=true`,
          cancel_url: `${request.nextUrl.origin}/pro?canceled=true`,
        });

        return NextResponse.json({ url: session.url });
      } catch (stripeErr: any) {
        console.error('Stripe API error:', stripeErr);
        // Fall back to demo mode response
        return NextResponse.json({
          url: null,
          demo: true,
          message: 'Stripe secret key error or test mode. Activated Pro Pass.',
        });
      }
    }

    // Demo Mode (when STRIPE_SECRET_KEY is not yet added to .env.local)
    return NextResponse.json({
      url: null,
      demo: true,
      message: 'Stripe key not configured. Activated instant Pro pass in demo mode.',
    });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: err.message || 'Checkout failed' }, { status: 500 });
  }
}
