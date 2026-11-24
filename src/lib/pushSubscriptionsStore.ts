// Almacén en memoria persistente para el runtime de Next.js
export interface PushSubscriptionRecord {
  subscription: any;
  userId: string;
  device?: string;
  updatedAt: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __nao_push_subscriptions: Map<string, PushSubscriptionRecord> | undefined;
}

if (!global.__nao_push_subscriptions) {
  global.__nao_push_subscriptions = new Map<string, PushSubscriptionRecord>();
}

export const subscriptionsStore = global.__nao_push_subscriptions;
