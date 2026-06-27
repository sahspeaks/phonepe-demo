import { NextResponse } from "next/server";
import crypto from "crypto";

const PHONEPE_SANDBOX_URL =
  "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";

export async function POST(req: Request) {
  try {
    const { amount, userId } = await req.json();

    if (!amount || amount < 1) {
      return NextResponse.json(
        { success: false, message: "Amount must be at least 1 (in rupees)" },
        { status: 400 }
      );
    }

    const merchantId = process.env.PHONEPE_TEST_MERCHANT_ID!;
    const saltKey = process.env.PHONEPE_TEST_SALT_KEY!;
    const saltIndex = process.env.PHONEPE_TEST_SALT_INDEX!;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

    const transactionId = `TXN-${Date.now()}`;
    const amountInPaise = Math.round(amount * 100);

    const paymentPayload = {
      merchantId,
      merchantTransactionId: transactionId,
      merchantUserId: userId || "USER-123",
      amount: amountInPaise,
      redirectUrl: `${appUrl}/api/phonepe/test-status?id=${transactionId}`,
      redirectMode: "POST",
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    const base64Payload = Buffer.from(
      JSON.stringify(paymentPayload),
      "utf8"
    ).toString("base64");

    const stringToHash = base64Payload + "/pg/v1/pay" + saltKey;
    const sha256 = crypto
      .createHash("sha256")
      .update(stringToHash)
      .digest("hex");
    const xVerify = `${sha256}###${saltIndex}`;

    const response = await fetch(PHONEPE_SANDBOX_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
      },
      body: JSON.stringify({ request: base64Payload }),
    });

    const data = await response.json();

    if (data.success) {
      const redirectUrl =
        data.data.instrumentResponse.redirectInfo.url;
      return NextResponse.json({
        success: true,
        url: redirectUrl,
        transactionId,
      });
    }

    return NextResponse.json(
      { success: false, message: data.message || "Payment initiation failed" },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error("PhonePe Test Payment Error:", error);
    const message =
      error instanceof Error ? error.message : "Payment initialization failed";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
