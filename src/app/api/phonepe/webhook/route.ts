import { NextResponse } from "next/server";
import { CallbackType } from "@phonepe-pg/pg-sdk-node";
import { getPhonePeClient } from "@/lib/phonepe";

export async function POST(req: Request) {
  try {
    const authorization = req.headers.get("authorization") || "";
    const body = await req.text();

    const username = process.env.PHONEPE_WEBHOOK_USERNAME!;
    const password = process.env.PHONEPE_WEBHOOK_PASSWORD!;

    const client = getPhonePeClient();
    const callbackResponse = client.validateCallback(
      username,
      password,
      authorization,
      body
    );

    const type = callbackResponse.type;
    const payload = callbackResponse.payload;

    console.log("Webhook received:", {
      type,
      orderId: payload.orderId,
      state: payload.state,
      amount: payload.amount,
    });

    // Handle different callback types
    switch (type) {
      case CallbackType.CHECKOUT_ORDER_COMPLETED:
        console.log(`Order ${payload.orderId} completed`);
        break;
      case CallbackType.CHECKOUT_ORDER_FAILED:
        console.log(`Order ${payload.orderId} failed`);
        break;
      case CallbackType.PG_REFUND_COMPLETED:
        console.log(`Refund ${payload.merchantRefundId} completed`);
        break;
      case CallbackType.PG_REFUND_FAILED:
        console.log(`Refund ${payload.merchantRefundId} failed`);
        break;
      default:
        console.log(`Unhandled callback type: ${type}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook validation failed:", error);
    return NextResponse.json(
      { success: false, message: "Invalid callback" },
      { status: 400 }
    );
  }
}
