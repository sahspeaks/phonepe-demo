import { NextResponse } from "next/server";
import { getPhonePeClient } from "@/lib/phonepe";

export async function POST(req: Request) {
  return handleStatusCheck(req);
}

export async function GET(req: Request) {
  return handleStatusCheck(req);
}

async function handleStatusCheck(req: Request) {
  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/payment-failed`,
        303
      );
    }

    const client = getPhonePeClient();
    const response = await client.getOrderStatus(orderId);
    const state = response.state;

    if (state === "COMPLETED") {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?orderId=${orderId}&amount=${response.amount}`,
        303
      );
    } else {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/payment-failed?orderId=${orderId}&state=${state}`,
        303
      );
    }
  } catch (error) {
    console.error("Status Check Failure:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/payment-failed`,
      303
    );
  }
}
