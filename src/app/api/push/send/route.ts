import { NextResponse } from 'next/server';
import { setVapidDetails, sendNotification } from 'web-push';
import { subscriptionsStore } from '@/lib/pushSubscriptionsStore';

export const dynamic = 'force-dynamic';

const DEFAULT_PUBLIC_KEY = 'BFxbi5q90Br-2juPyzQbWlSqmQC2G1a0Dt9WXgLPWmsQtf8ojnT35fWeRaGLT9jEjT0qoUveZYN353g-SuIZHvw';
const DEFAULT_PRIVATE_KEY = 'NDfxugwFVtoAmScUSiz0FpuAY9RX4DbFhzcgfpxz3so';
const DEFAULT_SUBJECT = 'mailto:admin@nao.club';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subscription, userId, payload } = body;

    const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || DEFAULT_PUBLIC_KEY;
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY || DEFAULT_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT || DEFAULT_SUBJECT;

    setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

    const messagePayload = JSON.stringify({
      title: payload?.title || 'NAO Moto Club',
      body: payload?.body || 'Tienes una nueva actualización en tu club.',
      icon: payload?.icon || '/apple-icon',
      badge: payload?.badge || '/favicon.svg',
      url: payload?.url || '/'
    });

    // 1. Si se envía una suscripción individual directa
    if (subscription && subscription.endpoint) {
      try {
        await sendNotification(subscription, messagePayload);
        return NextResponse.json({ success: true, count: 1 });
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          subscriptionsStore.delete(subscription.endpoint);
        }
        return NextResponse.json({ error: 'Push delivery failed', details: err.message }, { status: 400 });
      }
    }

    // 2. Si se envía a un usuario específico o broadcast
    const targetSubscriptions: any[] = [];
    subscriptionsStore.forEach((entry) => {
      if (!userId || entry.userId === userId) {
        targetSubscriptions.push(entry.subscription);
      }
    });

    if (targetSubscriptions.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: 'No active subscriptions found' });
    }

    const results = await Promise.allSettled(
      targetSubscriptions.map(sub => sendNotification(sub, messagePayload))
    );

    let delivered = 0;
    results.forEach((res, idx) => {
      if (res.status === 'fulfilled') {
        delivered++;
      } else {
        const err: any = res.reason;
        if (err && (err.statusCode === 410 || err.statusCode === 404)) {
          subscriptionsStore.delete(targetSubscriptions[idx].endpoint);
        }
      }
    });

    return NextResponse.json({
      success: true,
      delivered,
      totalAttempted: targetSubscriptions.length
    });
  } catch (err: any) {
    console.error('[NAO Push Send Error]:', err);
    return NextResponse.json({ error: err.message || 'Error enviando notificación' }, { status: 500 });
  }
}
