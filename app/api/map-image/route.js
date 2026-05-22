export const runtime = "nodejs";

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "Content-Type"
};

const mapViews = {
  wildfire: {
    center: [39.18, -106.82],
    zoom: 7,
    maptype: "terrain",
    marker: "color:orange|label:F|39.18,-106.82",
    path: "color:0xffa64dcc|fillcolor:0xffa64d44|weight:2|39.75,-107.5|39.95,-106.6|39.1,-105.7|38.55,-106.35|38.85,-107.35|39.75,-107.5"
  },
  construction: {
    center: [38.8977, -77.0365],
    zoom: 16,
    maptype: "satellite",
    marker: "color:blue|label:C|38.8977,-77.0365"
  },
  washington: {
    center: [38.9072, -77.0369],
    zoom: 12,
    maptype: "hybrid",
    marker: "color:blue|label:D|38.9072,-77.0369"
  },
  custom: {
    center: [23.6978, 120.9605],
    zoom: 7,
    maptype: "terrain",
    marker: "color:red|label:T|23.6978,120.9605"
  }
};

function googleMapsKey() {
  return process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_KEY || process.env.GOOGLE_API_KEY;
}

function normalizeScenario(value) {
  if (value === "construction") return "construction";
  if (value === "custom") return "custom";
  if (value === "washington") return "washington";
  return "wildfire";
}

function numericParam(searchParams, key) {
  const value = Number(searchParams.get(key));
  return Number.isFinite(value) ? value : null;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function markerLabel(value) {
  const text = String(value || "T").toUpperCase().replace(/[^A-Z0-9]/g, "");
  return text.slice(0, 1) || "T";
}

function dynamicAoiPath(lat, lng, scenario) {
  const latSpan = scenario === "construction" ? 0.0045 : 0.38;
  const lngSpan = scenario === "construction" ? 0.007 : 0.58;
  const points = [
    [lat + latSpan, lng - lngSpan],
    [lat + latSpan * 0.7, lng + lngSpan],
    [lat - latSpan * 0.75, lng + lngSpan * 0.75],
    [lat - latSpan, lng - lngSpan * 0.35],
    [lat + latSpan, lng - lngSpan]
  ];
  const color = scenario === "construction" ? "0x4aa3ffcc" : "0x35d0b2cc";
  const fill = scenario === "construction" ? "0x4aa3ff33" : "0x35d0b244";
  return `color:${color}|fillcolor:${fill}|weight:2|${points.map((point) => point.join(",")).join("|")}`;
}

function viewFromRequest(searchParams) {
  const lat = numericParam(searchParams, "lat");
  const lng = numericParam(searchParams, "lng");
  const centerLat = numericParam(searchParams, "center_lat");
  const centerLng = numericParam(searchParams, "center_lng");
  const targetLat = numericParam(searchParams, "target_lat") ?? lat;
  const targetLng = numericParam(searchParams, "target_lng") ?? lng;
  const scenario = normalizeScenario(searchParams.get("scenario"));
  const baseView = mapViews[scenario];

  if (targetLat !== null && targetLng !== null && targetLat >= -90 && targetLat <= 90 && targetLng >= -180 && targetLng <= 180) {
    const zoom = clamp(Number(searchParams.get("zoom")) || 12, 1, 20);
    const maptype = ["roadmap", "satellite", "terrain", "hybrid"].includes(searchParams.get("maptype"))
      ? searchParams.get("maptype")
      : "terrain";
    const validCenter =
      centerLat !== null && centerLng !== null && centerLat >= -90 && centerLat <= 90 && centerLng >= -180 && centerLng <= 180;

    return {
      ...baseView,
      center: validCenter ? [centerLat, centerLng] : [targetLat, targetLng],
      zoom,
      maptype,
      marker: `color:red|label:${markerLabel(searchParams.get("label"))}|${targetLat},${targetLng}`,
      path: dynamicAoiPath(targetLat, targetLng, scenario)
    };
  }

  return baseView;
}

export function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const key = googleMapsKey();

  if (!key) {
    return Response.json({ error: "GOOGLE_MAPS_API_KEY is not configured." }, { status: 503, headers: corsHeaders });
  }

  const view = viewFromRequest(searchParams);
  const [lat, lng] = view.center;
  const url = new URL("https://maps.googleapis.com/maps/api/staticmap");
  url.searchParams.set("center", `${lat},${lng}`);
  url.searchParams.set("zoom", String(view.zoom));
  url.searchParams.set("size", "640x420");
  url.searchParams.set("scale", "2");
  url.searchParams.set("maptype", view.maptype);
  url.searchParams.set("format", "png");
  url.searchParams.append("markers", view.marker);
  if (view.path) url.searchParams.append("path", view.path);
  url.searchParams.set("key", key);

  try {
    const response = await fetch(url);
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok || !contentType.startsWith("image/")) {
      return Response.json(
        {
          error: "Google Static Maps image unavailable.",
          google_status: response.status,
          google_content_type: contentType
        },
        { status: 502, headers: corsHeaders }
      );
    }

    return new Response(await response.arrayBuffer(), {
      headers: {
        "content-type": contentType,
        "cache-control": "public, max-age=300",
        ...corsHeaders
      }
    });
  } catch (error) {
    return Response.json({ error: "Google Static Maps request failed." }, { status: 502, headers: corsHeaders });
  }
}
