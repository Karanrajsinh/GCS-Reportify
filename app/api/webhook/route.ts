import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { prisma } from "@/prisma/prisma";

// Mark route as dynamic to prevent static optimization
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // Check WEBHOOK_SECRET first
  const webhookSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  if (!webhookSecret) {
    console.error('WEBHOOK_SECRET is not set');
    return new Response('Server configuration error', {
      status: 500
    });
  }
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(webhookSecret);

  try {
    const evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;

    const eventType = evt.type;
    const userId = evt.data.id;

    if (!userId || typeof userId !== 'string') {
      return new Response('Invalid user ID', { status: 400 });
    }

    try {
      switch (eventType) {
        case 'user.created':
          await prisma.user.create({
            data: {
              id: userId,
              email: evt.data.email_addresses?.[0]?.email_address ?? '',
              name: evt.data.first_name ?? null
            },
          });
          break;

        case 'user.updated':
          await prisma.user.update({
            where: { id: userId },
            data: {
              email: evt.data.email_addresses?.[0]?.email_address ?? '',
              name: evt.data.first_name ?? null
            },
          });
          break;

        case 'user.deleted':
          await prisma.user.delete({
            where: { id: userId },
          });
          break;
      }

      return new Response('Success', { status: 200 });
    } catch (error) {
      console.error('Database operation failed:', error);
      return new Response('Database operation failed', { status: 500 });
    }
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Webhook verification failed', { status: 400 });
  }
}