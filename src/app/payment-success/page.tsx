"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const amount = params.get("amount");

  return (
    <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-green-50 to-white dark:from-zinc-900 dark:to-black">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-zinc-800">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <svg
            className="h-8 w-8 text-green-600 dark:text-green-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Payment Successful
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Your payment has been processed successfully.
        </p>

        {(orderId || amount) && (
          <div className="mt-4 space-y-2 rounded-lg bg-zinc-50 p-4 text-left text-sm dark:bg-zinc-700">
            {orderId && (
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Order ID
                </span>
                <span className="font-mono text-zinc-900 dark:text-white">
                  {orderId.slice(0, 8)}...
                </span>
              </div>
            )}
            {amount && (
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Amount
                </span>
                <span className="font-semibold text-zinc-900 dark:text-white">
                  INR {(parseInt(amount) / 100).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}

        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Make Another Payment
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
