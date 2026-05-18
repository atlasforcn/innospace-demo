export const runtime = "nodejs";

const fallbackLocations = [
  {
    pattern: /washington|dc|d\.c\.|pennsylvania/i,
    formatted_address: "Washington, DC, USA",
    location: { lat: 38.9072, lng: -77.0369 },
    place_id: "fallback-washington-dc"
  },
  {
    pattern: /rocky|mountain|wildfire|colorado/i,
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

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || searchParams.get("address") || "";

  if (!query.trim()) {
    return Response.json({ error: "Missing q or address query parameter" }, { status: 400 });
  }

  const key = googleMapsKey();
  if (!key) {
    return Response.json({
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
      return Response.json({
        source: "fallback",
        warning: `Google Geocoding returned ${data.status || "NO_STATUS"}.`,
        google_status: data.status || null,
        google_error_message: data.error_message || null,
        query,
        result: fallbackGeocode(query)
      });
    }

    const result = data.results[0];
    return Response.json({
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
    return Response.json({
      source: "fallback",
      warning: "Google Geocoding request failed.",
      query,
      result: fallbackGeocode(query)
    });
  }
}
