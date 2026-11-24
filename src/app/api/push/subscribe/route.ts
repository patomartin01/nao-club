import { NextResponse } from 'next/server';
import { subscriptionsStore } from '@/lib/pushSubscriptionsStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    totalSubscriptions: subscriptionsStore.size,
    service: 'NAO Web Push Subscription Endpoint'
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subscription, userId = 'anonymous', device = 'unknown' } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Subscription endpoint is required' }, { status: 400 });
    }

    const key = subscription.endpoint;
    subscriptionsStore.set(key, {
      subscription,
      userId,
      device,
      updatedAt: new Date().toISOString()
    });

    console.log(`[NAO Push] Suscripción registrada para usuario ${userId}. Total: ${subscriptionsStore.size}`);

    return NextResponse.json({
      success: true,
      registered: true,
      totalActive: subscriptionsStore.size
    });
  } catch (err: any) {
    console.error('[NAO Push Subscribe Error]:', err);
    return NextResponse.json({ error: err.message || 'Error registrando suscripción' }, { status: 500 });
  }
}
