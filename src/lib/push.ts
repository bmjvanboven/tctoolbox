import webpush from "web-push";
import { prisma } from "@/lib/db";

webpush.setVapidDetails(
  process.env.VAPID_MAILTO!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function stuurPushNaarGebruiker(userId: string, payload: { titel: string; tekst: string; url?: string }) {
  const subs = await prisma.pushSubscriptie.findMany({ where: { userId } });
  const resultaten = await Promise.allSettled(
    subs.map(sub =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload)
      )
    )
  );
  // Verwijder verlopen subscripties (410 Gone)
  for (let i = 0; i < resultaten.length; i++) {
    const r = resultaten[i];
    if (r.status === "rejected" && (r.reason as { statusCode?: number })?.statusCode === 410) {
      await prisma.pushSubscriptie.delete({ where: { endpoint: subs[i].endpoint } }).catch(() => {});
    }
  }
}

export async function stuurPushNaarAllen(payload: { titel: string; tekst: string; url?: string }) {
  const subs = await prisma.pushSubscriptie.findMany();
  await Promise.allSettled(
    subs.map(sub =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload)
      )
    )
  );
}
