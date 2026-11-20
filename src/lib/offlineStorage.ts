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

const ACTIVE_SESSION_ID = 'current_gps_ride';

// Devuelve true si se guardó, false si IndexedDB no está disponible o falló
// (el modal usa eso para caer a localStorage solo cuando hace falta)
export const saveActiveRecordingToDB = async (data: any): Promise<boolean> => {
  try {
    const db = await getOfflineDB();
    if (!db) return false;
    await db.put('active_recording', {
      id: ACTIVE_SESSION_ID,
      ...data,
      updatedAt: Date.now()
    });
    return true;
  } catch (err) {
    console.warn('[OfflineDB] Error saving active recording point:', err);
    return false;
  }
};

export const getActiveRecordingFromDB = async () => {
  try {
    const db = await getOfflineDB();
    if (!db) return null;
    return await db.get('active_recording', ACTIVE_SESSION_ID);
  } catch (err) {
    console.warn('[OfflineDB] Error retrieving active recording:', err);
    return null;
  }
};

export const clearActiveRecordingFromDB = async () => {
  try {
    const db = await getOfflineDB();
    if (!db) return;
    await db.delete('active_recording', ACTIVE_SESSION_ID);
  } catch (err) {
    console.warn('[OfflineDB] Error clearing active recording:', err);
  }
};

// ==============================================================================
// OFFLINE OUTBOX SYNC QUEUE (COLA DE SINCRONIZACIÓN AUTOMÁTICA)
// ==============================================================================

export const enqueueOfflineAction = async (action: NaoOfflineDB['sync_queue']['value']['action'], payload: any) => {
  try {
    const db = await getOfflineDB();
    if (!db) return;
    const queueItem = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      action,
      payload,
      createdAt: Date.now(),
      retryCount: 0
    };
    await db.put('sync_queue', queueItem);
    console.log(`[OfflineDB] Acción '${action}' encolada para subir al volver la señal.`);
  } catch (err) {
    console.error('[OfflineDB] Error enqueueing offline action:', err);
  }
};

export const getPendingSyncQueue = async () => {
  try {
    const db = await getOfflineDB();
    if (!db) return [];
    return await db.getAll('sync_queue');
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
