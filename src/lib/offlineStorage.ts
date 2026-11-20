import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface NaoOfflineDB extends DBSchema {
  // Grabación activa punto por punto (para que no se pierda al recargar o si el OS suspende la app)
  active_recording: {
    key: string;
    value: {
      id: string;
      isRecording: boolean;
      isPaused: boolean;
      elapsedSeconds: number;
      distanceKm: number;
      currentSpeed: number;
      avgSpeed: number;
      currentElevation: number;
      maxElevation: number;
      trackCoords: [number, number][]; // [lat, lng]
      telemetryPoints: {
        lat: number;
        lng: number;
        ele: number;
        speed: number;
        accuracy: number;
        timestamp: number;
      }[];
      recordedWaypoints: any[];
      detectedStopsCount: number;
      routeTitle?: string;
      routeDescription?: string;
      targetCrewId?: string;
      targetRodadaId?: string;
      ownerId?: string; // usuario dueño de la grabación (varios pilotos pueden usar el mismo teléfono)
      updatedAt: number;
    };
  };

  // Cola de sincronización fuera de línea (Outbox)
  // Guarda acciones cuando no hay señal para subirlas en cuanto regrese internet
  sync_queue: {
    key: string;
    value: {
      id: string;
      action: 'publish_activity' | 'join_crew' | 'leave_crew' | 'follow_user' | 'unfollow_user' | 'create_route_proposal' | 'delete_route_proposal' | 'vote_route' | 'create_rodada' | 'delete_rodada' | 'lock_winning_route' | 'unlock_winning_route' | 'complete_rodada' | 'archive_route' | 'unarchive_route' | string;
      payload: any;
      createdAt: number;
      retryCount: number;
      userId?: string; // quién generó la acción: solo se sube con la sesión de ese usuario

    };
  };

  // Rutas y mapas guardados localmente para consulta offline en montaña
  offline_cached_routes: {
    key: string;
    value: {
      id: string;
      title: string;
      coordinates: [number, number][];
      waypoints: any[];
      distanceKm: number;
      cachedAt: number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<NaoOfflineDB>> | null = null;

export const getOfflineDB = () => {
  if (typeof window === 'undefined') return null;
  if (!dbPromise) {
    dbPromise = openDB<NaoOfflineDB>('nao_offline_vault_v1', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('active_recording')) {
          db.createObjectStore('active_recording', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('offline_cached_routes')) {
          db.createObjectStore('offline_cached_routes', { keyPath: 'id' });
        }
      }
    });
  }
  return dbPromise;
};

// ==============================================================================
// GPS ACTIVE RECORDING HELPERS (TOLERANTE A FALLAS / MODO MONTAÑA)
// ==============================================================================

// Una grabación activa por usuario: si dos pilotos usan el mismo teléfono (o uno cierra
// sesión y entra otro), cada quien recupera solo su propia ruta.
const LEGACY_SESSION_ID = 'current_gps_ride';
const sessionIdFor = (userId: string) => `${LEGACY_SESSION_ID}:${userId}`;

export const saveActiveRecordingToDB = async (userId: string, data: any): Promise<boolean> => {
  // Devuelve true si se guardó, false si IndexedDB no está disponible o falló
  // (el modal usa eso para caer a localStorage solo cuando hace falta)
  try {
    const db = await getOfflineDB();
    if (!db) return false;
    await db.put('active_recording', {
      ...data,
      id: sessionIdFor(userId),
      ownerId: userId,
      updatedAt: Date.now()
    });
    return true;
  } catch (err) {
    console.warn('[OfflineDB] Error saving active recording point:', err);
    return false;
  }
};

export const getActiveRecordingFromDB = async (userId: string) => {
  try {
    const db = await getOfflineDB();
    if (!db) return null;
    const own = await db.get('active_recording', sessionIdFor(userId));
    if (own) return own;
    // Registro viejo sin dueño (antes de separar por usuario): solo si declara ser de este usuario
    const legacy = await db.get('active_recording', LEGACY_SESSION_ID);
    if (legacy && legacy.ownerId === userId) return legacy;
    return null;
  } catch (err) {
    console.warn('[OfflineDB] Error retrieving active recording:', err);
    return null;
  }
};

export const clearActiveRecordingFromDB = async (userId: string) => {
  try {
    const db = await getOfflineDB();
    if (!db) return;
    await db.delete('active_recording', sessionIdFor(userId));
    const legacy = await db.get('active_recording', LEGACY_SESSION_ID);
    if (legacy && legacy.ownerId === userId) await db.delete('active_recording', LEGACY_SESSION_ID);
  } catch (err) {
    console.warn('[OfflineDB] Error clearing active recording:', err);
  }
};

// ==============================================================================
// OFFLINE OUTBOX SYNC QUEUE (COLA DE SINCRONIZACIÓN AUTOMÁTICA)
// ==============================================================================

// Usuario con sesión activa. AppContext lo actualiza al iniciar/cerrar sesión para que cada
// acción encolada quede marcada con su dueño sin tener que pasarlo en cada llamada.
let queueOwnerId: string | null = null;
export const setOfflineQueueOwner = (userId: string | null) => {
  queueOwnerId = userId && userId !== 'guest' ? userId : null;
};

export const enqueueOfflineAction = async (action: NaoOfflineDB['sync_queue']['value']['action'], payload: any) => {
  try {
    const db = await getOfflineDB();
    if (!db) return;
    const queueItem = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      action,
      payload,
      createdAt: Date.now(),
      retryCount: 0,
      userId: queueOwnerId || undefined
    };
    await db.put('sync_queue', queueItem);
    console.log(`[OfflineDB] Acción '${action}' encolada para subir al volver la señal.`);
  } catch (err) {
    console.error('[OfflineDB] Error enqueueing offline action:', err);
  }
};

// Solo las acciones del usuario con sesión: si en el teléfono entró otro piloto, no se suben
// acciones ajenas con su sesión (Supabase las rechazaría o quedarían a nombre equivocado).
// Las acciones viejas sin dueño se siguen subiendo para no perderlas. Orden por fecha de creación.
export const getPendingSyncQueue = async (userId?: string) => {
  try {
    const db = await getOfflineDB();
    if (!db) return [];
    const all = await db.getAll('sync_queue');
    return all
      .filter(item => !item.userId || !userId || item.userId === userId)
      .sort((a, b) => a.createdAt - b.createdAt);
  } catch (err) {
    console.warn('[OfflineDB] Error reading sync queue:', err);
    return [];
  }
};

export const removeOfflineAction = async (id: string) => {
  try {
    const db = await getOfflineDB();
    if (!db) return;
    await db.delete('sync_queue', id);
  } catch (err) {
    console.warn('[OfflineDB] Error removing action from sync queue:', err);
  }
};
