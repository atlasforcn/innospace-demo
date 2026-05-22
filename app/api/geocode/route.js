export const runtime = "nodejs";

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "Content-Type"
};

const fallbackLocations = [
  {
    pattern: /陽明山|yangmingshan|yangming mountain|yangmingshan national park/i,
    formatted_address: "Yangmingshan National Park, Taipei, Taiwan",
    location: { lat: 25.1664, lng: 121.5637 },
    place_id: "fallback-yangmingshan-taiwan"
  },
  {
    pattern: /new taipei|新北/i,
    formatted_address: "New Taipei City, Taiwan",
    location: { lat: 25.0169, lng: 121.4628 },
    place_id: "fallback-new-taipei-taiwan"
  },
  {
    pattern: /taipei|台北|臺北/i,
    formatted_address: "Taipei City, Taiwan",
    location: { lat: 25.033, lng: 121.5654 },
    place_id: "fallback-taipei-taiwan"
  },
  {
    pattern: /hsinchu|新竹/i,
    formatted_address: "Hsinchu City, Taiwan",
    location: { lat: 24.8138, lng: 120.9675 },
    place_id: "fallback-hsinchu-taiwan"
  },
  {
    pattern: /taichung|台中|臺中/i,
    formatted_address: "Taichung City, Taiwan",
    location: { lat: 24.1477, lng: 120.6736 },
    place_id: "fallback-taichung-taiwan"
  },
  {
    pattern: /tainan|台南|臺南/i,
    formatted_address: "Tainan City, Taiwan",
    location: { lat: 22.9999, lng: 120.227 },
    place_id: "fallback-tainan-taiwan"
  },
  {
    pattern: /kaohsiung|高雄/i,
    formatted_address: "Kaohsiung City, Taiwan",
    location: { lat: 22.6273, lng: 120.3014 },
    place_id: "fallback-kaohsiung-taiwan"
  },
  {
    pattern: /washington|dc|d\.c\.|pennsylvania/i,
    formatted_address: "Washington, DC, USA",
    location: { lat: 38.9072, lng: -77.0369 },
    place_id: "fallback-washington-dc"
  },
  {
    pattern: /alishan|阿里山|chiayi|嘉義/i,
    formatted_address: "Alishan Township, Chiayi County, Taiwan",
    location: { lat: 23.4355, lng: 120.7809 },
    place_id: "fallback-alishan-taiwan"
  },
  {
    pattern: /富士山|ふじさん|mount\s+fuji|fuji(?:san)?/i,
    formatted_address: "Mount Fuji, Japan",
    location: { lat: 35.3606, lng: 138.7274 },
    place_id: "fallback-mount-fuji-japan"
  },
  {
    pattern: /tokyo|東京/i,
    formatted_address: "Tokyo, Japan",
    location: { lat: 35.6762, lng: 139.6503 },
    place_id: "fallback-tokyo-japan"
  },
  {
    pattern: /osaka|大阪/i,
    formatted_address: "Osaka, Japan",
    location: { lat: 34.6937, lng: 135.5023 },
    place_id: "fallback-osaka-japan"
  },
  {
    pattern: /seoul|首爾|首尔/i,
    formatted_address: "Seoul, South Korea",
    location: { lat: 37.5665, lng: 126.978 },
    place_id: "fallback-seoul-korea"
  },
  {
    pattern: /singapore|新加坡/i,
    formatted_address: "Singapore",
    location: { lat: 1.3521, lng: 103.8198 },
    place_id: "fallback-singapore"
  },
  {
    pattern: /seattle|西雅圖|西雅图/i,
    formatted_address: "Seattle, WA, USA",
    location: { lat: 47.6062, lng: -122.3321 },
    place_id: "fallback-seattle-usa"
  },
  {
    pattern: /san francisco|舊金山|旧金山/i,
    formatted_address: "San Francisco, CA, USA",
    location: { lat: 37.7749, lng: -122.4194 },
    place_id: "fallback-san-francisco-usa"
  },
  {
    pattern: /los angeles|洛杉磯|洛杉矶/i,
    formatted_address: "Los Angeles, CA, USA",
    location: { lat: 34.0522, lng: -118.2437 },
    place_id: "fallback-los-angeles-usa"
  },
  {
    pattern: /new york|紐約|纽约/i,
    formatted_address: "New York, NY, USA",
    location: { lat: 40.7128, lng: -74.006 },
    place_id: "fallback-new-york-usa"
  },
  {
    pattern: /london|倫敦|伦敦/i,
    formatted_address: "London, UK",
    location: { lat: 51.5072, lng: -0.1276 },
    place_id: "fallback-london-uk"
  },
  {
    pattern: /paris|巴黎/i,
    formatted_address: "Paris, France",
    location: { lat: 48.8566, lng: 2.3522 },
    place_id: "fallback-paris-france"
  },
  {
    pattern: /rocky|colorado|落基山|洛磯山/i,
    formatted_address: "Rocky Mountains, Colorado, USA",
    location: { lat: 39.18, lng: -106.82 },
    place_id: "fallback-rocky-mountains"
  }
];

function fallbackGeocode(query) {
  const match = fallbackLocations.find((item) => item.pattern.test(query));
  if (match) {
    return {
      formatted_address: match.formatted_address,
      location: match.location,
      place_id: match.place_id
    };
  }

  return {
    formatted_address: query,
    location: null,
    place_id: "fallback-unresolved"
  };
}

function googleMapsKey() {
  return process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_KEY || process.env.GOOGLE_API_KEY;
}

function json(data, init = {}) {
  return Response.json(data, {
    ...init,
    headers: {
      ...corsHeaders,
      ...(init.headers || {})
    }
  });
}

export function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || searchParams.get("address") || "";

  if (!query.trim()) {
    return json({ error: "Missing q or address query parameter" }, { status: 400 });
  }

  const key = googleMapsKey();
  if (!key) {
    return json({
      source: "fallback",
      warning: "Google Maps API key is not configured.",
      query,
      result: fallbackGeocode(query)
    });
  }

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", query);
  url.searchParams.set("key", key);

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" || !data.results?.length) {
      return json({
        source: "fallback",
        warning: `Google Geocoding returned ${data.status || "NO_STATUS"}.`,
        google_status: data.status || null,
        google_error_message: data.error_message || null,
        query,
        result: fallbackGeocode(query)
      });
    }

    const result = data.results[0];
    return json({
      source: "google",
      query,
      result: {
        formatted_address: result.formatted_address,
        place_id: result.place_id,
        location: result.geometry?.location || null,
        location_type: result.geometry?.location_type || null,
        viewport: result.geometry?.viewport || null
      }
    });
  } catch (error) {
    return json({
      source: "fallback",
      warning: "Google Geocoding request failed.",
      query,
      result: fallbackGeocode(query)
    });
  }
}
