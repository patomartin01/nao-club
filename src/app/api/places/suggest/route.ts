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

  // Helper: clean routing noise and remove prefixes
  const cleanTerm = (text: string) => {
    return text
      .replace(/^(desviaci[oó]n\s+(a|hacia|de)\s+|entronque\s+(a|con)\s+|parada\s+(en|de)\s+|rumbo\s+a\s+|camino\s+a\s+|entrada\s+a\s+|salida\s+a\s+)/i, '')
      .replace(/\s+(precios|fotos|opiniones|tiempo|clima|letra|canci[oó]n|reseñas|reviews|costo|hotel|cabañas)\s*$/i, '')
      .trim();
  };

  // Helper: strip common geographical prefixes so geocoding engine hits the specific name
  const stripGeoPrefixes = (text: string) => {
    return text
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/^(parque\s+ecoturistico|parque\s+nacional|parque|reserva\s+ecologica|reserva\s+natural|reserva|santuario(\s+del\s+agua)?|presa|mirador|caseta(\s+de\s+cobro)?|balneario|restaurante|bosque|rancho|cerro|volcan|laguna|pueblo\s+magico)\s+/i, '')
      .trim();
  };

  // Helper: extract meaningful keywords (>= 3 chars, skip filler words)
  const extractKeywords = (str: string): string[] => {
    return str
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\b(el|la|los|las|de|del|en|un|una|parque|ecoturistico|nacional|presa|mirador|caseta|bosque|rancho|zona|santuario)\b/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length >= 3);
  };

  // Verify that a geocoded candidate is truly relevant to what the user typed
  // (Prevents "Parque Ecoturístico Corral de Piedra" matching "Parque Ecoturístico Las Piedras" in Chalco)
  const isGeocodeConsistent = (targetText: string, foundName: string): boolean => {
    const targetKw = extractKeywords(targetText);
    const foundKw = extractKeywords(foundName);
    if (targetKw.length === 0) return true;
    const matches = targetKw.filter(kw => foundKw.some(fw => fw.includes(kw) || kw.includes(fw)));
    return (matches.length / targetKw.length) >= 0.65;
  };

  const strippedQuery = cleanTerm(query);
  const coreQuery = stripGeoPrefixes(strippedQuery);

  // 2. Query Google Chrome suggestions (completions as seen in Google / Maps)
  const suggestions: Array<{ name: string; address?: string; lat?: number; lng?: number }> = [];
  const googleRawSuggestions: string[] = [];

  try {
    const googleSuggestRes = await fetch(
      `https://suggestqueries.google.com/complete/search?client=chrome&hl=es-MX&gl=mx&q=${encodeURIComponent(strippedQuery || query)}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    if (googleSuggestRes.ok) {
      const suggestData = await googleSuggestRes.json();
      if (Array.isArray(suggestData[1])) {
        suggestData[1].slice(0, 7).forEach((item: string) => {
          if (!item) return;
          const cleanedItem = cleanTerm(item);
          const isJunk = /(precios|fotos|opiniones|tiempo|clima|letra|canci[oó]n|reseñas|reviews|costo|trabajo|facturaci)/i.test(item);
          if (!isJunk && cleanedItem.length >= 3) {
            googleRawSuggestions.push(cleanedItem);
            const formatted = cleanedItem.charAt(0).toUpperCase() + cleanedItem.slice(1);
            if (!suggestions.some(s => s.name.toLowerCase() === formatted.toLowerCase())) {
              suggestions.push({ name: formatted });
            }
          }
        });
      }
    }
  } catch (err) {
    // ignore
  }

  // 3. Build smart search candidates for Geocoding (Photon Komoot & Nominatim)
  const searchCandidates: string[] = [];

  // If Google suggest provided a more specific candidate (e.g. "corral de piedra en amanalco"), use it
  for (const rawS of googleRawSuggestions) {
    const strippedCandidate = stripGeoPrefixes(rawS).replace(/\s+(?:en|cerca\s+de)\s+/i, ' ').trim();
    if (strippedCandidate && !searchCandidates.includes(strippedCandidate)) {
      searchCandidates.push(strippedCandidate);
    }
  }

  if (coreQuery && !searchCandidates.includes(coreQuery)) {
    searchCandidates.push(coreQuery);
  }
  if (strippedQuery && !searchCandidates.includes(strippedQuery)) {
    searchCandidates.push(strippedQuery);
  }
  if (query && !searchCandidates.includes(query)) {
    searchCandidates.push(query);
  }

  // 4. Query Photon Geocoding with Central Mexico geographical bias
  for (const candidate of searchCandidates.slice(0, 3)) {
    if (suggestions.some(s => s.lat)) break;
    try {
      const photonRes = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(candidate)}&lat=19.4326&lon=-99.1332&limit=6`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      );
      if (photonRes.ok) {
        const pData = await photonRes.json();
        const pResults = (pData.features || []).map((f: any) => {
          const props = f.properties || {};
          const coords = f.geometry?.coordinates || [0, 0];
          const name = props.name || props.street || candidate;
          const addressParts = [
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

        // Filter out false positive results (like Las Piedras in Chalco)
        const relevantResults = pResults.filter((pr: any) => 
          isGeocodeConsistent(coreQuery || strippedQuery, pr.name)
        );

        // Attach coordinates to matching suggestions
        relevantResults.forEach((pr: any) => {
          const matchExisting = suggestions.find(s => 
            s.name.toLowerCase().includes(pr.name.toLowerCase()) || 
            pr.name.toLowerCase().includes(s.name.toLowerCase()) ||
            isGeocodeConsistent(s.name, pr.name)
          );
          if (matchExisting && !matchExisting.lat) {
            matchExisting.lat = pr.lat;
            matchExisting.lng = pr.lng;
            if (!matchExisting.address) matchExisting.address = pr.address;
          }

          const key = `${pr.name.toLowerCase()}|${(pr.address || '').toLowerCase()}`;
          if (!suggestions.some(s => `${s.name.toLowerCase()}|${(s.address || '').toLowerCase()}` === key)) {
            suggestions.push(pr);
          }
        });
      }
    } catch (err) {
      // ignore
    }
  }

  // 5. Fallback geocode lookup for top suggestions still without coordinates
  for (let i = 0; i < Math.min(suggestions.length, 3); i++) {
    if (!suggestions[i].lat) {
      try {
        const lookupTerm = stripGeoPrefixes(cleanTerm(suggestions[i].name)) || suggestions[i].name;
        const geoLookup = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(lookupTerm)}&lat=19.4326&lon=-99.1332&limit=2`,
          { headers: { 'User-Agent': 'Mozilla/5.0' } }
        );
        if (geoLookup.ok) {
          const gData = await geoLookup.json();
          const first = (gData.features || []).find((f: any) => 
            isGeocodeConsistent(lookupTerm, f.properties?.name || '')
          ) || gData.features?.[0];

          if (first && first.geometry?.coordinates) {
            suggestions[i].lat = first.geometry.coordinates[1];
            suggestions[i].lng = first.geometry.coordinates[0];
            const props = first.properties || {};
            const addr = [props.district || props.locality, props.city || props.county, props.state].filter(Boolean).join(', ');
            if (addr && !suggestions[i].address) suggestions[i].address = addr;
          }
        }
      } catch {}
    }
  }

  return NextResponse.json({ results: suggestions.slice(0, 8) });
}
