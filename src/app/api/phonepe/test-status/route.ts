import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  return handleStatusCheck(req);
}

export async function GET(req: Request) {
  return handleStatusCheck(req);
}

async function handleStatusCheck(req: Request) {
  try {
    const url = new URL(req.url);
    const transactionId = url.searchParams.get("id");

    if (!transactionId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/payment-failed`,
        303
      );
    }

    const merchantId = process.env.PHONEPE_TEST_MERCHANT_ID!;
    const saltKey = process.env.PHONEPE_TEST_SALT_KEY!;
    const saltIndex = process.env.PHONEPE_TEST_SALT_INDEX!;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

    const apiPath = `/pg/v1/status/${merchantId}/${transactionId}`;
    const stringToHash = apiPath + saltKey;
    const sha256 = crypto
      .createHash("sha256")
      .update(stringToHash)
      .digest("hex");
    const xVerify = `${sha256}###${saltIndex}`;

    const statusUrl = `https://api-preprod.phonepe.com/apis/pg-sandbox${apiPath}`;

    const response = await fetch(statusUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
        "X-MERCHANT-ID": merchantId,
      },
    });

    const data = await response.json();

    if (data.success && data.code === "PAYMENT_SUCCESS") {
      return NextResponse.redirect(
        `${appUrl}/payment-success?orderId=${transactionId}&amount=${data.data.amount}`,
        303
      );
    }

    return NextResponse.redirect(
      `${appUrl}/payment-failed?orderId=${transactionId}&state=${data.code || "FAILED"}`,
      303
    );
  } catch (error) {
    console.error("Status Check Failure:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/payment-failed`,
      303
    );
  }
}
