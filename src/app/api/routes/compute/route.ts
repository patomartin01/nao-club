import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface WaypointPayload {
  lat: number;
  lng: number;
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Google Routes API (v2) compute endpoint',
    engine: 'routes.googleapis.com/directions/v2:computeRoutes'
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { origin, destination, intermediates = [] } = body;

    if (!origin || !destination) {
      return NextResponse.json({ error: 'Origin and destination are required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

    if (!apiKey) {
      return NextResponse.json({ error: 'Google Maps API key is not configured' }, { status: 500 });
    }

    const formatWaypoint = (wp: WaypointPayload) => ({
      location: {
        latLng: {
          latitude: wp.lat,
          longitude: wp.lng
        }
      }
    });

    const googlePayload: any = {
      origin: formatWaypoint(origin),
      destination: formatWaypoint(destination),
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_UNAWARE',
      polylineQuality: 'OVERVIEW'
    };

    if (Array.isArray(intermediates) && intermediates.length > 0) {
      googlePayload.intermediates = intermediates.map(formatWaypoint);
    }

    const res = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline',
        'Referer': request.headers.get('referer') || 'https://nao-club-three.vercel.app/'
      },
      body: JSON.stringify(googlePayload)
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: 'Routes API error', details: errText }, { status: res.status });
    }

    const data = await res.json();
    const route = data.routes?.[0];

    if (!route) {
      return NextResponse.json({ error: 'No route found' }, { status: 404 });
    }

    // duration format: "1515s"
    const durationSeconds = parseInt((route.duration || '0s').replace('s', ''), 10);
    const distanceMeters = route.distanceMeters || 0;

    return NextResponse.json({
      distanceKm: Math.round(distanceMeters / 100) / 10,
      durationMinutes: Math.round(durationSeconds / 60),
      encodedPolyline: route.polyline?.encodedPolyline || null
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
