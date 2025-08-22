import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// import { NextResponse } from "next/server";
// import Stripe from "stripe";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2025-07-30.basil",
// });

// export async function POST(req: Request) {
//   try {
//     const { planName, price, currency } = await req.json();

//     const priceInCents = Math.round(price * 100);

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       mode: "subscription",
//       line_items: [
//         {
//           price_data: {
//             currency,
//             product_data: { name: planName },
//             unit_amount: priceInCents,
//             recurring: { interval: "month" },
//           },
//           quantity: 1,
//         },
//       ],
//       success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
//     });

//     return NextResponse.json({ url: session.url });
//   } catch (err) {
//     console.error("Checkout error:", err);
//     return NextResponse.json({ error: "Stripe checkout failed" }, { status: 500 });
//   }
// }


// import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//   try {
//     const { phoneNumber, planName, price } = await req.json();

//     // 🔑 You’ll need to implement this:
//     // 1. Get Safaricom access token
//     // 2. Call STK push endpoint with `phoneNumber`, `amount`, etc.

//     // Mock for now:
//     console.log(`M-Pesa STK Push to ${phoneNumber} for ${planName} @ ${price}`);

//     return NextResponse.json({ success: true, message: "STK Push sent" });
//   } catch (err) {
//     console.error("M-Pesa checkout error:", err);
//     return NextResponse.json({ error: "M-Pesa checkout failed" }, { status: 500 });
//   }
// }
