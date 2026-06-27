import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { StandardCheckoutPayRequest, MetaInfo } from "@phonepe-pg/pg-sdk-node";
import { getPhonePeClient } from "@/lib/phonepe";

export async function POST(req: Request) {
  try {
    const { amount, userId } = await req.json();

    if (!amount || amount < 1) {
      return NextResponse.json(
        { success: false, message: "Amount must be at least 1 (in rupees)" },
        { status: 400 }
      );
    }

    const client = getPhonePeClient();
    const merchantOrderId = randomUUID();
    const amountInPaise = Math.round(amount * 100);

    const metaInfo = MetaInfo.builder()
      .udf1(userId || "guest")
      .udf2(new Date().toISOString())
      .build();

    const request = StandardCheckoutPayRequest.builder()
      .merchantOrderId(merchantOrderId)
      .amount(amountInPaise)
      .redirectUrl(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/phonepe/status?orderId=${merchantOrderId}`
      )
      .metaInfo(metaInfo)
      .build();

    const response = await client.pay(request);

    return NextResponse.json({
      success: true,
      url: response.redirectUrl,
      orderId: merchantOrderId,
    });
  } catch (error: unknown) {
    console.error("PhonePe Payment Error:", error);
    const message =
      error instanceof Error ? error.message : "Payment initialization failed";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
