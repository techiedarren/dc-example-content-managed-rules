import { ContentClient } from "dc-delivery-sdk-js";

let client: ContentClient | undefined;

export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy web/.env.example to web/.env.local.`,
    );
  }
  return value;
}

/**
 * Fetches a content item by delivery key from the Content Delivery API, with linked
 * content inlined, and returns it as plain JSON.
 */
export async function getContentByKey<T>(key: string): Promise<T> {
  client ??= new ContentClient({ hubName: requiredEnv("AMPLIENCE_HUB_NAME") });
  const item = await client.getContentItemByKey(key);
  return item.toJSON() as T;
}
