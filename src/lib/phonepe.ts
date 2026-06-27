import { StandardCheckoutClient, Env } from "@phonepe-pg/pg-sdk-node";

let client: StandardCheckoutClient | null = null;

export function getPhonePeClient(): StandardCheckoutClient {
  if (!client) {
    const clientId = process.env.PHONEPE_CLIENT_ID!;
    const clientSecret = process.env.PHONEPE_CLIENT_SECRET!;
    const clientVersion = Number(process.env.PHONEPE_CLIENT_VERSION) || 1;
    const env =
      process.env.PHONEPE_ENV === "PRODUCTION" ? Env.PRODUCTION : Env.SANDBOX;

    client = StandardCheckoutClient.getInstance(
      clientId,
      clientSecret,
      clientVersion,
      env
    );
  }
  return client;
}
