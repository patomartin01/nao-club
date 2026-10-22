import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  const query = q.trim();
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // 1. If Google Maps API key is configured, query official Google Places Autocomplete
  if (apiKey) {
    try {
      const googleRes = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          query
        )}&components=country:mx&language=es&key=${apiKey}`
      );
      if (googleRes.ok) {
        const data = await googleRes.json();
        if (data.status === 'OK' && data.predictions) {
          const results = data.predictions.map((p: any) => ({
            name: p.structured_formatting?.main_text || p.description,
            address: p.structured_formatting?.secondary_text || '',
            placeId: p.place_id,
            source: 'google_places'
          }));
          return NextResponse.json({ results });
        }
      }
    } catch (e) {
      console.error('Google Places API error:', e);
    }
  }

  // 2. Query Google suggestions (Chrome search completions for businesses / POIs)
  const suggestions: Array<{ name: string; address?: string; lat?: number; lng?: number }> = [];

  try {
    const googleSuggestRes = await fetch(
      `https://suggestqueries.google.com/complete/search?client=chrome&hl=es-MX&gl=mx&q=${encodeURIComponent(query)}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    if (googleSuggestRes.ok) {
      const suggestData = await googleSuggestRes.json();
      if (Array.isArray(suggestData[1])) {
        const topQueries: string[] = suggestData[1].slice(0, 4);
        topQueries.forEach(item => {
          if (item && item.toLowerCase() !== query.toLowerCase()) {
            suggestions.push({
              name: item
            });
          }
        });
      }
    }
  } catch (err) {
    // ignore
  }

  // 3. Query Photon Geocoding for coordinates and geocoded points in Mexico
  try {
    const photonRes = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=19.4326&lon=-99.1332&limit=6`
    );
    if (photonRes.ok) {
      const pData = await photonRes.json();
      const pResults = (pData.features || []).map((f: any) => {
        const props = f.properties || {};
        const coords = f.geometry?.coordinates || [0, 0];
        const name = props.name || props.street || query;
        const addressParts = [
          props.street && props.street !== name ? props.street : null,
          props.district || props.suburb || props.locality,
          props.city || props.county,
          props.state
        ].filter(Boolean) as string[];

        const uniqueParts = addressParts.filter((p, i) => addressParts.indexOf(p) === i);

        return {
          name,
          address: uniqueParts.slice(0, 3).join(', '),
          lat: coords[1] || 19.4000,
          lng: coords[0] || -99.2000
        };
      });

      // Merge results
      pResults.forEach((pr: any) => {
        const key = `${pr.name.toLowerCase()}|${(pr.address || '').toLowerCase()}`;
        if (!suggestions.some(s => `${s.name.toLowerCase()}|${(s.address || '').toLowerCase()}` === key)) {
          suggestions.push(pr);
        }
      });
    }
  } catch (err) {
    // ignore
  }

  return NextResponse.json({ results: suggestions.slice(0, 8) });
}
