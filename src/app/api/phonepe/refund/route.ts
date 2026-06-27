import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { RefundRequest } from "@phonepe-pg/pg-sdk-node";
import { getPhonePeClient } from "@/lib/phonepe";

export async function POST(req: Request) {
  try {
    const { orderId, amount } = await req.json();

    if (!orderId || !amount) {
      return NextResponse.json(
        { success: false, message: "orderId and amount are required" },
        { status: 400 }
      );
    }

    const client = getPhonePeClient();
    const refundId = randomUUID();
    const amountInPaise = Math.round(amount * 100);

    const request = RefundRequest.builder()
      .merchantRefundId(refundId)
      .originalMerchantOrderId(orderId)
      .amount(amountInPaise)
      .build();

    const response = await client.refund(request);

    return NextResponse.json({
      success: true,
      refundId,
      state: response.state,
      amount: response.amount,
    });
  } catch (error: unknown) {
    console.error("Refund Error:", error);
    const message =
      error instanceof Error ? error.message : "Refund failed";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
