import { getCourseById } from "@/lib/catalog";

/**
 * Creates a payment order for a course.
 *
 * Demo mode (default): returns a mock order id so the checkout flow works with no
 * secrets. To go live, set RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET and replace the
 * mock block with the Razorpay Orders API:
 *
 *   import Razorpay from "razorpay";
 *   const rzp = new Razorpay({ key_id, key_secret });
 *   const order = await rzp.orders.create({ amount: amountPaise, currency: "INR", receipt });
 *
 * The browser then opens Razorpay Checkout with `order.id`, and a separate
 * webhook/verify route confirms `razorpay_signature` before granting access.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { courseId?: string };
  const course = body.courseId ? await getCourseById(body.courseId) : undefined;

  if (!course) {
    return Response.json({ error: "Unknown course" }, { status: 400 });
  }

  const gst = Math.round(course.priceInr * 0.18);
  const amount = course.priceInr + gst;

  return Response.json({
    mock: true,
    orderId: `order_demo_${course.id}`,
    keyId: process.env.RAZORPAY_KEY_ID ?? "rzp_test_demo",
    currency: "INR",
    amountPaise: amount * 100,
    breakdown: { base: course.priceInr, gst, total: amount },
  });
}
